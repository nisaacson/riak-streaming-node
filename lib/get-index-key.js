module.exports = function getIndexKey(baseKey, value) {
  var valueType = typeof value
  var postfix
  if (valueType === 'number') {
    postfix = 'int'
  } else {
    postfix = 'bin'
  }
  return baseKey + '_' + postfix
}
