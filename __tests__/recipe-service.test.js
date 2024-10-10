const { logger } = require("../src/util/logger");
const uuid = require("uuid");
const {
  getRecipes,
  createRecipe,
  editRecipe,
  removeRecipe
} = require("../src/service/recipe-service");
const {
  queryRecipes,
  insertRecipe,
  updateRecipe,
  deleteRecipe
} = require("../src/repository/recipe-dao");
const {
  scanCommentsByRecipeUuid,
  deleteComment
} = require("../src/repository/comment-dao.js");
const { getDatabaseItem } = require("../src/service/general-service");
const Recipe = require("../src/model/recipe");

jest.mock("../src/repository/recipe-dao");
jest.mock("../src/util/logger");
jest.mock("uuid");
jest.mock("../src/repository/comment-dao.js");
jest.mock("../src/service/general-service");

describe("Recipe Service", () => {
  beforeEach(() => {
    uuid.v4.mockReturnValue("test-uuid");
    jest.clearAllMocks();
  });

  describe("getRecipes", () => {
    it("should return recipes successfully", async () => {
      const mockResponse = {
        $metadata: { httpStatusCode: 200 },
        Items: [{ id: 1, name: "Test Recipe" }]
      };
      queryRecipes.mockResolvedValue(mockResponse);

      const result = await getRecipes();

      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual(mockResponse.Items);
      expect(queryRecipes).toHaveBeenCalledTimes(1);
    });

    it("should log and throw an error if queryRecipes fails", async () => {
      const mockError = new Error("Database error");
      queryRecipes.mockRejectedValue(mockError);

      await expect(getRecipes()).rejects.toThrow("Database error");
      expect(logger.error).toHaveBeenCalledWith(mockError);
    });
  });

  describe("createRecipe", () => {
    it("should create a recipe successfully", async () => {
      const authorId = "12345";

      const recipeData = {
        authorUuid: authorId,
        recipeThumb: "image_url",
        recipeName: "New Recipe",
        type: "recipe",
        category: "sweets",
        cuisine: "French",
        description: "Delicious dessert recipe",
        ingredients: ["sugar", "flour"],
        instructions: "Mix and bake."
      };

      const newRecipe = new Recipe(recipeData, authorId);

      const mockResponse = {
        $metadata: { httpStatusCode: 201 },
        uuid: "test-uuid",
        authorUuid: authorId,
        creationDate: newRecipe.creationDate,
        recipeThumb: recipeData.recipeThumb,
        recipeName: recipeData.recipeName,
        type: recipeData.type,
        category: recipeData.category,
        cuisine: recipeData.cuisine,
        description: recipeData.description,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions
      };

      insertRecipe.mockResolvedValue(mockResponse);

      const result = await createRecipe(recipeData, authorId);

      expect(result.statusCode).toBe(201);
      expect(result.data).toEqual(mockResponse);
      expect(insertRecipe).toHaveBeenCalledWith(newRecipe);
    });

    it("should throw an error if recipe data is invalid", async () => {
      const authorId = "12345";

      const invalidData = {
        authorUuid: authorId,
        recipeThumb: "image_url",
        recipeName: undefined,
        type: "recipe",
        category: "sweets",
        cuisine: "French",
        description: "Delicious dessert recipe",
        ingredients: ["sugar", "flour"],
        instructions: "Mix and bake."
      };

      const mockError = new Error("Missing attribute(s)");

      await expect(createRecipe(invalidData, authorId)).rejects.toThrow(
        mockError.message
      );
    });

    it("should log and throw an error if insertRecipe fails", async () => {
      const authorId = "12345";

      const recipeData = {
        authorUuid: authorId,
        recipeThumb: "image_url",
        recipeName: "New Recipe",
        type: "recipe",
        category: "sweets",
        cuisine: "French",
        description: "Delicious dessert recipe",
        ingredients: ["sugar", "flour"],
        instructions: "Mix and bake."
      };

      const mockError = new Error("Insertion error");

      insertRecipe.mockRejectedValue(mockError);

      await expect(createRecipe(recipeData, authorId)).rejects.toThrow(
        mockError.message
      );
      expect(logger.error).toHaveBeenCalledWith(mockError);
    });
  });

  describe("editRecipe", () => {
    const authorId = "12345";
    const recipeData = {
      uuid: "12345",
      recipeThumb: "image_url",
      recipeName: "Updated Dessert Name",
      type: "recipe",
      category: "sweets",
      cuisine: "Italian",
      description: "Delicious updated dessert recipe.",
      ingredients: ["sugar", "flower", "mascarpone", "butter"],
      instructions: "Mix ingredients and bake."
    };

    it("should update an existing recipe and return the updated recipe", async () => {
      const mockUpdatedRecipe = {
        $metadata: { httpStatusCode: 200 },
        Attributes: {
          ...recipeData
        }
      };

      getDatabaseItem.mockResolvedValueOnce({ authorUuid: authorId });
      updateRecipe.mockResolvedValue(mockUpdatedRecipe);

      const result = await editRecipe(recipeData, authorId);

      expect(getDatabaseItem).toHaveBeenCalledWith(recipeData.uuid);
      expect(updateRecipe).toHaveBeenCalledWith(recipeData);
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual(mockUpdatedRecipe.Attributes);
    });

    it("should throw an error if the author is not the recipe owner", async () => {
      const difAuth = "different-author-uuid";

      getDatabaseItem.mockResolvedValueOnce({ authorUuid: authorId });

      await expect(editRecipe(recipeData, difAuth)).rejects.toThrow(
        "Only the recipe author is allowed to edit this recipe"
      );
      expect(getDatabaseItem).toHaveBeenCalledWith(recipeData.uuid);
      expect(updateRecipe).not.toHaveBeenCalled();
    });

    it("should log and throw an error if updateRecipe fails", async () => {
      const mockError = new Error("Update error");

      getDatabaseItem.mockResolvedValueOnce({ authorUuid: authorId });
      updateRecipe.mockRejectedValue(mockError);

      await expect(editRecipe(recipeData, authorId)).rejects.toThrow(
        mockError.message
      );
      expect(getDatabaseItem).toHaveBeenCalledWith(recipeData.uuid);
      expect(updateRecipe).toHaveBeenCalledWith(recipeData);
      expect(logger.error).toHaveBeenCalledWith(mockError);
    });
  });

  describe("removeRecipe", () => {
    const authorId = "12345";
    const recipeId = "12345";

    it("should delete an existing recipe", async () => {
      const mockResponse = {
        $metadata: { httpStatusCode: 200 },
        data: "Deleted recipe data"
      };
      const commentList = [];

      scanCommentsByRecipeUuid.mockReturnValue(commentList);
      deleteRecipe.mockResolvedValue(mockResponse);

      const result = await removeRecipe(recipeId, authorId);

      expect(result).toEqual({
        statusCode: 200,
        data: mockResponse
      });
      expect(deleteRecipe).toHaveBeenCalledWith(recipeId, authorId);
      expect(scanCommentsByRecipeUuid).toHaveBeenCalledWith(recipeId);
      expect(deleteComment).not.toHaveBeenCalled();
    });

    it("should throw an error if recipeId is missing", async () => {
      await expect(removeRecipe(null, authorId)).rejects.toThrow(
        "Missing uuid"
      );
      expect(deleteRecipe).not.toHaveBeenCalled();
      expect(scanCommentsByRecipeUuid).not.toHaveBeenCalled();
      expect(deleteComment).not.toHaveBeenCalled();
    });

    it("should log and throw an error if deleteRecipe fails", async () => {
      const mockError = new Error("Deletion error");
      deleteRecipe.mockRejectedValue(mockError);

      await expect(removeRecipe(recipeId, authorId)).rejects.toThrow(
        mockError.message
      );
      expect(logger.error).toHaveBeenCalledWith(mockError);
    });
    it("should delete all comments connected to an existing recipe", async () => {
      const mockResponse = {
        $metadata: { httpStatusCode: 200 },
        data: "Deleted recipe data"
      };
      const commentList = [{ uuid: "1" }, { uuid: "2" }];

      scanCommentsByRecipeUuid.mockReturnValue(commentList);
      deleteComment.mockReturnValue(null);
      deleteRecipe.mockResolvedValue(mockResponse);

      const result = await removeRecipe(recipeId, authorId);

      expect(result).toEqual({
        statusCode: 200,
        data: mockResponse
      });
      expect(deleteRecipe).toHaveBeenCalledWith(recipeId, authorId);
      expect(scanCommentsByRecipeUuid).toHaveBeenCalledWith(recipeId);
      expect(deleteComment).toHaveBeenCalledTimes(2);
    });
  });
});
