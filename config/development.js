
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
        uploadsDirectoryName   : 'files-uploaded',   // directory name to upload
        acceptableTimeUnits    : ['milliseconds', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'],
        purgeUploadsTimeUnit   : 'hours',            // accepts milliseconds, seconds, minutes, hours, days, weeks, months, years only
        purgeUploadsTimeMeasure: 4,                  // 4 hours
        totalUploadsLimit      : 5,                  // 5 files allowed every 4 hours
        sizeLimit              : 1024 * 1024 * 1024, // 1 GB upload limit
        messages: {
            dailySizeLimitsReached: 'Sorry, daily limit reached in terms of size. Try again tomorrow.',
            dailyTotalLimitReached: 'Sorry, daily limit reached for total files uploaded. Try again later.',
        }
    },

    app: {
        api: 'localhost:3000',
        url: 'http://localhost:3000',
        protocol: 'http'
    },

    server: {
        port: 3000 // port to run your express server
    }
};
