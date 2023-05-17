const fetch = require('cross-fetch')
let swapData = {}

const sleep = (delay) => {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

const pairSwapSocket = (io) => {

    fetch("https://api.saucerswap.finance/pools")
        .then(async (res) => {
            console.log(res.status, ">>>>>>>>>>>")
            if (res.status !== 200) {
                console.log("Getting pools info request failed!")
                return;
            }
            let pools = await res.json()
            console.log(`⚡: Getting pools info successfully!`);
            const getSwapData = async () => {
                for (let pool of pools) {
                    
                    console.log("============", pool);

                    swapData[pool.contractId] = 0
                    let response = await fetch(`https://mainnet-public.mirrornode.hedera.com/api/v1/contracts/${pool.contractId}/results/logs?order=asc`)
                    if (response.status === 200) {
                        let jsonData = await response.json()
                        
                        swapData[pool.contractId] += jsonData.logs.length
                        while (jsonData.links !== undefined && jsonData.links.next !== undefined) {
                            response = await fetch(`https://mainnet-public.mirrornode.hedera.com${jsonData.links.next}`)
                            if (response.status === 200) {
                                jsonData = await response.json()
                                console.log(jsonData.logs.length, "<<<<<<<<<<<<")
                                console.log(jsonData.links.next, "<<<<<<<<<<<<")
                                swapData[pool.contractId] += jsonData.logs.length
                            }
                        }
                        console.log(pool.contractId, swapData[pool.contractId], "<<<<<<<<<<<<")
                        sleep(1000)
                    }
                }
                setTimeout(getSwapData(), 1000)
            }
            const timeout = setTimeout(async () => {
                await getSwapData()
            }, 0)
            io.on('connection', (socket) => {
                console.log(`⚡: ${socket.id} user just connected on SwapDataSocket!`);

                socket.on('getSwapData', (startDailyTimestamp) => {
                    io.emit('getSwapDataResponse', swapData);
                });

                socket.on('disconnect', () => {
                    console.log('🔥: A swap user disconnected');
                    clearInterval(intervalSwap);
                });
            });
        })

}

module.exports = pairSwapSocket