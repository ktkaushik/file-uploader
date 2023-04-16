
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
        'apiKeyHeader': 'x-api-key'
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
