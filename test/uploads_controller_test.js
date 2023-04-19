const request = require('supertest');
const app = require('../app');
const fs      = require('fs')
const path    = require('path')
const expect  = require('chai').expect

const sampleDirPath = path.join(__dirname, 'sample')
const tempDirPath   = path.join(__dirname, '../', 'temp') 

let publicKey, privateKey


describe('File Upload API', () => {
    describe('POST /files', () => {
        it('should upload files and return public and private keys', (done) => {
            request(app)
                .post('/files')
                .attach('files', path.join(sampleDirPath, '10mb.pdf'))
                .set('Content-Type', 'multipart/form-data')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err)

                    publicKey = res.body.publicKey
                    privateKey = res.body.privateKey

                    expect(res.status).to.equal(200)
                    expect(res.body.publicKey).to.not.be.undefined
                    expect(res.body.privateKey).to.not.be.undefined
                    done()
                })
        })

        it('should throw error because we breached file limits', (done) => {
            request(app)
                .post(`/files`)
                .attach('files', path.join(sampleDirPath, '10mb.pdf'))
                .set('Content-Type', 'multipart/form-data')
                // .expect(200)
                .end((err, res) => {
                    if (err) return done(err)
                    expect(res.status).to.equal(500)
                    done()
                })
        })
    })

    describe('GET /files/:publicKey', () => {
        it('should be open to downloading files using public key', (done) => {
            request(app)
                .get(`/files/${publicKey}`)
                .end((err, res) => {
                    if (err) return done(err)
                    console.log(res.status)
                    expect(res.status).to.equal(200)
                    done()
                })
        })

        it('should be able to find the zip file made available for download', (done) => {
            let zipFileFound = false
            if (fs.existsSync(tempDirPath)) {
                const files = fs.readdirSync(tempDirPath)
                files.forEach((file) => {
                    if (file === 'files-archive.zip') {
                        zipFileFound = true
                    }
                })
            }

            expect(zipFileFound).to.equal(true)
            done()
        })
    })

    describe('DELETE /files/:privateKey', () => {

        it('should delete the uploaded folder using privateKey', (done) => {
            request(app)
                .delete(`/files/${privateKey}`)
                .end((err, res) => {
                    if (err) return done(err)
                    expect(res.status).to.equal(200)
                    done()
                })
        })
    })
})
