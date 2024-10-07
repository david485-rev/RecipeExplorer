const commentService = require("../src/service/comment-service.js");
const commentDao = require("../src/repository/comment-dao.js");
const generalDao = require("../src/repository/general-dao.js");

commentDao.createComment = jest.fn(async (comment) => {
    if(comment.rating != 1){
        return {
                httpStatusCode: 200,
                requestId: 'M2CKS3VIRLUCUS3LKF34IPIF5JVV4KQNSO5AEMVJF66Q9ASUAAJG',
                extendedRequestId: undefined,
                cfId: undefined,
                attempts: 1,
                totalRetryDelay: 0
                };
    }
    else{
        return {
                httpStatusCode: 400,
                requestId: '1EJTFBQ5RJ5I6PDL8NIHJRP0LVVV4KQNSO5AEMVJF66Q9ASUAAJG',
                extendedRequestId: undefined,
                cfId: undefined,
                attempts: 1,
                totalRetryDelay: 0
                };
    }
});
commentDao.scanCommentsByRecipeUuid = jest.fn();
commentDao.updateComment = jest.fn();
generalDao.queryByUuid = jest.fn();

describe("Testing comment creation via commentService.postComment", () => {
    beforeEach(() => {
        commentDao.createComment.mockClear()
    })

    test("Creating a valid comment", async () => {
        const comment = { rating: 4, description: "fake desc", recipeUuid: "3" };
        const authorUuid = 2;
        const expectedResult = {
            httpStatusCode: 200,
            requestId: 'M2CKS3VIRLUCUS3LKF34IPIF5JVV4KQNSO5AEMVJF66Q9ASUAAJG',
            extendedRequestId: undefined,
            cfId: undefined,
            attempts: 1,
            totalRetryDelay: 0
        };
        let result = null;
        
        result = await commentService.postComment(authorUuid, comment);

        expect(result.httpStatusCode).toEqual(expectedResult.httpStatusCode);
        expect(commentDao.createComment).toHaveBeenCalled();

    })
});