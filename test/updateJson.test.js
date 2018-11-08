const updateJson = require("../updateJson")
const assert = require("assert")
const util = require("util")

var testGroups = [
    {
        enabled: true,
        originalData: {
            "a1": true,
            "a2": 2,
            "a3": "av3",
            "a4": false,
        },
        submittedData: {
            "a2": 233,
            "a3": "av333",
            "a4": true,
            "a5": "a5"
        },
        expectedData: {
            "a1": true,
            "a2": 233,
            "a3": "av333",
            "a4": true
        }
    },
    {
        enabled: true,
        originalData: {
            "a1": [
                true,
                2,
                "av3",
                false,
                "av5"
            ]
        },
        submittedData: {
            "+a1[1]": "onPos1AddedAValue",  // batch: "+a1[2]": [a, serials, of, values]
            "+a1[2]": ["onPos2AddedAValue", 123, true],
            "-a1[6]": "av3",  // batch: "-a1": {1: a, 6: serials, 5: of, 8: values}
            "+a1": "addedValue123",
            "-a1": {  // note: object has no order
                4: 123,
                0: true,
                1: 2
            }
        },
        expectedData: {
            "a1": [
                // true,
                // 2,
                "onPos1AddedAValue",
                "onPos2AddedAValue",
                // 123,
                true,
                // "av3",
                false,
                "av5",
                "addedValue123"
            ]
        }
    },
    {
        enabled: true,
        originalData: {
            "a1": [
                true,
                2,
                "av3",
                false,
                "av5"
            ]
        },
        submittedData: {
            "+a1[2]": "onPos2AddedAValue",  // if batch wanted: "+a1[2]": [a, serials, of, values]
            "-a1[2]": "av3",  // if batch wanted: "-a1": {1: a, 3: serials, 5: of, 8: values}
            "+a1": "addedValue123",
            "-a1": {  // note: object has no order
                1: 2,
                0: true,
                4: "av5"
            }
        },
        expectedData: {
            "a1": [
                // true,  // removed
                // 2,     // removed
                // "av3", // removed
                "onPos2AddedAValue",  // added
                false,    // remained
                // "av5", // removed
                "addedValue123"  // added
            ]
        }
    },
    {
        enabled: true,
        originalData: {
            "a1": {
                "x": "xxx",
                "y": 123,
                "z": false,
                "k": "kkk"
            }
        },
        submittedData: {
            "+a1": {
                "m": "mmm",
                "n": "nnn"
            },
            "-a1[y]": 123,
            "-a1": {
                "x": "xxx",
                "z": false
            }
        },
        expectedData: {
            "a1": {
                // "x": "xxx",
                // "y": 123,
                // "z": false,
                "k": "kkk",
                "m": "mmm",
                "n": "nnn"
            }
        }
    },

    // json path field
    {
        enabled: true,
        originalData: {
            "a1": true,
            "a2": 2,
            "a3": "av3",
            "a4": {
                "a41": 42,
                "a42": false,
                "a43": "av43",
                "a44": {
                    "a441": 1234
                }
            },
        },
        submittedData: {
            "$.a2": 233,
            "$.a3": "av333",
            "$.a4.a41": 4200,
            "$.a4.a44.a441": 4321,
            "$.a5": "a5"
        },
        expectedData: {
            "a1": true,
            "a2": 233,
            "a3": "av333",
            "a4": {
                "a41": 4200,
                "a42": false,
                "a43": "av43",
                "a44": {
                    "a441": 4321
                }
            }
        }
    },
    {
        enabled: true,
        originalData: {
            "x": {
                "y": {
                    "a1": [
                        true,
                        2,
                        "av3",
                        false,
                        "av5"
                    ]
                }
            }
        },
        submittedData: {
            "$.x.y.+a1[1]": "onPos1AddedAValue",  // batch: "+a1[2]": [a, serials, of, values]
            "$.x.y.+a1[2]": ["onPos2AddedAValue", 123, true],
            "$.x.y.-a1[6]": "av3",  // batch: "-a1": {1: a, 6: serials, 5: of, 8: values}
            "$.x.y.+a1": "addedValue123",
            "$.x.y.-a1": {  // note: object has no order
                4: 123,
                0: true,
                1: 2
            }
        },
        expectedData: {
            "x": {
                "y": {
                    "a1": [
                        // true,
                        // 2,
                        "onPos1AddedAValue",
                        "onPos2AddedAValue",
                        // 123,
                        true,
                        // "av3",
                        false,
                        "av5",
                        "addedValue123"
                    ]
                }
            }
        }
    },
    {
        enabled: true,
        originalData: {
            "x": {
                "y": {
                    "a1": [
                        true,
                        2,
                        "av3",
                        false,
                        "av5"
                    ]
                }
            }
        },
        submittedData: {
            "$.x.y.+a1[2]": "onPos2AddedAValue",  // if batch wanted: "+a1[2]": [a, serials, of, values]
            "$.x.y.-a1[2]": "av3",  // if batch wanted: "-a1": {1: a, 3: serials, 5: of, 8: values}
            "$.x.y.+a1": "addedValue123",
            "$.x.y.-a1": {  // note: object has no order
                1: 2,
                0: true,
                4: "av5"
            }
        },
        expectedData: {
            "x": {
                "y": {
                    "a1": [
                        // true,  // removed
                        // 2,     // removed
                        // "av3", // removed
                        "onPos2AddedAValue",  // added
                        false,    // remained
                        // "av5", // removed
                        "addedValue123"  // added
                    ]
                }
            }
        }
    },

    // json path value
    {
        enabled: true,

        // suppose this is a tree data (original)
        // T
        // |——A
        // |  |——a1
        // |  |——a2
        // |  |——a3
        // |
        // |——B
        // |  |——b1
        // |  |——b2
        // |  |——b3
        // |
        originalData: {
          "name": "T",
          "children": [
              {
                  "name": "A",
                  "children": [
                      {"name": "a1"},
                      {"name": "a2"},
                      {"name": "a3"}
                  ]
              },
              {
                  "name": "B",
                  "children": [
                      {"name": "b1"},
                      {"name": "b2"},
                      {"name": "b3"}
                  ]
              }
          ]
        },

        submittedData: {
            "$.children[?(@.name=='A')].+children": "$.children[?(@.name=='B')].-children[?(@.name=='b3')]"
        },

        // this is the updated tree data
        // T
        // |——A
        // |  |——a1
        // |  |——a2
        // |  |——a3
        // |  |——b3
        // |
        // |——B
        // |  |——b1
        // |  |——b2
        // |

        expectedData: {
          "name": "T",
          "children": [
              {
                  "name": "A",
                  "children": [
                      {"name": "a1"},
                      {"name": "a2"},
                      {"name": "a3"},
                      {"name": "b3"}
                  ]
              },
              {
                  "name": "B",
                  "children": [
                      {"name": "b1"},
                      {"name": "b2"}
                  ]
              }
          ]
        }
    },

]

var resultData

function isEqual(a, b) {
    if (util.isObject(a) && util.isObject(b)) {
        let aKeys = Object.keys(a)
        let bKeys = Object.keys(b)
        if (aKeys.length === bKeys.length) {
            for (let ak of aKeys) {
                if (b.hasOwnProperty(ak) && isEqual(a[ak], b[ak])) {
                    continue
                } else {
                    return false
                }
            }
            return true
        } else {
            return false
        }
    } else if (util.isArray(a) && util.isArray(b)) {
        if (a.length === b.length) {
            for (let ai in a) {
                if (isEqual(a[ai], b[ai])) {
                    continue
                } else {
                    return false
                }
            }
            return true
        } else {
            return false
        }
    } else {
        return a === b
    }
}

describe("updateJson", () => {
    for (let n = 0; n <= testGroups.length - 1; n++) {
        if (!testGroups[n].enabled) continue
        it(`#group${n+1}`, () => {
            resultData = updateJson(testGroups[n].originalData, testGroups[n].submittedData)
            assert.equal(true, isEqual(resultData, testGroups[n].expectedData))
        })
    }
})

