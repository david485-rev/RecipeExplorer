const express = require("express");
const router = express.Router();

const profileService= require("../service/profileService");

router.patch("/profile", async(req, res) => {
    const data = profileService.createProfile(req.body);
    res.status(200).json(data);
})

module.exports = router;