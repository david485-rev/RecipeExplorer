const express = require("express");
const router = express.Router();

const profileService= require("../service/user-service");

router.patch("/profile", async(req, res) => {
    const data = profileService.createProfile(req.body);
    res.status(200).json(data);
})

module.exports = router;