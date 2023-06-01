const fetch = require("cross-fetch");
const SocialInfo = require("../models/SocialInfo")

module.exports.getFeedData = async ({tokenId, from, to}) => {
    var nowDate = (Date.now())/1000 + 1;
    var startDate = nowDate - 864000
    try {
        let url = ''
        if (from && to){
            url = `https://api.saucerswap.finance/tokens/prices/${tokenId}?interval=FIVEMIN&from=${from}&to=${to}`;
        } else {
            url = `https://api.saucerswap.finance/tokens/prices/${tokenId}?interval=FIVEMIN&from=${startDate}&to=${nowDate}`;
        }
            let response = await fetch(url)

        if (response.status === 200) {
            let jsonData = await response.json();
            let data = []
            for (var i = 0 ; i < jsonData.length ; i ++) {
                let tmp = jsonData[i]['low']
                jsonData[i]['lowTokens'] = tmp
                jsonData[i]['low'] = jsonData[i]['lowUsd']
                tmp = jsonData[i]['high']
                jsonData[i]['highTokens'] = tmp
                jsonData[i]['high'] = jsonData[i]['highUsd']
                tmp = jsonData[i]['open']
                jsonData[i]['openTokens'] = tmp
                jsonData[i]['open'] = jsonData[i]['openUsd']
                tmp = jsonData[i]['close']
                jsonData[i]['closeTokens'] = tmp
                jsonData[i]['close'] = jsonData[i]['closeUsd']
                delete jsonData[i]['lowUsd']
                delete jsonData[i]['highUsd']
                delete jsonData[i]['openUsd']
                delete jsonData[i]['closeUsd']
            }
            return jsonData;
        }
        return []
    } catch (error) {
        console.log (error)
        return []
    }
}

module.exports.getSocialInfo = async ({tokenId}) => {
    try {
        console.log (tokenId)
        let data = await SocialInfo.find({"Contract ID": tokenId})
        console.log (data)
        if (data === null || data === undefined) return {}
        if (data.length === 0) return {}
        return data[0]
    } catch (error) {
        console.log (error)
        return {}
    }
}