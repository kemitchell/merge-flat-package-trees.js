var find = require('array-find')

module.exports = function (firstTree, secondTree) {
  mergeRoots(
    find(firstTree, isRoot),
    find(secondTree, isRoot)
  )
  secondTree.forEach(function (secondElement) {
    var alreadyHas = firstTree.some(function (firstElement) {
      return (
        firstElement.name === secondElement.name &&
        firstElement.missing === secondElement.missing &&
        firstElement.range === secondElement.range
      )
    })
    if (!alreadyHas) {
      firstTree.push(secondElement)
    }
  })
}

function mergeRoots (firstRoot, secondRoot) {
  secondRoot.links.forEach(function (secondLink) {
    var alreadyHas = firstRoot.links.some(function (firstLink) {
      return sameLinks(firstLink, secondLink)
    })
    if (alreadyHas) {
      return
    }
    var rangeConflict = firstRoot.links.some(function (firstLink) {
      return conflictingRanges(firstLink, secondLink)
    })
    if (rangeConflict) {
      var error = new Error(
        'dependency-range mismatch for ' + secondLink.name
      )
      error.rangeMismatch = true
      throw error
    }
    firstRoot.links.push(secondLink)
  })
}

var LINK_PROPERTIES = ['name', 'range', 'version']

function sameLinks (firstLink, secondLink) {
  return LINK_PROPERTIES.every(function (property) {
    return firstLink[property] === secondLink[property]
  })
}

function conflictingRanges (first, second) {
  return (
    first.name === second.name &&
    first.range !== second.range
  )
}

function isRoot (element) {
  return element.root === true
}
