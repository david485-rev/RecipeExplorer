class Comment {
    constructor(userUuid, recipeUuid, description, rating) {
        this.uuid = uuid.v4();
        this.creation_date = Math.floor(new Date().getTime() / 1000);
        this.userUuid = userUuid;
        this.recipeUuid = recipeUuid;
        this.description = description;
        this.rating = rating;
    }
}

module.exports = Comment;