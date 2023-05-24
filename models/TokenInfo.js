const mongoose = require('mongoose');
const TokenInfoSchema = new mongoose.Schema({
  timestamp: { type: String, default: Date.now() },
  tokenId: {type: String, default: ''},
  info: {
    tokenId: {type: String, default: ''},
    avg: {type: Number, default: 0},
    avgUSd: {type: Number, default: 0},
    close: {type: Number, default: 0},
    closeUsd: {type: Number, default: 0},
    high: {type: Number, default: 0},
    highUsd: {type: Number, default: 0},
    id: {type: Number, default: 0},
    liquidity: {type: String, default: 0},
    liquidityUsd: {type: Number, default: 0},
    low: {type: Number, default: 0},
    lowUsd: {type: Number, default: 0},
    open: {type: Number, default: 0},
    openUsd: {type: Number, default: 0},
    starTimestampSeconds: {type: Number, default: 0},
    volume: {type: String, default: 0},
    volumeUsd: {type: Number, default: 0}
  },
}, { timestamps: true });

module.exports = TokenInfo = mongoose.model('TokenInfo', TokenInfoSchema);
