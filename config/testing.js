
/**
 * development config
 */

const secret = require('./secret')

module.exports = {

    constants: {
        cronExpression         : '0 * * * * *',      // every hour at minute 00
        uploadsDirectoryName   : 'test-files-uploaded',   // directory name to upload
        purgeUploadsTimeMeasure: 60,                 // in minutes
        totalUploadsLimit      : 3,                  // 5 files allowed every 4 hours
        sizeLimit              : 2 * 1024 * 1024,    // 2 MB upload limit
        messages: {
            dailySizeLimitsReached: 'Sorry, daily limit reached in terms of size. Try again tomorrow.',
            dailyTotalLimitReached: 'Sorry, daily limit reached for total files uploaded. Try again later.',
            noFilesFound: 'Sorry, we could not find any data',
            missingPrivateKey: 'Private key is missing'
        }
    }

}
