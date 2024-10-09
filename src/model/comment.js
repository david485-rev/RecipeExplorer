const uuid = require('uuid');

class Comment {
    constructor(authorUuid, recipeUuid, description, rating) {
        this.uuid = uuid.v4();
        this.creationDate = Math.floor(new Date().getTime() / 1000);
        this.authorUuid = authorUuid;
        this.recipeUuid = recipeUuid;
        this.description = description;
        this.rating = rating;
        this.type = "comment"
    }
}

module.exports = Comment;