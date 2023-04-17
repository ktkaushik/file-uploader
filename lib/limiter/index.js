const fs     = require('fs')
const path   = require('path')
const moment = require('moment')
const config = require('../../config')()

class Limiter {

    constructor (ip, files) {
        this.totalSizeOfFilesUploaded = 0
        this.totalFilesUploadedByThisIPSinceLastPurge = 0

        // set timestamps
        this.timeOfLastPurgeOfUploads = moment.utc().subtract(config.constants.purgeUploadsTimeMeasure, config.constants.purgeUploadsTimeUnit)

        this.ip    = ip
        this.files = files
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
            await this.setFilesPreviousUploadedDataForComputation()
            if (this.totalFilesUploadedByThisIPSinceLastPurge < config.constants.totalUploadsLimit) {
                return {
                    allow: true
                }
            // } else if (this.earliestUploadTimestamp  ) {
            } else {
                return {
                    allow: false,
                    message: config.constants.messages.dailyTotalLimitReached
                }
            }
        }
    }

    // Get the uploads directory path after reading it
    async getUploadsDir () {
        this.setUploadsDirPath()
        return fs.readdirSync(this.uploadDirPath)
    }

    // Sets the uploads directory path
    async setUploadsDirPath () {
        this.uploadDirPath = path.join(__dirname, '../../', config.constants.uploadsDirectoryName, this.ip)
    }

    // Get total uploads for an IP 
    async setFilesPreviousUploadedDataForComputation () {
        let stats, fileUploadedAt
        this.uploadDir.forEach((file) => {

            // get file stats
            stats = fs.statSync(path.join(this.uploadDirPath, file))

            console.log(stats)
            // convert file uploaded at timestamp to moment in UTC instance so it's easy to compare
            fileUploadedAt = moment.utc(stats.mtime)

            // Only consider files that were uploaded since the last purge
            // This also acts as a fail-safe just in case if automatic purge did not work
            if (fileUploadedAt > this.timeOfLastPurgeOfUploads) {
                // if (!this.earliestUploadTimestamp) {
                //     // set earliest uploaded timestamp to the first file uploaded since the last purge
                //     this.earliestUploadTimestamp = fileUploadedAt
                // } else if (this.earliestUploadTimestamp > fileUploadedAt) {
                //     // update earliest uploaded timestamp
                //     this.earliestUploadTimestamp = fileUploadedAt
                // }

                // compute total size of all files uploaded
                this.totalSizeOfFilesUploaded = this.totalSizeOfFilesUploaded + stats.size

                // increase the counter
                if (stats.isFile()) {
                    this.totalFilesUploadedByThisIPSinceLastPurge++;
                }
            }
            
        })
    }

    /**
     * 1. Get current time
     * 2. read all the files in the folder and find the earliest file uploaded which is NOT due for deletion
     * 3. calculate the time different
     * 4. If time difference is within the allowed time spectrum then great!!
     * 5. otherwise, return false.
     */
    async allowUploadsWithinTheTimeRange () {
        const hourAgo = Date.now() - 60000; // 5 minutes in dev mode
        let numFilesInHour = 0;

        let totalFilesUploaded = 0
        this.uploadDir.forEach((file) => {totalFilesUploaded++;})

        console.log(`totalFilesUploaded are ${totalFilesUploaded}`)

        this.uploadDir.forEach((file) => {
            const filepath = path.join(uploadDir, file);
            const stats = fs.statSync(filepath);
            // console.log(`is this a file? ${stats.isFile()}`)
            // console.log(`is it still valid ${(stats.mtimeMs > hourAgo)}`)
            // console.log(stats.mtimeMs)
            // console.log(new Date(stats.mtimeMs))
            if (stats.isFile() && (stats.mtimeMs > hourAgo)) {
                numFilesInHour++;
            }
        })
    }
}

module.exports = Limiter;