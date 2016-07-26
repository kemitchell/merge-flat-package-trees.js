var merge = require('./')
var tape = require('tape')

tape('concatenates independent dependencies', function (test) {
  test.deepEqual(
    merge(
      [{name: 'a', version: '1.0.0', links: []}],
      [{name: 'b', version: '1.0.0', links: []}]
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
    merge(
      [{name: 'a', version: '1.0.0', links: []}],
      [{name: 'a', version: '1.0.1', links: []}]
    ),
    [
      {name: 'a', version: '1.0.0', links: []},
      {name: 'a', version: '1.0.1', links: []}
    ]
  )
  test.end()
})

tape('sorts', function (test) {
  test.deepEqual(
    merge(
      [
        {name: 'b', version: '1.0.0', links: []},
        {name: 'a', version: '1.0.0', links: []}
      ],
      []
    ),
    [
      {name: 'a', version: '1.0.0', links: []},
      {name: 'b', version: '1.0.0', links: []}
    ]
  )
  test.end()
})
