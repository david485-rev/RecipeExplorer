const uuid = require('uuid');

class User {
    constructor(username, password, description=null, picture=null) {
        this.uuid = uuid.v4();
        this.creation_date = Math.floor(new Date().getTime() / 1000);
        this.type = 'user';
        this.username = username;
        this.password = password;
        this.description = description;
        this.picture = picture;
    }

}

module.exports = User;