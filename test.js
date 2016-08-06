var merge = require('./')
var sort = require('sort-flat-package-tree')
var tape = require('tape')

var DO_NOT_END = {}

function doMerge (a, b, result, end) {
  merge(a, b)
  sort(a)
  this.deepEqual(a, result)
  if (end !== DO_NOT_END) {
    this.end()
  }
}

tape('concatenates independent dependencies', function (test) {
  doMerge.apply(test, [
    [
      {name: 'a', version: '1.0.0', links: []}
    ],
    [
      {name: 'b', version: '1.0.0', links: []}
    ],
    [
      {name: 'a', version: '1.0.0', links: []},
      {name: 'b', version: '1.0.0', links: []}
    ]
  ])
})

tape('preserves indirect dependencies', function (test) {
  doMerge.apply(test, [
    [
      {
        name: 'a',
        version: '1.0.0',
        links: [{name: 'b', range: '^1.0.0', version: '1.0.0'}]
      },
      {name: 'b', version: '1.0.0', links: []}
    ],
    [
      {name: 'c', version: '1.0.0', links: []}
    ],
    [
      {
        name: 'a',
        version: '1.0.0',
        links: [{name: 'b', range: '^1.0.0', version: '1.0.0'}]
      },
      {name: 'b', version: '1.0.0', links: []},
      {name: 'c', version: '1.0.0', links: []}
    ]
  ])
})

tape('merges shared dependencies', function (test) {
  doMerge.apply(test, [
    [
      {name: 'a', version: '1.0.0', links: []},
      {name: 'b', version: '1.0.0', links: []},
      {name: 'c', version: '1.0.0', links: []}
    ],
    [
      {name: 'c', version: '1.0.0', links: []},
      {name: 'd', version: '1.0.0', links: []},
      {name: 'e', version: '1.0.0', links: []}
    ],
    [
      {name: 'a', version: '1.0.0', links: []},
      {name: 'b', version: '1.0.0', links: []},
      {name: 'c', version: '1.0.0', links: []},
      {name: 'd', version: '1.0.0', links: []},
      {name: 'e', version: '1.0.0', links: []}
    ]
  ])
})

tape('does not merge distinct versions', function (test) {
  doMerge.apply(test, [
    [
      {name: 'a', version: '1.0.0', links: []}
    ],
    [
      {name: 'a', version: '1.0.1', links: []}
    ],
    [
      {name: 'a', version: '1.0.0', links: []},
      {name: 'a', version: '1.0.1', links: []}
    ]
  ])
})

tape('preserves direct dependency ranges', function (test) {
  doMerge.apply(test, [
    [{name: 'a', version: '1.0.0', links: []}],
    [{name: 'a', range: '^1.0.0', version: '1.0.0', links: []}],
    [{name: 'a', range: '^1.0.0', version: '1.0.0', links: []}],
    DO_NOT_END
  ])
  doMerge.apply(test, [
    [{name: 'a', range: '^1.0.0', version: '1.0.0', links: []}],
    [{name: 'a', version: '1.0.0', links: []}],
    [{name: 'a', range: '^1.0.0', version: '1.0.0', links: []}],
    DO_NOT_END
  ])
  doMerge.apply(test, [
    [{name: 'a', range: '^1.0.0', version: '1.0.0', links: []}],
    [{name: 'a', range: '^1.0.0', version: '1.0.0', links: []}],
    [{name: 'a', range: '^1.0.0', version: '1.0.0', links: []}],
    DO_NOT_END
  ])
  test.end()
})

tape('throws for direct-dependency range mismatches', function (test) {
  test.throws(function () {
    merge(
      [{name: 'a', range: '^1.0.0', version: '1.0.0', links: []}],
      [{name: 'a', range: '^1.1.0', version: '1.0.0', links: []}]
    )
  }, /direct-dependency range mismatch/)
  test.end()
})

tape('throws for missing direct range mismatches', function (test) {
  test.throws(function () {
    merge(
      [{name: 'a', range: '^1.0.0', links: []}],
      [{name: 'a', range: '^1.1.0', links: []}]
    )
  }, /direct-dependency range mismatch/)
  test.end()
})

tape('merges missing', function (test) {
  doMerge.apply(test, [
    [{name: 'a', range: '^1.0.0', links: []}],
    [{name: 'a', range: '^1.0.0', links: []}],
    [{name: 'a', range: '^1.0.0', links: []}]
  ])
})

tape('resolves missing direct', function (test) {
  doMerge.apply(test, [
    [
      {name: 'a', range: '^1.0.0', links: []},
      {name: 'c', range: '^1.0.0', version: '1.0.0', links: []}
    ],
    [
      {name: 'a', range: '^1.0.0', version: '1.0.1', links: []}
    ],
    [
      {name: 'a', range: '^1.0.0', version: '1.0.1', links: []},
      {name: 'c', range: '^1.0.0', version: '1.0.0', links: []}
    ]
  ])
})

tape('resolves missing indirect', function (test) {
  doMerge.apply(test, [
    [
      {
        name: 'a',
        version: '1.0.0',
        range: '^1.0.0',
        links: [
          {name: 'b', range: '^1.0.0'},
          {name: 'c', range: '^1.0.0'}
        ]
      }
    ],
    [
      {name: 'b', version: '1.0.0', links: []}
    ],
    [
      {
        name: 'a',
        version: '1.0.0',
        range: '^1.0.0',
        links: [
          {name: 'b', range: '^1.0.0', version: '1.0.0'},
          {name: 'c', range: '^1.0.0'}
        ]
      },
      {name: 'b', version: '1.0.0', links: []}
    ]
  ])
})

tape('engineered for coverage', function (test) {
  test.throws(function () {
    merge(
      [{name: 'a', range: '^1.0.0', links: []}],
      [{name: 'a', range: '^1.1.0', version: '1.1.0', links: []}]
    )
  })
  test.end()
})

tape('multiple links to missing', function (test) {
  doMerge.apply(test, [
    [
      {
        name: 'a',
        version: '1.0.0',
        range: '^1.0.0',
        links: [{name: 'd', range: '^1.0.0'}]
      },
      {
        name: 'b',
        version: '1.0.0',
        range: '^1.0.0',
        links: [{name: 'd', range: '^1.1.0'}]
      },
      {
        name: 'c',
        version: '1.0.0',
        range: '^1.0.0',
        links: [{name: 'd', range: '^2.0.0'}]
      }
    ],
    [
      {name: 'd', version: '1.1.0', links: []}
    ],
    [
      {
        name: 'a',
        version: '1.0.0',
        range: '^1.0.0',
        links: [{name: 'd', range: '^1.0.0', version: '1.1.0'}]
      },
      {
        name: 'b',
        version: '1.0.0',
        range: '^1.0.0',
        links: [{name: 'd', range: '^1.1.0', version: '1.1.0'}]
      },
      {
        name: 'c',
        version: '1.0.0',
        range: '^1.0.0',
        links: [{name: 'd', range: '^2.0.0'}]
      },
      {name: 'd', version: '1.1.0', links: []}
    ]
  ])
})
