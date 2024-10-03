const express = require("express");
const { logger } = require('../util/logger.js');
const router = express.Router();
const { postComment, getCommentByUuid } = require('../service/comment-service.js');

router.post("/", async (req, res) => {
    try {
        await postComment(req.body);
        res.status(201).json({ message: 'Comment successfully created' });
    }
    catch (err) {
        logger.error(err);
        res.status(400).json({ message: err.message });
        return;
    }

})
router.get("/:commentUuid", async (req, res) => {
    try{
        const comment = getCommentByUuid(req.params.commentUuid);
        if(comment){
            res.status(200).json(comment);
            return;
        }
        res.status(404).json({ message: "no comment found" });
        return;
    }catch(err){
        logger.error(err);
        res.status(404).json({message: "no comment found"})
    }
})

module.exports = router;