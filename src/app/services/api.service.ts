import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import {Balance,  EthTransactionRes
    , FabTransactionResponse, CoinsPrice, BtcUtxo, KEthBalance, FabUtxo, EthTransactionStatusRes, GasPrice,
    FabTokenBalance, FabTransactionJson, BtcTransactionResponse, BtcTransaction} from '../interfaces/balance.interface';

import {Web3Service} from './web3.service';
import {UtilService} from './util.service';
import {AlertService} from './alert.service';

import { environment } from '../../environments/environment';
import TronWeb from 'tronweb';

const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider(environment.chains.TRX.fullNode);
const solidityNode = new HttpProvider(environment.chains.TRX.solidityNode);
const eventServer = new HttpProvider(environment.chains.TRX.eventServer);
const ADDRESS_PREFIX_REGEX = /^(41)/;

const tronWeb = new TronWeb(
    fullNode,
    solidityNode,
    eventServer
);

@Injectable() 
export class ApiService {
    
    constructor(private http: HttpClient, private web3Serv: Web3Service, private utilServ: UtilService, private alertServ: AlertService) { }
    
    getExTransaction(code: string) {
        const url = environment.endpoints.blockchaingate + 'payment/gateway/code/' + code;
        return this.http.get(url);
    }

    async getTrxTransactionStatus(txid: string) {
        const transactionInfo = await tronWeb.trx.getTransactionInfo(txid);
        if(transactionInfo && transactionInfo.receipt) {
            if(transactionInfo.receipt.result == 'SUCCESS') {
                return 'confirmed';
            } 
            return 'failed';
        }
        return 'pending';
    }

    getOrderByCode(code: string) {

        const url = environment.endpoints.blockchaingate + 'orders/code/' + code;
        return this.http.get(url);
    }
    
    getEXGLockerDetail(fabAddress: string) {
        const url = environment.endpoints.kanban + 'getLockerHashesByAccount/' + fabAddress;
        return this.http.get(url);
    }

    getCoin(symbol: string) {
        const url = environment.endpoints.kanban + 'coins/' + symbol;
        return this.http.get(url);
    }

    getAllCoins() {
        const url = environment.endpoints.kanban + 'coins/';
        return this.http.get(url).toPromise();
    }

    getEpayHash(paymentAmount: number, paymentUnit: string) {
        const url = environment.endpoints.blockchaingate + 'epay/hash/' + paymentAmount + '/' + paymentUnit;
        return this.http.get(url);       
    }
    /// hash/:payeeAccount/:paymentAmount/:paymentUnit
    chargeOrder(orderID, txhex: string) {
        const url = environment.endpoints.blockchaingate + 'orders/' + orderID + '/charge' ;

        const data = {
            rawTransaction: txhex
        };   
        
        return this.http.post(url, data);
    }

    updateExTransactionId(trans_code: string, txid: string) {
        const url = environment.endpoints.blockchaingate + 'payment/gateway/transaction';
        const data = {
            trans_code: trans_code,
            txid: txid
        };
        return this.http.post(url, data);
    }

    

    getSmartContractABI(address: string) {
        if (!address.startsWith('0x')) {
            address = '0x' + address;
        }
        if(
            (address == environment.addresses.smartContract.DSC.FAB)
            || (address == environment.addresses.smartContract.BST.FAB)
        ) {
            address = environment.addresses.smartContract.EXG.FAB;
        }
        const url = environment.endpoints.FAB.exchangily + 'getabiforcontract/' + address; 
        return this.http.get(url);
    }
    async getCoinsPrice() {
        const url = environment.endpoints.coingecko + 'api/v3/simple/price?ids=bitcoin,ethereum,fabcoin,tether&vs_currencies=usd';
        const response = await this.http.get(url).toPromise() as CoinsPrice;  
        return response;        
    }

    getUSDValues() {
        const url = 'https://kanbanprod.fabcoinapi.com/getexgprice';
        return this.http.get(url);
    }
    
    getBtcTransFeeEstimate() {
        const url = environment.endpoints.BTC.exchangily + 'getfeeestimate';
        return this.http.get(url);
    }

    async getBtcUtxos(address: string): Promise<[BtcUtxo]> {
        const url = environment.endpoints.BTC.exchangily + 'getutxos/' + address;
        console.log('url in getBtcUtxos' + url);
        let response = null;
        try {
            response = await this.http.get(url).toPromise() as [BtcUtxo];
        } catch (e) {console.log (e); }
        return response;
    }

