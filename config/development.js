
/**
 * development config
 */

const secret = require('./secret')

module.exports = {

    constants: {
        cronExpression         : '*/20 * * * * *',    //
        uploadsDirectoryName   : 'files-uploaded',   // directory name to upload
        purgeUploadsTimeMeasure: 4,                  // in minutes
        totalUploadsLimit      : 5,                  // 5 files allowed every 4 hours
        sizeLimit              : 1024 * 1024 * 1024, // 1 GB upload limit
        messages: {
            dailySizeLimitsReached: 'Sorry, daily limit reached in terms of size. Try again tomorrow.',
            dailyTotalLimitReached: 'Sorry, daily limit reached for total files uploaded. Try again later.',
            noFilesFound: 'Sorry, we could not find any data',
            missingPrivateKey: 'Private key is missing'
        }
    }

}
