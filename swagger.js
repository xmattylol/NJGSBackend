const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Intro to SE Sample Application",
    version: "1.0.0",
    description: "Backend Node application for storing users and jobs",
  },
};

const options = {
  swaggerDefinition,
  apis: ["./app.js"], // Path to the API routes in your Node.js application
  //   apis: [`${__dirname}/app.js`], // Path to the API routes in your Node.js application
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;