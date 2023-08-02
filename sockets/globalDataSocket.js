const fetch = require("cross-fetch");
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const Visitor = require('../models/Visitor');

dayjs.extend(utc)

let prices = []
let timeDelta = 0
let startDailyTimestamp = 0
let visitors = {}
const setStartTimestamp = async () => {
    startDailyTimestamp = dayjs
        .utc()
        .subtract(
            1,
            'year'
        )
        .startOf('day')
        .unix() - 1

    startWeeklyTimestamp = dayjs
        .utc()
        .subtract(
            1,
            'week'
        )
        .startOf('day')
        .unix() - 1
}

const getDateHourString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const day = now.getDate()
    const hours = now.getHours()
    return (new Date(year, month, day, hours).valueOf()).toString()
}

const getDateString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const day = now.getDate()
    return (new Date(year, month, day).valueOf()).toString()
}

const initVisitors = async () => {
    for (let t = Number(getDateString()); t < Date.now(); t += 3600000) {
        let _data = await Visitor.find({ timestamp: t.toString() }).limit(1)
        if (_data === null || _data === undefined || _data.length === 0) continue
        visitors[_data[0]["timestamp"]] = _data[0]["count"]
    }
}

initVisitors()

const globalDataSocket = (io) => {

    io.on('connection', (socket) => {
        socket.on('visit', async ({ socketID }) => {
            if (visitors[getDateHourString()] === undefined) visitors[getDateHourString()] = 0
            visitors[getDateHourString()]++
            io.emit('visited', visitors);
            delete visitors[(Number(getDateHourString()) - 86400000).toString()]
            let _data = await Visitor.find({ timestamp: getDateHourString() }).limit(1)
            if (_data === null || _data === undefined || _data.length === 0) {
                newVisitor = new Visitor({
                    timestamp: getDateHourString(),
                    count: visitors[getDateHourString()]
                })
                await newVisitor.save()
            } else {
                await Visitor.findOneAndUpdate(
                    { timestamp: getDateHourString() },
                    {
                        count: visitors[getDateHourString()],
                    }
                );
            }
        });

        socket.on('disconnect', () => {
            console.log('🔥: A user disconnected');
        });
    });

    fetch("https://api.saucerswap.finance/tokens")
        .then(async (res1) => {
            if (res1.status !== 200) {
                console.log("Getting tokens info request failed!")
                return;
            }
            let tokens = await res1.json()

            io.on('connection', (socket) => {
                console.log(`⚡: ${socket.id} user just connected!`);
                const intervalPrices = setInterval(async () => {
                    setStartTimestamp()
                    let now_date = Date.now()
                    try {
                        if (timeDelta > 10 || prices.length === 0) {
                            if (startDailyTimestamp > 0) {
                                let response = await fetch(`https://api.coingecko.com/api/v3/coins/hedera-hashgraph/market_chart/range?vs_currency=USD&from=${startDailyTimestamp}&to=${now_date / 1000 + 1}`)
                                if (response.status === 200) {
                                    let jsonData = await response.json();
                                    prices = jsonData['prices'];
                                    console.log(prices)

                                    io.emit('getPricesResponse', prices);
                                    timeDelta = 0
                                    return
                                }
                            }
                            if (prices.length > 0) io.emit('getPricesResponse', prices);
                            timeDelta = 0
                        }
                    } catch (err) {
                        console.log(err)
                    }
                    timeDelta++
                }, 1000)

                // socket.on('getPrices', (startDailyTimestamp) => {
                //     io.emit('getPricesResponse', data);
                // });

                socket.on('SubAdd', async ({ subs }) => {
                    // io.emit('getPricesResponse', data);
                    const [symbolId, symbolName, tokenSymbol, currency] = subs.split('~')
                    let tokenId = -1
                    for (let token of tokens) {
                        if (token.symbol === tokenSymbol) {
                            tokenId = token.id; break;
                        }
                    }
                    if (tokenId === -1) {
                        io.emit("m", "~~~~~~~~0")
                        return
                    }
                    const url = `https://api.saucerswap.finance/tokens/prices/latest/${tokenId}?interval=HOUR`;
                    const res = await fetch(url)
                    if (res.status === 200) {
                        const jsonData = await res.json()
                        const data = `subAdd~exchange~${jsonData.startTimestampSeconds}~${jsonData.timestampSeconds}~~~${jsonData.timestampSeconds}~~${jsonData.closeUsd}`
                        io.emit('m', data)
                        return
                    }
                    io.emit("m", "~~~~~~~~0")
                });

                socket.on('disconnect', () => {
                    console.log('🔥: A user disconnected');
                    clearInterval(intervalPrices);
                });
            });
        });
}

module.exports = globalDataSocket
