import { Component, ViewEncapsulation, TemplateRef, ViewChild, ViewContainerRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Wallet } from '../../../../models/wallet';
import { MyCoin } from '../../../../models/mycoin';
import { WalletService } from '../../../../services/wallet.service';
import { CoinService } from '../../../../services/coin.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { UtilService } from '../../../../services/util.service';
import { ApiService } from '../../../../services/api.service';
import { KanbanService } from '../../../../services/kanban.service';
import { Web3Service } from '../../../../services/web3.service';
import { Signature, Token } from '../../../../interfaces/kanban.interface';
import { DepositAmountModal } from '../../modals/deposit-amount/deposit-amount.modal';
import { ToolsModal } from '../../modals/tools/tools.modal';
import { RedepositAmountModal } from '../../modals/redeposit-amount/redeposit-amount.modal';
import { AddAssetsModal } from '../../modals/add-assets/add-assets.modal';
import { PinNumberModal } from '../../../shared/modals/pin-number/pin-number.modal';
import { DisplayPinNumberModal } from '../../../shared/modals/display-pin-number/display-pin-number.modal';
import { AddGasModal } from '../../modals/add-gas/add-gas.modal';
import { ShowSeedPhraseModal } from '../../modals/show-seed-phrase/show-seed-phrase.modal';
import { VerifySeedPhraseModal } from '../../modals/verify-seed-phrase/verify-seed-phrase.modal';
import { SendCoinModal } from '../../modals/send-coin/send-coin.modal';
import { BackupPrivateKeyModal } from '../../modals/backup-private-key/backup-private-key.modal';
import { DeleteWalletModal } from '../../modals/delete-wallet/delete-wallet.modal';
import { LoginSettingModal } from '../../modals/login-setting/login-setting.modal';
import { GetFreeFabModal } from '../../modals/get-free-fab/get-free-fab.modal';
import { DisplaySettingModal } from '../../modals/display-setting/display-setting.modal';
import { CoinsPrice } from '../../../../interfaces/balance.interface';
import { SendCoinForm } from '../../../../interfaces/kanban.interface';
import { StorageService } from '../../../../services/storage.service';
import { AlertService } from '../../../../services/alert.service';
import { AngularCsv } from 'angular7-csv';
import { TransactionItem } from '../../../../models/transaction-item';
import BigNumber from 'bignumber.js/bignumber';
import { TimerService } from '../../../../services/timer.service';
import { TranslateService } from '@ngx-translate/core';
import { WsService } from '../../../../services/ws.service';
import { environment } from '../../../../../environments/environment';
import { ManageWalletComponent } from '../manage-wallet/manage-wallet.component';
import { CampaignOrderService } from '../../../../services/campaignorder.service';
import { Pair } from 'src/app/modules/market/models/pair';
import { LockedInfoModal } from '../../modals/locked-info/locked-info.modal';
import { WalletUpdateModal } from '../../modals/wallet-update/wallet-update.modal';

