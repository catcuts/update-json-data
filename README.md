# Update Json Data by Extended Json Path

Get started: `npm i update-json-data`

- [Update Json Data by Extended Json Path](#update-json-data-by-extended-json-path)
    - [1. Updating The non-Object and non-Array](#1-updating-the-non-object-and-non-array)
    - [2. Updating The Array (simple)](#2-updating-the-array-simple)
    - [3. Updating The Array (complicated)](#3-updating-the-array-complicated)
    - [4. Updating via JsonPath](#4-updating-via-jsonpath)
    - [5. Updating Tree Data](#5-updating-tree-data)

## 1. Updating The non-Object and non-Array

Suppose we have the original data:

```js
originalData: {
    "a1": true,
    "a2": 2,
    "a3": "av3",
    "a4": false,
}
```

What we want to apply on it is:

- Remain a1's value
- Modify a2's value to 233
- Modify a3's value to "av333"
- Modify a4's value to true
- Ignore a5 which does not exist in original's keys

To achieve this, prepare the submitted data:

```js
submittedData: {
    "a2": 233,
    "a3": "av333",
    "a4": true,
    "a5": "a5"
}
```

Then we got the expected data:

```js
expectedData: {
    "a1": true,
    "a2": 233,
    "a3": "av333",
    "a4": true
}
```

## 2. Updating The Array (simple)

Suppose we have the original data:

```js
originalData: {
    "a1": [
        true,
        2,
        "av3",
        false,
        "av5"
    ]
}
```

What we want to apply on it is: (index is counted from 0)

- Insert an element after the the 2nd element; then:
- Remove the 2nd element which value is "av3"; then:
- Insert an element after the final element; then:
- Remove below elements: (neither to consider the order or to consider changing the index every time after every removal)
    - the 0th element which value is true
    - the 1st element which value is 2
    - the 4th element which value is "av5"

To achieve this, prepare the submitted data:

```js
submittedData: {
    "+a1[2]": "onPos2AddedAValue",  // if batch wanted: "+a1[2]": [a, serials, of, values]
    "-a1[2]": "av3",  // if batch wanted: "-a1": {1: a, 3: serials, 5: of, 8: values}
    "+a1": "addedValue123",
    "-a1": {  // note: object has no order
        1: 2,
        0: true,
        4: "av5"
    }
}
```

Then we got the expected data:

```js
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
```

## 3. Updating The Array (complicated)

Suppose we have the original data:

```js
originalData: {
    "a1": [
        true,
        2,
        "av3",
        false,
        "av5"
    ]
}
```

What we want to apply on it is: (index is counted from 0)

- Insert an element after the the 1st element; then:
- Insert an element list after the the 2nd element; then:
- Remove the 6th element which value is "av3"; then:
- Insert an element after the final element; then:
- Remove below elements: (neither to consider the order or to consider changing the index every time after every removal)
    - the 0th element which value is true
    - the 1th element which value is 2
    - the 4th element which value is 123

To achieve this, prepare the submitted data:

```js
submittedData: {
    "+a1[1]": "onPos1AddedAValue",
    "+a1[2]": ["onPos2AddedAValue", 123, true],
    "-a1[6]": "av3",
    "+a1": "addedValue123",
    "-a1": {  // note: object has no order
        4: 123,
        0: true,
        1: 2
    }
}
```

Then we got the expected data:

```js
expectedData: {
    "a1": [
        // true,  // removed
        // 2,     // removed
        "onPos1AddedAValue",  // added
        "onPos2AddedAValue",  // added
        // 123,   // added then removed
        true,     // remained
        // "av3", // removed
        false,    // remained
        "av5",    // remained
        "addedValue123"  // added
    ]
}
```

## 4. Updating via JsonPath

Suppose we have the original data:

```js
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
}
```

What we want to apply on "$.x.y.a1" is: (index is counted from 0)

- Insert an element after the the 1st element; then:
- Insert an element list after the the 2nd element; then:
- Remove the 6th element which value is "av3"; then:
- Insert an element after the final element; then:
- Remove below elements: (neither to consider the order or to consider changing the index every time after every removal)
    - the 0th element which value is true
    - the 1th element which value is 2
    - the 4th element which value is 123

To achieve this, prepare the submitted data:

```js
submittedData: {
    "$.x.y.+a1[1]": "onPos1AddedAValue",
    "$.x.y.+a1[2]": ["onPos2AddedAValue", 123, true],
    "$.x.y.-a1[6]": "av3",
    "$.x.y.+a1": "addedValue123",
    "$.x.y.-a1": {  // note: object has no order
        4: 123,
        0: true,
        1: 2
    }
}
```

Then we got the expected data:

```js
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
```

## 5. Updating Tree Data

Suppose we have a tree defined by below data:

```js
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
}
```

What we want to apply on this tres is:

- Move node B-b3 to A-a2's next

To achieve this, prepare the submitted data:

```js
submittedData: {
    // note: currently we don't support:
    // "$.children[?(@.name=='A')].+children[?(@.name=='a2')": "$.children[?(@.name=='B')].-children[?(@.name=='b3')"
    "$.children[?(@.name=='A')].+children[1]": "$.children[?(@.name=='B')].-children[2]"
    //                          ^         ^                                ^         ^
    //                         note1     note2                            note3     note4
    // note4: remove children[2]
    // note1: and then add to after children[1]
    // note2 and note3: the last index need to be pre-calculated
}
```

Then we got the expected data:

```js
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
```