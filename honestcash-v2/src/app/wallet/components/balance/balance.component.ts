import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppStates, selectWalletState} from '../../../app.states';
import {Observable, Subscription} from 'rxjs';
import {WalletState} from '../../store/wallet.state';
import {WALLET_STATUS} from '../../models/status';

@Component({
  selector: 'wallet-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class WalletBalanceComponent implements OnInit, OnDestroy {
  public balance: number;
  public status: WALLET_STATUS;
  private wallet$: Observable<WalletState>;
  private walletSub: Subscription;
  constructor(
    private store: Store<AppStates>,
  ) {
    this.wallet$ = this.store.select(selectWalletState);
  }

  public ngOnInit() {
    this.walletSub = this.wallet$.subscribe((walletState: WalletState) => {
      this.status = walletState.status;
      this.balance = walletState.balance;
    });
  }

  public ngOnDestroy() {
    if (this.walletSub) {
      this.walletSub.unsubscribe();
    }
  }

}
