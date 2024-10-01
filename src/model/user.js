const uuid = require('uuid');

class User {
    constructor(username, password, description=null) {
        this.uuid = uuid.v4();
        this.creation_date = Math.floor(new Date().getTime() / 1000);
        this.username = username;
        this.password = password;
        this.description = description;
    }

}

module.exports = User;