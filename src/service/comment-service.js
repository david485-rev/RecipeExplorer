const { logger } = require("../util/logger");

const Comment = require("../model/comment.js");
const {
    createComment,
    scanCommentsByRecipeUuid,
    updateComment,
    deleteComment,
    queryCommentsByAuthorUuidRecipeUuid
} = require("../repository/comment-dao.js");
const { getItemByUuid } = require("../repository/general-dao.js");

async function postComment(authorUuid, reqBody) {
    const { rating, description, recipeUuid } = reqBody;
    if (!recipeUuid) {
        throw new Error("missing recipe uuid");
    }
    if (!authorUuid) {
        throw new Error("missing author uuid");
    }
    if (!description) {
        throw new Error("missing description");
    }
    if (!rating) {
        throw new Error("missing rating");
    }
    if (typeof rating !== "number" && !(rating >= 1) && !(rating < 11)) {
        throw new Error("rating is not of type number");
    }
    
    const recipe = await getItemByUuid(recipeUuid);
    if (recipe.type !== "recipe") {
        throw new Error("comment being attached to non-recipe entity");
    } else {
        const commentList = await queryCommentsByAuthorUuidRecipeUuid(authorUuid, recipeUuid);
        if(commentList.length > 0){
            throw new Error(`user has already reviewed recipe ${recipeUuid}`);
        }
        const newComment = new Comment(authorUuid, recipeUuid, description, Math.floor(rating));
        
        try {
            const data = await createComment(newComment);
            if (data.$metadata.httpStatusCode !== 200) {
                throw new Error("database error");
            }
            return data;
        } catch (err) {
            logger.error(err);
            throw new Error(err);
        }
    }
}

async function getRecipeComments(recipeUuid) {
    if (!recipeUuid) {
        throw new Error("missing recipe uuid");
    }
    try {
        const commentList = await scanCommentsByRecipeUuid(recipeUuid);
        return commentList;
    } catch (err) {
        logger.error(err + " at getRecipeComments");
        throw new Error(err);
    }
}

async function editComment(uuid, authorUuid, reqBody) {
    if (!uuid) {
        throw new Error("missing uuid");
    }
    if (!authorUuid) {
        throw new Error("missing authorUuid");
    }
    try {
        const { description, rating } = reqBody;
        if (!rating || !description) {
            throw new Error("missing rating or description")
        }
        if (typeof (rating) !== "number" && !(rating >= 1) && !(rating < 11)) {
            throw new Error('rating is not in scope');
        }
        const oldComment = await getItemByUuid(uuid);
        if (oldComment.type !== "comment") {
            throw new Error("uuid does not point to comment");
        }
        if (oldComment.authorUuid !== authorUuid) {
            throw new Error("Forbidden Access");
        }
        const newComment = await updateComment(uuid, description, Math.floor(rating));
        return newComment;
    } catch (err) {
        logger.error(err);
        throw new Error(err);
    }
}

async function removeComment(uuid, authorUuid) {
    if (!uuid) {
        throw new Error("missing uuid");
    }
    if (!authorUuid) {
        throw new Error("missing authorUuid");
    }
    try {
        const comment = await getItemByUuid(uuid);
        let userChecked = false;
        if (comment && comment.type === "comment") {
            if (comment.authorUuid === authorUuid) {
                userChecked = true;
            } else {
                const recipe = await getItemByUuid(comment.recipeUuid);
                if (recipe && recipe.type === "recipe") {
                    if (recipe.authorUuid === authorUuid) {
                        userChecked = true;
                    }
                }
            }
        }
        if (userChecked) {
            const data = await deleteComment(uuid);
            if (data.$metadata.httpStatusCode !== 200) {
                throw new Error("database error");
            }
            return data;
        } else {
            throw new Error("Forbidden Access");
        }
    } catch (err) {
        logger.error(err);
        throw new Error(err);
    }
}

module.exports = {
    postComment,
    getRecipeComments,
    editComment,
    removeComment
};
