const { logger } = require('../util/logger');

const Comment = require('../model/comment.js');
const { createComment, 
    scanCommentsByRecipeUuid,
    updateComment
} = require('../repository/comment-dao.js');
const { queryByUuid } = require('../repository/general-dao.js')

async function postComment(reqBody) {
    const { rating, description, recipeUuid } = reqBody;
    //this is where jwt should have uuid 
    const userUuid = "0634d64b-b395-4079-9294-d15440c14182";
    if(!recipeUuid){
        throw new Error('missing recipe uuid');
    }
    if (!description) {
        throw new Error('missing description');
    }
    if (!rating) {
        throw new Error('missing rating');
    }
    const newComment = new Comment(userUuid, recipeUuid, description, rating);

    try {
        const data = await createComment(newComment);
        return data;
    } catch (err) {
        logger.error(err);
        throw new Error(err);
    }
}

async function getRecipeComments(recipeUuid){
    if (!recipeUuid){
        throw new Error('missing recipe uuid');
    }
    try{
        const commentList = await scanCommentsByRecipeUuid(recipeUuid);
        return commentList;
    }catch(err){
        logger.error(err);
        throw new Error(err);
    }
}

async function editComment(uuid, reqBody){
    //this is where the request body should have the decoded jwt to get the author UUid
    const authorUuid = "e8c1593a-fabb-4246-8e66-94a059d22959"
    if(!uuid){
        throw new Error("missing uuid");
    }
    if(!authorUuid){
        throw new Error("missing authorUuid");
    }
    try{
        const oldComment = await queryByUuid(uuid);
        if(oldComment.type !== "comment"){
            throw new Error("uuid does not point to comment");
        }
        if(oldComment.authorUuid !== authorUuid){
            throw new Error("Forbidden Access");
        }
        let description = oldComment.description;
        if (comment.description != null && description !== comment.description){
            description = comment.description;
        }
        let rating = oldComment.rating;
        if (comment.rating != null && rating !== comment.rating){
            rating = comment.rating;
        }
        const newComment = await updateComment(uuid, oldComment.creation_date, description, rating);
        return newComment;
    }catch(err){
        logger.error(err);
        throw new Error(err);
    }
}

module.exports = {
    postComment,
    getRecipeComments,
    editComment
}