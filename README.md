Given two flat package dependency tree manifests like:

```json
[
  {
    "name": "a",
    "version": "1.0.0",
    "range": "^1.0.0",
    "links": []
  }
]
```

and:

```json
[
  {
    "name": "b",
    "version": "1.0.0",
    "range": "^1.0.0",
    "links": []
  }
]
```

merge the second into the first:

```json
[
  {
    "name": "a",
    "version": "1.0.0",
    "range": "^1.0.0",
    "links": []
  },
  {
    "name": "b",
    "version": "1.0.0",
    "range": "^1.0.0",
    "links": []
  }
]
```
