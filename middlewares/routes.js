
module.exports = function (app) {
    const uploads = require('../routes/uploads_controller')
    const simpleUploads = require('../routes/simple_uploads_controller')

    app.use('/files', uploads)
    app.use('/simple/', simpleUploads)
}