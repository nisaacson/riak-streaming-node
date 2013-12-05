var pattern = /x-riak-index-(.*)/;
module.exports = function (headers) {
  var indices = []
  Object.keys(headers).forEach(function(header) {
    var matches = header.match(pattern)
    if (!matches) {
      return false
    }
    var indexKey = matches[1]
    var value = headers[header]
    var row = {
      key: indexKey,
      value: value
    }
    indices.push(row)
  })
  return indices
}
