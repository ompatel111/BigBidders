const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/uploads') // Set the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) // Set the filename
    }
});

const upload = multer({ storage: storage }).single('image'); // 'image' should match the name attribute of your file input field

module.exports = upload;        
