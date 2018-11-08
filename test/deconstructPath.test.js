const deconstructPath = require("../deconstructPath")
const assert = require("assert")

var testGroups = [
    {
        enabled: true,
        originalData: "",
        submittedData: "$.children[?(@.name=='B')].+children[?(@.name=='b3')]",
        expectedData: {
            parentPath: "$.children[?(@.name=='B')]",
            targetPath: "children[?(@.name=='b3')]",
            targetPos: "+",
            targetOperator: "+"
        }
    },
    {
        enabled: true,
        originalData: "",
        submittedData: "$.children[?(@.name=='B')].+children[2]",
        expectedData: {
            parentPath: "$.children[?(@.name=='B')]",
            targetPath: "children",
            targetPos: "2",
            targetOperator: "+"
        }
    },
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
            parentPath: "$",
            targetPath: "abc",
            targetPos: "",
            targetOperator: ""
        }
    },
    {
        enabled: true,
        originalData: "",
        submittedData: "+a1[1]",
        expectedData: {
            parentPath: "$",
            targetPath: "a1",
            targetPos: "1",
            targetOperator: "+"
        }
    },

]

var resultData

describe("deconstructPath", () => {
    for (let n = 0; n <= testGroups.length - 1; n++) {
        if (!testGroups[n].enabled) continue
        it(`#group${n+1}`, () => {
            resultData = deconstructPath(testGroups[n].submittedData)
            Object.getOwnPropertyNames(resultData).forEach(k => {
                let expectedData = testGroups[n].expectedData
                if (expectedData.hasOwnProperty(k)) {
                    assert.equal(resultData[k], expectedData[k])
                }
            })
        })
    }
})

