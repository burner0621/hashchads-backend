const fetch = require('cross-fetch')
const TradeHistory = require('../models/TradeHistory');
const MIRRORNODE_URL = 'https://mainnet-public.mirrornode.hedera.com'
let swapData = {}

const sleep = (delay) => {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

let nextLink = {}
let lastTransactioTimestamp = {}
const startTime = Date.now() / 1000 - 86400 * 3
const pairSwapSocket = () => {

    fetch("https://api.saucerswap.finance/pools")
        .then(async (res) => {
            if (res.status !== 200) {
                console.log("Getting pools info request failed!")
                return;
            }
            let pools = await res.json()
            console.log(`⚡: Getting pools info successfully!`);
            fetch("https://api.saucerswap.finance/tokens")
                .then(async (res1) => {
                    if (res1.status !== 200) {
                        console.log("Getting tokens info request failed!")
                        return;
                    }
                    let tokens = await res1.json()
                    console.log(`⚡: Getting tokens info successfully!`);
                    let decimalObj = {}
                    for (let token of tokens) {
                        decimalObj[token.id] = Number(token.decimals)
                    }
                    for (let pool of pools) {
                        if (pool.lpToken && pool.lpToken.id && pool.lpToken.decimals)
                            decimalObj[pool.lpToken.id] = Number(pool.lpToken.decimals)
                    }

                    for (let pool of pools) {
                        let _data = await TradeHistory.find({ poolId: pool.contractId }).sort({ timestamp: -1 }).limit(1)
                        if (_data === null || _data === undefined || _data.length === 0) {
                            lastTransactioTimestamp[pool.contractId] = startTime
                            continue
                        }
                        lastTransactioTimestamp[pool.contractId] = _data[0].timestamp
                    }
                    const getSwapData = async () => {
                        for (let pool of pools) {

                            console.log("Trade History============", pool.contractId, "============");
                            let response, url = '';
                            if (nextLink[pool.contractId] === undefined) {
                                if (lastTransactioTimestamp[pool.contractId])
                                    url = `/api/v1/transactions?account.id=${pool.contractId}&timestamp=gt:${lastTransactioTimestamp[pool.contractId]}&limit=100&transactiontype=CRYPTOTRANSFER&order=asc`
                                else
                                    url = `/api/v1/transactions?account.id=${pool.contractId}&limit=100&transactiontype=CRYPTOTRANSFER&order=asc`
                            } else {
                                url = nextLink[pool.contractId]
                            }
                            console.log(`${MIRRORNODE_URL}${url}`)
                            // sleep(1000)
                            response = await fetch(`${MIRRORNODE_URL}${url}`)
                            console.log(`---------------Fetch Run--------------`)
                            if (response.status === 200) {
                                let jsonData = await response.json()
                                let dic = {}
                                if (jsonData.transactions && jsonData.transactions.length > 0) {
                                    // for (let transaction of jsonData.transactions) {
                                    //     if (lastTransactioTimestamp[pool.contractId] && lastTransactioTimestamp[pool.contractId] >= transaction['valid_start_timestamp']) {
                                    //         continue
                                    //     }
                                    //     let item0, item1;
                                    //     if (transaction.token_transfers && transaction.token_transfers.length === 2 && transaction.node === null) {
                                    //         if (transaction['token_transfers'][1]['account'] === pool.contractId) {
                                    //             item0 = transaction['token_transfers'][0]
                                    //             item1 = transaction['token_transfers'][1]
                                    //         }
                                    //         else if (transaction['token_transfers'][0]['account'] === pool.contractId) {
                                    //             item0 = transaction['token_transfers'][1]
                                    //             item1 = transaction['token_transfers'][0]
                                    //         }

                                    //         if ((Number(item0.amount) / Number(item1.amount)) !== -1) continue
                                    //         console.log("Trade History ============================", item0.amount, transaction.transaction_id, "============================")
                                    //         let newData = new TradeHistory({
                                    //             timestamp: transaction.valid_start_timestamp,
                                    //             datetime: transaction.valid_start_timestamp,
                                    //             poolId: pool.contractId,
                                    //             tokenId: item0.token_id,
                                    //             accountId: item0.account,
                                    //             amount: Number(item0.amount) / Math.pow(10, decimalObj[item0.token_id]),
                                    //             state: Number(item0.amount) > 0 ? 'buy' : 'sell',
                                    //             transactionId: transaction.transaction_id
                                    //         });
                                    //         await newData.save();
                                    //         lastTransactioTimestamp[pool.contractId] = transaction.valid_start_timestamp
                                    //     }
                                    // }
                                    for (let transaction of jsonData.transactions) {
                                        if (lastTransactioTimestamp[pool.contractId] && lastTransactioTimestamp[pool.contractId] >= transaction['valid_start_timestamp']) {
                                            continue
                                        }
                                        if (dic[transaction.transaction_id]) {
                                            if (transaction.token_transfers.length === 2) {
                                                dic[transaction.transaction_id].push(transaction)
                                            }
                                        }
                                        if (dic[transaction.transaction_id] === undefined) {
                                            if (transaction.token_transfers && transaction.token_transfers.length === 2) {
                                                dic[transaction.transaction_id] = [transaction]
                                            }
                                        }
                                    }
                                    for (let transactionId in dic) {
                                        if (dic[transactionId].length !== 2) continue
                                        let item0 = dic[transactionId][0]['token_transfers'][1], item1 = dic[transactionId][1]['token_transfers'][1]
                                        let account0 = dic[transactionId][0]['token_transfers'][0], account1 = dic[transactionId][1]['token_transfers'][0]
                                        if (dic[transactionId][0]['token_transfers'][1]['account'] === pool.contractId) {
                                            item0 = dic[transactionId][0]['token_transfers'][1]
                                            account0 = dic[transactionId][0]['token_transfers'][0]
                                        }
                                        else if (dic[transactionId][0]['token_transfers'][0]['account'] === pool.contractId) {
                                            item0 = dic[transactionId][0]['token_transfers'][0]
                                            account0 = dic[transactionId][0]['token_transfers'][1]
                                        }
                                        if (dic[transactionId][1]['token_transfers'][1]['account'] === pool.contractId) {
                                            item1 = dic[transactionId][1]['token_transfers'][1]
                                            account1 = dic[transactionId][1]['token_transfers'][0]
                                        }
                                        else if (dic[transactionId][1]['token_transfers'][0]['account'] === pool.contractId) {
                                            item1 = dic[transactionId][1]['token_transfers'][0]
                                            account1 = dic[transactionId][1]['token_transfers'][1]
                                        }
                                        // if (Math.abs(dic[transactionId][0]['nonce'] - dic[transactionId][1]['nonce']) !== 1) continue
                                        if (item0.account !== pool.contractId || item0.account !== item1.account) continue
                                        if ((Number(item0.amount) / Math.abs(Number(item0.amount))) * (Number(item1.amount) / Math.abs(Number(item1.amount))) !== -1) continue
                                        console.log("============================", transactionId, "============================")
                                        let newData = new TradeHistory({
                                            timestamp: dic[transactionId][0].valid_start_timestamp,
                                            datetime: dic[transactionId][0].valid_start_timestamp,
                                            poolId: pool.contractId,
                                            tokenId: account0.token_id,
                                            accountId: account0.account,
                                            amount: Number(account0.amount) / Math.pow(10, decimalObj[account0.token_id]),
                                            state: Number(account0.amount) > 0 ? 'buy' : 'sell',
                                            transactionId: transactionId
                                        });
                                        await newData.save();

                                        newData = new TradeHistory({
                                            timestamp: dic[transactionId][1].valid_start_timestamp,
                                            datetime: dic[transactionId][1].valid_start_timestamp,
                                            poolId: pool.contractId,
                                            tokenId: account1.token_id,
                                            accountId: account1.account,
                                            amount: Number(account1.amount) / Math.pow(10, decimalObj[account1.token_id]),
                                            state: Number(account1.amount) > 0 ? 'buy' : 'sell',
                                            transactionId: transactionId
                                        });
                                        await newData.save();
                                        lastTransactioTimestamp[pool.contractId] = dic[transactionId][0].valid_start_timestamp
                                    }
                                }
                                if (jsonData.links.next === null || jsonData.links.next === "null") {
                                    continue
                                }
                                nextLink[pool.contractId] = jsonData.links.next

                            }
                        }
                        setTimeout(await getSwapData(), 300)
                    }
                    const timeout = setTimeout(async () => {
                        await getSwapData()
                    }, 300)

                });
        })

}

module.exports = pairSwapSocket