var merge = require('./')
var sort = require('sort-flat-package-tree')
var tape = require('tape')

tape('concatenates independent dependencies', function (test) {
  test.deepEqual(
    sort(
      merge(
        [{name: 'a', version: '1.0.0', links: []}],
        [{name: 'b', version: '1.0.0', links: []}]
      )
    ),
    [
      {name: 'a', version: '1.0.0', links: []},
      {name: 'b', version: '1.0.0', links: []}
    ]
  )
  test.end()
})

tape('merges shared dependencies', function (test) {
  test.deepEqual(
    sort(
      merge(
        [
          {name: 'a', version: '1.0.0', links: []},
          {name: 'b', version: '1.0.0', links: []},
          {name: 'c', version: '1.0.0', links: []}
        ],
        [
          {name: 'c', version: '1.0.0', links: []},
          {name: 'd', version: '1.0.0', links: []},
          {name: 'e', version: '1.0.0', links: []}
        ]
      )
    ),
    [
      {name: 'a', version: '1.0.0', links: []},
      {name: 'b', version: '1.0.0', links: []},
      {name: 'c', version: '1.0.0', links: []},
      {name: 'd', version: '1.0.0', links: []},
      {name: 'e', version: '1.0.0', links: []}
    ]
  )
  test.end()
})

tape('does not merge distinct versions', function (test) {
  test.deepEqual(
    sort(
      merge(
        [{name: 'a', version: '1.0.0', links: []}],
        [{name: 'a', version: '1.0.1', links: []}]
      )
    ),
    [
      {name: 'a', version: '1.0.0', links: []},
      {name: 'a', version: '1.0.1', links: []}
    ]
  )
  test.end()
})

tape('preserves direct dependency ranges', function (test) {
  var withRange = [
    {name: 'a', version: '1.0.0', range: '^1.0.0', links: []}
  ]
  var withoutRange = [{name: 'a', version: '1.0.0', links: []}]
  test.deepEqual(sort(merge(withoutRange, withRange)), withRange)
  test.deepEqual(sort(merge(withRange, withoutRange)), withRange)
  test.deepEqual(sort(merge(withRange, withRange)), withRange)
  test.end()
})

tape('throws for direct-dependency range mismatches', function (test) {
  test.throws(function () {
    sort(
      merge(
        [{name: 'a', version: '1.0.0', range: '^1.0.0', links: []}],
        [{name: 'a', version: '1.0.0', range: '^1.1.0', links: []}]
      )
    )
  }, /direct-dependency range mismatch/)
  test.end()
})

tape('sorts', function (test) {
  test.deepEqual(
    sort(
      merge(
        [
          {name: 'b', version: '1.0.0', links: []},
          {name: 'a', version: '1.0.0', links: []}
        ],
        []
      )
    ),
    [
      {name: 'a', version: '1.0.0', links: []},
      {name: 'b', version: '1.0.0', links: []}
    ]
  )
  test.end()
})
