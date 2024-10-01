const profileService = require('../repository/profileDAO')

async function createProfile(item) {
    let data = await profileService.patchProfile({
       ...item,  
    });
    return data;
}

module.exports = {
    createProfile
}