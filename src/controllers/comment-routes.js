const express = require("express");
const { logger } = require('../util/logger.js');
const router = express.Router();
const { postComment, getRecipeComments, editComment } = require('../service/comment-service.js');

router.post("/", async (req, res) => {
    try {
        await postComment(req.body);
        res.status(201).json({ message: 'Comment successfully created' });
        return;
    }
    catch (err) {
        logger.error(err);
        res.status(400).json({ message: err.message });
        return;
    }
})
router.get("/recipe", async (req, res) => {
    try{
        const recipeUuid = req.query.recipe;
        const comment = getRecipeComments(recipeUuid);
        res.status(200).json(comment);
        return;
    }catch(err){
        logger.error(err);
        res.status(404).json({message: err})
        return;
    }
})
router.put("/:uuid", async (req, res) => {
    try{
        const comment = editComment(req.params.uuid, req.body);
        if(comment){
            res.status(200).json(comment);
            return;
        }
        res.status(400).json({message: "error updating comment"});
    }catch(err){
        logger.error(err);
        if (err === "Forbidden Access"){
            res.status(403).json({ message: err });
            return;
        }
        res.status(404).json({message: err});
        return;
    }
})

module.exports = router;