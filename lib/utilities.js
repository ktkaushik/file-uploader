/**
 * Bunch of utilies to be used across the project
 */

const Buffer = require('buffer').Buffer
const fs = require('fs')

/**
 * privateKey is genereted by double-encoding (base64) the IP address. 
 * This makes it possible to double-decode a string and fetch the IP address.
 * @param {string} IP 
 * @returns privateKEY
 */
const getPrivateKey = (ip) => {
    const encodedIP = base64Encode(ip)
    return base64Encode(encodedIP)
}

/**
 * @param {string} str 
 * @returns based64 encoded str
 */
const base64Encode = (str) => {
    return Buffer.from(str, 'utf8').toString('base64')
}

/**
 * @param {string} base64Str 
 * @returns based64 decoded str
 */
const base64Decode = (base64Str) => {
    return Buffer.from(base64Str, 'base64').toString('ascii')
}

/**
 * Get folder name for publicKey and private key
 * @param {string} publicKey 
 * @param {string} privateKey 
 * @returns Formatted folder name with ip address, publicKey, privateKey separated by --
 */
const getEncodedFolderNameForIP = (publicKey, privateKey) => {
    const ip = base64Decode(publicKey)
    return `${ip}--${publicKey}--${privateKey}`;
}

/**
 * Get folder name for a given PublickKey
 * @param {string} publicKey 
 * @returns Formatted folder name with ip address, publicKey, privateKey separated by --
 */
const getFolderNameFromPublicKey = (publicKey) => {
    const ip = base64Decode(publicKey)
    const privateKey = base64Encode(publicKey)
    return `${ip}--${publicKey}--${privateKey}`;
}

/**
 * Get folder name for a given privateKey
 * @param {string} privateKey 
 * @returns Formatted folder name with ip address, publicKey, privateKey separated by --
 */
const getFolderNameFromPrivateKey = (privateKey) => {
    const publicKey = base64Decode(privateKey)
    const ip = base64Decode(publicKey)
    return `${ip}--${publicKey}--${privateKey}`;
}

/**
 * Check if directory empty?
 * @param {string} pathToFolder 
 * @returns Boolean
 */
function isDirectoryEmpty (path) {
    return fs.readdirSync(path).length === 0;
}

module.exports = {
    getPrivateKey,
    base64Encode,
    base64Decode,
    getEncodedFolderNameForIP,
    getFolderNameFromPrivateKey,
    getFolderNameFromPublicKey,
    isDirectoryEmpty
}