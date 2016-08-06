var find = require('array-find')
var semver = require('semver')

module.exports = function (firstTree, secondTree) {
  secondTree.forEach(function (newDependency) {
    var alreadyHave = firstTree.some(function (existingDependency) {
      return equivalents(existingDependency, newDependency)
    })
    if (!alreadyHave) {
      firstTree.push(newDependency)
    }
  })
  resolveMissing(firstTree)
  removeExtraMissing(firstTree)
  checkForRangeConflicts(firstTree)
  collapseDirectDependencies(firstTree)
  return firstTree
}

function equivalents (a, b) {
  return (
    a.name === b.name &&
    a.version === b.version &&
    a.missing === b.missing &&
    a.range === b.range
  )
}

function collapseDirectDependencies (tree) {
  tree.forEach(function (dependency) {
    if (dependency.range === undefined) {
      var otherHasRange = tree.some(function (otherDependency) {
        return (
          otherDependency.name === dependency.name &&
          otherDependency.version === dependency.version &&
          otherDependency.range !== undefined
        )
      })
      if (otherHasRange) {
        spliceOut(tree, dependency)
      }
    }
  })
}

function checkForRangeConflicts (tree) {
  tree.forEach(function (dependency) {
    var name = dependency.name
    // Check for direct-dependency range conflicts.
    if (dependency.hasOwnProperty('range')) {
      var hasDirectConflict = tree.some(function (otherDependency) {
        return (
          otherDependency.name === name &&
          otherDependency.hasOwnProperty('range') &&
          otherDependency.range !== dependency.range
        )
      })
      if (hasDirectConflict) {
        var error = new Error(
          'direct-dependency range mismatch for ' + name
        )
        error.rangeConflict = true
        throw error
      }
    }
    // Check for link range conflicts.
    /*
    dependency.links.forEach(function (link) {
      var conflicts = dependency.links.some(function (otherLink) {
        return (
          otherLink.name === link.name &&
          otherLink.range !== link.range
        )
      })
      if (conflicts) {
        var error = new Error(
          'link dependency range mismatch for ' + link.name
        )
        error.rangeConflict = true
        throw error
      }
    })
    */
  })
}

function resolveMissing (tree) {
  tree.forEach(function (dependency) {
    if (dependency.missing === true && dependency.range !== undefined) {
      var missing = dependency
      var range = missing.range
      var possiblySatisfying = tree.filter(function (possibleMatch) {
        return (
          missing !== possibleMatch &&
          missing.name === possibleMatch.name &&
          satisfiesRange(possibleMatch.version, range)
        )
      })
      if (possiblySatisfying.length !== 0) {
        var availableVersions = possiblySatisfying
        .map(function (dependency) {
          return dependency.version
        })
        var version = semver.maxSatisfying(availableVersions, range)
        var satisfying = find(
          possiblySatisfying,
          function (dependency) {
            return dependency.version === version
          }
        )
        var rangeMismatch = (
          satisfying.range !== undefined &&
          satisfying.range !== missing.range
        )
        if (rangeMismatch) {
          var error = new Error(
            'direct-dependency range mismatch ' +
            'for ' + missing.name + '@' + version
          )
          error.rangeMismatch = true
          throw error
        } else {
          satisfying.range = missing.range
          spliceOut(tree, missing)
        }
      }
    }
    dependency.links.forEach(function (link) {
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
  console.log(JSON.stringify(tree, null, 2))
  tree.forEach(function (dependency) {
    if (dependency.missing && dependency.range === undefined) {
      var haveInboundLink = tree.some(function (dependency) {
        return dependency.links.some(function (link) {
          return (
            link.name === dependency.name &&
            link.missing === true
          )
        })
      })
      console.log('%s is %j', 'haveInboundLink', haveInboundLink)
      if (!haveInboundLink) {
        spliceOut(tree, dependency)
      }
    }
  })
  console.log(JSON.stringify(tree, null, 2))
}

function spliceOut (array, element) {
  array.splice(array.indexOf(element), 1)
}
