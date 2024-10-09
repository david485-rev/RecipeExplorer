const uuid = require('uuid');

class User {
    constructor(username, password, email, description=null, picture=null) {
        this.uuid = uuid.v4();
        this.creationDate = Math.floor(new Date().getTime() / 1000);
        this.type = 'user';
        this.username = username;
        this.password = password;
        this.email = email;
        this.description = description;
        this.picture = picture;
    }

}

module.exports = User;