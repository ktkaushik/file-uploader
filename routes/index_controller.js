// Index controller
const express  = require('express');
const router   = express.Router()

router.get('/', (req, res, next) => {
    return res.json({hello: true})
})

module.exports = router;