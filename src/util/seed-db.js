const User = require('../model/user');
const Recipe = require('../model/recipe');
const { createUser } = require('../repository/user-dao');
const { insertRecipe } = require('../repository/recipe-dao');

const MAX_USERS = 10;
const MAX_RECIPES = 2;

/**
 * This function creates fake users that look like this:
 *  {
    uuid: 'b206d4a8-fd8e-4b3c-94ac-a7b9b244b400',
    creation_date: 1727980920,
    type: 'User',
    username: 'test-user(0 to MAX_USERS - 1)',
    password: 'test-password(0 to MAX_USERS - 1)',
    description: 'Hi! I am test-user(0 to MAX_USERS - 1)'
  }
 * @returns a list that contains MAX_USERS users
 */
async function createFakeUsers() {
    const user_list = [];
    for (let count = 0; count < MAX_USERS; count++) {
        user_list.push(new User(`test-user${count}`, `test-password${count}`, `Hi! I am test-user${count}`));
    }
    return user_list;
}

async function createFakeRecipes() {
    const recipe_list = [];
    for (let count = 0; count < MAX_RECIPES; count++) {

    }
}

const mockRecipeDataOne = {
    "thumb": "someimagelink",
    "recipeName": "pot roast",
    "type": "recipe",
    "category": "beef",
    "cuisine": "American",
    "description": "A flavorful, juicy, and fall apart tender meal for the family",
    "ingredients": [
        "chuck roast",
        "potatoes",
        "carrots",
        "onions",
        "tomato paste",
        "salt",
        "black pepper",
        "red pepper flakes",
        "olive oil"
    ],
    "instructions": "Preheat oven to 350 F. Cut up your vegetables and place in a large pan along with the chuck roast. Liberally oil and season everything in the pan. Mix the tomato paste in a cup of hot water until the paste has been diluted. Pour tomato paste mixture over the meat and vegetables in the plan. Cover the pan with aluminum foil and place in middle rack of preheated over for 3 hours. After 3 hours, check for tenderness, and enjoy!",
    "comments": []
}

const mockRecipeDataTwo = {
    "thumb": "someimagelink",
    "recipeName": "pancakes",
    "type": "recipe",
    "category": "breakfast",
    "cuisine": "American",
    "description": "Fluffy and buttery!",
    "ingredients": [
        "flour",
        "water",
        "vegetable oil",
        "sugar",
        "milk",
        "vanilla extract",
        "baking powder",
        "sald"
    ],
    "instructions": "Mix all ingredient in a bowl to form a smoothe pancake batter. Onto an nonstick skilled, over medium heat, pour a quarter cup of batter into center of pan. Wait for the pancake to form air pockets on the surface and then flip the pancake over. Once the underside is golden brown to your liking, remove from pan and enjoy!",
    "comments": [
        "really good pancakes!",
        "sooooo easy to make, my family loves them for breakfast."
    ]
}

const recipeOne = new Recipe(mockRecipeDataOne);
const recipeTwo = new Recipe(mockRecipeDataTwo);

/**
 * This function inserts the fake users created from createFakeUsers()
 * into DynamoDB
 */
async function seedDB() {
    const usersList = await createFakeUsers();
    usersList.forEach(async function (user) {
        try {
            await createUser(user);
        } catch (err) {
            console.log(err)
        }
    });

    const recipesList = [recipeOne, recipeTwo];
    recipesList.forEach(async function (recipe) {
        try {
            await insertRecipe(recipe);
        } catch (err) {
            console.log(err)
        }
    })


}

seedDB();