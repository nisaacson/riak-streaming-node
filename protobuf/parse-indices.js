module.exports = function parseIndices(indices) {
  indices = indices.map(parseSingleIndex)
  return indices
}

function parseSingleIndex(index) {
  index.value = index.value.toString()
  return index
}
