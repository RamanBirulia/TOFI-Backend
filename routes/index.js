let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', {title: 'Trading platform GraBiLa.'});
});

module.exports = router;
