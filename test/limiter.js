const fs      = require('fs')
const path    = require('path')
const moment  = require('moment')
const assert  = require('assert')
const Limiter = require('../lib/limiter')
const config  = require('../config')()

const sampleDirPath = path.join(__dirname, './sample')
const uploadDirPath = path.join(__dirname, '../', config.constants.uploadsDirectoryName) 

describe('Limiter module testing scenarios *********', () => {
    let files;
    let ip;
    let limiter;

    // Upload files before each test case
    beforeEach(() => {
        
        // Generate some sample files for testing
        const files = fs.readdirSync(sampleDirPath)
        files.forEach((file) => {
            fs.copyFileSync(path.join(sampleDirPath, file), path.join(uploadDirPath, file))
        })

        // Set the IP address of the uploader
        ip = '10.10.10.10';

        // Initialize the Limiter instance
        limiter = new Limiter(ip, files, uploadDirPath);
    })

    it('should allow upload when no limits are breached', async () => {
        // remove all files uploaded so no limits are breached
        const files = fs.readdirSync(uploadDirPath)
        files.forEach((file) => {
            fs.rmSync(path.join(uploadDirPath, file))
        })

        const result = await limiter.allowUploadsForThisIP();
        assert.strictEqual(result.allow, true);
    })

    it('should not allow upload when size limit is breached', async () => {
        // Set the size limit to 1 byte so that it is breached. We uploaded 100MB file which is the limit
        // but we will upload another file to breach

        const file = 'file1.txt'
        if (fs.existsSync(path.join(uploadDirPath, file))) {
            fs.rmSync(path.join(uploadDirPath, file))
        }

        const result = await limiter.allowUploadsForThisIP();

        assert.strictEqual(result.allow, false);
        assert.strictEqual(result.errorMessage, config.constants.messages.dailySizeLimitsReached);
    })

    it('should not allow upload when daily total limit is breached', async () => {
        // uploading 2 files will breach total limit

        const files = ['file2.txt', 'file3.txt']
        files.forEach((file) => {
            fs.writeFileSync(path.join(uploadDirPath, file), 'Sample content')
        })

        const result = await limiter.allowUploadsForThisIP();

        assert.strictEqual(result.allow, false);
        assert.strictEqual(result.errorMessage, config.constants.messages.dailyTotalLimitReached);

        files.forEach((file) => {
            fs.rmSync(path.join(uploadDirPath, file))
        })
    })

})