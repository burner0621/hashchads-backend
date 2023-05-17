const fetch = require("cross-fetch");
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

let prices = []
let timeDelta = 0
let startDailyTimestamp = 0

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
    io.on('connection', (socket) => {
        console.log(`⚡: ${socket.id} user just connected!`);
        const intervalPrices = setInterval(async () => {
            setStartTimestamp ()
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
            clearInterval (intervalPrices);
        });
    });

}

module.exports = globalDataSocket
