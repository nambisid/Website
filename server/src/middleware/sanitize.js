const mongoSanitize = require('express-mongo-sanitize');

// Middleware to sanitize user input against NoSQL injection
const sanitize = mongoSanitize({
  replaceWith: '_',
});

module.exports = sanitize;
