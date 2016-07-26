var merge = require('./')
var tape = require('tape')

tape(function (test) {
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
