const User = require('../model/user');
const Recipe = require('../model/recipe');
const Comment = require('../model/comment');
const { createUser } = require('../repository/user-dao');
const { insertRecipe } = require('../repository/recipe-dao');
const { createComment } = require('../repository/comment-dao');
const MOCK_DATA = require('./mock_data');

const MAX_USERS = 10;
const MAX_RECIPES = 3;
const MAX_COMMENTS = 5;

/**
 * This function creates fake users that look like this:
 *  {
    uuid: 'b206d4a8-fd8e-4b3c-94ac-a7b9b244b400',
    creationDate: 1727980920,
    type: 'user',
    username: 'test-user(0 to MAX_USERS - 1)',
    password: 'test-password(0 to MAX_USERS - 1)',
    description: 'Hi! I am test-user(0 to MAX_USERS - 1)'
  }
 * @returns a list that contains MAX_USERS users
 */
async function createFakeUsers() {
    const user_list = [];
    for (let count = 0; count < MAX_USERS; count++) {
        user_list.push(new User(`test-user${count}`, `test-password${count}`, `test${count}@gmail.com`, `Hi! I am test-user${count}`, `picture-link${count}`));
    }
    return user_list;
}

/**
 * 
 * @returns 
 */
async function createFakeRecipes() {
    const recipe_list = [];
    for (let count = 0; count < MAX_RECIPES; count++) {
        const number_of_ingredients = Math.floor(Math.random() * 6) + 2;
        const random_ingredients = [];
        for(let i = 0; i < number_of_ingredients; i++) {
            random_ingredients.push(MOCK_DATA.ingredients[Math.floor(Math.random() * MOCK_DATA.ingredients.length)]);
        }

        const recipe_data = {
            recipeThumb: "some link",
            recipeName: `test-recipe${count}`,
            type: "recipe",
            category: "test-category",
            cuisine: MOCK_DATA.cuisine[Math.floor(Math.random() * MOCK_DATA.cuisine.length)],
            description: MOCK_DATA.descriptions[Math.floor(Math.random() * MOCK_DATA.descriptions.length)],
            ingredients: random_ingredients,
            instructions: "Step 1:, Step 2:, Step 3:, ...",
            comments: []
        };
        recipe_list.push(new Recipe(recipe_data))
    }

    return recipe_list;
}

/**
 * This function creates fake comments that look like this:
 *  {
    uuid: 'bc8b6edc-8df9-4b6a-b08e-bce3f85e94d1',
    creationDate: 1728053702,
    authorUuid: '32262434-2ebf-46ca-8e8c-a2d3ccc063c1',
    recipeUuid: '87b24bf5-9c7e-4742-a843-15338a4ebe2a',
    description: "My uncle asked me for the recipe, that's how you know it's good!",
    rating: 7,
    type: 'comment'
  }
 *
 * A random user and random recipe are chosen from user_list and recipe_list
 * A random rating is chosen using Math.random()
 *  - Ratings can go from 1 - 10 and are out of 10
 * A random description is chosen based on the score of the rating
 * A new comment is made using the four above attributes
 * 
 * EXAMPLE: 1/10, 2/10, ... , 10/10
 * @param {List} user_list - a list of users
 * @param {List} recipe_list - a list of recipes
 * @returns comment_list, a list of comments
 */
async function createFakeComments(user_list, recipe_list) {
    const comment_list = [];
    for(let count = 0; count < MAX_COMMENTS; count++) {
        const random_user = user_list[Math.floor(Math.random() * user_list.length)];
        const random_recipe = recipe_list[Math.floor(Math.random() * recipe_list.length)];

        const mock_descriptions = {
            good_descriptions: [
                "I made this recipe for my family dinner and everyone loved it!",
                "I used this recipe for my work's potluck and all of it was gone!",
                "My uncle asked me for the recipe, that's how you know it's good!"
            ],
            bad_descriptions: [
                "This recipe wasn't so delicious, would not make again.",
                "The recipe is so hard to make! Would not recommend to my worst enemies!",
                "My daughter started crying after eating this. NOT MAKING AGAIN!!!"
            ]
        };
        const random_rating = Math.floor(Math.random() * 10) + 1;
        let random_description;
        
        if(random_rating >= 6) {
            random_description = mock_descriptions.good_descriptions[Math.floor(Math.random() * mock_descriptions.good_descriptions.length)];
        } else {
            random_description = mock_descriptions.bad_descriptions[Math.floor(Math.random() * mock_descriptions.bad_descriptions.length)];
        }

        comment_list.push(new Comment(random_user.uuid, random_recipe.uuid, random_description, random_rating));
    }

    return comment_list;
}

/**
 * This function inserts into DynamoDB:
 * the fake users created from createFakeUsers()
 * the fake recipes created from createFakeRecipes()
 * the fake comments created from createFakeComments()
 */
async function seedDB() {
    const users_list = await createFakeUsers();
    users_list.forEach(async function (user) {
        try {
            await createUser(user);
        } catch (err) {
            console.log(err)
        }
    });

    const recipes_list = await createFakeRecipes();
    recipes_list.forEach(async function (recipe) {
        try {
            


            await insertRecipe(recipe);
        } catch (err) {
            console.log(err)
        }
    });

    const comments_list = await createFakeComments(users_list, recipes_list);
    comments_list.forEach(async function (comment) {
        try {
            await createComment(comment);
        } catch (err) {
            console.log(err)
        }
    });
}

seedDB();