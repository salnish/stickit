// const { Store } = require("express-session");
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/icons");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname.substring(file.originalname.lastIndexOf('.'))
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

// const upload = multer({ storage: storage });
module.exports = store = multer({ storage: storage })