const fetch = require("cross-fetch");
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

let hbarPrice = 0
let saucePrice = 0
let todayVolumeUSD = 0
let totalVolumeHBAR = 0
let totalVolumeUSD = 0

let prices = []
let timeDelta = 0
let startDailyTimestamp = 0
let startWeeklyTimestamp = 0

let oneDayData_totalVolumeUSD = 0
let twoDayData_totalVolumeUSD = 0

let dailyLiquidity = []
let dailyVolume = []
let weeklyVolume = []

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

const globalDataSocket = (io) => {
console.log ("<<<<<<<<<<<<<<<")
    io.on('connection', (socket) => {
        console.log(`⚡: ${socket.id} user just connected!`);

        // const interval = setInterval(async () => {
        //     let response = await fetch("https://api.saucerswap.finance/tokens")
        //     if (response.status === 200) {
        //         let data = await response.json();
        //         let rlt = {}
        //         try {
        //             rlt = { hbarPrice: Number(data[0]['priceUsd']), saucePrice: Number(data[2]['priceUsd']) }
        //             if (hbarPrice !== rlt.hbarPrice || saucePrice !== rlt.saucePrice) {
        //                 hbarPrice = rlt.hbarPrice
        //                 saucePrice = rlt.saucePrice
        //                 io.emit('hbarAndSaucePrice', rlt);
        //             }
        //         } catch (error) {
        //             console.error(err);
        //         }
        //     }
        // }, 1000)
        // const interval2 = setInterval(async () => {
        //     let response = await fetch("https://api.saucerswap.finance/stats")
        //     if (response.status === 200) {
        //         let data = await response.json();
        //         let rlt = {}
        //         try {
        //             rlt = { totalVolumeHBAR: Number(data['tvl']) / 100000000, totalVolumeUSD: Number(data['tvlUsd']) }
        //             if (totalVolumeHBAR !== rlt.totalVolumeHBAR || totalVolumeUSD !== rlt.totalVolumeUSD) {
        //                 totalVolumeHBAR = rlt.totalVolumeHBAR
        //                 totalVolumeUSD = rlt.totalVolumeUSD
        //                 io.emit('totalVolmmeHbarAndUsd', rlt);
        //             }
        //         } catch (error) {
        //             console.error(err);
        //         }
        //     }
        // }, 1000)
        // const interval3 = setInterval(async () => {
        //     let response = await fetch("https://api.saucerswap.finance/stats/volume/daily")
        //     if (response.status === 200) {
        //         let data = await response.json();
        //         let rlt = {}
        //         try {
        //             rlt = { todayVolumeUSD: Number(data[0]['dailyVolume'] / 100000000) }
        //             if (todayVolumeUSD !== rlt.todayVolumeUSD) {
        //                 todayVolumeUSD = rlt.todayVolumeUSD
        //                 console.log(rlt)
        //                 io.emit('todayVolumeUSD', rlt);
        //             }
        //         } catch (error) {
        //             console.error(err);
        //         }
        //     }
        // }, 1000)

        // const interval10 = setInterval(async () => {
        //     setStartTimestamp()
        //     let now_date = Date.now()

        //     if (startDailyTimestamp > 0) {
        //         if (prices.length > 0) {
        //             let response = await fetch(`https://api.saucerswap.finance/stats/platformData?field=LIQUIDITY&interval=DAY&from=${startDailyTimestamp}&to=${now_date / 1000 + 1}`)
        //             if (response.status === 200) {
        //                 let data = await response.json();
        //                 let rlt = {}
        //                 try {
        //                     let diff = prices.length - data.length
        //                     for (let i = 0; i < data.length; i++) {
        //                         dailyLiquidity.push({ "liquidity": Number(data[i]['valueHbar']) / 100000000 * prices[diff + i][1], "date": data[i]['timestampSeconds'] })
        //                     }
        //                     rlt['dailyLiquidity'] = dailyLiquidity
        //                     io.emit('dailyLiquidity', rlt);
        //                 } catch (error) {
        //                     console.error(err);
        //                 }
        //             }
        //         }
        //     }
        // }, 1000)
        // const interval11 = setInterval(async () => {
        //     let now_date = Date.now()

        //     if (startDailyTimestamp > 0) {
        //         if (prices.length > 0) {
        //             let response = await fetch(`https://api.saucerswap.finance/stats/platformData?field=VOLUME&interval=DAY&from=${startDailyTimestamp}&to=${now_date / 1000 + 1}`)
        //             if (response.status === 200) {
        //                 let data = await response.json();
        //                 let rlt = {}
        //                 try {
        //                     oneDayData_totalVolumeUSD = (Number(data[data.length - 2]['valueHbar']) / 100000000 * hbarPrice)
        //                     twoDayData_totalVolumeUSD = (Number(data[data.length - 3]['valueHbar']) / 100000000 * hbarPrice)
        //                     let diff = prices.length - data.length
        //                     for (let i = 0; i < data.length; i++) {
        //                         dailyVolume.push({ "dailyVolume": Number(data[i]['valueHbar']) / 100000000 * prices[diff + i][1], "date": data[i]['timestampSeconds'] })
        //                     }
        //                     rlt['dailyVolume'] = dailyVolume
        //                     rlt['oneDayData_totalVolumeUSD'] = oneDayData_totalVolumeUSD
        //                     rlt['twoDayData_totalVolumeUSD'] = twoDayData_totalVolumeUSD
        //                     io.emit('dailyVolume', rlt);
        //                 } catch (error) {
        //                     console.error(err);
        //                 }
        //             }
        //         }
        //     }

        // }, 1000)
        // const interval12 = setInterval(async () => {
        //     let now_date = Date.now()

        //     if (startWeeklyTimestamp > 0) {
        //         if (prices.length > 0) {
        //             let response = await fetch(`https://api.saucerswap.finance/stats/platformData?field=VOLUME&interval=WEEK&from=${startDailyTimestamp}&to=${now_date / 1000 + 1}`)
        //             if (response.status === 200) {
        //                 let data = await response.json();
        //                 let rlt = {}
        //                 try {
        //                     oneWeekData_totalVolumeUSD = Number(data[data.length - 2]['valueHbar']) / 100000000 * hbarPrice
        //                     twoWeekData_totalVolumeUSD = Number(data[data.length - 3]['valueHbar']) / 100000000 * hbarPrice

        //                     let diff = prices.length - data.length
        //                     for (let i = 0; i < data.length; i++) {
        //                         weeklyVolume.push({ "weeklyVolume": Number(data[i]['valueHbar']) / 100000000 * prices[diff + i][1], "date": data[i]['timestampSeconds'] })
        //                     }
        //                     rlt['weeklyVolume'] = weeklyVolume
        //                     io.emit('weeklyVolume', rlt);
        //                 } catch (error) {
        //                     console.error(error);
        //                 }
        //             }
        //         }
        //     }
        // }, 1000)
        const interval05 = setInterval(async () => {
            setStartTimestamp ()
            console.log (timeDelta, ">>>>>>>>>")
            let now_date = Date.now()
            try {
                if (timeDelta > 10 || prices.length === 0){
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

        socket.on('disconnect', () => {
            console.log('🔥: A user disconnected');
            clearInterval (interval05);
        });
    });

}

module.exports = globalDataSocket
