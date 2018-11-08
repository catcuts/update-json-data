const deconstructPath = require("../deconstructPath")
const assert = require("assert")
const util = require("util")

var testGroups = [
    {
        enabled: true,
        originalData: "",
        submittedData: "$.children[?(@.name=='B')].+children[?(@.name=='b3')][12]",
        expectedData: {
            parentPath: "$.children[?(@.name=='B')]",
            targetPath: "children[?(@.name=='b3')]",
            targetPos: "12",
            targetOperator: "+"
        }
    },
    {
        enabled: true,
        originalData: "",
        submittedData: "$.children[?(@.name=='B')].-(children[?(@.name=='b3')][12])",
        expectedData: {
            parentPath: "$.children[?(@.name=='B')]",
            targetPath: "children[?(@.name=='b3')][12]",
            targetPos: "-",
            targetOperator: "-"
        }
    },
    {
        enabled: true,
        originalData: "",
        submittedData: "$.children[?(@.name=='B')].-(children[?(@.name=='b3')][12])[34]",
        expectedData: {
            parentPath: "$.children[?(@.name=='B')]",
            targetPath: "children[?(@.name=='b3')][12]",
            targetPos: "34",
            targetOperator: "-"
        }
    },
    {
        enabled: true,
        originalData: "",
        submittedData: "abc",
        expectedData: {
            parentPath: "abc",
            targetPath: "",
            targetPos: "",
            targetOperator: ""
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

describe("deconstructPath", () => {
    for (let n = 0; n <= testGroups.length - 1; n++) {
        if (!testGroups[n].enabled) continue
        it(`#group${n+1}`, () => {
            resultData = deconstructPath(testGroups[n].submittedData)
            assert.equal(true, isEqual(resultData, testGroups[n].expectedData))
        })
    }
})

