
module.exports = function (app) {
    const uploads = require('../routes/uploads_controller')

    app.use('/', uploads)
}