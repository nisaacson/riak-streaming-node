var defaults = require('./defaults')

module.exports = function getValue(opts, key) {
  return opts[key] || defaults[key]
}

