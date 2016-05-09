# ColorQueue-Firebase

Application which connects to firebase server, watches /colors reference for changes, and syncrhonizes changes with instance of ColorQueue which animates colors on an LED strip.

## Installation

Clone this repository:
```
git clone https://github.com/mattmazzola/colorqueue-firebase.git
```

Install Dependencies:
```
npm install
typings install
```

Build solution:
```
tsc -p .
```

Setup Configuration:
```
{
  "firebaseUrl": "<Your Firebase account url>",
  "length": "<Number of LEDs on your strip>"
}
```

Run the service
```
node dist/index.js
```

At this point the servie will be connected to firebase and will update anytime colors are added or removed to the /colors node.

You can see this by manually opening up the contorl panel and adding a color object such as:
```
{
  r: 255,
  g: 0,
  b: 0,
  a: 1,
  transition: "linear",
  duration: 30000,
  order: 1462774343131
}
```

Howver, it's more likely that you would use a different application such as (colorqueueapp)[https://github.com/mattmazzola/colorqueueapp] which provides a website where users can select their favorite color and add it to the queue.

## Notes about setting up firebase account

It's a best practice to enable validation on the colors node to ensure no bad data is inserted into the database
```
"rules": {
        ".read": true,
        "colors": {
          "$color": {
            ".validate": "newData.hasChildren(['r', 'g', 'b', 'a', 'order', 'duration', 'transition'])
                        && newData.child('r').isNumber() && 0 <= newData.child('r').val() && newData.child('r').val() <= 255
                        && newData.child('g').isNumber() && 0 <= newData.child('g').val() && newData.child('g').val() <= 255
                        && newData.child('b').isNumber() && 0 <= newData.child('b').val() && newData.child('b').val() <= 255
                        && newData.child('a').isNumber() && 0 <= newData.child('a').val() && newData.child('a').val() <= 1
                        && newData.child('order').isNumber() && 0 <= newData.child('order').val()
                        && newData.child('duration').isNumber() && 0 <= newData.child('duration').val() && newData.child('duration').val() <= 600000
                        && newData.child('transition').isString()"
          }
        }
    }
```

