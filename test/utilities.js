const assert = require('assert')
const {
    getPrivateKey,
    base64Encode,
    base64Decode,
    getEncodedFolderNameForIP,
    getFolderNameFromPrivateKey
} = require('../lib/utilities')

const ip = '127.0.0.1'

describe('Test utilities', function () {

    it('should generate a private key from an IP address', function () {
        const privateKey = getPrivateKey(ip)
        assert.equal(privateKey, 'TVRJM0xqQXVNQzR4')
    })

    it('should encode a string as base64', function () {
        const encoded = base64Encode('Hello World')
        assert.equal(encoded, 'SGVsbG8gV29ybGQ=')
    })

    it('should decode a base64 string back to its original value', function () {
        const decoded = base64Decode('SGVsbG8gV29ybGQ=')
        assert.equal(decoded, 'Hello World')
    })

    it('should generate an encoded folder name from a public and private key', function () {
        const publicKey = base64Encode(ip)
        const privateKey = getPrivateKey(ip)
        const folderName = getEncodedFolderNameForIP(publicKey, privateKey)
        assert.equal(folderName, '127.0.0.1--MTI3LjAuMC4x--TVRJM0xqQXVNQzR4')
    })

    it('should generate a folder name from a private key', function () {
        const folderName = getFolderNameFromPrivateKey('TVRJM0xqQXVNQzR4')
        assert.equal(folderName, '127.0.0.1--MTI3LjAuMC4x--TVRJM0xqQXVNQzR4')
    })
})
