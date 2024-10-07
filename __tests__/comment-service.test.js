const commentService = require("../src/service/comment-service.js");
const { createComment, scanCommentsByRecipeUuid, updateComment } = require("../src/repository/comment-dao.js");
const { getItemByUuid } = require("../src/repository/general-dao.js");

jest.mock('../src/repository/comment-dao.js', () => {
    const originalModule = jest.requireActual('../src/repository/comment-dao.js');

    return {
        ...originalModule,
        scanCommentsByRecipeUuid: jest.fn(),
        createComment: jest.fn(),
        updateComment: jest.fn()
    }
});
jest.mock("../src/repository/general-dao.js", () => {
    const originalModule = jest.requireActual("../src/repository/general-dao.js");

    return {
        ...originalModule,
        getItemByUuid:jest.fn()
    }
})

describe("Testing comment creation via commentService.postComment", () => {
    afterEach(() => {
        createComment.mockClear();
        //getItemByUuid.mockClear();
    });
    
    test("Creating a valid comment", async () => {
        const comment = { rating: 4, description: "fake desc", recipeUuid: "3" };
        //const recipe = { uuid: "3", type: "recipe" };
        const authorUuid = "2";
        const expectedResult = {
            $metadata: {
                httpStatusCode: 200,
                requestId: 'M2CKS3VIRLUCUS3LKF34IPIF5JVV4KQNSO5AEMVJF66Q9ASUAAJG',
                extendedRequestId: undefined,
                cfId: undefined,
                attempts: 0,
                totalRetryDelay: 1
            }
        };
        let result = null;

        createComment.mockReturnValueOnce(expectedResult);
        //getItemByUuid.mockReturnValueOnce(recipe);

        result = await commentService.postComment(authorUuid, comment);

        expect(result).toEqual(expectedResult);
        //expect(getItemByUuid).toHaveBeenCalled();
        expect(createComment).toHaveBeenCalled();
    });

    test("Creating an invalid comment no description", async () => {
        const comment = { rating: 4, description: "", recipeUuid: "3" };
        //const recipe = { uuid: "3", type: "recipe" };
        const authorUuid = "2";

        const expectedError = "missing description";
        //getItemByUuid.mockReturnValueOnce(recipe);

        expect(async () => {
            await commentService.postComment(authorUuid, comment);
        }).rejects.toThrow(expectedError);
        expect(createComment).not.toHaveBeenCalled();
    });

    test("Creating an invalid comment no authorId", async () => {
        const comment = { rating: 4, description: "Hello", recipeUuid: "3" };
        //const recipe = { uuid: "3", type: "recipe" };
        const authorUuid = null;

        const expectedError = "missing author uuid";
        //getItemByUuid.mockReturnValueOnce(recipe);

        expect(async () => {
            await commentService.postComment(authorUuid, comment);
        }).rejects.toThrow(expectedError);
        expect(createComment).not.toHaveBeenCalled();
    });
    /*
    test("Creating an invalid comment incorrect recipeUuid", async () => {
        const comment = { rating: 4, description: "Hello", recipeUuid: "2" };
        const recipe = { uuid: "2", type: "user" };
        const authorUuid = "2";
        const expectedError = "comment being attached to non-recipe entity";

        //getItemByUuid.mockReturnValueOnce(recipe);

        expect(async () => {
            await commentService.postComment(authorUuid, comment);
        }).rejects.toThrow(expectedError);
        expect(getItemByUuid).toHaveBeenCalled();
        expect(createComment).not.toHaveBeenCalled();
    });
    */
    test("Creating an invalid comment bad database return", async () => {
        const comment = { rating: 4, description: "Hello", recipeUuid: "3" };
        //const recipe = { uuid: "3", type: "recipe" };
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
        //getItemByUuid.mockReturnValueOnce(recipe);

        expect(async () => {
            await commentService.postComment(authorUuid, comment);
        }).rejects.toThrow(expectedError);
        //expect(getItemByUuid).toHaveBeenCalled();
        expect(createComment).toHaveBeenCalled();
    });
});

describe("Testing getting comments via commentService.getRecipe", () => {
    afterEach(() => {
        scanCommentsByRecipeUuid.mockClear();
    });

    test("getting all comments on a valid recipeUuid", async () => {
        const expectedResult = [{ rating: 4, description: "Hello", recipeUuid: "3" }, 
            { rating: 5, description: "Hello2", recipeUuid: "3" }];
        let result = null;
        const recipeUuid = "3";
        scanCommentsByRecipeUuid.mockReturnValueOnce(expectedResult);

        result = await commentService.getRecipeComments(recipeUuid);

        expect(result).toEqual(expectedResult);
        expect(scanCommentsByRecipeUuid).toHaveBeenCalled();
    });

    test("getting all comments on an invalid recipeUuid", async () => {
        const expectedResult = [];
        let result = null;
        const recipeUuid = "3";
        scanCommentsByRecipeUuid.mockReturnValueOnce(expectedResult);

        result = await commentService.getRecipeComments(recipeUuid);

        expect(result).toEqual(expectedResult);
        expect(scanCommentsByRecipeUuid).toHaveBeenCalled();
    });

    test("getting all comments without recipeUuid", async () => {
        const recipeUuid = null;
        const expectedError = "missing recipe uuid";
        
        expect(async () => {
            await commentService.getRecipeComments(recipeUuid);
        }).rejects.toThrow(expectedError);
        expect(scanCommentsByRecipeUuid).not.toHaveBeenCalled();
    });
});

