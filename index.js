var semver = require('semver')

module.exports = function (firstTree, secondTree) {
  secondTree.forEach(function (element) {
    var alreadyHave = firstTree.some(function (have) {
      return (
        have.name === element.name &&
        have.version === element.version
      )
    })
    if (!alreadyHave) {
      firstTree.push(element)
    }
  })
  firstTree.sort(compareDependencies)
  return firstTree
}

function compareDependencies (first, second) {
  if (first.name < second.name) {
    return -1
  } else if (first.name > second.name) {
    return 1
  } else {
    return semver.compare(first.version, second.version)
  }
}
