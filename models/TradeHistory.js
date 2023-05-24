const mongoose = require('mongoose');
const TradeHistorySchema = new mongoose.Schema({
    timestamp: { type: String, default: '' },
    poolId: {type: String, default: ''},
    accountId: {type: String, default: ''},
    tokenId: { type: String, default: '' },
    price: { type: String, default: '' },
    amount: { type: String, default: '' },
    state: { type: String, default: '' },
    datetime: { type: String, default: '' },
    transactionId: { type: String, default: '' },
}, { timestamps: true });

module.exports = TradeHistory = mongoose.model('TradeHistory', TradeHistorySchema);
