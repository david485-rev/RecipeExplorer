const { logger } = require('../util/logger');

const { getItemByUuid } = require('../repository/general-dao.js');

async function getDatabaseItem(uuid){
    if(!uuid){
        throw new Error('missing Uuid');
    }
    try{
        const newItem = {};
        const item = await getItemByUuid(uuid);
        //logger.info("item is: " + JSON.stringify(item));
        var keys = Object.keys(item);
        for (const key of keys) {
            if(key !== 'password'){
                newItem[key] = item[key];
            }
        }
        //logger.info("newItem is: " + JSON.stringify(newItem));
        return newItem;
    }
    catch(err){
        logger.error(err);
        throw new Error(err);
    }
}

module.exports = {
    getItemByUuid
}