    async getUtxos(coin: string, address: string): Promise<[BtcUtxo]> {
        const url = environment.endpoints[coin].exchangily + 'getutxos/' + address;
        
        console.log('url in getBtcUtxos' + url);
        let response = null;
        try {
            response = await this.http.get(url).toPromise() as [BtcUtxo];
        } catch (e) {console.log (e); }
        return response;
    }

    async getBchUtxos(address: string): Promise<[BtcUtxo]> {
        const url = environment.endpoints.BCH.exchangily + 'getutxos/' + address;
        console.log('url in getBchUtxos' + url);
        let response = null;
        try {
            response = await this.http.get(url).toPromise() as [BtcUtxo];
        } catch (e) {console.log (e); }
        return response;
    }

    async getEthGasPrice(): Promise<number> {
        const url = 'https://ethprod.fabcoinapi.com/getgasprice';
        let gasPrice = 0;
        try {
            const response = await this.http.get(url).toPromise() as GasPrice;
            gasPrice = response.gasprice;
        } catch (e) {console.log (e); }
        return gasPrice;
    }

    async getDogeUtxos(address: string): Promise<[BtcUtxo]> {
        const url = environment.endpoints.DOGE.exchangily + 'getutxos/' + address;
        console.log('url for getDogeUtxos=', url);
        let response = null;
        try {
            response = await this.http.get(url).toPromise() as [BtcUtxo];
        } catch (e) {console.log (e); }
        return response;
    }

    async getLtcUtxos(address: string): Promise<[BtcUtxo]> {
        const url = environment.endpoints.LTC.exchangily + 'getutxos/' + address;
        console.log('url for getLtcUtxos=', url);
        let response = null;
        try {
            response = await this.http.get(url).toPromise() as [BtcUtxo];
        } catch (e) {console.log (e); }
        return response;
    }

    async getBtcTransaction(txid: string) {
        txid = this.utilServ.stripHexPrefix(txid);
        const url = environment.endpoints.BTC.exchangily + 'gettransactionjson/' + txid;
        let response = null;
        try {
            response = await this.http.get(url).toPromise() as BtcTransaction;
            console.log('response=', response);
        } catch (e) {console.log (e); }
        return response;        
    }

    getBtcTransactionSync(txid: string) {
        txid = this.utilServ.stripHexPrefix(txid);
        const url = environment.endpoints.BTC.exchangily + 'gettransactionjson/' + txid;
        return this.http.get(url);        
    }
    async getEthTransaction(txid: string) {
        const url = environment.endpoints.ETH.exchangily + 'gettransaction/' + txid;
        // console.log('url=' + url);
        let response = null;
        try {
            response = await this.http.get(url).toPromise() as EthTransactionRes;
        } catch (e) {console.log (e); }
        return response; 
    }

    getEthTransactionSync(txid: string) {
        const url = environment.endpoints.ETH.exchangily + 'gettransaction/' + txid;
        return this.http.get(url);
    }

    async getEthTransactionStatus(txid: string) {
        const url = environment.endpoints.ETH.exchangily + 'gettransactionstatus/' + txid;
        console.log('url=' + url);
        let response = null;
        try {
            response = await this.http.get(url).toPromise() as EthTransactionStatusRes;
        } catch (e) {console.log (e); }
        return response;         
    }

    getEthTransactionStatusSync(txid: string) {
        const url = environment.endpoints.ETH.exchangily + 'gettransactionstatus/' + txid;
        return this.http.get(url);
    }

    async getBtcBalance(address: string): Promise<Balance> {
        const url = environment.endpoints.BTC.exchangily + 'getbalance/' + address;
        let balance = 0;
        try {
            const response = await this.http.get(url).toPromise() as number;
            balance = response;
        } catch (e) {console.log (e); }
        const lockbalance = 0;
        return {balance, lockbalance};
    }

    async getFabTransactionJson(txid: string): Promise<FabTransactionJson> {
        txid = this.utilServ.stripHexPrefix(txid);
        const url = environment.endpoints.FAB.exchangily + 'gettransactionjson/' + txid;
        const response = await this.http.get(url).toPromise() as FabTransactionJson;
        return response;
    }

    getFabTransactionJsonSync(txid: string) {
        txid = this.utilServ.stripHexPrefix(txid);
        const url = environment.endpoints.FAB.exchangily + 'gettransactionjson/' + txid;
        return this.http.get(url);
    }

    async isFabTransactionLocked(txid: string, idx: number): Promise<boolean> {
        
        const response = await this.getFabTransactionJson(txid);
        // console.log('response in isFabTransactionLocked=', response);
        if (response.vin && response.vin.length > 0) {
            const vin = response.vin[0];
            // console.log('vin=', vin);
            // console.log('idx=', idx);
            if (idx === 0 && vin.coinbase) {
                if (response.confirmations <= 800) {
                    return true;
                }
            }
        }
        return false;
    }

