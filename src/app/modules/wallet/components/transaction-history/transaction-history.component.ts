import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { StorageService } from '../../../../services/storage.service';
import { TransactionItem } from '../../../../models/transaction-item';
import { CoinsPrice } from '../../../../interfaces/balance.interface';
import { UtilService } from '../../../../services/util.service';
import { ApiService } from '../../../../services/api.service';
import { KanbanService } from '../../../../services/kanban.service';
import { TransactionDetailModal } from '../../modals/transaction-detail/transaction-detail.modal';
import { TransactionDetailModal2 } from '../../modals/transaction-detail2/transaction-detail2.modal';
import { CoinService } from '../../../../services/coin.service';

@Component({
    selector: 'app-transaction-history',
    templateUrl: './transaction-history.component.html',
    styleUrls: ['./transaction-history.component.css']
})
export class TransactionHistoryComponent implements OnInit {
    @ViewChild('transactionDetailModal', { static: true }) transactionDetailModal: TransactionDetailModal;
    @ViewChild('transactionDetailModal2', { static: true }) transactionDetailModal2: TransactionDetailModal2;

    @Input() coinsPrice: CoinsPrice;
    @Input() walletId: string;
    @Input() transactions: TransactionItem[];

    currentType: string;
    utilServ: UtilService;

    constructor(
        private coinServ: CoinService,
        private storageService: StorageService,
        private apiServ: ApiService,
        utilServ: UtilService,
        private kanbanServ: KanbanService
    ) {
        this.utilServ = utilServ;
    }

    changeType(type: string) {
        this.currentType = type;
    }

    showCoinName(name: string, tokenType: string) {
        console.log('tokenType for showCoinName=', tokenType);


        if ((name == 'TRON_USDT') || ((name == 'USDT') && (tokenType == 'TRX'))) {
            return 'USDT(TRC20)';
        } else 
        if (name == 'USDT') {
            return 'USDT(ERC20)';
        } else         
        if ((name == 'ETH_FAB') || ((name == 'FAB') && (tokenType == 'ETH'))) {
            return 'FAB(ERC20)'
        } else
        if ((name == 'ETH_EXG') || ((name == 'EXG') && (tokenType == 'ETH'))) {
            return 'EXG(ERC20)'
        } else 
        if ((name == 'ETH_DSC') || ((name == 'DSC') && (tokenType == 'ETH'))) {
            return 'DSC(ERC20)'
        } else
        if ((name == 'ETH_BST') || ((name == 'BST') && (tokenType == 'ETH'))) {
            return 'BST(ERC20)'
        }
        return name;
    }
    mergeSortedArray(a,b){
        if(!a) {
            return b;
        } else
        if(!b) {
            return a;
        }
        var tempArray = [];
        var currentPos = {
            a: 0,
            b: 0
        }
        while(currentPos.a < a.length && currentPos.b < b.length) {

            if(typeof a[currentPos.a] === 'undefined') {
                tempArray.push(b[currentPos.b++]);
            } else if(a[currentPos.a].timestamp > b[currentPos.b].timestamp){
                tempArray.push(a[currentPos.a++]);
            } else {
                tempArray.push(b[currentPos.b++]);
            }
        }

        while(currentPos.a < a.length) {
            tempArray.push(a[currentPos.a++]);
        }

        while(currentPos.b < b.length) {
            tempArray.push(b[currentPos.b++]);
        }        
        return tempArray;
    }


    ngOnInit() {
        this.currentType = 'All';
        this.storageService.getTransactionHistoryList().subscribe(
            (transactionHistory: TransactionItem[]) => {
                //console.log('transactionHistory=', transactionHistory);
                if (transactionHistory && (transactionHistory.length > 0)) {
                    //this.transactionHistory = transactionHistory.reverse().filter(s => s.walletId === this.walletId);
                    let newTransactions = [];
                    for(let i=transactionHistory.length - 1;i >= 0; i--) {
                        const transactionItem = transactionHistory[i];
                        const time = transactionItem.time;
                        const timestamp = Math.round(time.getTime() / 1000);

                        const wid = transactionItem.walletId;
                        if(wid != this.walletId) {
                            continue;
                        }
                        const newTransaction = {
                            action: transactionItem.type,
                            coin: transactionItem.coin,
                            tokenType: transactionItem.tokenType,
                            quantity: transactionItem.amount,
                            to: transactionItem.to,
                            timestamp: timestamp,
                            comment: transactionItem.comment,
                            transactions: [
                                {
                                    chain: transactionItem.tokenType ? transactionItem.tokenType : transactionItem.coin,
                                    status: transactionItem.status,
                                    timestamp: '',
                                    transactionId: transactionItem.txid
                                }                               
                            ]
                        };

                        newTransactions.push(newTransaction);
                    }

                    console.log('this.transactions==', this.transactions);
                    console.log('newTransactions==', newTransactions);
                    this.transactions = this.mergeSortedArray(this.transactions, newTransactions);

                }
            }
        );
    }

    async showTransactionDetail2(item: any) {

        this.transactionDetailModal2.show(item);
    }

    async showTransactionDetail(item: TransactionItem) {
        /*
        console.log('item is:', item);
        if (item.type === 'Withdraw') {
            const status = await this.kanbanServ.getTransactionStatus(item.txid);
            item.confirmations = status;
        } else
        if (item.type === 'Deposit') {
            const status = await this.kanbanServ.getDepositStatus(item.txid);
            item.confirmations = status;
        } else
        if (item.coin === 'BTC') {
            const tx = await this.apiServ.getBtcTransaction(item.txid);
            item.confirmations = tx.confirmations;
            item.blockhash = tx.blockhash;
        } else
        if (item.coin === 'ETH' || item.tokenType === 'ETH') {
            const tx = await this.apiServ.getEthTransaction(item.txid);
            item.confirmations = '0';
            if (tx.blockNumber) {
                item.confirmations = tx.confirmations;
            }
            item.blockhash = tx.blockHash;
        } else
        if (item.coin === 'FAB' || item.tokenType === 'FAB') {
            const tx = await this.apiServ.getFabTransactionJson(item.txid);
            item.confirmations = '0';
            if (tx.confirmations) {
                item.confirmations = tx.confirmations.toString();
            }
            item.blockhash = tx.blockhash;
        } else
        if (item.coin === 'TRX' || item.tokenType === 'TRX') {
            const status = await this.coinServ.getTrxTransactionStatus(item.txid);
            //console.log('status for tron ===', status);
            item.status = status;
        }
        */
        this.transactionDetailModal.show(item);
    }
}
