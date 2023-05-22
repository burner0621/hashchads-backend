const fetch = require("cross-fetch");
const Transaction = require("../models/Transaction")

const getPagination = (page, size) => {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;

    return { limit, offset };
};

module.exports.getTradeHistory = async ({ tokenId, pageNum, pageSize }) => {

    const { limit, offset } = getPagination(pageNum, pageSize);

    try{
        let data = await Transaction.find({}).sort({timestamp: -1}).skip(offset).limit(limit).exec()
        return data
    }catch(e) {
        return []
    }


}