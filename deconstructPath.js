const util = require("util")

function deconstructPath(path) {
    // $.children[?(@.name=='B')].±children[?(@.name=='b3')][n]       -> pos=n
    // $.children[?(@.name=='B')].±(children[?(@.name=='b3')][n])     -> pos=_
    // $.children[?(@.name=='B')].±(children[?(@.name=='b3')][n])[m]  -> pos=m
    //
    // ±$.children[?(@.name=='B')].children[?(@.name=='b3')][n]       -> pos=n
    // ±$.children[?(@.name=='B')].(children[?(@.name=='b3')][n])     -> pos=_
    // ±$.children[?(@.name=='B')].(children[?(@.name=='b3')][n])[m]  -> pos=m
    //
    // —————————————————————————— — ——————————————————————— ——
    //        parentPath          o        targetPath       targetPos
    //                             p
    //                              e
    //                               r
    //                                a
    //                                 t
    //                                  o
    //                                   r
    let parentPath = "$", targetPath = path, targetPos = "", targetOperator = ""
    if (util.isString(path)) {
        let reversedPath = path.split("").reverse()
        // first find the right dot to split
        for (let i = 0; i < path.length; i++) {
            let curr = reversedPath[i]
            let near = reversedPath[i + 1]
            if (curr === "." && near !== "@") {
                parentPath = path.slice(0, path.length - i - 1)
                targetPath = path.slice(path.length - i)
                break
            }
        }

        // for the left part

        // get the left operator
        let leftOperator = parentPath.startsWith("+") ? "+" : (parentPath.startsWith("-") ? "-" : "")
        if (leftOperator) {
            parentPath = parentPath.slice(1)
        }

        // for the right part

        // get the right operator
        let rightOperator = targetPath.startsWith("+") ? "+" : (targetPath.startsWith("-") ? "-" : "")

        // get the position
        targetPos = (targetPath.match(/\[(\w+)\]$/) || ["0", leftOperator || rightOperator])[1]

        // trim off the [targetPos] by replace
        // and pick off the targetPos by slice
        targetPath = targetPath.replace(new RegExp(`\\[${targetPos}\\]$`), "")

        // pick off operator
        if (rightOperator) {
            targetPath = targetPath.slice(1)
        }

        // trim the brackets on the beginning and end position
        if (/^\(.+\)$/.test(targetPath)) {
            targetPath = targetPath.slice(1, targetPath.length - 1)
        }

        // final operator
        targetOperator = leftOperator || rightOperator

    }
    return {parentPath, targetPath, targetPos, targetOperator}
}

module.exports = deconstructPath