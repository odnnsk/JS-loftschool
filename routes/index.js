const express = require('express');
const router = express.Router();

const photoCtrl = require('../controllers/photo.js');

router.post('/', async (req, res, next) => {
    try{
        const image = await photoCtrl(req);

        //TODO: res mime type for resize, size
        res.status(200).json({
            status: true,
            image,
        });
    }
    catch(err){
        console.error(err);
    }
});

module.exports = router;