    async getFabUtxos(address: string): Promise<[FabUtxo]> {
        const url = environment.endpoints.FAB.exchangily + 'getutxos/' + address;
        const response = await this.http.get(url).toPromise() as [FabUtxo];
        return response;
    }
    async getFabBalance(address: string): Promise<Balance> {

       let balance = 0;
       let lockbalance = 0;
       const utxos = await this.getFabUtxos(address);
       if (utxos) {
        for (let i = 0; i < utxos.length; i++) {
            const utxo = utxos[i];
            const value = utxo.value;
            const txid = utxo.txid;
            const idx = utxo.idx;
            /*
            const isLock = await this.isFabTransactionLocked(txid, idx);
            if (isLock) {
                lockbalance += value;
            } else {
                balance += value;
            }
            */
           balance += value;
        }
       }

       lockbalance = await this.getFabLockBalance(address);
       // console.log('balance=', balance);
       // console.log('lockbalance=', lockbalance);
       return {balance, lockbalance};

    }

    async getEthNonce (address: string) {
        const url = environment.endpoints.ETH.exchangily + 'getnonce/' + address + '/latest';
        const response = await this.http.get(url).toPromise() as string;
        return Number (response);
    }

    async postEthTx(txHex: string) {
        // console.log('postEthTx here we go');
        // account for https://etherscan.io  keninqiu   82239^
        // token: M5TN678RMY96HIZVKIAIK22WKQ6CN7R7JB

        /*
        const url = environment.endpoints.ETH.etherscan + 'api?module=proxy&action=eth_sendRawTransaction&hex='
        + txHex + '&apikey=M5TN678RMY96HIZVKIAIK22WKQ6CN7R7JB';
        let response = null;
        if (txHex) {
            response = await this.http.get(url).toPromise() as EthTransaction;
        }
        console.log('response for postEthTx=');
        console.log(response);
        if (response) {
            if (response.result) {
                return response.result;
            }
            if (response.error && response.error.message) {
                this.alertServ.openSnackBar(response.error.message, 'Ok');
            }
        }
        */
        let txHash = '';
        let errMsg = '';
        const url = environment.endpoints.ETH.exchangily + 'sendsignedtransaction';
        const data = {
            signedtx: txHex
        };
        if (txHex) {
            try {
                txHash = await this.http.post(url, data, {responseType: 'text'}).toPromise() as string;
            } catch (err) {
                console.log('errqqq=', err);
                if (err.error) {
                 errMsg = err.error;
                }
 
            }          
        }    

        return {txHash, errMsg};
    }

    async getFabLockBalance(address: string) {
        const fabSmartContractAddress = environment.addresses.smartContract.FABLOCK;
        const getLockedInfoABI = '43eb7b44';
        const url = environment.endpoints.FAB.exchangily + 'callcontract';
        const data = {
            address: this.utilServ.stripHexPrefix(fabSmartContractAddress),
            data: this.utilServ.stripHexPrefix(getLockedInfoABI),
            sender: address
        };  
        const response = await this.http.post(url, data, {responseType: 'text'}).toPromise() as string;
        const json = JSON.parse(response);
        let balance = 0;
        if (json && json.executionResult && json.executionResult.output) {
            const balanceHex = json.executionResult.output;
            // console.log('balanceHex=', balanceHex);
            const decoded = this.web3Serv.decodeParameters(['uint256[]','uint256[]'], balanceHex);
            // console.log('decoded', decoded);
            // console.log('decoded.1', decoded[1]);
            if (decoded && decoded[1]) {
                // console.log('got it,decoded[1.length=', decoded[1].length);
                for (let i = 0; i < decoded[1].length; i++) {
                    const value = decoded[1][i];
                    balance += Number(value);
                }
            }
        }
        return balance;
    }
    callFabSmartContract(address: string, abiHex: string, sender: string) {
        const url = environment.endpoints.FAB.exchangily + 'callcontract';
        const data = {
            address: address,
            data: abiHex,
            sender: sender
        };   
        return this.http.post(url, data);     
    }

