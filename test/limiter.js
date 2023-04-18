const assert = require('assert');
const Limiter = require('../lib/limiter');

describe('Limiter', function() {
    describe('allowUploadsForThisIP', function() {
        it('should allow upload when no previous uploads for this IP', async function() {
            const limiter = new Limiter('127.0.0.1', [], './test/uploads');
            const result = await limiter.allowUploadsForThisIP();
            assert.strictEqual(result.allow, true);
        });
        
        it('should not allow upload when total files limit is breached', async function() {
            const limiter = new Limiter('127.0.0.1', ['file1.txt', 'file2.txt'], './test/uploads');
            const result = await limiter.allowUploadsForThisIP();
            assert.strictEqual(result.allow, false);
            assert.strictEqual(result.errorMessage, 'Daily limit of total files reached');
        });

        it('should not allow upload when size limit is breached', async function() {
            const limiter = new Limiter('127.0.0.1', ['file1.txt'], './test/uploads');
            limiter.totalSizeOfFilesUploaded = 100000000; // set total size to 100 MB
            const result = await limiter.allowUploadsForThisIP();
            assert.strictEqual(result.allow, false);
            assert.strictEqual(result.errorMessage, 'Daily size limit reached');
        });

        it('should allow upload when limit is not breached', async function() {
            const limiter = new Limiter('127.0.0.1', ['file1.txt'], './test/uploads');
            const result = await limiter.allowUploadsForThisIP();
            assert.strictEqual(result.allow, true);
        });

        it('should return false when upload directory does not exist', async function() {
            const limiter = new Limiter('127.0.0.1', ['file1.txt'], './test/non-existent-directory');
            const result = await limiter.allowUploadsForThisIP();
            assert.strictEqual(result, false);
        });
    });
});
