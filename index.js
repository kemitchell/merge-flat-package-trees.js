module.exports = function (firstTree, secondTree) {
  secondTree.forEach(function (secondElement) {
    var matchingDependencyIndex = firstTree.findIndex(function (have) {
      return (
        have.name === secondElement.name &&
        have.version === secondElement.version
      )
    })
    if (matchingDependencyIndex === -1) {
      firstTree.push(secondElement)
    } else if (secondElement.range !== undefined) {
      var firstElement = firstTree[matchingDependencyIndex]
      if (firstElement.range === undefined) {
        firstElement.range = secondElement.range
      } else {
        if (firstElement.range !== secondElement.range) {
          var error = new Error(
            'direct-dependency range mismatch ' +
            'for ' + secondElement.name + '@' + secondElement.version
          )
          error.rangeMismatch = true
          throw error
        }
      }
    }
  })
  return firstTree
}
