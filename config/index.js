/**
 * Load the right ENV config file
 */

module.exports = function () {
    let config, defaultsEnv

    if (!process.env.NODE_ENV) process.env.NODE_ENV = `development`
    config = require('./' + process.env.NODE_ENV)
    return {...config, ...defaultsEnv}
}
