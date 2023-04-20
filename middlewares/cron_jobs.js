
/**
 * Background cron set and run by node-cron module. 
 * This cron is responsible to purge files who have breached their time limit
 */
const cron = require('node-cron')
const config = require('../config')()
const FilesManager = require('../lib/files_manager')

let cronExpression = config.constants.cronExpression 
if (!cronExpression) {
    cronExpression = "* * * * * *" // default
}

cron.schedule(cronExpression, async () => {
    console.log("--------- Cron clean up begun ------------");
    const totalFilesDeleted = await FilesManager.deleteExpiredFiles()
    console.log(`--------- Removed ${totalFilesDeleted} files ------------`);
})