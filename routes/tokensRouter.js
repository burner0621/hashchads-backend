const express = require("express");
const router = express.Router();
const tokenController = require("../controllers/tokenController");

router.get("/gettokenbycontract", async (req, res) => {
    try {
        let response = await tokenController.getTokenByContract(req.query.contractId);
        console.log (response)
        res.send ({
            status: response.data
        });
    } catch (err) {
        console.log(err);
        res.send ({
            status: "Not Available"
        });
    }
});

module.exports = router;