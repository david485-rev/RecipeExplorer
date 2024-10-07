const { logger } = require('../util/logger');

const Comment = require('../model/comment.js');
const { createComment, 
    scanCommentsByRecipeUuid,
    updateComment
} = require('../repository/comment-dao.js');
const { queryByUuid } = require('../repository/general-dao.js')

async function postComment(authorUuid, reqBody) {
    const { rating, description, recipeUuid } = reqBody;
    if(!recipeUuid){
        throw new Error('missing recipe uuid');
    }
    if (!authorUuid) {
        throw new Error('missing author uuid');
    }
    if (!description) {
        throw new Error('missing description');
    }
    if (!rating) {
        throw new Error('missing rating');
    }
    /* Depreciated
    const recipe = await queryByUuid(recipeUuid);
     
    if(recipe.type !== 'recipe'){
        throw new Error('comment being attached to non-recipe entity');
    }
    */
    const newComment = new Comment(authorUuid, recipeUuid, description, rating);

    try {
        const data = await createComment(newComment);
        if(data.$metadata.httpStatusCode !== 200){
            throw new Error("database error");
        }
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

async function editComment(uuid, authorUuid, reqBody){
    if(!uuid){
        throw new Error("missing uuid");
    }
    if(!authorUuid){
        throw new Error("missing authorUuid");
    }
    try{
        const { description, rating } = reqBody;
        const oldComment = await queryByUuid(uuid);
        if(oldComment.type !== "comment"){
            throw new Error("uuid does not point to comment");
        }
        if(oldComment.authorUuid !== authorUuid){
            throw new Error("Forbidden Access");
        }
        let changes = false;
        let newDescription = oldComment.description;
        if (description != null && newDescription !== description){
            newDescription = description;
            changes = true;
        }
        let newRating = oldComment.rating;
        if (rating != null && newRating !== rating){
            newRating = rating;
            changes = true;
        }
        if(changes){
            const newComment = await updateComment(uuid, oldComment.creation_date, newDescription, newRating);
            return newComment;
        }
        else{
            throw new Error("no changes have been made")
        }
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