const fs   = require('fs')
const path = require('path')
const config = require('../../config')()

class Limiter {

    constructor (ip, files) {
        this.ip = ip
        this.files = files
        this.totalFiles = files.length
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
        let allowUploads = true
        this.uploadDir = await this.getUploadsDir()
        if (!this.uploadDir) {
            // No upload directory found. This means the IP address has never uploaded
            // anything yet. We should allow it in this case.
            return {
                allow: allowUploads
            }
        } else {
            const totalFilesUploadedByThisIP = await this.getTotalUploads()
            if (totalFilesUploadedByThisIP < config.constants.dailyTotalUploadLimit) {
                // allowUploads = await allowUploadsWithinTheTimeRange()
                return {
                    allow: true
                }
            } else {
                return {
                    allow: false,
                    message: config.constants.messages.dailyTotalLimitReached
                }
            }
        }
    }

    async getUploadsDir () {
        this.setUploadsDirPath()
        return fs.readdirSync(this.uploadDirPath)
    }

    async setUploadsDirPath () {
        this.uploadDirPath = path.join(__dirname, '../../', config.constants.uploadsDirectoryName, this.ip)
    }

    async getTotalUploads () {
        let totalFilesUploadedByThisIP = 0
        let stats
        this.uploadDir.forEach((file) => {
            stats = fs.statSync(path.join(this.uploadDirPath, file))
            if (stats.isFile()) {
                totalFilesUploadedByThisIP++;
            }
        })

        return totalFilesUploadedByThisIP
    }

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