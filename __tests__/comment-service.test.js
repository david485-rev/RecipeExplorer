const commentService = require("../src/service/comment-service.js");
const { createComment, scanCommentsByRecipeUuid, updateComment, deleteComment, queryCommentsByAuthorUuidRecipeUuid } = require("../src/repository/comment-dao.js");
const { getItemByUuid } = require("../src/repository/general-dao.js");

jest.mock('../src/repository/comment-dao.js', () => {
    const originalModule = jest.requireActual('../src/repository/comment-dao.js');

    return {
        ...originalModule,
        scanCommentsByRecipeUuid: jest.fn(),
        queryCommentsByAuthorUuidRecipeUuid: jest.fn(),
        createComment: jest.fn(),
        updateComment: jest.fn(),
        deleteComment: jest.fn()
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
        queryCommentsByAuthorUuidRecipeUuid.mockClear();
        createComment.mockClear();
        getItemByUuid.mockClear();
        queryCommentsByAuthorUuidRecipeUuid.mockReset();
        createComment.mockReset();
        getItemByUuid.mockReset();

    });
    
    test("Creating a valid comment", async () => {
        const comment = { rating: 4, description: "fake desc", recipeUuid: "3" };
        const recipe = { uuid: "3", type: "recipe" };
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
        const commentList = [];
        let result = null;

        createComment.mockReturnValueOnce(expectedResult);
        getItemByUuid.mockReturnValueOnce(recipe);
        queryCommentsByAuthorUuidRecipeUuid.mockReturnValueOnce(commentList);

        result = await commentService.postComment(authorUuid, comment);

        expect(result).toEqual(expectedResult);
        expect(getItemByUuid).toHaveBeenCalled();
        expect(createComment).toHaveBeenCalled();
        expect(queryCommentsByAuthorUuidRecipeUuid).toHaveBeenCalled();
    });

    test("Creating an invalid comment no description", async () => {
        const comment = { rating: 4, description: "", recipeUuid: "3" };
        const recipe = { uuid: "3", type: "recipe" };
        const authorUuid = "2";
        
        const expectedError = "missing description";

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

        getItemByUuid.mockReturnValueOnce(recipe);

        expect(async () => {
            await commentService.postComment(authorUuid, comment);
        }).rejects.toThrow(expectedError);
        expect(getItemByUuid).toHaveBeenCalled();
        expect(createComment).not.toHaveBeenCalled();
    });
    
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
        const commentList = [];

        createComment.mockReturnValueOnce(databaseResult);
        queryCommentsByAuthorUuidRecipeUuid.mockReturnValueOnce(commentList);
        getItemByUuid.mockReturnValueOnce(recipe);

        expect(async () => {
            await commentService.postComment(authorUuid, comment);
        }).rejects.toThrow(expectedError);
        expect(getItemByUuid).toHaveBeenCalled();
    });

    test("Creating a valid comment when a comment by the user already exists", async () => {
        const comment = { rating: 4, description: "fake desc", recipeUuid: "3" };
        const recipe = { uuid: "3", type: "recipe" };
        const authorUuid = "2";
        const expectedError = "user has already reviewed recipe 3";
        const commentList = [{ rating: 1, description: "trash", recipeUuid: "3" }];
        let result = null;

        getItemByUuid.mockReturnValueOnce(recipe);
        queryCommentsByAuthorUuidRecipeUuid.mockReturnValueOnce(commentList);

        expect(async () => {
            await commentService.postComment(authorUuid, comment);
        }).rejects.toThrow(expectedError);
        expect(getItemByUuid).toHaveBeenCalled();
    });
});

