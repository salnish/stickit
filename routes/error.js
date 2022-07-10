var express = require('express');
var router = express.Router();


router.get('/', function (req, res, next) {
res.render("error",{layout:false})
})

module.exports = router;