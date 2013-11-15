module.exports = function getIndexKey(baseKey) {
  var keyType
  if (typeof baseKey === 'number') {
    keyType = 'int'
  } else {
    keyType = 'bin'
  }
  return baseKey + '_' + keyType
}
