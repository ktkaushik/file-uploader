
module.exports = function (app) {
    // const uploads = require('../routes/uploads_controller')
    const uploads = require('../routes/streams_uploads_controller')

    app.use('/', uploads)
}