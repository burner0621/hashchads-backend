const fetch = require ("cross-fetch")
const {ProxyAgent} = require ('proxy-agent')
const fs = require('fs');
const getStream = require('get-stream');
const {parse} = require('csv-parse');
const config = require('../config/config');

let proxyList = {}

const readCSVData = async (filePath) => {
  const parseStream = parse({delimiter: ','});
  const data = await getStream.array(fs.createReadStream(filePath).pipe(parseStream));
  return data
}

let tokenDailyPriceData = {}

const sleep = (delay) => {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

const initDailyPriceData = async () => {
    let proxyLen = proxyList.length; 
    let i = 0;
    let res = await fetch("https://api.saucerswap.finance/tokens")
    if (res.status !== 200) {
        console.log("Getting tokens info request failed!")
        return;
    }
    const now_date = new Date() / 1000
    const start_date = now_date - 86400 * 31
    let tokens = await res.json()
    for (let token of tokens) {
        const proxy = new ProxyAgent(`${proxyList[i][2].toLowerCase()}://${proxyList[i][0]}:${proxyList[i][1]}`);
        let res = await fetch(`https://api.saucerswap.finance/tokens/prices/${token.id}?interval=DAY&from=${start_date}&to=${now_date}`, {agent: proxy})
        if (res.status === 200) {
            const dailyPrice = await res.json()
            tokenDailyPriceData[token['id']] = dailyPrice
        }
        i = (++ i) % proxyLen
    }
    console.log("===================== Got daily price data =====================")
    setTimeout(async () => await initDailyPriceData(), 3600000)
}

const dailyPriceTimeout = setTimeout(async () => {
    proxyList = await readCSVData ("proxylist/" + config.proxyListFile)
    await initDailyPriceData()
}, 0)

const dailyPriceDataSocket = (io) => {
    io.on('connection', (socket) => {
        socket.on('dailyPriceData', () => {
            io.emit('getDailyPriceData', tokenDailyPriceData)
        });

        socket.on('disconnect', () => {
            console.log('🔥: A user disconnected');
        });
    });
}

module.exports = dailyPriceDataSocket