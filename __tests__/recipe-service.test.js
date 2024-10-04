const { logger } = require("../src/util/logger");
const uuid = require("uuid");
const { getRecipes, createRecipe } = require("../src/service/recipe-service");
const { queryRecipes, insertRecipe } = require("../src/repository/recipe-dao");
const Recipe = require("../src/model/recipe");

jest.mock("../src/repository/recipe-dao");
jest.mock("../src/util/logger");
jest.mock("uuid");

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

      expect(result.status).toBe(200);
      expect(result.body).toEqual(mockResponse.Items);
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
      const recipeData = {
        thumb: "image_url",
        recipeName: "New Recipe",
        type: "dessert",
        category: "sweets",
        cuisine: "French",
        description: "Delicious dessert recipe",
        ingredients: ["sugar", "flour"],
        instructions: "Mix and bake.",
        comments: []
      };

      const newRecipe = new Recipe(recipeData);

      const mockResponse = {
        $metadata: { httpStatusCode: 201 },
        uuid: "test-uuid",
        creation_date: newRecipe.creation_date,
        recipe_thumb: recipeData.thumb,
        recipe_name: recipeData.recipeName,
        type: recipeData.type,
        category: recipeData.category,
        cuisine: recipeData.cuisine,
        description: recipeData.description,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        comments: recipeData.comments
      };

      insertRecipe.mockResolvedValue(mockResponse);

      const result = await createRecipe(recipeData);

      expect(result.status).toBe(201);
      expect(result.body).toEqual(mockResponse);
      expect(insertRecipe).toHaveBeenCalledWith(newRecipe);
    });

    it("should throw an error if recipe data is invalid", async () => {
      const invalidData = {
        thumb: "image_url",
        recipeName: undefined,
        type: "dessert",
        category: "sweets",
        cuisine: "French",
        description: "Delicious dessert recipe",
        ingredients: ["sugar", "flour"],
        instructions: "Mix and bake.",
        comments: []
      };

      await expect(createRecipe(invalidData)).rejects.toThrow(
        "All attributes must be present"
      );
    });

    it("should log and throw an error if insertRecipe fails", async () => {
      const recipeData = {
        thumb: "image_url",
        recipeName: "New Recipe",
        type: "dessert",
        category: "sweets",
        cuisine: "French",
        description: "Delicious dessert recipe",
        ingredients: ["sugar", "flour"],
        instructions: "Mix and bake.",
        comments: []
      };

      const mockError = new Error("Insertion error");

      insertRecipe.mockRejectedValue(mockError);

      await expect(createRecipe(recipeData)).rejects.toThrow("Insertion error");
      expect(logger.error).toHaveBeenCalledWith(mockError);
    });
  });
});
