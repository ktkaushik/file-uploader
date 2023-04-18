
const cron = require('node-cron')
const FilesManager = require('../lib/files_manager')

cron.schedule("* */15 * * * *", async () => {
    console.log("--------- Cron clean up begun ------------");
    await FilesManager.deleteExpiredFiles()
    console.log("--------- end ------------");
})