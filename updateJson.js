const deepMerge = require("merge-deep")
const jsonpath = require("jsonpath")
const util = require("util")

function str2int(str, {min=0, fallback=0}={}) {
    if (/^[+-]*\d+$/.test(str)) {  // 如果为数字或数字字符串
        let int = parseInt(str)  // 则转为数值型整数
        return Math.max(min, int)
    } else {  // 否则使用 fallback
        return fallback
    }
}

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

function merge(a, b) {  // a <- b
    if (util.isObject(a) && util.isObject(b)) {
        for(let bk in b){ if(!a.hasOwnProperty(bk)) delete b[bk] }
        return deepMerge(a, b)
    } else {
        return b
    }

}

function add(a, b, n) {  // a <- b
    b = Array.isArray(b) ? b : [b]
    if (Array.isArray(a)) {
        if (n === "+") n = a.length  // n in splice is current index + 1
        n = str2int(n, {fallback: a.length})
        if (n > a.length) return
        a.splice(n + 1, 0, ...b)
    } else if (util.isObject(a)) {
        b.forEach(e => {
            if (util.isObject(e)) {
                a = deepMerge(a, e)
            }
        })
    }  // else ignore
    return a
}

function sub(a, b, n, offset=0) {  // a <- b is for check
    if (n === "-") {
        if (!util.isObject(b)) return false
        if (Array.isArray(a)) {
            let refPoint = a.length - 1
            let _offset = 0
            for (let bk in b) {
                bk = str2int(bk, {fallback: "notInteger"})
                if (bk === "notInteger") continue
                _offset = sub(a, b[bk], bk, bk > refPoint ? _offset : 0) ? (_offset - 1) : _offset
                refPoint = bk
            }
        } else {
            for (let bk in b) {
                sub(a, b[bk], bk)
            }
        }
    } else {
        if (Array.isArray(a)) {
            n = str2int(n, {fallback: a.length}) + offset
            // note: n is counted from 0
            if (n > a.length - 1) return false
            if (isEqual(a[n], b)) {
                return a.splice(n, 1).length
            }  // else ignore
        } else if (util.isObject(a)) {
            if (isEqual(a[n], b)) {
                return delete a[n]
            }  // else ignore
        }
    }
}

function updateDataWithDecorator(targetParent, targetName, targetValue) {
    // what is decorator —— prefix and suffix
    // note: targetParent not object type results no effect and no error
    let plus = targetName.startsWith("+") ? "+" : false
    let minu = targetName.startsWith("-") ? "-" : false
    if (plus || minu) {
        var targetPos = (targetName.match(/\[(.+)]$/) || ["0", plus || minu])[1]
        targetName = targetName.replace(`[${targetPos}]`, "").slice(1)
    }
    if (plus) {
        targetParent[targetName] = add(targetParent[targetName], targetValue, targetPos)
    } else if (minu) {
        sub(targetParent[targetName], targetValue, targetPos)
    } else if (targetParent.hasOwnProperty(targetName)) {
        targetParent[targetName] = merge(targetParent[targetName], targetValue)
    }
}

function updateJson(data, pathData) {
    // decorator is prefixed / suffixed on e in case of a.b.c.d.[pre]e[suf]
    // prefix is picked from +, -
    // suffix is picked from [n]
    // data is considered to be object type, here we don't apply parameter check
    for (let fieldPath in pathData) {
        if (fieldPath.startsWith("$")) {

            let targetParent = jsonpath.query(data, fieldPath.replace(/\.[^.]*$/, ""))  // a.b.c.d.e -> a

            if (!Array.isArray(targetParent)) {
                targetParent = [targetParent]
            }

            targetParent.forEach(tp => {
                // if (!util.isObject(targetParent)) continue
                // ↑ no necessary to check if targetParent is object type
                // because nonObject['anyPropName'] = 'anyValue' results nothing
                // so does nonObject.anyPropName = 'anyValue'
                // and nonObject.notExistedPropName gets undefined but not error

                let targetName = fieldPath.replace(/^.*\./, "")  // a.b.c.d.e -> e

                updateDataWithDecorator(tp, targetName, pathData[fieldPath])
            })

        } else {
            updateDataWithDecorator(data, fieldPath, pathData[fieldPath])
        }
    }
    return data
}

module.exports = updateJson