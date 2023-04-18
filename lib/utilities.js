/**
 * Bunch of utilies to be used across the project
 */

const Buffer = require('buffer').Buffer

// generates the private key with default 16 chars in length
const getPrivateKey = (ip) => {
    const encodedIP = base64Encode(ip)
    return base64Encode(encodedIP)
}

const base64Encode = (str) => {
    return Buffer.from(str, 'utf8').toString('base64')
}

const base64Decode = (base64Str) => {
    return Buffer.from(base64Str, 'base64').toString('ascii')
}

// a central function to get folder name
const getEncodedFolderNameForIP = (publicKey, privateKey) => {
    const ip = base64Decode(publicKey)
    return `${ip}--${publicKey}--${privateKey}`;
}

const getFolderNameFromPublicKey = (publicKey) => {
    const ip = base64Decode(publicKey)
    const privateKey = base64Encode(publicKey)
    return `${ip}--${publicKey}--${privateKey}`;
}

const getFolderNameFromPrivateKey = (privateKey) => {
    const publicKey = base64Decode(privateKey)
    const ip = base64Decode(publicKey)
    return `${ip}--${publicKey}--${privateKey}`;
}

module.exports = {
    getPrivateKey,
    base64Encode,
    base64Decode,
    getEncodedFolderNameForIP,
    getFolderNameFromPrivateKey,
    getFolderNameFromPublicKey
}