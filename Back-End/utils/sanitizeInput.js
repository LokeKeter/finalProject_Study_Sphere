const sanitizeHtml = require('sanitize-html');

function sanitizeObject(inputObj) {
  const sanitized = {};
  for (const key in inputObj) {
    if (typeof inputObj[key] === 'string') {
      sanitized[key] = sanitizeHtml(inputObj[key], {
        allowedTags: [],
        allowedAttributes: {},
      });
    } else {
      sanitized[key] = inputObj[key]; // שדות שאינם מחרוזות נשארים כמו שהם
    }
  }
  return sanitized;
}

module.exports = sanitizeObject;
