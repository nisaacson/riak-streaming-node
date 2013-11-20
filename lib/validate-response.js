var errorAdapter = require('error-adapter')

var badStatusCodeMessages = {
  400: 'Bad Request',
  412: 'Precondition Failed',
  503: 'Service Unavailable',
  500: 'Internal Server Error'
}

module.exports = function (deferred, validStatusCodes, msg) {
  return function(err, res, body) {
    if (err) {
      return deferred.reject(err)
    }
    var error = validateStatusCode(validStatusCodes, res, body, msg)
    if (error) {
      return deferred.reject(error)
    }
    return deferred.resolve(body)
  }
}

function validateStatusCode(validStatusCodes, res, body, msg) {
  var statusCode = res.statusCode
  msg += '. Bad status code in riak response: "' + statusCode + '" '
  if (validStatusCodes.indexOf(statusCode) >= 0) {
    return
  }
  var customMessage = badStatusCodeMessages.statusCode || 'Unknown Error'
  msg += customMessage
  return createError(statusCode, msg, body)
}

function createError(statusCode, msg, body) {
  return errorAdapter.create({
    message: msg,
    statusCode: statusCode,
    body: body
  })
}


