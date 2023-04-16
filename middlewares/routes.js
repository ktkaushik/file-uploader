
module.exports = function (app) {
    const index = require('../routes/index_controller')

    app.use('/', index)
}