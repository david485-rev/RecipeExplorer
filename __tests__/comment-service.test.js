const commentService = require("../src/service/comment-service.js");
const { createComment } = require("../src/repository/comment-dao.js");
const { queryByUuid } = require("../src/repository/general-dao.js");

jest.mock('../src/repository/comment-dao.js', () => {
    const originalModule = jest.requireActual('../src/repository/comment-dao.js');

    return {
        ...originalModule,
        createComment: jest.fn(),
    }
});

jest.mock('../src/repository/general-dao.js', () => {
    const originalModule = jest.requireActual('../src/repository/general-dao.js');

    return {
        ...originalModule,
        queryByUuid: jest.fn(),
    }
});

describe("Testing comment creation via commentService.postComment", () => {
    afterEach(() => {
        createComment.mockClear();
        queryByUuid.mockClear();
    });
    /*
    test("Creating a valid comment", async () => {
        const comment = { rating: 4, description: "fake desc", recipeUuid: "3" };
        const recipe = { uuid: "3", type: "recipe" };
        const authorUuid = "2";
        const expectedResult = {
            $metadata: {
                httpStatusCode: 400,
                requestId: 'M2CKS3VIRLUCUS3LKF34IPIF5JVV4KQNSO5AEMVJF66Q9ASUAAJG',
                extendedRequestId: undefined,
                cfId: undefined,
                attempts: 0,
                totalRetryDelay: 1
            }
        };
        let result = null;

        createComment.mockReturnValueOnce(expectedResult);
        queryByUuid.mockReturnValueOnce(recipe);

        result = await commentService.postComment(authorUuid, comment);

        expect(result.$metadata).toEqual(expectedResult.$metadata);
        expect(queryByUuid).toHaveBeenCalled();
        expect(createComment).toHaveBeenCalled();
    });

    test("Creating an invalid comment no description", async () => {
        const comment = { rating: 4, description: "", recipeUuid: "3" };
        const recipe = { uuid: "3", type: "recipe" };
        const authorUuid = "2";

        const expectedError = "missing description";
        queryByUuid.mockReturnValueOnce(recipe);

        expect(async () => {
            await commentService.postComment(authorUuid, comment);
        }).rejects.toThrow(expectedError);
        expect(createComment).not.toHaveBeenCalled();
    });

    test("Creating an invalid comment no authorId", async () => {
        const comment = { rating: 4, description: "Hello", recipeUuid: "3" };
        const recipe = { uuid: "3", type: "recipe" };
        const authorUuid = null;

        const expectedError = "missing author uuid";
        queryByUuid.mockReturnValueOnce(recipe);

        expect(async () => {
            await commentService.postComment(authorUuid, comment);
        }).rejects.toThrow(expectedError);
        expect(createComment).not.toHaveBeenCalled();
    });
    
    test("Creating an invalid comment incorrect recipeUuid", async () => {
        const comment = { rating: 4, description: "Hello", recipeUuid: "2" };
        const recipe = { uuid: "2", type: "user" };
        const authorUuid = "2";
        const expectedError = "comment being attached to non-recipe entity";

        queryByUuid.mockReturnValueOnce(recipe);

        expect(async () => {
            await commentService.postComment(authorUuid, comment);
        }).rejects.toThrow(expectedError);
        expect(queryByUuid).toHaveBeenCalled();
        expect(createComment).not.toHaveBeenCalled();
    });
    */
    test("Creating an invalid comment bad database return", async () => {
        const comment = { rating: 4, description: "Hello", recipeUuid: "3" };
        const recipe = { uuid: "3", type: "recipe" };
        const authorUuid = "2";
        const expectedError = "database error";
        const databaseResult = {
            $metadata: {
                httpStatusCode: 400,
                requestId: 'M2CKS3VIRLUCUS3LKF34IPIF5JVV4KQNSO5AEMVJF66Q9ASUAAJG',
                extendedRequestId: undefined,
                cfId: undefined,
                attempts: 0,
                totalRetryDelay: 1
            }
        };

        createComment.mockReturnValueOnce(databaseResult);
        queryByUuid.mockReturnValueOnce(recipe);

        expect(async () => {
            await commentService.postComment(authorUuid, comment);
        }).rejects.toThrow(expectedError);
        expect(queryByUuid).toHaveBeenCalled();
        expect(createComment).toHaveBeenCalled();
    });
});