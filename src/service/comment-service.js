const { logger } = require('../util/logger');

const Comment = require('../model/comment.js');
const { createComment, queryCommentByUuid } = require('../repository/comment-dao.js');

async function postComment(reqBody) {
    const { rating, description, recipeUuid } = reqBody;
    //this is where jwt should have uuid 
    const userUuid = "0634d64b-b395-4079-9294-d15440c14182";
    if(!recipeUuid){
        throw new Error('missing recipe uuid')
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

async function getCommentByUuid(uuid) {
    if (!uuid) {
        throw new Error('missing uuid');
    }
    try {
        const comment = await queryCommentByUuid(uuid);
        return comment;
    } catch (err) {
        logger.error(err);
        throw new Error(err);
    }
}

module.exports = {
    postComment,
    getCommentByUuid
}