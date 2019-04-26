import { Component, HostBinding, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectWalletState } from './store/app.states';
import { Observable } from 'rxjs';
import { WalletSetup, WalletCleanup } from './store/wallet/wallet.actions';
import { AuthService } from './services/auth.service';
import { UserSetup } from './store/auth/auth.actions';
import { WalletUtils } from './shared/lib/WalletUtils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @HostBinding('class') class = 'h-screen w-screen flex flex-wrap';
  title = 'honestcash-v2';

  walletState: Observable<any>;
  authState: Observable<any>;

  constructor(
    private store: Store<AppState>,
    private authService: AuthService
  ) {
    this.walletState = this.store.select(selectWalletState);
    this.authState = this.store.select(selectAuthState);
  }

  ngOnInit() {
    this.setupUser();
    this.setupWallet();


    WalletUtils.getWallet((wallet) => {
      console.log(wallet);
    });
  }

  private setupWallet() {
    // setup the wallet
    this.authState.subscribe((authState) => {

      // depending on the result of authentification, setup or cleanup the wallet.
      const simpleWallet = WalletUtils.generateWalletWithEncryptedRecoveryPhrase(
        authState.wallet.mnemonicEncrypted,
        authState.password
      );

      this.store.dispatch(
        authState.token && authState.wallet ?
          new WalletSetup({
            // @refactor and hash it for encoding of the mnemonics
            password: authState.password,
            mnemonicEncrypted: authState.wallet.mnemonicEncrypted
          }) :
          new WalletCleanup()
      );
    });
  }

  private setupUser() {
    // setup the user
    this.authService.getMe().subscribe(user => {
      // dispatch an action to init a user in a store
      console.log(user);

      this.store.dispatch(
        new UserSetup({ user })
      );
    });
  }

  // @todo destroy the subs on exit
}
