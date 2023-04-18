
module.exports = function (app) {
    const gcp = require('../routes/gcp')
    const uploads = require('../routes/uploads_controller')
    const simpleUploads = require('../routes/simple_uploads_controller')

    app.use('/gcp', gcp)
    app.use('/files', uploads)
    app.use('/simple/', simpleUploads)
}