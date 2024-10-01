const profileService = require('../repository/user-dao')

async function createProfile(item) {
    let data = await profileService.patchProfile({
       ...item,  
    });
    return data;
}

module.exports = {
    createProfile
}