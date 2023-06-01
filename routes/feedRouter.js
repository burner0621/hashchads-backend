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

module.exports = router;