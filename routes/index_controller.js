// Index controller
const express  = require('express');
const router   = express.Router();

router.get('/', (req, res, next) => {
    res.format({
        html: () => {
            res.render()
        },

        json: () => {
            res.json({hello: true})
        }
    })
});

module.exports = router;