    async postFabTx(txHex: string) {
        
        /*
        const url = 'http://fabtest.info:9001/fabapi/' + '/sendrawtransaction/' + txHex;
        console.log('txHex=' + txHex);
        console.log('url=' + url);
        let response = null;
        if (txHex) {
            response = await this.http.get(url).toPromise() as FabTransactionResponse;
        }
        console.log('response from postFabTx=');
        console.log(response);
        let ret = '';
        if (response && response.txid) {
            ret = '0x' + response.txid;
        }
        console.log('ret from postFabTx=' + ret);
        return ret;
        */
       const url = environment.endpoints.FAB.exchangily + 'postrawtransaction';

       // console.log('url here we go:', url);
       let txHash = '';
       let errMsg = '';
       const data = {
        rawtx: txHex
       };
       if (txHex) {
           try {
            const json = await this.http.post(url, data).toPromise() as FabTransactionResponse;
            console.log('json there we go=', json);
            if (json) {
                if (json.txid) {
                    txHash = json.txid;
                } else 
                if (json.Error) {
                    errMsg = json.Error;
                } 
            }
           } catch (err) {
               if (err.error && err.error.Error) {
                errMsg = err.error.Error;
                console.log('err there we go', err.error.Error);
               }

           }

       }       

       return {txHash, errMsg};
    }

    async postBtcTx(txHex: string) {
       let txHash = '';
       let errMsg = '';
       const url = environment.endpoints.BTC.exchangily + 'postrawtransaction';
       let response = null;

       const data = {
        rawtx: txHex
       };

       try {
            if (txHex) {
                response = await this.http.post(url, data).toPromise() as BtcTransactionResponse;
            }
            if (response && response.txid) {
            txHash = '0x' + response.txid;
            }
       } catch (err) {
            if (err.error && err.error.Error) {
            errMsg = err.error.Error;
            console.log('err there we go', err.error.Error);
           }
       }

       //return ret;
       return {txHash, errMsg};
    }

    async postTx(coin, txHex: string) {
        let txHash = '';
        let errMsg = '';
        const url = environment.endpoints[coin].exchangily + 'postrawtransaction';
        let response = null;
 
        const data = {
         rawtx: txHex
        };
 
        try {
             if (txHex) {
                 response = await this.http.post(url, data).toPromise() as BtcTransactionResponse;
             }
             if (response && response.txid) {
             txHash = '0x' + response.txid;
             }
        } catch (err) {
             if (err.error && err.error.Error) {
             errMsg = err.error.Error;
             console.log('err there we go', err.error.Error);
            }
        }
 
        //return ret;
        return {txHash, errMsg};
     }

    async postBchTx(txHex: string) {
        let txHash = '';
        let errMsg = '';
        const url = environment.endpoints.BCH.exchangily + 'postrawtransaction';
        let response = null;
 
        const data = {
         rawtx: txHex
        };
 
        try {
             if (txHex) {
                 response = await this.http.post(url, data).toPromise() as BtcTransactionResponse;
             }
             if (response && response.txid) {
             txHash = '0x' + response.txid;
             }
        } catch (err) {
             if (err.error && err.error.Error) {
             errMsg = err.error.Error;
             console.log('err there we go', err.error.Error);
            }
        }
 
        //return ret;
        return {txHash, errMsg};
     }

     async postDogeTx(txHex: string) {
        let txHash = '';
        let errMsg = '';
        const url = environment.endpoints.DOGE.exchangily + 'postrawtransaction';
        let response = null;
 
        const data = {
         rawtx: txHex
        };
 
        try {
             if (txHex) {
                 response = await this.http.post(url, data).toPromise() as BtcTransactionResponse;
             }
             if (response && response.txid) {
             txHash = '0x' + response.txid;
             }
        } catch (err) {
             if (err.error && err.error.Error) {
             errMsg = err.error.Error;
             console.log('err there we go', err.error.Error);
            }
        }
 
        //return ret;
        return {txHash, errMsg};
     }

     async postLtcTx(txHex: string) {
        let txHash = '';
        let errMsg = '';
        const url = environment.endpoints.LTC.exchangily + 'postrawtransaction';
        let response = null;
 
        const data = {
         rawtx: txHex
        };
 
        try {
             if (txHex) {
                 response = await this.http.post(url, data).toPromise() as BtcTransactionResponse;
             }
             if (response && response.txid) {
             txHash = '0x' + response.txid;
             }
        } catch (err) {
             if (err.error && err.error.Error) {
             errMsg = err.error.Error;
             console.log('err there we go', err.error.Error);
            }
        }
 
        //return ret;
        return {txHash, errMsg};
     }     
    async getEthBalance(address: string): Promise<Balance> {
       const url = environment.endpoints.ETH.exchangily + 'getbalance/' + address;
       const response = await this.http.get(url).toPromise()  as KEthBalance;
       const balance = response.balance;
       const lockbalance = 0;
       return {balance, lockbalance};  
    }

