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

router.get("/testweb3", async (req, res) => {
    try {
        let data = await feedController.testweb3();
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

module.exports = router;