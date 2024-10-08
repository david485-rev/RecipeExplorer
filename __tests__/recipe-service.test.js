const { logger } = require("../src/util/logger");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
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
const Recipe = require("../src/model/recipe");

jest.mock("../src/repository/recipe-dao");
jest.mock("../src/util/logger");
jest.mock("uuid");
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn()
}));

describe("Recipe Service", () => {
  beforeEach(() => {
    uuid.v4.mockReturnValue("test-uuid");
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
      jwt.verify.mockReturnValue({ uuid: "12345" });

      const recipeData = {
        author_id: authorId,
        recipe_thumb: "image_url",
        recipe_name: "New Recipe",
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
        author_id: authorId,
        creation_date: newRecipe.creation_date,
        recipe_thumb: recipeData.recipe_thumb,
        recipe_name: recipeData.recipe_name,
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
      jwt.verify.mockReturnValue({ uuid: "12345" });

      const invalidData = {
        author_id: authorId,
        recipe_thumb: "image_url",
        recipe_name: undefined,
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
      jwt.verify.mockReturnValue({ uuid: "12345" });

      const recipeData = {
        author_id: authorId,
        recipe_thumb: "image_url",
        recipe_name: "New Recipe",
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
    it("should update an existing recipe and return the updated recipe", async () => {
      const authorId = "12345";
      jwt.verify.mockReturnValue({ uuid: "12345" });

      const recipeData = {
        uuid: "12345",
        author_id: authorId,
        creation_date: 1234567,
        recipe_thumb: "image_url",
        recipe_name: "Updated Dessert Name",
        type: "recipe",
        category: "sweets",
        cuisine: "Italian",
        description: "Delicious updated dessert recipe.",
        ingredients: ["sugar", "flower", "mascarpone", "butter"],
        instructions: "Mix ingredients and bake."
      };

      const mockUpdatedRecipe = {
        $metadata: { httpStatusCode: 200 },
        Attributes: {
          ...recipeData
        }
      };

      updateRecipe.mockResolvedValue(mockUpdatedRecipe);

      const result = await editRecipe(recipeData, authorId);

      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual(mockUpdatedRecipe.Attributes);
      expect(updateRecipe).toHaveBeenCalledWith(recipeData);
    });

    it("should log and throw an error if updateRecipe fails", async () => {
      const authorId = "12345";
      jwt.verify.mockReturnValue({ uuid: "12345" });

      const recipeData = {
        author_id: authorId,
        uuid: "12345",
        creation_date: 1234567,
        recipe_thumb: "image_url",
        recipe_name: "Updated Dessert Name",
        type: "recipe",
        category: "sweets",
        cuisine: "Italian",
        description: "Delicious updated dessert recipe.",
        ingredients: ["sugar", "flower", "mascarpone", "butter"],
        instructions: "Mix ingredients and bake."
      };

      const mockError = new Error("Update error");

      updateRecipe.mockRejectedValue(mockError);

      await expect(editRecipe(recipeData, authorId)).rejects.toThrow(
        mockError.message
      );
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

      deleteRecipe.mockResolvedValue(mockResponse);

      jwt.verify.mockReturnValue({ uuid: "12345" });

      const result = await removeRecipe(recipeId, authorId);

      expect(result).toEqual({
        statusCode: 200,
        data: mockResponse
      });
      expect(deleteRecipe).toHaveBeenCalledWith(recipeId, authorId);
    });

    it("should throw an error if recipeId is missing", async () => {
      await expect(removeRecipe(null, authorId)).rejects.toThrow(
        "Missing uuid"
      );
      expect(deleteRecipe).not.toHaveBeenCalled();
    });
  });
});