    async getBchBalance(address: string): Promise<Balance> {
        const url = environment.endpoints.BCH.exchangily + 'getbalance/' + address;
        const response = await this.http.get(url).toPromise()  as number;
        const balance = response;
        const lockbalance = 0;
        return {balance, lockbalance};  
     }

    async getEthTokenBalance(name: string, contractAddress: string, address: string) {
        /*
        const url = environment.endpoints.ETH.etherscan + 'api?module=account&action=tokenbalance&contractaddress='
        + contractAddress + '&address=' + address + '&tag=latest&apikey=M5TN678RMY96HIZVKIAIK22WKQ6CN7R7JB';
        console.log('url for getEthTokenBalance=' + url);
        const response = await this.http.get(url).toPromise()  as EthBalance;
        const balance = response.result;
        */
       if (name === 'USDT') {
        contractAddress = environment.addresses.smartContract.USDT.ETH;
       }
       let balance = 0;
       try {
        const url = environment.endpoints.ETH.exchangily + 'callcontract/' + contractAddress + '/' + address;
        const response = await this.http.get(url).toPromise()  as KEthBalance;
        balance = response.balance; 
       } catch(e) {
           
       }
      
        const lockbalance = 0;
        return {balance, lockbalance}; 
    }

    getWalletBalance(data) {
        const url = environment.endpoints.kanban + 'walletBalances';
        return this.http.post(url, data);
    }

    getTransactionHistoryEvents(data) {
        const url = environment.endpoints.kanban + 'getTransactionHistoryEvents';
        return this.http.post(url, data);
    }

    async getFabTransactionReceiptAsync(txid: string) {
        const url = environment.endpoints.FAB.exchangily + 'gettransactionreceipt/' + txid;

        return await this.http.get(url).toPromise();
    }

    async fabCallContract(contractAddress: string, fxnCallHex: string) {
        const url = environment.endpoints.FAB.exchangily + 'callcontract';

        contractAddress = this.utilServ.stripHexPrefix(contractAddress);     
        const data = {address: contractAddress, data: fxnCallHex};

        const formData: FormData = new FormData(); 
        formData.append('address', contractAddress); 
        formData.append('data', fxnCallHex); 

        const response = await this.http.post(url, formData).toPromise() as FabTokenBalance;
        return response;
    }

    async getFabTokenBalance(name: string, address: string, contractAddress?: string) {
        if(!contractAddress) {
            contractAddress = environment.addresses.smartContract[name];
        }
        if(typeof contractAddress != 'string') {
            contractAddress = contractAddress['FAB'];
        }
        let fxnCallHex = this.web3Serv.getFabTokenBalanceOfABI([address]);
        console.log('name=', name);
        console.log('fxnCallHex there we go=', fxnCallHex);
        fxnCallHex = this.utilServ.stripHexPrefix(fxnCallHex); 
        const response = await this.fabCallContract(contractAddress, fxnCallHex);    
        let balance = 0;
        const lockbalance = 0;
        if (response && response.executionResult && response.executionResult.output) {
            const balanceHex = response.executionResult.output;
            balance = parseInt(balanceHex, 16);
        }
        return {balance, lockbalance};    
    }
    async getExgBalance(address: string) {
        const contractAddress = environment.addresses.smartContract.EXG.FAB;
        // console.log('contractAddress=' + contractAddress + ',address=' + address);
        let fxnCallHex = this.web3Serv.getFabBalanceOfABI([address]);
        fxnCallHex = this.utilServ.stripHexPrefix(fxnCallHex); 

        //console.log('fxnCallHex for EXGA', fxnCallHex);
        let response = await this.fabCallContract(contractAddress, fxnCallHex);

        // console.log('response=', response);
        let balance = 0;
        if (response && response.executionResult && response.executionResult.output) {
            const balanceHex = response.executionResult.output;
            balance = parseInt(balanceHex, 16);
        }



        fxnCallHex = this.web3Serv.getFabFrozenBalanceABI([address]);
        fxnCallHex = this.utilServ.stripHexPrefix(fxnCallHex);
        
        response = await this.fabCallContract(contractAddress, fxnCallHex);

        let lockbalance = 0;
        if (response && response.executionResult && response.executionResult.output) {
            const balanceHex = response.executionResult.output;
            // console.log('response here we go:', response);
            
            if (balanceHex) {
                lockbalance = parseInt(balanceHex, 16);
            }
        }
        return {balance, lockbalance};
    }

    postCampaignSingleDetail(id: string) {
        const url = environment.endpoints.kanban + 'kanban/getCampaignSingle';
        const data = {"id":id};
        return this.http.post(url, data);
    }
}
