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
  resolveMissingIndirectDependencies(firstTree)
  throwForDirectDependencyRangeConflict(firstTree)
  removeSupersededDependencies(firstTree)
}

function equivalents (a, b) {
  return (
    a.name === b.name &&
    a.version === b.version &&
    a.range === b.range
  )
}

function resolveMissingIndirectDependencies (tree) {
  tree.forEach(function (dependency) {
    dependency.links.forEach(function (link) {
      var name = link.name
      var range = link.range
      var version = link.version
      if (version === undefined) {
        var satisfying = maxSatisfying(tree, name, range)
        if (satisfying) {
          link.version = satisfying.version
        }
      }
    })
  })
}

function throwForDirectDependencyRangeConflict (tree) {
  tree.forEach(function (dependency) {
    var name = dependency.name
    // Check for direct-dependency range conflicts.
    if (dependency.range !== undefined) {
      var hasDirectConflict = tree.some(function (otherDependency) {
        return (
          otherDependency.name === name &&
          otherDependency.range !== undefined &&
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
  })
}

function removeSupersededDependencies (tree) {
  tree.forEach(function (dependency, index) {
    if (dependency.range) {
      var name = dependency.name
      var range = dependency.range
      var superseding
      // Check missing direct dependencies.
      if (dependency.version === undefined) {
        superseding = maxSatisfying(tree, name, range)
        if (superseding) {
          // Any range conflict that might appear here would have caused
          // `checkForDirectDependencyRangeConflict` to throw an error.
          superseding.range = dependency.range
          spliceOut(tree, dependency)
        }
      // Check resolved direct dependencies.
      } else /* if (dependency.version) */ {
        var version = dependency.version
        tree.forEach(function (other) {
          var superseded = (
            other.name === name &&
            other.version === version &&
            other.range === undefined
          )
          if (superseded) {
            spliceOut(tree, other)
          }
        })
      }
    }
  })
}

function maxSatisfying (tree, name, range) {
  var candidates = []
  tree.forEach(function (dependency) {
    var match = (
      dependency.name === name &&
      dependency.version !== null &&
      satisfiesRange(dependency.version, range)
    )
    if (match) {
      candidates.push(dependency)
    }
  })
  if (candidates.length === 0) {
    return null
  } else {
    var availableVersions = candidates.map(function (dependency) {
      return dependency.version
    })
    var version = semver.maxSatisfying(availableVersions, range)
    return find(candidates, function (dependency) {
      return dependency.version === version
    })
  }
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

function spliceOut (array, element) {
  var index = array.indexOf(element)
  /* istanbul ignore else */
  if (index !== -1) {
    array.splice(index, 1)
  }
}
