const fs     = require('fs')
const path   = require('path')
const moment = require('moment')
const config = require('../../config')()

class Limiter {

    constructor (ip, files, uploadDirPath) {
        this.totalSizeOfFilesUploaded = 0
        this.totalFilesUploadedByThisIPSinceLastPurge = 0

        // set timestamp for the last time system purged uploads
        this.timeOfLastPurgeOfUploads = moment.utc().subtract(config.constants.purgeUploadsTimeMeasure, 'minutes')

        this.ip    = ip
        this.files = files
        this.uploadDirPath  = uploadDirPath
        this.totalFiles = this.files.length
    }

    /**
     * 1. Get IP of the user
     * 2. check if folder exists
     * 3. check how many files are uploaded by the user
     * 4. if number of files is more than cnofigured amount then throw error
     * 5. if number of files are not more than configured amount then upload the file
     * 6. check when was the first file uploaded
     * 7. Bypass everything if file name is same because then we will have to overwrite the file 
     */
    async allowUploadsForThisIP () {
        this.uploadDir = await this.getUploadsDir()
        if (!this.uploadDir) {
            // No upload directory found. This means the IP address has never uploaded
            // anything yet. We should allow it in this case.
            return {
                allow: true
            }
        } else {
            await this.setFilesPreviousUploadedSizeAndCount()

            console.log(this.totalFilesUploadedByThisIPSinceLastPurge)
            // check if limit of total files is breached
            if (this.totalFilesUploadedByThisIPSinceLastPurge < config.constants.totalUploadsLimit) {

                // check availed storage
                console.log(`totalsize is ${this.totalSizeOfFilesUploaded} in ${this.uploadDirPath}`)
                if (this.totalSizeOfFilesUploaded < config.constants.sizeLimit) {

                    // allow for upload
                    return {
                        allow: true
                    }
                } else {

                    // no storage available
                    return {
                        allow: false,
                        errorMessage: config.constants.messages.dailySizeLimitsReached
                    }    
                }
            } else {

                // daily limit of files reached
                return {
                    allow: false,
                    errorMessage: config.constants.messages.dailyTotalLimitReached
                }
            }
        }
    }

    // Get the uploads directory path after reading it
    async getUploadsDir () {
        if (!fs.existsSync(this.uploadDirPath)) {
            // fs.mkdirSync(this.uploadDirPath, { recursive: true });
            return false
        }
        return fs.readdirSync(this.uploadDirPath)
    }

    // Get total uploads for an IP 
    async setFilesPreviousUploadedSizeAndCount () {
        let stats, fileUploadedAt
        this.uploadDir.forEach((file) => {

            // get file stats
            stats = fs.statSync(path.join(this.uploadDirPath, file))

            // convert file uploaded at timestamp to moment in UTC instance so it's easy to compare
            fileUploadedAt = moment.utc(stats.mtime)

            // Only consider files that were uploaded since the last purge
            // This also acts as a fail-safe just in case if automatic purge did not work
            // console.log(`File uploaded at ${fileUploadedAt.toISOString()}`)
            // console.log(`last purge ${this.timeOfLastPurgeOfUploads.toISOString()}`)
            if (fileUploadedAt > this.timeOfLastPurgeOfUploads) {
                // console.log(`lets calculate....`)
                // compute total size of all files uploaded
                
                // console.log(`size of ${file} is ${stats.size}`)
                // console.log(stats)
                // increase the counter
                if (stats.isFile()) {
                    // console.log(`file found ${file}`)
                    this.totalSizeOfFilesUploaded = this.totalSizeOfFilesUploaded + stats.size
                    this.totalFilesUploadedByThisIPSinceLastPurge++;
                }
            }
            
        })

        // console.log(`folder is ${this.uploadDirPath}`)
        // console.log(`files found ${this.totalFilesUploadedByThisIPSinceLastPurge}`)
        // console.log(`total size is ${this.totalSizeOfFilesUploaded}`)
    }

}

module.exports = Limiter;