describe("Testing updating a comment via commentService.editComment", () => {
    afterEach(() => {
        updateComment.mockClear();
        getItemByUuid.mockClear();
    });
    test("updating a comment with a new rating", async () => {
        const expectedResult = { uuid: "5", rating: 4, description: "hello", recipeUuid: "3", type:"comment", authorUuid:"2" };
        const reqBody = {rating: 4};
        const comment = { uuid: "5", rating: 2, description: "hello", recipeUuid: "3", type: "comment", authorUuid: "2" };
        const authorUuid = "2";
        const uuid = "5"
        let result = null;
        updateComment.mockReturnValueOnce(expectedResult);
        getItemByUuid.mockReturnValueOnce(comment);

        result = await commentService.editComment(uuid, authorUuid, reqBody);

        expect(result).toEqual(expectedResult);
        expect(getItemByUuid).toHaveBeenCalled();
        expect(updateComment).toHaveBeenCalled();
    });

    test("updating a comment with a new description", async () => {
        const expectedResult = { uuid: "5", rating: 4, description: "hello comment", recipeUuid: "3", type: "comment", authorUuid: "2" };
        const reqBody = { description: "hello comment" };
        const comment = { uuid: "5", rating: 2, description: "hello", recipeUuid: "3", type: "comment", authorUuid: "2" };
        const authorUuid = "2";
        const uuid = "5"
        let result = null;
        updateComment.mockReturnValueOnce(expectedResult);
        getItemByUuid.mockReturnValueOnce(comment);

        result = await commentService.editComment(uuid, authorUuid, reqBody);

        expect(result).toEqual(expectedResult);
        expect(getItemByUuid).toHaveBeenCalled();
        expect(updateComment).toHaveBeenCalled();
    });

    test("updating a comment with a no changes", async () => {
        const expectedError = "no changes have been made";
        const reqBody = { };
        const comment = { uuid: "5", rating: 2, description: "hello", recipeUuid: "3", type: "comment", authorUuid: "2" };
        const authorUuid = "2";
        const uuid = "5"
        
        getItemByUuid.mockReturnValueOnce(comment);

        expect(async () => {
            await commentService.editComment(uuid, authorUuid, reqBody);
        }).rejects.toThrow(expectedError);
        expect(getItemByUuid).toHaveBeenCalled();
        expect(updateComment).not.toHaveBeenCalled();
    });

    test("updating a comment with no authorId", async () => {
        const expectedError = "missing authorUuid";
        const reqBody = { description: "hello2" };
        const authorUuid = null;
        const uuid = "5"
    
        expect(async () => {
            await commentService.editComment(uuid, authorUuid, reqBody);
        }).rejects.toThrow(expectedError);
        expect(getItemByUuid).not.toHaveBeenCalled();
        expect(updateComment).not.toHaveBeenCalled();
    });

    test("updating a comment with no uuid", async () => {
        const expectedError = "missing uuid";
        const reqBody = { description: "hello2" };
        const authorUuid = "2";
        const uuid = null;

        expect(async () => {
            await commentService.editComment(uuid, authorUuid, reqBody);
        }).rejects.toThrow(expectedError);
        expect(getItemByUuid).not.toHaveBeenCalled();
        expect(updateComment).not.toHaveBeenCalled();
    });
    
    
    test("updating a comment with invalid authorId", async () => {
        const expectedError = "Forbidden Access";
        const reqBody = { description: "hello2" };
        const comment = { uuid: "5", rating: 2, description: "hello", recipeUuid: "3", type: "comment", authorUuid: "2" };
        const authorUuid = "6";
        const uuid = "5";

        getItemByUuid.mockReturnValueOnce(comment);

        expect(async () => {
            await commentService.editComment(uuid, authorUuid, reqBody);
        }).rejects.toThrow(expectedError);
        expect(getItemByUuid).toHaveBeenCalled();
        expect(updateComment).not.toHaveBeenCalled();
    });
    
    test("updating a item that is not a comment", async () => {
        const expectedError = "uuid does not point to comment";
        const reqBody = { description: "hello2" };
        const comment = { uuid: "5", rating: 2, description: "hello", type: "recipe", authorUuid: "2" };
        const authorUuid = "2";
        const uuid = "5";

        getItemByUuid.mockReturnValueOnce(comment);

        expect(async () => {
            await commentService.editComment(uuid, authorUuid, reqBody);
        }).rejects.toThrow(expectedError);
        expect(getItemByUuid).toHaveBeenCalled();
        expect(updateComment).not.toHaveBeenCalled();
    });
    
});