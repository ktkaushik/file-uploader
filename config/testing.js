
/**
 * development config
 */

const secret = require('./secret')

module.exports = {

    // db uri to connect. Name of the database is notifications, please change it to your liking
    mongodb: {
        uri: 'mongodb://localhost/meld-file-uploader',
        options : {}
    },

    constants: {
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
    },

    app: {
        api: 'localhost:2222',
        url: 'http://localhost:2222',
        protocol: 'http'
    },

    server: {
        port: 2222 // port to run your express server
    }
};
