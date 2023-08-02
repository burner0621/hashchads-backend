const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feedController");

router.get("/getfeeddata", async (req, res) => {
    try {
        let data = await feedController.getFeedData(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ({
            data
        });
    }
});

router.get("/getsocial", async (req, res) => {
    try {
        let data = await feedController.getSocialInfo(req.query);
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ({
            data
        });
    }
});

router.get("/getdailypriceoftoken", async (req, res) => {
    try {
        let data = await feedController.getTokenDailyPriceData();
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ({});
    }
});

router.get("/gettokens", async (req, res) => {console.log ("DDDDDDDDDDD")
    try {
        let data = await feedController.getTokens();
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([]);
    }
});

router.get("/getpools", async (req, res) => {
    try {
        let data = await feedController.getPools();
        res.send (
            data
        );
    } catch (err) {
        console.log(err);
        res.send ([]);
    }
});

module.exports = router;