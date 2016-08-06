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

tape('preserves indirect dependencies', function (test) {
  test.deepEqual(
    sort(
      merge(
        [
          {
            name: 'a',
            version: '1.0.0',
            links: [{name: 'b', version: '1.0.0', range: '^1.0.0'}]
          },
          {name: 'b', version: '1.0.0', links: []}
        ],
        [{name: 'c', version: '1.0.0', links: []}]
      )
    ),
    [
      {
        name: 'a',
        version: '1.0.0',
        links: [{name: 'b', version: '1.0.0', range: '^1.0.0'}]
      },
      {name: 'b', version: '1.0.0', links: []},
      {name: 'c', version: '1.0.0', links: []}
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

tape('throws for missing direct range mismatches', function (test) {
  test.throws(function () {
    sort(
      merge(
        [{name: 'a', missing: true, range: '^1.0.0', links: []}],
        [{name: 'a', missing: true, range: '^1.1.0', links: []}]
      )
    )
  }, /direct-dependency range mismatch/)
  test.end()
})

tape('merges missing', function (test) {
  test.deepEqual(
    sort(
      merge(
        [{name: 'a', links: [], range: '^1.0.0', missing: true}],
        [{name: 'a', links: [], range: '^1.0.0', missing: true}]
      )
    ),
    [{name: 'a', links: [], range: '^1.0.0', missing: true}]
  )
  test.end()
})

tape('resolves missing direct', function (test) {
  test.deepEqual(
    sort(
      merge(
        [
          {name: 'a', range: '^1.0.0', links: [], missing: true},
          {name: 'c', range: '^1.0.0', links: [], version: '1.0.0'}
        ],
        [{name: 'a', version: '1.0.1', range: '^1.0.0', links: []}]
      )
    ),
    [
      {name: 'a', version: '1.0.1', range: '^1.0.0', links: []},
      {name: 'c', range: '^1.0.0', links: [], version: '1.0.0'}
    ]
  )
  test.end()
})

tape('resolves missing indirect', function (test) {
  test.deepEqual(
    sort(
      merge(
        [
          {
            name: 'a',
            version: '1.0.0',
            range: '^1.0.0',
            links: [
              {name: 'b', missing: true, range: '^1.0.0'},
              {name: 'c', missing: true, range: '^1.0.0'}
            ]
          },
          {name: 'b', links: [], missing: true},
          {name: 'c', links: [], missing: true}
        ],
        [{name: 'b', version: '1.0.0', links: []}]
      )
    ),
    [
      {
        name: 'a',
        version: '1.0.0',
        range: '^1.0.0',
        links: [
          {name: 'b', version: '1.0.0', range: '^1.0.0'},
          {name: 'c', missing: true, range: '^1.0.0'}
        ]
      },
      {name: 'b', version: '1.0.0', links: []},
      {name: 'c', missing: true, links: []}
    ]
  )
  test.end()
})

tape('multiple links to missing', function (test) {
  test.deepEqual(
    sort(
      merge(
        [
          {
            name: 'a',
            version: '1.0.0',
            range: '^1.0.0',
            links: [{name: 'd', missing: true, range: '^1.0.0'}]
          },
          {
            name: 'b',
            version: '1.0.0',
            range: '^1.0.0',
            links: [{name: 'd', missing: true, range: '^1.1.0'}]
          },
          {
            name: 'c',
            version: '1.0.0',
            range: '^1.0.0',
            links: [{name: 'd', missing: true, range: '^2.0.0'}]
          },
          {name: 'd', links: [], missing: true}
        ],
        [{name: 'd', version: '1.1.0', links: []}]
      )
    ),
    [
      {
        name: 'a',
        version: '1.0.0',
        range: '^1.0.0',
        links: [{name: 'd', version: '1.1.0', range: '^1.0.0'}]
      },
      {
        name: 'b',
        version: '1.0.0',
        range: '^1.0.0',
        links: [{name: 'd', version: '1.1.0', range: '^1.1.0'}]
      },
      {
        name: 'c',
        version: '1.0.0',
        range: '^1.0.0',
        links: [{name: 'd', missing: true, range: '^2.0.0'}]
      },
      {name: 'd', links: [], missing: true},
      {name: 'd', version: '1.1.0', links: []}
    ]
  )
  test.end()
})
