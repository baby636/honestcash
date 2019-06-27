import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import Wallet from '../models/wallet';
import {isPlatformBrowser} from '@angular/common';
import {LoginSuccessResponse, OkResponse, SignupSuccessResponse} from '../../auth/models/authentication';
import {Logger} from '../../../core/shared/services/logger.service';
import {AsyncSubject, defer, Observable, Subject} from 'rxjs';
import {AuthService} from '../../auth/services/auth.service';
import {HttpService} from '../../../core';
import {LocalStorageToken} from '../../../core/shared/helpers/local-storage.helper';
import {sha3_512} from 'js-sha3';
import {ISimpleBitcoinWallet} from '../models/simple-bitcoin-wallet';
import {ScriptService} from 'ngx-script-loader';

export const API_ENDPOINTS = {
  setWallet: `/auth/set-wallet`,
};

export const WALLET_LOCALSTORAGE_KEYS = {
  HD_PATH: 'HC_BCH_HD_PATH',
  MNEMONIC: 'HC_BCH_MNEMONIC',
  PRIVATE_KEY: 'HC_BCH_PRIVATE_KEY'
};

export const WALLET_DEFAULT_HD_PATH = `m/44'/0'/0'/0/0`;

const simpleBitcoinWalletAssetPath = 'assets/libs/simple-bitcoin-wallet.min.js';

export enum WALLET_SETUP_STATUS {
  NotInitialized = 'NOT_INITIALIZED',
  Started = 'STARTED',
  Initialized = 'INITIALIZED',
}

@Injectable({providedIn: 'root'})
export class WalletService {
  public _wallet: Wallet = null;
  public wallet: Wallet = null;

  public isSettingUpWallet: Subject<WALLET_SETUP_STATUS> = new AsyncSubject<WALLET_SETUP_STATUS>();

  private logger: Logger;
  private readonly isPlatformBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    @Inject(LocalStorageToken) private localStorage: Storage,
    private http: HttpService,
    private scriptService: ScriptService,
  ) {
    this.logger = new Logger('WalletService');
    this.isPlatformBrowser = isPlatformBrowser(this.platformId);
    this.isSettingUpWallet.next(WALLET_SETUP_STATUS.NotInitialized);
  }

  public generateNewWallet = async (password: string): Promise<ISimpleBitcoinWallet> => {
    const SimpleBitcoinWallet: any = await this.loadSimpleBitcoinWallet();

    return new SimpleBitcoinWallet(null, {password});
  };

  public encrypt = async (mnemonic: string, password: string): Promise<string> => {
    const SimpleBitcoinWallet: any = await this.loadSimpleBitcoinWallet();

    return SimpleBitcoinWallet.encrypt(mnemonic, password);
  };

  public generateWalletWithEncryptedRecoveryPhrase = async (
    encryptedRecoveryPhrase: string,
    password: string
  ): Promise<ISimpleBitcoinWallet> => {
    const SimpleBitcoinWallet: any = await this.loadSimpleBitcoinWallet();

    return new SimpleBitcoinWallet(encryptedRecoveryPhrase, {password});
  };

  public generateWalletWithDecryptedRecoveryPhrase = async (
    recoveryPhrase: string,
  ): Promise<ISimpleBitcoinWallet> => {
    const SimpleBitcoinWallet: any = await this.loadSimpleBitcoinWallet();

    return new SimpleBitcoinWallet(recoveryPhrase, {password: null});
  };

  // @todo add typings to SimpleBitcoinWallet
  // @todo these typings below are a little bit off
  // simple-bitcoin-wallet is lazy loaded as it is a >1MB package and it is not needed for server side rendering.
  public loadSimpleBitcoinWallet() {
    return this.scriptService.loadScript(simpleBitcoinWalletAssetPath);
  }

  public calculateSHA3Hash = (message: string): string => {
    return sha3_512(message);
  };

  public determineMessageForHashing = (salt: string, password: string): string => {
    return `${salt}:${password}`;
  };

  public calculatePasswordHash = (email: string, password: string): string => {
    return this.calculateSHA3Hash(
      this.determineMessageForHashing(email, password)
    );
  };

  public setupWallet(payload?: LoginSuccessResponse | SignupSuccessResponse): Observable<ISimpleBitcoinWallet | Error> {
    return defer(
      async () => {
        this.isSettingUpWallet.next(WALLET_SETUP_STATUS.Started);
        let simpleWallet: ISimpleBitcoinWallet;
        if (payload) {
          if ((<LoginSuccessResponse>payload).wallet && (<LoginSuccessResponse>payload).wallet.mnemonicEncrypted) {
            // if there is a payload and a wallet attached
            // it means it is a login action
            this.logger.info('Setting up an already existing wallet from payload');
            simpleWallet = await this.generateWalletWithEncryptedRecoveryPhrase(
              (<LoginSuccessResponse>payload).wallet.mnemonicEncrypted,
              payload.password
            );
          } else {
            // if there is a payload but NO wallet attached
            // it means it is a signup action with only the password
            this.logger.info('Creating new wallet.');
            simpleWallet = await this.generateNewWallet(payload.password);
          }
        } else {
          if (this.getWalletMnemonic()) {
            // if there is no payload
            // but there is a decrypted mnemonic and a token in the localstorage
            // it means the app loads wallet from localStorage
            this.logger.info('Setting up an already existing wallet from local storage');
            simpleWallet = await this.generateWalletWithDecryptedRecoveryPhrase(<string>this.getWalletMnemonic());
          }
        }

        if (!simpleWallet) {
          return new Error();
        }

        this.setWallet(simpleWallet);
        this.isSettingUpWallet.next(WALLET_SETUP_STATUS.Initialized);
        this.isSettingUpWallet.complete();
        return simpleWallet;
      }
    );
  }

  public getWalletSetupStatus(): Observable<WALLET_SETUP_STATUS> {
    return this.isSettingUpWallet.asObservable();
  }

  public getWalletMnemonic(): string | void {
    if (this.isPlatformBrowser) {
      return this.localStorage.getItem(WALLET_LOCALSTORAGE_KEYS.MNEMONIC);
    }
  }

  public setWallet(wallet: ISimpleBitcoinWallet | Wallet): Observable<OkResponse> {
    if (this.isPlatformBrowser) {
      this.localStorage.setItem(WALLET_LOCALSTORAGE_KEYS.MNEMONIC, wallet.mnemonic);
    }
    return this.http.post<OkResponse>(API_ENDPOINTS.setWallet, wallet.mnemonicEncrypted);
  }

  public unsetWallet(): void {
    if (this.isPlatformBrowser) {
      this.localStorage.removeItem(WALLET_LOCALSTORAGE_KEYS.MNEMONIC);
    }
  }
}
