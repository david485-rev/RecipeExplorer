const express = require("express");
const { logger } = require('../util/logger.js');
const router = express.Router();
const { postComment, getRecipeComments, editComment, removeComment } = require('../service/comment-service.js');
const { authenticateToken } = require('../util/authentication.js')


router.post("/", authenticateToken, async (req, res) => {
    try {
        await postComment(req.user.uuid, req.body);
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
        const comment = await getRecipeComments(recipeUuid);
        res.status(200).json(comment);
        return;
    }catch(err){
        logger.error(err);
        res.status(404).json({message: err.message})
        return;
    }
})
router.put("/:uuid", authenticateToken, async (req, res) => {
    try{
        const comment = await editComment(req.params.uuid, req.user.uuid, req.body);
        if(comment){
            res.status(200).json(comment);
            return;
        }
        res.status(400).json({message: "error updating comment"});
    }catch(err){
        logger.error(err);
        if (err === "Forbidden Access"){
            res.status(403).json({ message: err.message });
            return;
        }
        res.status(404).json({ message: err.message });
        return;
    }
})

router.delete("/:uuid", authenticateToken, async (req, res) => {
    try {
        const comment = await removeComment(req.params.uuid, req.user.uuid);
        if (comment) {
            res.status(200).json(comment);
            return;
        }
        res.status(400).json({ message: "error deleting comment" });
    } catch (err) {
        logger.error(err);
        if (err === "Forbidden Access") {
            res.status(403).json({ message: err.message });
            return;
        }
        res.status(400).json({ message: err.message });
        return;
    }
})

module.exports = router;