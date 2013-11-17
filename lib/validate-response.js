module.exports = function (deferred, validateStatusCode) {
  return function(err, res, body) {
    if (err) {
      return deferred.reject(err)
    }
    var error = validateStatusCode(res, body)
    if (error) {
      return deferred.reject(error)
    }
    return deferred.resolve(body)
  }
}