@Component({
    selector: 'app-wallet-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class WalletDashboardComponent implements OnInit {
    @ViewChild('manageWallet', { static: true }) manageWallet: ManageWalletComponent;
    @ViewChild('pinModal', { static: true }) pinModal: PinNumberModal;
    @ViewChild('displayPinModal', { static: true }) displayPinModal: DisplayPinNumberModal;
    @ViewChild('depositModal', { static: true }) depositModal: DepositAmountModal;
    @ViewChild('redepositModal', { static: true }) redepositModal: RedepositAmountModal;
    @ViewChild('addGasModal', { static: true }) addGasModal: AddGasModal;
    @ViewChild('addAssetsModal', { static: true }) addAssetsModal: AddAssetsModal;
    @ViewChild('sendCoinModal', { static: true }) sendCoinModal: SendCoinModal;
    @ViewChild('showSeedPhraseModal', { static: true }) showSeedPhraseModal: ShowSeedPhraseModal;
    @ViewChild('verifySeedPhraseModal', { static: true }) verifySeedPhraseModal: VerifySeedPhraseModal;
    @ViewChild('backupPrivateKeyModal', { static: true }) backupPrivateKeyModal: BackupPrivateKeyModal;
    @ViewChild('deleteWalletModal', { static: true }) deleteWalletModal: DeleteWalletModal;
    @ViewChild('loginSettingModal', { static: true }) loginSettingModal: LoginSettingModal;
    @ViewChild('displaySettingModal', { static: true }) displaySettingModal: DisplaySettingModal;
    @ViewChild('toolsModal', { static: true }) toolsModal: ToolsModal;
    @ViewChild('getFreeFabModal', { static: true }) getFreeFabModal: GetFreeFabModal;
    @ViewChild('lockedInfoModal', { static: true }) lockedInfoModal: LockedInfoModal;
    @ViewChild('walletUpdateModal', { static: true }) walletUpdateModal: WalletUpdateModal;

    sendCoinForm: SendCoinForm;
    wallet: Wallet;
    privateKey: string;
    coinName: string;
    amountForm: any;
    maintainence: boolean;
    wallets: Wallet[];
    modalRef: BsModalRef;
    checked = true;
    satoshisPerBytes: number;
    toAddress: string;
    exgAddress: string;
    fabAddress: string;
    exgBalance: number;
    exgValue: number;
    valueChange = 0;
    currentWalletIndex: number;
    pairsConfig: Pair[];
    currentCoin: MyCoin;
    amount: number;
    fabBalance: number;
    ethBalance: number;
    coinsPrice: CoinsPrice;
    pin: string;
    baseCoinBalance: number;
    seed: Buffer;
    hasNewCoins: boolean;
    hideSmall: boolean;
    showMyAssets: boolean;
    showTransactionHistory: boolean;
    gas: number;
    transactions: any;
    alertMsg: string;
    opType: string;
    currentCurrency: string;
    currencyRate: number;
    lan = 'en';
    walletUpdateToDate: boolean;
    hideWallet = false;

    sortField: string;
    sortFieldType: string;
    sortAsc: boolean;
    sortAscName: number;
    sortAscBalance: number;
    sortAscLockedBalance: number;

    constructor(
        private campaignorderServ: CampaignOrderService,
        private route: Router, private walletServ: WalletService, private modalServ: BsModalService,
        private coinServ: CoinService, public utilServ: UtilService, private apiServ: ApiService,
        private _wsServ: WsService,
        private translateServ: TranslateService,
        private kanbanServ: KanbanService, private web3Serv: Web3Service,
        private alertServ: AlertService, private timerServ: TimerService,
        private coinService: CoinService, private storageService: StorageService) {
        this.lan = localStorage.getItem('Lan');
        
        this.showMyAssets = true;
        this.currentCurrency = 'USD';
        this.currencyRate = 1;
        this.hasNewCoins = false;
        this.baseCoinBalance = 0;
        this.maintainence = false;
        this.sortField = '';
        this.sortFieldType = '';
        this.sortAscName = 0;
        this.sortAscBalance = 0;
        this.sortAscLockedBalance = 0;   

        this.kanbanServ.getKanbanStatus().subscribe(
            (res: any) => {
                if (res && res.success) {
                    const data = res.body;
                    if (data != 'live') {
                        this.maintainence = true;
                    }
                }
            },
            err => {
                if (environment.production) {
                    this.maintainence = true;
                }

                console.log(err);
            })
            ;

        this.showTransactionHistory = false;

    }

    getFreeFab() {
        this.getFreeFabModal.show();
    }

    changeSort(field: string, fieldType: string) {
        this.sortField = field;
        this.sortFieldType = fieldType;
        if(field == 'name') {
            if(!this.sortAscName) {
                this.sortAscName = 1;
            } else {
                this.sortAscName = -this.sortAscName;
            }
            if(this.sortAscName == 1) {
                this.sortAsc = true;
            } else {
                this.sortAsc = false;
            }
        } else
        if(field == 'balance') {
            if(!this.sortAscBalance) {
                this.sortAscBalance = 1;
            } else {
                this.sortAscBalance = -this.sortAscBalance;
            }
            if(this.sortAscBalance == 1) {
                this.sortAsc = true;
            } else {
                this.sortAsc = false;
            }            
        } else
        if(field == 'lockedBalance') {
            if(!this.sortAscLockedBalance) {
                this.sortAscLockedBalance = 1;
            } else {
                this.sortAscLockedBalance = -this.sortAscLockedBalance;
            }
            if(this.sortAscLockedBalance == 1) {
                this.sortAsc = true;
            } else {
                this.sortAsc = false;
            }             
        }   
        
        //this.walletServ.updateToWalletList(this.wallet, this.currentWalletIndex);
    }

    getCoinLogo(coin) {
        return '/assets/coins/' + coin.name.toLowerCase() + '.png';
    }

    loadnewCoins() {
        this.opType = 'loadnewCoins';
        this.pinModal.show();
    }

    changeCurrency(name: string) {
        this.currentCurrency = name;
        if (name === 'USD') {
            this.currencyRate = 1;
        } else if (name === 'CAD') {
            this.currencyRate = 1.31;
        } else if (name === 'RMB') {
            this.currencyRate = 7.07;
        }
    }
    async updateCoinBalance(coinName: string) {
        // console.log('coinName=' + coinName);
        let interval = 3000;
        if (coinName === 'FAB') {
            interval = 8000;
        }
        for (let i = 0; i < this.wallet.mycoins.length; i++) {
            const coin = this.wallet.mycoins[i];
            // console.log('coin.name=' + coin.name);
            if (coin.name === coinName) {
                for (let j = 0; j < 20; j++) {
                    await new Promise(resolve => setTimeout(resolve, interval));
                    const balance = await this.coinServ.getBalance(coin);
                    if (coin.balance !== balance.balance || coin.lockedBalance !== balance.lockbalance) {
                        // console.log('you got it');
                        coin.balance = balance.balance;
                        coin.lockedBalance = balance.lockbalance;
                        break;
                    }
                }

            }
        }
    }

    async ngOnInit() {
        this.exgBalance = 0;
        this.exgValue = 0;
        /*
        const anotherPublicKey = '0x4ac4691ef9cda915d6b4a48bf449fe9daba60281e0ab0ece80b1af89073ebb6b2a5a93054ce960e98ee7743bda765fc97215417ecd5132e030fbe876830b2c81';
        const addr2 = this.utilServ.toKanbanAddress(Buffer.from(anotherPublicKey, 'hex'));
        console.log('addr2====', addr2);
        */

        this.setPairsConfig();

        await this.loadWallets();
        // this.currentWalletIndex = await this.walletServ.getCurrentWalletIndex();
        // console.log('this.currentWalletIndex=', this.currentWalletIndex);
        if (!this.currentWalletIndex) {
            this.currentWalletIndex = 0;
        }
        if (this.wallets) {
            await this.loadWallet(this.wallets[this.currentWalletIndex]);
            // this.loadCoinsPrice();

            // this.startTimer();
            this.loadBalance();
        }

        if (this.exgAddress) {
            /*
            if (this.exgAddress === '0x5ccab4dd9c83d675b25e6589561f4ee1e185a0b7') {
                this.exgAddress = '';
                for (let i = 0; i < this.wallet.mycoins.length; i++) {
                    this.wallet.mycoins[i].receiveAdds[0].address = '';
                }
            }
            */

            /*
            this.kanbanServ.getDepositErr(this.exgAddress).subscribe(
                (resp: any) => {
                    // console.log('resp=', resp);
                    for (let j = 0; j < this.wallet.mycoins.length; j++) {
                        this.wallet.mycoins[j].redeposit = [];
                    }
                    for (let i = 0; i < resp.length; i++) {
                        const coinType = resp[i].coinType;
                        for (let j = 0; j < this.wallet.mycoins.length; j++) {
                            const name = this.wallet.mycoins[j].name;
                            const myCoinType = this.coinServ.getCoinTypeIdByName(name);
                            // console.log('coinType=' + coinType + ',myCoinType=' + myCoinType);
                            if (coinType === myCoinType) {
                                //  console.log('got it');
                                if (!this.wallet.mycoins[j].redeposit) {
                                    this.wallet.mycoins[j].redeposit = [];
                                }
                                this.wallet.mycoins[j].redeposit.push(resp[i]);
                            }
                        }
                    }
                    // console.log('this.wallet.mycoinsssssssss===', this.wallet.mycoins);
                }
            );
            */
        }
        /*
        this.storageService.changedTransaction.subscribe(
            (transaction: TransactionItem) => {
                
                const status = transaction.status;
                const type = transaction.type;
                const amount = transaction.amount;
                const coin = transaction.coin;
                if (status === 'confirmed') {
                    if (type === 'Add Gas') {
                        this.gas += amount;
                        this.updateCoinBalance('FAB');
                    } else
                    if (type === 'Send') {
                        this.updateCoinBalance(coin);
                    }
                }

            }
        );    
        */
    }

    setPairsConfig() {
        if (this.pairsConfig) { return; }

        let strPairsConfig = sessionStorage.getItem('pairsConfig');
        if (!strPairsConfig) {
            this.kanbanServ.getPairConfig().subscribe(
                res => {
                    strPairsConfig = JSON.stringify(res);
                    sessionStorage.setItem('pairsConfig', strPairsConfig);
                    this.pairsConfig = <Pair[]>res;
                },
                err => { this.alertMsg = err.message; });
        } else {
            this.pairsConfig = <Pair[]>(JSON.parse(strPairsConfig));
        }
    }

    getPairConfig(pairName: string): Pair {
        if (!this.pairsConfig) { return null; }

        pairName = pairName.toLocaleUpperCase();
        const pairConfig = <Pair>this.pairsConfig.find(item => item.name === pairName);
        return pairConfig;
    }

    copyAddress() {
        this.utilServ.copy(this.fabAddress);
    }

    updateWallet() {
        this.opType = 'updateWallet';
        this.pinModal.show();
    }

    onConfirmedBackupPrivateKey(cmd: string) {
        // console.log('onConfirmedBackupPrivateKey start, cmd=', cmd);

        const options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalseparator: '.',
            showLabels: false,
            showTitle: false,
            title: 'Your title',
            useBom: true,
            noDownload: false,
            headers: ['Coin', 'Chain', 'Index', 'Address', 'Private Key']
        };
        const data = [];

        for (let i = 0; i < this.wallet.mycoins.length; i++) {
            const coin = this.wallet.mycoins[i];
            let receiveAddsLength = 1;
            if (coin.receiveAdds.length < receiveAddsLength) {
                receiveAddsLength = coin.receiveAdds.length;
            }
            for (let j = 0; j < receiveAddsLength; j++) {
                const addr = coin.receiveAdds[j];
                const keyPair = this.coinServ.getKeyPairs(coin, this.seed, 0, addr.index);
                const item = {
                    coin: coin.name,
                    chain: 'external',
                    index: addr.index,
                    address: addr.address,
                    privateKey: keyPair.privateKeyDisplay
                };
                data.push(item);
            }

            /*
            let changeAddsLength = 1;
            if (coin.changeAdds.length < changeAddsLength) {
                changeAddsLength = coin.changeAdds.length;
            }            
            for (let j = 0; j < changeAddsLength; j++) {
                const addr = coin.changeAdds[j];
                const keyPair = this.coinServ.getKeyPairs(coin, this.seed, 1, addr.index);
                const item = {
                    coin: coin.name,
                    chain: 'change',
                    index: addr.index,
                    address: addr.address,
                    privateKey: keyPair.privateKeyDisplay
                };
                data.push(item);
            }  
            */
        }
        const csv = new AngularCsv(data, 'Private Keys for wallet ' + this.wallet.name, options);
    }

    onShowMyAssets() {
        this.showMyAssets = true;
        this.showTransactionHistory = false;
    }

    onmanageWallet(type: string) {
        // console.log('type in dashboard=' + type);
        if (type === 'SHOW_SEED_PHRASE') {
            this.opType = 'showSeedPhrase';
            this.pinModal.show();
        } else if (type === 'VERIFY_SEED_PHRASE') {
            this.opType = 'verifySeedPhrase';
            this.pinModal.show();
        } else if (type === 'BACKUP_PRIVATE_KEY') {
            this.opType = 'backupPrivateKey';
            this.pinModal.show();
        } else if (type === 'DELETE_WALLET') {
            this.opType = 'deleteWallet';
            this.pinModal.show();
        } else if (type === 'LOGIN_SETTING') {
            this.opType = 'loginSetting';
            this.pinModal.show();
        } else if (type === 'DISPLAY_SETTING') {
            this.opType = 'displaySetting';
            this.pinModal.show();
        } else if (type === 'TOOLS') {
            this.opType = 'tools';
            this.toolsModal.show();
        } else if (type === 'SMART_CONTRACT') {
            this.route.navigate(['/smartcontract']);
            return;
        } else if (type === 'HIDE_SHOW_WALLET') {
            if(!this.wallet.pwdDisplayHash || this.wallet.pwdDisplayHash.length == 0) {

                this.alertServ.openSnackBar(this.translateServ.instant('Please set your display password in display setting'), 'ok');
                return;
            }
            if (this.wallet.hide) {
                this.opType = 'showWallet';
                this.displayPinModal.show();
            } else {
                this.toggleWalletHide();
            }
        }
    }

    navigate(url: string) {
        this.route.navigate([url]);
    }
    onShowTransactionHistory() {
        this.showMyAssets = false;
        this.showTransactionHistory = true;
    }

    async onConfirmedDeleteWallet() {
        // console.log('confirm delete it.');
        // this.walletServ.deleteCurrentWallet();
        // console.log(this.wallets);
        // console.log('this.currentWalletIndex=' + this.currentWalletIndex);
        if (this.currentWalletIndex >= 0 && this.wallets) {

            this.wallets.splice(this.currentWalletIndex, 1);
        }
        // console.log(this.wallets);
        if (this.wallets.length === this.currentWalletIndex) {
            this.currentWalletIndex = this.wallets.length - 1;
            await this.walletServ.saveCurrentWalletIndex(this.currentWalletIndex);
        }
        this.walletServ.updateWallets(this.wallets);

    }


    async loadCoinsPrice() {
        this.coinsPrice = await this.apiServ.getCoinsPrice();

        this.coinsPrice.exgcoin = {
            usd: 0.2
        };
        this._wsServ.currentPrices.subscribe((arr: any) => {
            // console.log('arr===', arr);
            for (let i = 0; i < arr.length; i++) {
                const item = arr[i];
                // console.log('item=', item);
                if (item.symbol === 'EXGUSDT') {
                    const price = item.price;
                    // console.log('price===', price);
                    const thisPairConfig: Pair = this.getPairConfig(item.symbol);
                    if (thisPairConfig) {
                        const priceAmount = this.utilServ.showAmount(price, thisPairConfig.priceDecimal);
                        // console.log('priceAmount====', priceAmount);
                        this.coinsPrice.exgcoin.usd = Number(priceAmount);
                    }
                    break;
                }
            }
        });

    }

    async loadBalance() {
        this.walletUpdateToDate = false;
        // console.log('this.coinsPrice=');
        // console.log(this.coinsPrice);
        if (!this.wallet) {
            return;
        }

        let btcAddress = '';
        let ethAddress = '';
        let fabAddress = '';
        let bchAddress = '';
        let dogeAddress = '';
        let ltcAddress = '';
        let trxAddress = '';

        if(this.wallet.mycoins[4].name == 'TRX') {
            this.walletUpdateToDate = true;
        } else {
            this.walletUpdateModal.show();
        }
        for (let i = 0; i < this.wallet.mycoins.length; i++) {
            const coin = this.wallet.mycoins[i];       

            if (coin.name == 'BTC' && !btcAddress) {
                btcAddress = coin.receiveAdds[0].address;
            }
            if (coin.name == 'ETH' && !ethAddress) {
                ethAddress = coin.receiveAdds[0].address;
            }
            
            if (coin.name == 'FAB' && (!coin.tokenType || coin.tokenType == 'FAB') && !coin.encryptedPrivateKey && !fabAddress) {
                fabAddress = coin.receiveAdds[0].address;
                //this.fabBalance = coin.balance;
                //console.log('this.fabBalance==', this.fabBalance);
                this.fabAddress = fabAddress;
            }
            if (coin.name == 'BCH') {
                bchAddress = coin.receiveAdds[0].address;
            }
            if (coin.name == 'TRX') {
                trxAddress = coin.receiveAdds[0].address;
            }            
            if (coin.name == 'DOGE') {
                dogeAddress = coin.receiveAdds[0].address;
            }
            if (coin.name == 'LTC') {
                ltcAddress = coin.receiveAdds[0].address;
            }
            if (coin.name == 'USD Coin') {
                try {
                    const balance = await this.coinServ.getBalance(coin);
                    coin.balance = balance.balance;
                    coin.lockedBalance = balance.lockbalance;
                } catch(e) {

                }

            }

            if(coin.new) {
                try {
                    console.log('coin custom=', coin);
                    const balance = await this.coinServ.getBalance(coin);
                    console.log('balance=', balance);
                    coin.balance = balance.balance;
                    coin.lockedBalance = balance.lockbalance;

                    /*
                    if(coin.name === 'EXG') {
                        if(!this.exgBalance) {
                            this.exgBalance = Number(coin.balance) + Number(coin.lockedBalance);
                            console.log('this.exgBalance=', this.exgBalance);
                        }      
                    }   
                    */                
                } catch(e) {

                }          
            }

        }

        const data = {
            btcAddress: btcAddress,
            ethAddress: ethAddress,
            fabAddress: fabAddress,
            bchAddress: bchAddress,
            dogeAddress: dogeAddress,
            ltcAddress: ltcAddress,
            trxAddress: trxAddress,
            timestamp: 0
        };

        this.coinServ.getTransactionHistoryEvents(data).subscribe(
            (res: any) => {
                if (res && res.success) {
                    const data = res.data;
                    this.transactions = data;
                }
            }
        );
        this.coinServ.walletBalance(data).subscribe(
            async (res: any) => {
                if (res && res.success) {
                    let updated = false;
                    let hasDRGN = false;
                    let hasNVZN = false;
                    let hasCNB = false;
                    let ethCoin;
                    let fabCoin;
                    for (let j = 0; j < this.wallet.mycoins.length; j++) {
                        const coin = this.wallet.mycoins[j];   
                        
                        if(coin.new) {
                            continue;
                        }
                        if (coin.name === 'DRGN') {
                            hasDRGN = true;
                        }
                        if (coin.name === 'NVZN') {
                            hasNVZN = true;
                        }
                        if (coin.name === 'ETH') {
                            ethCoin = coin;
                        }
                        if(coin.name === 'EXG' && coin.tokenType == 'FAB' && !coin.encryptedPrivateKey) {
                            //console.log('coin=', coin);
                            //console.log('this.exgBalance=', this.exgBalance);
                            let exgBalance =  Number(coin.balance);
                            let exgLockedBalance = Number(coin.lockedBalance);
                            if(exgBalance < 0) {
                                exgBalance = 0;
                            }
                            if(exgLockedBalance < 0) {
                                exgLockedBalance = 0;
                            }
                            if(!this.exgBalance) {
                                this.exgBalance = exgBalance + exgLockedBalance;
                                this.exgValue = coin.usdPrice;
                            }

                            //console.log('this.exgBalance=', this.exgBalance);
                                     
                        }
                        if (coin.name === 'FAB' && !coin.tokenType) {
                            fabCoin = coin;
                            
                        }
                        if (coin.name === 'CNB') {
                            hasCNB = true;
                        }                        

                        for (let i = 0; i < res.data.length; i++) {
                            const item = res.data[i];

                            if(item.coin == 'FAB') {
                                this.fabBalance = item.balance;
                            }
                            if (
                                (item.coin === coin.name) || 
                                ((item.coin === 'USDTX') && (coin.name ==='USDT') && (coin.tokenType === 'TRX')) ||
                                ((item.coin === 'FABE') && (coin.name ==='FAB') && (coin.tokenType === 'ETH')) ||
                                ((item.coin === 'EXGE') && (coin.name ==='EXG') && (coin.tokenType === 'ETH')) ||
                                ((item.coin === 'DSCE') && (coin.name ==='DSC') && (coin.tokenType === 'ETH')) ||
                                ((item.coin === 'BSTE') && (coin.name ==='BST') && (coin.tokenType === 'ETH'))
                            ) {
                                if (item.depositErr) {
                                    coin.redeposit = item.depositErr;
                                    updated = true;
                                } else {
                                    coin.redeposit = [];
                                    updated = true;
                                }
                                if (coin.balance !== this.utilServ.toPrecision(item.balance)) {
                                    coin.balance = this.utilServ.toPrecision(item.balance);
                                    updated = true;
                                }
                                if (coin.lockedBalance !== this.utilServ.toPrecision(item.lockBalance)) {
                                    coin.lockedBalance = this.utilServ.toPrecision(item.lockBalance);
                                    updated = true;
                                }
                                coin.lockers = item.lockers ? item.lockers : item.fabLockers;
                                if (item.usdValue && (coin.usdPrice !== item.usdValue.USD)) {
                                    coin.usdPrice = item.usdValue.USD;
                                    updated = true;
                                }
                            }



                        }
                   }

                    if (updated) {
                        // console.log('updated=' + updated);
                        this.walletServ.updateToWalletList(this.wallet, this.currentWalletIndex);
                    }
                }

            },
            async error => {
                let updated = false;
                let hasDUSD = false;
                let hasBCH = false;
                let exgCoin;
                let fabCoin;
                for (let i = 0; i < this.wallet.mycoins.length; i++) {
                    const coin = this.wallet.mycoins[i];
                    const balance = await this.coinServ.getBalance(coin);
                    if (coin.name === 'DUSD') {
                        hasDUSD = true;
                    } else if (coin.name === 'EXG') {
                        exgCoin = coin;
                    } else if (coin.name === 'FAB') {
                        fabCoin = coin;
                        this.fabBalance = balance.balance;
                    } else if (coin.name === 'ETH') {
                        this.ethBalance = balance.balance;
                    } else
                        if (coin.name === 'BCH') {
                            hasBCH = true;
                        }

                    if (coin.balance !== balance.balance || coin.lockedBalance !== balance.lockbalance) {

                        coin.balance = balance.balance;
                        // coin.receiveAdds[0].balance = balance.balance;
                        coin.lockedBalance = balance.lockbalance;
                        updated = true;
                    }

                    console.log('balance for coin' + coin.name + '=', balance);
                }

            }
        );

        /*

        */

    }

    async changeWallet(value) {
        this.currentWalletIndex = value;
        // this.wallet = this.wallets[this.currentWalletIndex];
        // this.exgAddress = this.wallet.mycoins[0].receiveAdds[0].address;
        this.walletServ.saveCurrentWalletIndex(this.currentWalletIndex);
        // console.log('this.currentWalletIndex=' + this.currentWalletIndex);
        await this.loadWallet(this.wallets[this.currentWalletIndex]);
        this.loadBalance();
    }

    async loadWallets() {
        this.wallets = await this.walletServ.getWallets();
        if (!this.wallets || this.wallets.length === 0) {
            this.route.navigate(['/wallet/create']);
            return;
        }
        this.currentWalletIndex = await this.walletServ.getCurrentWalletIndex();
        if (this.currentWalletIndex == null || this.currentWalletIndex < 0) {
            this.currentWalletIndex = 0;
        }
        if (this.currentWalletIndex > this.wallets.length - 1) {
            this.currentWalletIndex = this.wallets.length - 1;
        }
    }

    refreshGas() {
        this.kanbanServ.getKanbanBalance(this.wallet.excoin.receiveAdds[0].address).subscribe(
            (resp: any) => {
                // console.log('resp=', resp);
                const fab = this.utilServ.stripHexPrefix(resp.balance.FAB);
                this.gas = this.utilServ.hexToDec(fab) / 1e18;

            },
            error => {
                // console.log('errorrrr=', error);
            }
        );
    }

    async loadWallet(wallet: Wallet) {
        this.wallet = wallet;

        this.exgBalance = 0;

        this.campaignorderServ.getCheck(this.exgAddress).subscribe(
            (resp: any) => {
                if (resp.ok) {
                    if (resp._body && resp._body.totalQuantities > 0) {
                        this.alertMsg = 'Disqualified with campaign';
                        if (this.lan === 'zh') {
                            this.alertMsg = '未达推广资格';
                        }

                    } else {
                        this.alertMsg = '';
                    }
                    console.log('this.alertMsg==', this.alertMsg);
                } else {
                    this.alertMsg = '';
                }
            }
        );
        // console.log('load wallet again.');
        this.refreshGas();
    }
    exchangeMoney() {
        this.route.navigate(['/market/trade/BTC_USDT']);
    }
    openModal(template: TemplateRef<any>) {
        this.modalRef = this.modalServ.show(template);
    }

    async addGasFee() {
        if (this.fabBalance < 0.5) {
            return;
        }
        // this.currentCoin = this.wallet.mycoins[1];
        this.addGasModal.show();
    }

    deposit(currentCoin: MyCoin) {
        this.currentCoin = currentCoin;
        if (currentCoin.tokenType === 'ETH') {
            this.baseCoinBalance = this.ethBalance;
        } else
            if (currentCoin.tokenType === 'FAB') {
                this.baseCoinBalance = this.fabBalance;
            }
        this.depositModal.initForm(currentCoin);
        this.depositModal.show();
    }

     redeposit(currentCoin: MyCoin) {
        this.currentCoin = currentCoin;
        console.log('this.currentCoin===', this.currentCoin);
        // this.opType = 'redeposit';
        // this.pinModal.show();
        if (this.currentCoin && this.currentCoin.redeposit && this.currentCoin.redeposit.length > 0) {
            this.redepositModal.setTransactionID(this.currentCoin.redeposit[0].transactionID);
        }

        this.redepositModal.show(currentCoin);
    }

    checkAmount(amount: number, transFee: number, tranFeeUnit: string) {
        let fabBalance = 0;
        let ethBalance = 0;
        let btcBalance = 0;
        let trxBalance = 0;

        for (let i = 0; i < this.wallet.mycoins.length; i++) {
            if (this.wallet.mycoins[i].name === 'FAB' && !fabBalance) {
                fabBalance = this.wallet.mycoins[i].balance;
            } else if (this.wallet.mycoins[i].name === 'ETH' && !ethBalance) {
                ethBalance = this.wallet.mycoins[i].balance;
            } else if (this.wallet.mycoins[i].name === 'BTC' && !btcBalance) {
                btcBalance = this.wallet.mycoins[i].balance;
            } else if (this.wallet.mycoins[i].name === 'TRX' && !trxBalance) {
                trxBalance = this.wallet.mycoins[i].balance;
            }
        }

        console.log('ethBalance=', ethBalance);
        console.log('transFee=', transFee);
        const currentCoinBalance = this.currentCoin.balance;
        const coinName = this.currentCoin.name;
        if (currentCoinBalance < amount) {
            this.alertServ.openSnackBar(
                this.translateServ.instant('InsufficientForTransaction', {coin: coinName}),
                this.translateServ.instant('Ok'));

            return false;
        }
        if (tranFeeUnit === 'BTC') {
            if (transFee > btcBalance) {
                this.alertServ.openSnackBar(
                    this.translateServ.instant('InsufficientForTransaction', {coin: tranFeeUnit}),
                    this.translateServ.instant('Ok'));
                return false;
            }
        } else if (tranFeeUnit === 'FAB') {
            if (transFee > fabBalance) {
                this.alertServ.openSnackBar(
                    this.translateServ.instant('InsufficientForTransaction', {coin: tranFeeUnit}),
                    this.translateServ.instant('Ok'));
                return false;
            }
        } else if (tranFeeUnit === 'ETH') {
            if (transFee > ethBalance) {
                this.alertServ.openSnackBar(
                    this.translateServ.instant('InsufficientForTransaction', {coin: tranFeeUnit}),
                    this.translateServ.instant('Ok'));
                return false;
            }
        } else if (tranFeeUnit === 'TRX') {
            if (transFee > trxBalance) {
                this.alertServ.openSnackBar(
                    this.translateServ.instant('InsufficientForTransaction', {coin: tranFeeUnit}),
                    this.translateServ.instant('Ok'));
                return false;
            }
        }

        if ((coinName === 'BTC') || (coinName === 'ETH') || (coinName === 'FAB') || (coinName === 'TRX')) {
            if (currentCoinBalance < amount + transFee) {
                this.alertServ.openSnackBar(
                    this.translateServ.instant('InsufficientForTransaction', {coin: coinName}),
                    this.translateServ.instant('Ok'));
                return false;
            }
        }

        return true;
    }

    onConfirmedDepositAmount(amountForm: any) {
        this.amountForm = amountForm;

        this.opType = 'deposit';
        this.pinModal.show();
    }

    onConfirmedRedepositAmount(amountForm: any) {
        this.amountForm = amountForm;
        this.opType = 'redeposit';
        this.pinModal.show();
    }

    onConfirmedLoginSetting(password: string) {
        console.log('new password=' + password);
        this.wallet = this.walletServ.updateWalletPassword(this.wallet, this.pin, password);
        this.walletServ.updateToWalletList(this.wallet, this.currentWalletIndex);
    }

    onConfirmedDisplaySetting(password: string) {
        console.log('new password=' + password);
        this.wallet = this.walletServ.updateWalletDisplayPassword(this.wallet, password);
        this.walletServ.updateToWalletList(this.wallet, this.currentWalletIndex);
    }

    onConfirmedGas(amount: number) {
        this.amount = amount;
        this.opType = 'addGas';
        this.pinModal.show();
    }

    onConfirmedCoinSent(sendCoinForm: SendCoinForm) {
        this.currentCoin = this.wallet.mycoins[sendCoinForm.coinIndex];
        this.sendCoinForm = sendCoinForm;
        this.opType = 'sendCoin';
        this.pinModal.show();
    }

    addAssets() {
        this.addAssetsModal.show();
    }

    sendCoin() {
        this.sendCoinModal.show();
    }

    onConfirmedPin(pin: string) {
        this.pin = pin;
        const pinHash = this.utilServ.SHA256(pin).toString();
        if (pinHash !== this.wallet.pwdHash) {
            this.warnPwdErr();
            return;
        }
        if (this.opType === 'deposit') {
            this.depositdo();
        } else if (this.opType === 'redeposit') {
            this.redepositdo();
        } else if (this.opType === 'addGas') {
            this.addGasDo();
        } else if (this.opType === 'sendCoin') {
            this.sendCoinDo();
        } else if (this.opType === 'showSeedPhrase') {
            this.showSeedPhrase();
        } else if (this.opType === 'verifySeedPhrase') {
            this.verifySeedPhrase();
        } else if (this.opType === 'backupPrivateKey') {
            this.backupPrivateKey();
        } else if (this.opType === 'deleteWallet') {
            this.deleteWalletModal.show();
        } else if (this.opType === 'loginSetting') {
            this.loginSettingModal.show();
        } else if (this.opType === 'displaySetting') {
            this.displaySettingModal.show();
        } else if (this.opType === 'BTCinFAB') {
            this.btcInFab();
        } else if (this.opType === 'FABinBTC') {
            this.fabInBtc();            
        } else if (this.opType === 'loadnewCoins') {
            this.loadNewCoinsDo();
        } else if(this.opType == 'addNewAsset') {
            this.addNewAssetDo();
        } else if(this.opType == 'updateWallet') {
            this.updateWalletDo();
        }
    }

    async updateWalletDo() {

        const mnemonic = this.utilServ.aesDecrypt(this.wallet.encryptedMnemonic, this.pin);

        if (!mnemonic) {
            this.warnPwdErr();
            return;
        }        
        const wallet = this.walletServ.generateWallet(this.pin, this.wallet.name, mnemonic);

        if (!wallet) {
          if (localStorage.getItem('Lan') === 'zh') {
            alert('发生错误，请再试一次。');
          } else {
            alert('Error occured, please try again.');
          }
        } else {
            this.walletServ.updateToWalletList(wallet, this.currentWalletIndex);
            this.walletUpdateToDate = true;
            this.wallet = wallet;
            await this.loadBalance();
        }         
    }

    addNewAssetDo() {

        const coin = new MyCoin(this.coinName);
        coin.new = true;
        coin.encryptedPrivateKey = this.utilServ.aesEncrypt(this.privateKey, this.pin);
        this.coinServ.fillUpAddressByPrivateKey(coin, this.privateKey);
        for(let i=0;i<this.wallet.mycoins.length;i++) {
            const item = this.wallet.mycoins[i];
            if(item.name == 'FAB' && item.receiveAdds[0].address == coin.receiveAdds[0].address) {
                this.alertServ.openSnackBarSuccess(this.translateServ.instant('FAB Coin already exists'), 'Ok');
                return;
            }
        }
        this.coinServ.updateCoinBalance(coin);
        this.wallet.mycoins.push(coin);

        if(this.coinName == 'FAB') {
            const exgCoin = this.coinServ.initToken('FAB', 'EXG', 18, environment.addresses.smartContract.EXG.FAB, coin);
            exgCoin.new = true;
            exgCoin.encryptedPrivateKey = coin.encryptedPrivateKey;
            this.coinServ.updateCoinBalance(exgCoin);

            const dusdCoin = this.coinServ.initToken('FAB', 'DUSD', 18, environment.addresses.smartContract.DUSD, coin);
            dusdCoin.new = true;
            dusdCoin.encryptedPrivateKey = coin.encryptedPrivateKey;    
            this.coinServ.updateCoinBalance(dusdCoin);

            const cnbCoin = this.coinServ.initToken('FAB', 'CNB', 18, environment.addresses.smartContract.CNB, coin);
            cnbCoin.new = true;
            cnbCoin.encryptedPrivateKey = coin.encryptedPrivateKey; 
            this.coinServ.updateCoinBalance(cnbCoin);

            this.wallet.mycoins.push(exgCoin);
            this.wallet.mycoins.push(dusdCoin);
            this.wallet.mycoins.push(cnbCoin);
        }

        this.walletServ.updateToWalletList(this.wallet, this.currentWalletIndex);

        this.alertServ.openSnackBarSuccess(this.translateServ.instant('FAB Coin was added successfully'), 'Ok');
    }

    loadNewCoinsDo() {
        const pin = this.pin;
        const seed = this.utilServ.aesDecryptSeed(this.wallet.encryptedSeed, pin);

        const myCoins = this.wallet.mycoins;

        let ethCoin;

        for (let i = 0; i < myCoins.length; i++) {
            const coin = myCoins[i];
            if (coin.name === 'ETH') {
                ethCoin = coin;
            }
        }

        const bchCoin = new MyCoin('BCH');
        this.coinServ.fillUpAddress(bchCoin, seed, 1, 0);
        myCoins.push(bchCoin);

        const ltcCoin = new MyCoin('LTC');
        this.coinServ.fillUpAddress(ltcCoin, seed, 1, 0);
        myCoins.push(ltcCoin);

        const dogCoin = new MyCoin('DOGE');
        this.coinServ.fillUpAddress(dogCoin, seed, 1, 0);
        myCoins.push(dogCoin);

        const erc20Tokens = [
            'INB', 'REP', 'HOT', 'MATIC', 'IOST', 'MANA',
            'ELF', 'GNO', 'WINGS', 'KNC', 'GVT', 'DRGN'
        ];

        for (let i = 0; i < erc20Tokens.length; i++) {
            const tokenName1 = erc20Tokens[i];
            const token1 = this.coinServ.initToken('ETH', tokenName1, 18, environment.addresses.smartContract[tokenName1], ethCoin);
            this.coinServ.fillUpAddress(token1, seed, 1, 0);
            myCoins.push(token1);
        }

        const erc20Tokens2 = [
            'FUN', 'WAX', 'MTL'
        ];

        for (let i = 0; i < erc20Tokens2.length; i++) {
            const tokenName2 = erc20Tokens2[i];
            const token2 = this.coinServ.initToken('ETH', tokenName2, 8, environment.addresses.smartContract[tokenName2], ethCoin);
            this.coinServ.fillUpAddress(token2, seed, 1, 0);
            myCoins.push(token2);
        }

        let tokenName = 'POWR';
        let token = this.coinServ.initToken('ETH', tokenName, 6, environment.addresses.smartContract[tokenName], ethCoin);
        this.coinServ.fillUpAddress(token, seed, 1, 0);
        myCoins.push(token);

        tokenName = 'CEL';
        token = this.coinServ.initToken('ETH', tokenName, 4, environment.addresses.smartContract[tokenName], ethCoin);
        this.coinServ.fillUpAddress(token, seed, 1, 0);
        myCoins.push(token);

        this.hasNewCoins = false;

        this.walletServ.updateToWalletList(this.wallet, this.currentWalletIndex);
    }

    onConfirmedDisplayPin(pin: string) {
        this.pin = pin;
        const pinHash = this.utilServ.SHA256(pin).toString();
        if (pinHash !== this.wallet.pwdDisplayHash) {
            this.warnPwdErr();
            return;
        }
        this.toggleWalletHide();
    }

    onConfirmedTools(event) {
        console.log('event-', event);
        if (event.action === 'BTCinFAB') {
            this.opType = 'BTCinFAB';
            this.toAddress = event.data;
            this.satoshisPerBytes = event.satoshisPerBytes;
            this.toolsModal.hide();
            this.pinModal.show();
        } else
        if (event.action === 'FABinBTC') {
            this.opType = 'FABinBTC';
            this.toAddress = event.data;
            this.satoshisPerBytes = event.satoshisPerBytes;
            this.toolsModal.hide();
            this.pinModal.show();
        }

    }

    toggleWalletHide() {
        this.wallet.hide = !this.wallet.hide;
        this.manageWallet.changeHideWallet();
        this.walletServ.updateWallets(this.wallets);
    }

    showSeedPhrase() {
        let seedPhrase = '';
        if (this.wallet.encryptedMnemonic) {
            seedPhrase = this.utilServ.aesDecrypt(this.wallet.encryptedMnemonic, this.pin);

            /*
            const seed = this.utilServ.aesDecrypt(this.wallet.encryptedSeed, this.pin);
            const id = this.wallet.id;
            console.log('id=', id);
            console.log('seedPhrase=', seedPhrase);
            console.log('seed=', seed);
            */
        }
        if (seedPhrase) {
            this.showSeedPhraseModal.show(seedPhrase);
        } else {
            this.warnPwdErr();
        }
    }

    warnPwdErr() {
        if (this.lan === 'zh') {
            this.alertServ.openSnackBar('密码错误', 'Ok');
        } else {
            this.alertServ.openSnackBar('Your password is invalid.', 'Ok');
        }
    }

    backupPrivateKey() {
        const seed = this.utilServ.aesDecryptSeed(this.wallet.encryptedSeed, this.pin);
        this.seed = seed;
        if (!seed) {
            this.warnPwdErr();
            return;
        }
        this.backupPrivateKeyModal.show(seed, this.wallet);
    }

    async fabInBtc() {
        const seed = this.utilServ.aesDecryptSeed(this.wallet.encryptedSeed, this.pin);
        const coin = this.coinServ.initFABinBTC(seed);
        const options = {
            satoshisPerBytes: this.satoshisPerBytes ? this.satoshisPerBytes : environment.chains.BTC.satoshisPerBytes
        };

        const { txHex, txHash, errMsg } = await this.coinService.sendTransaction(coin, seed,
            this.toAddress, 0, options, true
        );
        console.log('errMsg for sendcoin=', errMsg);
        if (errMsg) {
            this.alertServ.openSnackBar(errMsg, 'Ok');
            return;
        }
        if (txHex && txHash) {
            if (this.lan === 'zh') {
                this.alertServ.openSnackBarSuccess('交易提交成功，请等一会查看结果', 'Ok');
            } else {
                this.alertServ.openSnackBarSuccess('your transaction was submitted successful, please wait a while to check status.', 'Ok');
            }

            const item = {
                walletId: this.wallet.id,
                type: 'Send',
                coin: coin.name,
                tokenType: coin.tokenType,
                amount: 0,
                txid: txHash,
                to: this.toAddress,
                time: new Date(),
                confirmations: '0',
                blockhash: '',
                comment: '',
                status: 'pending'
            };
            this.timerServ.transactionStatus.next(item);
            this.timerServ.checkTransactionStatus(item);
            this.storageService.storeToTransactionHistoryList(item);
        }
    }

    async btcInFab() {
        const seed = this.utilServ.aesDecryptSeed(this.wallet.encryptedSeed, this.pin);
        const coin = this.coinServ.initBTCinFAB(seed);
        const options = {
            satoshisPerBytes: this.satoshisPerBytes ? this.satoshisPerBytes : environment.chains.BTC.satoshisPerBytes
        };

        const { txHex, txHash, errMsg } = await this.coinService.sendTransaction(coin, seed,
            this.toAddress, 0, options, true
        );
        console.log('errMsg for sendcoin=', errMsg);
        if (errMsg) {
            this.alertServ.openSnackBar(errMsg, 'Ok');
            return;
        }
        if (txHex && txHash) {
            if (this.lan === 'zh') {
                this.alertServ.openSnackBarSuccess('交易提交成功，请等一会查看结果', 'Ok');
            } else {
                this.alertServ.openSnackBarSuccess('your transaction was submitted successful, please wait a while to check status.', 'Ok');
            }

            const item = {
                walletId: this.wallet.id,
                type: 'Send',
                coin: coin.name,
                tokenType: coin.tokenType,
                amount: 0,
                txid: txHash,
                to: this.toAddress,
                time: new Date(),
                confirmations: '0',
                blockhash: '',
                comment: '',
                status: 'pending'
            };
            this.timerServ.transactionStatus.next(item);
            this.timerServ.checkTransactionStatus(item);
            this.storageService.storeToTransactionHistoryList(item);
        }

    }

    showLockedDetails(coin) {
        this.lockedInfoModal.show(coin);
    }
    verifySeedPhrase() {
        let seedPhrase = '';
        if (this.wallet.encryptedMnemonic) {
            seedPhrase = this.utilServ.aesDecrypt(this.wallet.encryptedMnemonic, this.pin);
        }

        if (seedPhrase) {
            this.verifySeedPhraseModal.show(seedPhrase);
        } else {
            this.warnPwdErr();
        }
    }

    onConfirmedAssets(assets: [Token]) {
        console.log('assets to be added=', assets);
        for (let i = 0; i < assets.length; i++) {
            const token = assets[i];
            const type = token.type;
            const name = token.name;
            const symbol = token.symbol;
            const addr = token.address;
            const decimals = token.decimals;
            if(name == 'FAB') {

                this.opType = 'addNewAsset';
                this.privateKey = token.privateKey;
                this.coinName = 'FAB';
                this.pinModal.show();   
                return;
            }

            for (let j = 0; j < this.wallet.mycoins.length; j++) {
                if (this.wallet.mycoins[j].name === type) {
                    const baseCoin = this.wallet.mycoins[j];
                    const mytoken = this.coinServ.initToken(type, name, decimals, addr, baseCoin, symbol);
                    mytoken.new = true;
                    this.wallet.mycoins.push(mytoken);
                    break;
                }
            }
        }
        this.walletServ.updateToWalletList(this.wallet, this.currentWalletIndex);
        this.alertServ.openSnackBar(this.translateServ.instant('Your asset was added successfully.'), this.translateServ.instant('Ok'));
    }

    async depositFab(currentCoin) {
        const amount = this.amount;
        const pin = this.pin;

        const seed = this.utilServ.aesDecryptSeed(this.wallet.encryptedSeed, pin);
        if (!seed) {
            this.warnPwdErr();
            return;
        }
        const scarAddress = await this.kanbanServ.getScarAddress();
        console.log('scarAddress=', scarAddress);
        const { txHash, errMsg } = await this.coinServ.depositFab(scarAddress, seed, currentCoin, amount);
        if (errMsg) {
            this.alertServ.openSnackBar(errMsg, 'Ok');
        } else {
            const addr = environment.addresses.exchangilyOfficial.FAB;

            const item: TransactionItem = {
                walletId: this.wallet.id,
                type: 'Add Gas',
                coin: currentCoin.name,
                tokenType: currentCoin.tokenType,
                amount: amount,
                txid: txHash,
                to: addr,
                time: new Date(),
                confirmations: '0',
                blockhash: '',
                comment: '',
                status: 'pending'
            };
            this.storageService.storeToTransactionHistoryList(item);

            if (this.lan === 'zh') {
                this.alertServ.openSnackBarSuccess('加燃料交易提交成功，请等40分钟后查看结果', 'Ok');
            } else {
                this.alertServ.openSnackBarSuccess('Add gas transaction was submitted successfully, please check gas balance 40 minutes later.', 'Ok');
            }
        }
    }

    async addGasDo() {
        /*
        if (environment.production) {
            this.alertServ.openSnackBar('Not available in production', 'Ok');
            return;
        }
        */
        const currentCoin = this.wallet.mycoins[1];
        this.depositFab(currentCoin);
    }

    async sendCoinDo() {
        const pin = this.pin;
        const currentCoin = this.wallet.mycoins[this.sendCoinForm.coinIndex];

        if(currentCoin.name == 'FAB' && currentCoin.tokenType == 'FAB') {
            currentCoin.tokenType = '';
        }        
        const amount = this.sendCoinForm.amount;

        await this.loadBalance();
        if(!this.checkAmount(this.sendCoinForm.amount, this.sendCoinForm.transFee, this.sendCoinForm.transFeeUnit)) {


            return;
        }

        const doSubmit = true;
        const options = {
            gasPrice: this.sendCoinForm.gasPrice,
            gasLimit: this.sendCoinForm.gasLimit,
            satoshisPerBytes: this.sendCoinForm.satoshisPerBytes
        };
        
        let resForSendTx;
        if(currentCoin.new && currentCoin.encryptedPrivateKey) {
            const privateKey = this.utilServ.aesDecrypt(currentCoin.encryptedPrivateKey, pin);

            resForSendTx = await this.coinService.sendTransactionWithPrivateKey(currentCoin, privateKey,
                this.sendCoinForm.to.trim(), amount, options, doSubmit
            );
        } else {
            console.log('currentCoin for sendCoinDo==', currentCoin);
            const seed = this.utilServ.aesDecryptSeed(this.wallet.encryptedSeed, pin);
            resForSendTx = await this.coinService.sendTransaction(currentCoin, seed,
                this.sendCoinForm.to.trim(), amount, options, doSubmit
            );

            console.log('resForSendTx===', resForSendTx);
        }

        
        if(!resForSendTx) {
            return;
        }
        const txHex = resForSendTx.txHex;
        const txHash = resForSendTx.txHash;
        const errMsg = resForSendTx.errMsg;
        const txids = resForSendTx.txids;
        console.log('errMsg for sendcoin=', errMsg);
        if (errMsg) {
            this.alertServ.openSnackBar(errMsg, 'Ok');
            return;
        }
        if (txHash) {
            if (this.lan === 'zh') {
                this.alertServ.openSnackBarSuccess('交易提交成功，请等一会查看结果', 'Ok');
            } else {
                this.alertServ.openSnackBarSuccess('your transaction was submitted successful, please wait a while to check status.', 'Ok');
            }

            const item = {
                walletId: this.wallet.id,
                type: 'Send',
                coin: currentCoin.symbol,
                tokenType: currentCoin.tokenType,
                amount: amount,
                txid: txHash,
                to: this.sendCoinForm.to.trim(),
                time: new Date(),
                confirmations: '0',
                blockhash: '',
                comment: this.sendCoinForm.comment,
                status: 'pending'
            };
            console.log('before next');
            this.timerServ.transactionStatus.next(item);
            this.timerServ.checkTransactionStatus(item);
            console.log('after next');
            this.storageService.storeToTransactionHistoryList(item);
            this.coinService.addTxids(txids);
        }
    }

    async redepositdo() {
        if (!this.amountForm) {
            if (this.lan === 'zh') {
                this.alertServ.openSnackBar('没有待确认的转币去交易所输入', 'Ok');
            } else {
                this.alertServ.openSnackBar('No input for confirmation of moving fund to DEX', 'OK');
            }
            return;
        }
        const transactionID = this.amountForm.transactionID;
        const gasPrice = Number(this.amountForm.gasPrice);
        const gasLimit = Number(this.amountForm.gasLimit);

        const currentCoin = this.currentCoin;
        if (!transactionID || !gasPrice || !gasLimit) {
            if (this.lan === 'zh') {
                this.alertServ.openSnackBar('没有转币去交易所输入', 'Ok');
            } else {
                this.alertServ.openSnackBar('invalid input for moving fund to DEX', 'OK');
            }
            return;
        }


        const redepositArray = currentCoin.redeposit ? currentCoin.redeposit : currentCoin.depositErr;
        // const addressInKanban = this.wallet.excoin.receiveAdds[0].address;
        if (redepositArray && redepositArray.length > 0) {

            for (let i = 0; i < redepositArray.length; i++) {
                const redepositItem = redepositArray[i];
                console.log('redepositItemyyyyy==', redepositItem);
                const amount = new BigNumber(redepositItem.amount);
                console.log('amount==', amount);
                const coinType = redepositItem.coinType;
                const r = redepositItem.r;
                const s = redepositItem.s;
                const v = redepositItem.v;
                const txid = redepositItem.transactionID;
                console.log('txid==', txid);
                if (txid !== transactionID) {
                    continue;
                }

                console.log('transactionID===', transactionID);
                this.submitrediposit(coinType, amount, transactionID, gasPrice, gasLimit);
            }
        }
    }

    async submitrediposit(coinType: number, amount: BigNumber, transactionID: string, gasPrice: number, gasLimit: number) {
        
        console.log('submit redeposit');
        const addressInKanban = this.wallet.excoin.receiveAdds[0].address;
        const nonce = await this.kanbanServ.getTransactionCount(addressInKanban);
        const pin = this.pin;

        const seed = this.utilServ.aesDecryptSeed(this.wallet.encryptedSeed, pin);

        if (!seed) {
            this.warnPwdErr();
            return;
        }

        const coinName = this.coinServ.getCoinNameByTypeId(coinType);

        console.log('coinType==' + coinType + ',coinName==' + coinName);
        if(coinName == 'USDTX') {
            coinType = this.coinServ.getCoinTypeIdByName('USDT');
        } else
        if(coinName == 'FABE') {
            coinType = this.coinServ.getCoinTypeIdByName('FAB');
        } else 
        if(coinName == 'EXGE') {
            coinType = this.coinServ.getCoinTypeIdByName('EXG');
        } else 
        if(coinName == 'DSCE') {
            coinType = this.coinServ.getCoinTypeIdByName('DSC');
        } else 
        if(coinName == 'BSTE') {
            coinType = this.coinServ.getCoinTypeIdByName('BST');
        }

        let currentCoin = this.currentCoin;
        /*
        for (let i = 0; i < this.wallet.mycoins.length; i++) {
            if (
                ((this.wallet.mycoins[i].name === coinName)) || 
                (coinName == 'USDTX' && this.wallet.mycoins[i].name == 'USDT' && this.wallet.mycoins[i].tokenType == 'TRX') ||
                (coinName == 'FABE' && this.wallet.mycoins[i].name == 'FAB' && this.wallet.mycoins[i].tokenType == 'ETH') ||
                (coinName == 'EXGE' && this.wallet.mycoins[i].name == 'EXG' && this.wallet.mycoins[i].tokenType == 'ETH') ||
                (coinName == 'DSCE' && this.wallet.mycoins[i].name == 'DSC' && this.wallet.mycoins[i].tokenType == 'ETH') ||
                (coinName == 'BSTE' && this.wallet.mycoins[i].name == 'BST' && this.wallet.mycoins[i].tokenType == 'ETH')
            ) {
                currentCoin = this.wallet.mycoins[i];
            }
        }
        */
        //console.log('for redeposit, coinType=', coinType);
        console.log('currentCoin=', currentCoin);
        if (!currentCoin) {
            if (this.lan === 'zh') {
                this.alertServ.openSnackBar('币类型错误', 'Ok');
            } else {
                this.alertServ.openSnackBar('Your coin type is invalid.', 'Ok');
            }
            return;
        }

        let coinTypePrefix = this.coinServ.getCoinTypePrefix(currentCoin);

        //console.log('coinTypePrefix==', coinTypePrefix);
        const amountInLink = amount; // it's for all coins.
        const updatedCoinType = this.coinServ.getUpdatedCoinType(currentCoin);
        const originalMessage = this.coinServ.getOriginalMessage(updatedCoinType, this.utilServ.stripHexPrefix(transactionID)
            , amountInLink, this.utilServ.stripHexPrefix(addressInKanban));





        const keyPairs = this.coinServ.getKeyPairs(currentCoin, seed, 0, 0);
        const signedMessage: Signature = await this.coinServ.signedMessage(originalMessage, keyPairs);

        const coinPoolAddress = await this.kanbanServ.getCoinPoolAddress();
        const keyPairsKanban = this.coinServ.getKeyPairs(this.wallet.excoin, seed, 0, 0);

        const abiHex = this.web3Serv.getDepositFuncABI(coinType, transactionID, amount, addressInKanban, signedMessage, coinTypePrefix);
        console.log('abiHex for redeposit===');
        console.log(abiHex);
        const options = {
            gasPrice: gasPrice,
            gasLimit: gasLimit
        };

        const txKanbanHex = await this.web3Serv.signAbiHexWithPrivateKey(abiHex, keyPairsKanban, coinPoolAddress, nonce, 0, options);
        this.kanbanServ.submitReDeposit(txKanbanHex).subscribe((resp: any) => {
            console.log('resp for submitrediposit=', resp);
            if (resp.success) {
                // const txid = resp.data.transactionID;
                this.kanbanServ.incNonce();
                if (this.lan === 'zh') {
                    this.alertServ.openSnackBarSuccess('确认交易所入币成功提交', 'Ok');
                } else {
                    this.alertServ.openSnackBarSuccess('Confirmation was submitted successfully.', 'Ok');
                }
            }
        },
            (error: any) => {
                console.log('error=', error);
                let message = 'Unknown error while confirm moving fund to DEX.';
                if (this.lan === 'zh') {
                    message = '确认交易所入币时发生未知错误';
                }
                if (error.message) {
                    message = error.message;
                } else if (error.error && error.error.message) {
                    message = error.error.message;
                }
                this.alertServ.openSnackBar(error.error.message, 'ok');
            });
    }

    /*
                amount: amount,resp
                gasPrice: gasPrresp
                gasLimit: gasLiresp
                satoshisPerByteresposhisPerBytes,
                kanbanGasPrice:respnGasPrice,
                kanbanGasLimit:respnGasLimit
    */

    async depositdo() {
        await this.loadBalance();
        if(!this.checkAmount(this.amountForm.amount, this.amountForm.transFee, this.amountForm.tranFeeUnit)) {
            return;
        }

        const currentCoin = this.currentCoin;
        if(currentCoin.name == 'FAB' && currentCoin.tokenType == 'FAB') {
            currentCoin.tokenType = '';
        }
        const amount = this.amountForm.amount;
        const pin = this.pin;

        const coinType = this.coinServ.getCoinTypeIdByName(currentCoin.name);

        console.log('coinType is', coinType);
        const seed = this.utilServ.aesDecryptSeed(this.wallet.encryptedSeed, pin);
        if (!seed) {
            this.warnPwdErr();
            return;
        }
        const keyPairs = this.coinServ.getKeyPairs(currentCoin, seed, 0, 0);

        const officalAddress = this.coinServ.getOfficialAddress(currentCoin);
        if (!officalAddress) {
            if (this.lan === 'zh') {
                this.alertServ.openSnackBar(currentCoin.name + '官方地址无效', 'Ok');
            } else {
                this.alertServ.openSnackBar('offical address for ' + currentCoin.name + ' is unavailable', 'Ok');
            }
            return;
        }
        const depositable = this.coinServ.isDepositable(currentCoin);
        if (!depositable) {
            if (this.lan === 'zh') {
                this.alertServ.openSnackBar('交易所不支持该币', 'Ok');
            } else {
                this.alertServ.openSnackBar('deposit for ' + currentCoin.name + ' is unavailable', 'Ok');
            }
            return;
        }

        const addressInKanban = this.wallet.excoin.receiveAdds[0].address;
        let keyPairsKanban = this.coinServ.getKeyPairs(this.wallet.excoin, seed, 0, 0);

        const doSubmit = false;
        const options = {
            gasPrice: this.amountForm.gasPrice,
            gasLimit: this.amountForm.gasLimit,
            satoshisPerBytes: this.amountForm.satoshisPerBytes
        };

        console.log('currentCoin for deposit=', currentCoin);
        const { txHex, txHash, errMsg, amountInTx, txids } = await this.coinServ.sendTransaction(
            currentCoin, seed, officalAddress, amount, options, doSubmit
        );

        if (errMsg) {
            this.alertServ.openSnackBar(errMsg, 'Ok');
            return;
        }

        if (!txHex) {
            if (this.lan === 'zh') {
                this.alertServ.openSnackBar('内部错误，txHex为空', 'Ok');
            } else {
                this.alertServ.openSnackBar('Internal error, txHex is null', 'Ok');
            }
            return;
        }

        if (!txHash) {
            if (this.lan === 'zh') {
                this.alertServ.openSnackBar('内部错误，txHash为空', 'Ok');
            } else {
                this.alertServ.openSnackBar('Internal error, txHash is null', 'Ok');
            }
            return;
        }
        
        const amountInLink = new BigNumber(amount).multipliedBy(new BigNumber(1e18)); // it's for all coins.

        const amountInLinkString = amountInLink.toFixed();
        const amountInTxString = amountInTx.toFixed();

        console.log('amountInLinkString=', amountInLinkString);
        console.log('amountInTxString=', amountInTxString);
        if (amountInLinkString.indexOf(amountInTxString) === -1) {
            if (this.lan === 'zh') {
                this.alertServ.openSnackBar('转账数量不相等', 'Ok');
            } else {
                this.alertServ.openSnackBar('Inequal amount for deposit', 'Ok');
            }
            return;
        }

        const subString = amountInLinkString.substr(amountInTxString.length);

        console.log('subString==', subString);
        if (subString && Number(subString) !== 0) {
            console.log('not equal 2');
            if (this.lan === 'zh') {
                this.alertServ.openSnackBar('转账数量不符合', 'Ok');
            } else {
                this.alertServ.openSnackBar('deposit amount not the same', 'Ok');
            }
            return;
        }

        let coinTypePrefix = this.coinServ.getCoinTypePrefix(currentCoin);


        const updatedCoinType = this.coinServ.getUpdatedCoinType(currentCoin);
        const originalMessage = this.coinServ.getOriginalMessage(updatedCoinType, this.utilServ.stripHexPrefix(txHash)
            , amountInLink, this.utilServ.stripHexPrefix(addressInKanban));

        console.log('originalMessage in deposit=', originalMessage);
        const signedMessage: Signature = await this.coinServ.signedMessage(originalMessage, keyPairs);


        const coinPoolAddress = await this.kanbanServ.getCoinPoolAddress();
        const abiHex = this.web3Serv.getDepositFuncABI(coinType, txHash, amountInLink, addressInKanban, signedMessage, coinTypePrefix);

        console.log('abiHex=', abiHex);
        const nonce = await this.kanbanServ.getTransactionCount(addressInKanban);
        // const nonce = await this.kanbanServ.getNonce(addressInKanban);
        // console.log('nonce there we go =', nonce);
        const optionsKanban = {
            gasPrice: this.amountForm.kanbanGasPrice,
            gasLimit: this.amountForm.kanbanGasLimit,
        };
        const txKanbanHex = await this.web3Serv.signAbiHexWithPrivateKey(abiHex, keyPairsKanban, coinPoolAddress, nonce, 0, optionsKanban);

        console.log('txKanbanHex=', txKanbanHex);
        // return 0;
        this.kanbanServ.submitDeposit(txHex, txKanbanHex).subscribe((resp: any) => {
            // console.log('resp=', resp);
            if (resp && resp.data && resp.data.transactionID) {
                /*
                const item = {
                    walletId: this.wallet.id,
                    type: 'Deposit',
                    coin: currentCoin.name,
                    tokenType: currentCoin.tokenType,
                    amount: amount,
                    txid: resp.data.transactionID,
                    to: officalAddress,
                    time: new Date(),
                    confirmations: '0',
                    blockhash: '',
                    comment: '',
                    status: 'pending'
                };
                this.storageService.storeToTransactionHistoryList(item);
                this.timerServ.transactionStatus.next(item);
                this.timerServ.checkTransactionStatus(item);
                */
                this.kanbanServ.incNonce();
                this.coinServ.addTxids(txids);
                if (this.lan === 'zh') {
                    this.alertServ.openSnackBarSuccess('转币去交易所请求已提交，请等待' + environment.depositMinimumConfirmations[currentCoin.name] + '个确认', 'Ok');
                } else {
                    this.alertServ.openSnackBarSuccess('Moving fund to DEX was submitted, please wait for ' + environment.depositMinimumConfirmations[currentCoin.name] + ' confirmations.', 'Ok');
                }
            } else if (resp.error) {
                this.alertServ.openSnackBar(resp.error, 'Ok');
            }
        },
            error => {
                console.log('error====');
                console.log(error);
                if (error.error && error.error.error) {
                    this.alertServ.openSnackBar(error.error.error, 'Ok');
                } else if (error.message) {
                    this.alertServ.openSnackBar(error.message, 'Ok');
                }
            }
        );

    }

    selectCoin(coinSymbol: string) {
        this.route.navigate(['/assets/' + coinSymbol]);
    }
}
