var express = require('express');
var router = express.Router();
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');



// Swagger set up
const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "HTML5 Player Server API",
      version: "1.0.0",
      description:
        "List of all APIs used for HTML5 based player",
      license: {
        name: "MIT",
        url: ""
      },
      contact: {
        name: "CemtrexLabs",
        url: "",
        email: "Info@cemtrexlabs.com"
      }
    },
    servers: [
      {
        url: "http://localhost:3000/"
      }
    ]
  },

  apis: ['./routes/*.js']

};

const specs = swaggerJsdoc(options);
router.use('/', swaggerUi.serve);
router.get(
  "/",
  swaggerUi.setup(specs, {
    explorer: true
  })

);
module.exports = router;
