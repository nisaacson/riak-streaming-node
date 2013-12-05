var errorAdapter = require('error-adapter')

module.exports = function createError(statusCode, msg, body) {
  return errorAdapter.create({
    message: msg,
    statusCode: statusCode,
    body: body
  })
}
