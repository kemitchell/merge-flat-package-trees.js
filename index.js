var find = require('array-find')
var semver = require('semver')

module.exports = function (firstTree, secondTree) {
  secondTree.forEach(function (secondElement) {
    var matchingDependencyIndex = firstTree.findIndex(function (have) {
      return (
        have.name === secondElement.name &&
        (
          have.version === secondElement.version ||
          (
            have.missing === true &&
            secondElement.missing === true &&
            have.range === secondElement.range
          )
        )
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
            'for ' + secondElement.name +
            '(' + firstElement.range +
            ' and ' + secondElement.range + ')'
          )
          error.rangeMismatch = true
          throw error
        }
      }
    }
  })
  resolveMissing(firstTree)
  removeExtraMissing(firstTree)
  return firstTree
}

function resolveMissing (tree) {
  console.log('%s is %j', 'tree', tree)
  tree.forEach(function (element) {
    if (element.missing === true && element.range !== undefined) {
      var missing = element
      var range = missing.range
      var satisfying = tree.filter(function (possibleMatch) {
        return (
          missing !== possibleMatch &&
          missing.name === possibleMatch.name &&
          satisfiesRange(possibleMatch.version, range)
        )
      })
      if (satisfying.length !== 0) {
        var availableVersions = satisfying.map(function (dependency) {
          return dependency.version
        })
        delete missing.missing
        var version = semver.maxSatisfying(availableVersions, range)
        var matching = find(satisfying, function (dependency) {
          return dependency.version === version
        })
        var rangeMismatch = (
          matching.range !== undefined &&
          matching.range !== missing.range
        )
        if (rangeMismatch) {
          var error = new Error(
            'direct-dependency range mismatch ' +
            'for ' + missing.name + '@' + version
          )
          error.rangeMismatch = true
          throw error
        } else {
          matching.range = missing.range
          spliceOut(tree, missing)
        }
      }
    } else {
      element.links.forEach(function (link) {
        if (link.missing === true) {
          var match = find(tree, function (possibleMatch) {
            return (
              possibleMatch.name === link.name &&
              possibleMatch.hasOwnProperty('version') &&
              satisfiesRange(possibleMatch.version, link.range)
            )
          })
          if (match) {
            delete link.missing
            link.version = match.version
          }
        }
      })
    }
  })
}

function satisfiesRange (version, range) {
  var versionIsSemVer = semver.valid(version) !== null
  var rangeIsSemVer = semver.validRange(version) !== null
  if (versionIsSemVer && rangeIsSemVer) {
    return semver.satisfies(version, range)
  } else {
    return version === range
  }
}

function removeExtraMissing (tree) {
  tree.forEach(function (element) {
    if (element.missing && element.range === undefined) {
      var someLink = tree.some(function (element) {
        return element.links.some(function (link) {
          return link.name === element.name
        })
      })
      if (!someLink) {
        spliceOut(tree, element)
      }
    }
  })
}

function spliceOut (array, element) {
  array.splice(array.indexOf(element), 1)
}
