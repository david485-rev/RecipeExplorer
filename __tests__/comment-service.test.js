const commentService = require("../src/service/comment-service.js");
const { createComment } = require("../src/repository/comment-dao.js");
const {  } = require("../src/repository/general-dao.js");

jest.mock('../src/repository/comment-dao.js', () => {
    const originalModule = jest.requireActual('../src/repository/comment-dao.js');

    return {
        ...originalModule,
        createComment: jest.fn(),
    }
});

describe("Testing comment creation via commentService.postComment", () => {
    afterEach(() => {
        createComment.mockClear();
        //commentDao.createComment.mockRestore()
    });

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
        createComment.mockReturnValueOnce({
            httpStatusCode: 200,
            requestId: 'M2CKS3VIRLUCUS3LKF34IPIF5JVV4KQNSO5AEMVJF66Q9ASUAAJG',
            extendedRequestId: undefined,
            cfId: undefined,
            attempts: 1,
            totalRetryDelay: 0
    });
        let result = null;
        
        result = await commentService.postComment(authorUuid, comment);
        
        expect(result.httpStatusCode).toEqual(expectedResult.httpStatusCode);
        expect(createComment).toHaveBeenCalled();
    });

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
        createComment.mockReturnValueOnce({
            httpStatusCode: 200,
            requestId: 'M2CKS3VIRLUCUS3LKF34IPIF5JVV4KQNSO5AEMVJF66Q9ASUAAJG',
            extendedRequestId: undefined,
            cfId: undefined,
            attempts: 1,
            totalRetryDelay: 0
        });
        let result = null;

        result = await commentService.postComment(authorUuid, comment);

        expect(result.httpStatusCode).toEqual(expectedResult.httpStatusCode);
        expect(createComment).toHaveBeenCalled();
    });
});