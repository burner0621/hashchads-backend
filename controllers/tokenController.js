const fetch = require("cross-fetch");

module.exports.getTokenByContract = async (contractId) => {
    try {
        const url = `https://server.saucerswap.finance/api/public/tokens/prices/latest/${contractId}?interval=FIVEMIN`;
        const response = await fetch(url, {
            method: "get", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
                "accept": "*/*",
                "accept-encoding": "gzip, deflate, br",
                "accept-language": "en-US,en;q=0.9",
                "if-none-match": 'W/"1a6-YmFwzd+zGx9VVWB1tVjSuBUrq9Q"',
                "origin": "https://www.saucerswap.finance",
                "referer": "https://www.saucerswap.finance/",
                "sec-ch-ua": '"Chromium",v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "Windows",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
            },
        });
        const data = await response.json();
        return { error: false, data: data };
    } catch (error) {
        throw error;
    }
}