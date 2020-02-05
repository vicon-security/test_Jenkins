/**
 * @swagger
 * tags:
 *   name: Landing Page
 *   description: Index URL
 */

 /**
 * @swagger
 * basePath: /
 * path:
 *  /index/:
 *    get:
 *      summary: Execute main exe 
 *      description: This will initiate the main exe.
 *      responses:
 *        "200":
 *          description: Ok
 */

var express = require('express');
var router = express.Router();
var logger = require('.././logger.js')
/* GET home page. */
router.post('/', function(req, res, next) {
  console.log(req.body);

 //res.render(req);


});


// logger.log({
//   level: 'info',
//   message: 'basic log111'
// });

module.exports = router;
