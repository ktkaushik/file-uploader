
const cron = require('node-cron')
const FilesManager = require('../lib/files_manager')

cron.schedule("* */15 * * * *", async () => {
    console.log("--------- Clean up begin ------------");
    await FilesManager.deleteExpiredFiles()
    console.log("--------- Clean up done ------------");
})