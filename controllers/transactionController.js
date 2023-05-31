const fetch = require("cross-fetch");
const Transaction = require("../models/Transaction")
const TradeHistory = require("../models/TradeHistory")

const getPagination = (page, size) => {
    const limit = size ? size : 10;
    const offset = page ? (page - 1) * limit : 0;

    return { limit, offset };
};

module.exports.getTradeHistory = async ({ tokenId, pageNum, pageSize }) => {

    const { limit, offset } = getPagination(pageNum, pageSize);
    
    try{
        let data = await Transaction.find({tokenId: tokenId}).sort({timestamp: -1}).skip(offset).limit(limit).exec()
        let count = await Transaction.find({tokenId: tokenId}).count()
        // let data = await TradeHistory.find({tokenId: tokenId}).sort({timestamp: -1}).skip(offset).limit(limit).exec()
        // let count = await TradeHistory.find({tokenId: tokenId}).count()
        return {data, count}
    }catch(e) {
        return {data: [], count: 0}
    }


}

module.exports.getStatistics = async ({tokenId, timeRangeType}) => {
    let timeStart = 0;
    let nowDate = Date.now() / 1000;
    if (timeRangeType === 'five') timeStart = nowDate - 300;
    else if (timeRangeType === 'hour') timeStart = nowDate - 3600;
    else if (timeRangeType === 'six') timeStart = nowDate - 3600 * 6;
    else if (timeRangeType === 'day') timeStart = nowDate - 86400;
    else if (timeRangeType === 'week') timeStart = nowDate - 86400 * 7;
    try{
        let txs = await Transaction.find({tokenId: tokenId, timestamp: {$gte: timeStart}}).count();
        let buys = await Transaction.find({tokenId: tokenId, state: 'buy', timestamp: {$gte: timeStart}}).count();
        let records = await Transaction.find({tokenId: tokenId, timestamp: {$gte: timeStart}});
        let totalVol = 0
        for (let record of records) {
            totalVol += Math.abs (Number(record.amount))
        }
        return {txs, buys, sells: txs - buys, vol: totalVol}
    }catch(e) {
        return {data: [], count: 0}
    }
}