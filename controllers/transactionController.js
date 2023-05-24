const fetch = require("cross-fetch");
const Transaction = require("../models/Transaction")
const TradeHistory = require("../models/TradeHistory")

const getPagination = (page, size) => {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;

    return { limit, offset };
};

module.exports.getTradeHistory = async ({ tokenId, pageNum, pageSize }) => {

    const { limit, offset } = getPagination(pageNum, pageSize);

    try{
        // let data = await Transaction.find({tokenId: tokenId}).sort({timestamp: -1}).skip(offset).limit(limit).exec()
        // let count = await Transaction.find({tokenId: tokenId}).count()
        let data = await TradeHistory.find({tokenId: tokenId}).sort({timestamp: -1}).skip(offset).limit(limit).exec()
        let count = await TradeHistory.find({tokenId: tokenId}).count()
        return {data, count}
    }catch(e) {
        return {data: [], count: 0}
    }


}