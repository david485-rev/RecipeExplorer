const { logger } = require("../src/util/logger");
const uuid = require("uuid");
const {
  getRecipes,
  createRecipe,
  editRecipe
} = require("../src/service/recipe-service");
const {
  queryRecipes,
  insertRecipe,
  updateRecipe
} = require("../src/repository/recipe-dao");
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
        recipe_thumb: "image_url",
        recipe_name: "New Recipe",
        type: "recipe",
        category: "sweets",
        cuisine: "French",
        description: "Delicious dessert recipe",
        ingredients: ["sugar", "flour"],
        instructions: "Mix and bake."
      };

      const newRecipe = new Recipe(recipeData);

      const mockResponse = {
        $metadata: { httpStatusCode: 201 },
        uuid: "test-uuid",
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

      const result = await createRecipe(recipeData);

      expect(result.status).toBe(201);
      expect(result.body).toEqual(mockResponse);
      expect(insertRecipe).toHaveBeenCalledWith(newRecipe);
    });

    it("should throw an error if recipe data is invalid", async () => {
      const invalidData = {
        recipe_thumb: "image_url",
        recipe_name: undefined,
        type: "recipe",
        category: "sweets",
        cuisine: "French",
        description: "Delicious dessert recipe",
        ingredients: ["sugar", "flour"],
        instructions: "Mix and bake."
      };

      await expect(createRecipe(invalidData)).rejects.toThrow(
        "All attributes must be present"
      );
    });

    it("should log and throw an error if insertRecipe fails", async () => {
      const recipeData = {
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

      await expect(createRecipe(recipeData)).rejects.toThrow("Insertion error");
      expect(logger.error).toHaveBeenCalledWith(mockError);
    });
  });

  describe("editRecipe", () => {
    it("should update an existing recipe and return the updated recipe", async () => {
      const recipeData = {
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

      const mockUpdatedRecipe = {
        $metadata: { httpStatusCode: 200 },
        Attributes: {
          ...recipeData
        }
      };

      updateRecipe.mockResolvedValue(mockUpdatedRecipe);

      const result = await editRecipe(recipeData);

      expect(result.status).toBe(200);
      expect(result.body).toEqual(mockUpdatedRecipe.Attributes);
      expect(updateRecipe).toHaveBeenCalledWith(recipeData);
    });

    it("should log and throw an error if updateRecipe fails", async () => {
      const recipeData = {
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

      insertRecipe.mockRejectedValue(mockError);

      await expect(createRecipe(recipeData)).rejects.toThrow("Update error");
      expect(logger.error).toHaveBeenCalledWith(mockError);
    });
  });
});
