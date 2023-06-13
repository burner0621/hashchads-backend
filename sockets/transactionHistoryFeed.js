const fetch = require('cross-fetch')
const { AccountId, ContractId } = require("@hashgraph/sdk");

const exampleAddress = "0.0.1456985";

// Check if the address is an account or a contract
if (AccountId.fromString(exampleAddress) instanceof AccountId) {
  console.log("This is an account address.");
} else if (ContractId.fromString(exampleAddress) instanceof ContractId) {
  console.log("This is a contract address.");
} else {
  console.log("This is not a valid Hedera address.");
}

const TradeHistory = require('../models/TradeHistory');
const MIRRORNODE_URL = 'https://mainnet-public.mirrornode.hedera.com'
let swapData = {}

const sleep = (delay) => {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

let nextLink = ''
let lastTransactioTimestamp = undefined
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

                    let _data = await TradeHistory.find({}).sort({ timestamp: -1 }).limit(1)
                    if (_data === null || _data === undefined || _data.length === 0) {
                        lastTransactioTimestamp = startTime
                    } else{
                        lastTransactioTimestamp = _data[0].timestamp
                    }
                    const getSwapData = async () => {
                        let response, url = '';
                        if (nextLink === '') {
                            if (lastTransactioTimestamp)
                                url = `/api/v1/transactions?timestamp=gt:${lastTransactioTimestamp}&limit=100&transactiontype=CRYPTOTRANSFER&order=asc`
                            else
                                url = `/api/v1/transactions?limit=100&transactiontype=CRYPTOTRANSFER&order=asc`
                        } else {
                            url = nextLink
                        }
                        console.log(`${MIRRORNODE_URL}${url}`)
                        // sleep(1000)
                        response = await fetch(`${MIRRORNODE_URL}${url}`)
                        if (response.status === 200) {
                            let jsonData = await response.json()
                            let dic = {}
                            if (jsonData.transactions && jsonData.transactions.length > 0) {
                                for (let transaction of jsonData.transactions) {
                                    if (lastTransactioTimestamp && lastTransactioTimestamp >= transaction['valid_start_timestamp']) {
                                        continue
                                    }

                                    if (transaction.token_transfers === undefined) continue;
                                    if (dic[transaction.transaction_id]) {
                                        if (transaction.token_transfers.length === 2) {
                                            dic[transaction.transaction_id].push(transaction)
                                        }
                                    }
                                    if (dic[transaction.transaction_id] === undefined) {
                                        if (transaction.token_transfers) {
                                            dic[transaction.transaction_id] = [transaction]
                                        }
                                    }
                                }
                                for (let transactionId in dic) {
                                    if (dic[transactionId].length === 1) continue
                                    console.log (`---------------${transactionId}----------------`)
                                    let account = transactionId.split("-")[0]
                                    let timestamp = transactionId.split("-")[1] + "." + transactionId.split("-")[2]
                                    let firstTransaction = dic[transactionId][0]
                                    let lastTransaction = dic[transactionId][dic[transactionId].length - 1]
                                    let state = "", buyAmount = 0, sellAmount = 0, position = "", buyToken = "", sellToken="";
                                    if (firstTransaction.token_transfers[0]["account"] === account || firstTransaction.token_transfers[1]["account"] === account) {
                                        if (firstTransaction.token_transfers[0]["account"] === account) {
                                            state = firstTransaction.token_transfers[0]["amount"] > 0 ? "buy" : "sell"
                                            buyToken = state === "buy" ? firstTransaction.token_transfers[0]["token_id"] : ""
                                            sellToken = state === "sell" ? firstTransaction.token_transfers[0]["token_id"] : ""
                                            buyAmount = state === "buy" ? firstTransaction.token_transfers[0]["amount"] : 0
                                            sellAmount = state === "sell" ? firstTransaction.token_transfers[0]["amount"] : 0
                                        }
                                        if (firstTransaction.token_transfers[1]["account"] === account) {
                                            state = firstTransaction.token_transfers[1]["amount"] > 0 ? "buy" : "sell"
                                            buyToken = state === "buy" ? firstTransaction.token_transfers[1]["token_id"] : ""
                                            sellToken = state === "sell" ? firstTransaction.token_transfers[1]["token_id"] : ""
                                            buyAmount = state === "buy" ? firstTransaction.token_transfers[1]["amount"] : 0
                                            sellAmount = state === "sell" ? firstTransaction.token_transfers[1]["amount"] : 0
                                        }
                                        position = "first"
                                    } else if (lastTransaction.token_transfers[0]["account"] === account || lastTransaction.token_transfers[1]["account"] === account) {
                                        if (lastTransaction.token_transfers[0]["account"] === account) {
                                            state = lastTransaction.token_transfers[0]["amount"] > 0 ? "buy" : "sell"
                                            buyToken = state === "buy" ? lastTransaction.token_transfers[0]["token_id"] : ""
                                            sellToken = state === "sell" ? lastTransaction.token_transfers[0]["token_id"] : ""
                                            buyAmount = state === "buy" ? lastTransaction.token_transfers[0]["amount"] : 0
                                            sellAmount = state === "sell" ? lastTransaction.token_transfers[0]["amount"] : 0
                                        }
                                        if (lastTransaction.token_transfers[1]["account"] === account) {
                                            state = lastTransaction.token_transfers[1]["amount"] > 0 ? "buy" : "sell"
                                            buyToken = state === "buy" ? lastTransaction.token_transfers[1]["token_id"] : ""
                                            sellToken = state === "sell" ? lastTransaction.token_transfers[1]["token_id"] : ""
                                            buyAmount = state === "buy" ? lastTransaction.token_transfers[1]["amount"] : 0
                                            sellAmount = state === "sell" ? lastTransaction.token_transfers[1]["amount"] : 0
                                        }
                                        position = "last"
                                    }

                                    if (buyAmount === 0 && sellAmount === 0) continue

                                    if (buyAmount === 0) {
                                        buyAmount = position === "first" ? lastTransaction.token_transfers[0]["amount"] : firstTransaction.token_transfers[0]["amount"]
                                        buyToken = position === "first" ? lastTransaction.token_transfers[0]["token_id"] : firstTransaction.token_transfers[0]["token_id"]
                                    } if (sellAmount === 0) {
                                        sellAmount = position === "first" ? lastTransaction.token_transfers[0]["amount"] : firstTransaction.token_transfers[0]["amount"]
                                        sellToken = position === "first" ? lastTransaction.token_transfers[0]["token_id"] : firstTransaction.token_transfers[0]["token_id"]
                                    }

                                    if (decimalObj[buyToken] === undefined) {
                                        const tokenResponse = await fetch(`${MIRRORNODE_URL}/api/v1/tokens/${buyToken}`)
                                        if (tokenResponse.status === 200) {
                                            const tokenData = await tokenResponse.json()
                                            decimalObj[buyToken] = tokenData["decimals"]
                                        }
                                    }
                                    if (decimalObj[sellToken] === undefined) {
                                        const tokenResponse = await fetch(`${MIRRORNODE_URL}/api/v1/tokens/${sellToken}`)
                                        if (tokenResponse.status === 200) {
                                            const tokenData = await tokenResponse.json()
                                            decimalObj[sellToken] = tokenData["decimals"]
                                        }
                                    }

                                    if (buyAmount !== 0 && sellAmount !== 0) {
                                        newData = new TradeHistory({
                                            timestamp: firstTransaction.valid_start_timestamp,
                                            datetime: firstTransaction.valid_start_timestamp,
                                            tokenId: buyToken,
                                            accountId: account,
                                            amount: Math.abs(Number(buyAmount)) / Math.pow(10, decimalObj[buyToken]),
                                            state: 'buy',
                                            transactionId: transactionId
                                        });
                                        await newData.save();
                                        newData = new TradeHistory({
                                            timestamp: firstTransaction.valid_start_timestamp,
                                            datetime: firstTransaction.valid_start_timestamp,
                                            tokenId: sellToken,
                                            accountId: account,
                                            amount: Math.abs(Number(sellAmount)) / Math.pow(10, decimalObj[sellToken]),
                                            state: 'sell',
                                            transactionId: transactionId
                                        });
                                        await newData.save();
                                    }
                                  
                                    lastTransactioTimestamp = firstTransaction.valid_start_timestamp
                                }
                            }
                            if (jsonData.links.next) {
                                nextLink = jsonData.links.next
                            }
                        }
                        setTimeout(async () => await getSwapData(), 300)
                    }
                    // const timeout = setTimeout(async () => {
                    //     await getSwapData()
                    // }, 300)

                });
        })

}

module.exports = pairSwapSocket