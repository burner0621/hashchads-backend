const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.get("/get", async (req, res) => {
    try {
        // {tokenId, pageNum, pageSize} = req.query
        let data = await transactionController.getTradeHistory(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ({data: [], count: 0});
    }
});

module.exports = router;