describe("Testing getting comments via commentService.getRecipe", () => {
    afterEach(() => {
        scanCommentsByRecipeUuid.mockClear();
        scanCommentsByRecipeUuid.mockReset();
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
        updateComment.mockReset();
        getItemByUuid.mockReset();
    });
    test("updating a comment with a new rating", async () => {
        const expectedResult = { uuid: "5", rating: 4, description: "hello", recipeUuid: "3", type:"comment", authorUuid:"2" };
        const reqBody = { rating: 4, description: "hello" };
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
        const reqBody = { rating: 4, description: "hello comment" };
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

    test("updating a comment with a no values", async () => {
        const expectedError = "Error: missing rating or description";
        const reqBody = { };
        const comment = { uuid: "5", rating: 2, description: "hello", recipeUuid: "3", type: "comment", authorUuid: "2" };
        const authorUuid = "2";
        const uuid = "5"
        
        getItemByUuid.mockReturnValueOnce(comment);

        expect(async () => {
            await commentService.editComment(uuid, authorUuid, reqBody);
        }).rejects.toThrow(expectedError);
        expect(getItemByUuid).not.toHaveBeenCalled();
        expect(updateComment).not.toHaveBeenCalled();
    });

    test("updating a comment with no authorId", async () => {
        const expectedError = "missing authorUuid";
        const reqBody = { description: "hello2", rating: 3 };
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
        const reqBody = { description: "hello2", rating: 3 };
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
        const reqBody = { description: "hello2", rating: 2 };
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
        const reqBody = { description: "hello2", rating: 3 };
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

describe("Testing deleting a comment via commentService.removeComment", () => {
    afterEach(() => {
        deleteComment.mockClear();
        getItemByUuid.mockClear();
        deleteComment.mockReset();
        getItemByUuid.mockReset();
    });

    test("deleting a comment with author Id", async () => {
        const uuid = "3";
        const authorUuid = "1";
        const comment = { uuid: "3", type: "comment", authorUuid: "1",  recipeUuid: "6"};
        const recipe = { uuid: "6", type: "recipe", authorUuid: "4"};
        const expectedResult = {$metadata: {httpStatusCode: 200,}}
        let result = null;
        
        getItemByUuid.mockReturnValueOnce(comment);
        getItemByUuid.mockReturnValueOnce(recipe);
        deleteComment.mockReturnValueOnce(expectedResult);

        result = await commentService.removeComment(uuid, authorUuid);
    
        expect(result).toEqual(expectedResult);
        expect(getItemByUuid).toHaveBeenCalled();
        expect(deleteComment).toHaveBeenCalled();
    });

    test("deleting a comment with recipe author id", async () => {
        const uuid = "3";
        const authorUuid = "4";
        const comment = { uuid: "3", type: "comment", authorUuid: "1", recipeUuid: "6" };
        const recipe = { uuid: "6", type: "recipe", authorUuid: "4" };
        const expectedResult = { $metadata: { httpStatusCode: 200, } }
        let result = null;

        getItemByUuid.mockReturnValueOnce(comment);
        getItemByUuid.mockReturnValueOnce(recipe);
        deleteComment.mockReturnValueOnce(expectedResult);

        result = await commentService.removeComment(uuid, authorUuid);

        expect(result).toEqual(expectedResult);
        expect(getItemByUuid).toHaveBeenCalledTimes(2);
        expect(deleteComment).toHaveBeenCalled();
    });

    test("deleting a comment with invalid id", async () => {
        const uuid = "3";
        const authorUuid = "5";
        const comment = { uuid: "3", type: "comment", authorUuid: "1", recipeUuid: "6" };
        const recipe = { uuid: "6", type: "recipe", authorUuid: "4" };
        const expectedResult = { $metadata: { httpStatusCode: 200, } }
        const expectedError = 'Forbidden Access';
        let result = null;

        getItemByUuid.mockReturnValueOnce(comment);
        getItemByUuid.mockReturnValueOnce(recipe);
        deleteComment.mockReturnValueOnce(expectedResult);

        expect(async () => {
            await commentService.removeComment(uuid, authorUuid);
        }).rejects.toThrow(expectedError);
        expect(getItemByUuid).toHaveBeenCalled();
        expect(deleteComment).not.toHaveBeenCalled();
    });
    test("deleting a comment with no uuid", async () => {
        const uuid = null;
        const authorUuid = "5";
        const comment = { uuid: "3", type: "comment", authorUuid: "1", recipeUuid: "6" };
        const recipe = { uuid: "6", type: "recipe", authorUuid: "4" };
        const expectedResult = { $metadata: { httpStatusCode: 200, } };
        const expectedError = 'missing uuid';
        let result = null;

        getItemByUuid.mockReturnValueOnce(comment);
        getItemByUuid.mockReturnValueOnce(recipe);
        deleteComment.mockReturnValueOnce(expectedResult);


        expect(async () => {
            await commentService.removeComment(uuid, authorUuid);
        }).rejects.toThrow(expectedError);
        expect(getItemByUuid).not.toHaveBeenCalled();
        expect(deleteComment).not.toHaveBeenCalled();
    });
    test("deleting a comment uuid going to incorrect db item", async () => {
        const uuid = "6";
        const authorUuid = "5";
        const comment = { uuid: "3", type: "comment", authorUuid: "1", recipeUuid: "6" };
        const recipe = { uuid: "6", type: "recipe", authorUuid: "4" };
        const expectedResult = { $metadata: { httpStatusCode: 200, } };
        const expectedError = 'Forbidden Access';
        let result = null;

        getItemByUuid.mockReturnValueOnce(recipe);
        getItemByUuid.mockReturnValueOnce(comment);
        deleteComment.mockReturnValueOnce(expectedResult);


        expect(async () => {
            await commentService.removeComment(uuid, authorUuid);
        }).rejects.toThrow(expectedError);
        expect(getItemByUuid).toHaveBeenCalled();
        expect(deleteComment).not.toHaveBeenCalled();
    });
})