const fs = require('fs');
const path = require('path');
// const db = require('../models');
const formidable = require('formidable');


exports.add = req => new Promise(async (resolve, reject) => {
    try {
        // parse a form with file upload. multipart/form-data
        const form = new formidable.IncomingForm();
        const uploadDir = path.join(process.cwd(), '/dist', 'assets');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        form.uploadDir = uploadDir;

        form.parse(req, (err, fields, files) => {
            if(err) reject(err);

            let img = fields.photo.split(';base64,').pop();
            let imgName = fields.photoName;

            const fileName = path.join(uploadDir, imgName);

            fs.writeFile(fileName, img, {encoding: 'base64'}, function(err) {
                if(err) reject(err);

                console.log('File created');

                //TODO: Save userData in db
                // updateUserData(fields.userId, {image: 'assets/' + imgName});

                return resolve('assets/' + imgName);
            });
        });
    }
    catch(err) {
        reject(err);
    }
});