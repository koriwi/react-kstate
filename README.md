# KState
## Very easy and simple state manager

### 1. Install
`npm install react-kstate`

### 2. Use

#### Basics
File 1
- You can set state variable by accessing the prop with the same name as the state
```js
import React, { Component } from 'react'
import { connect } from 'react-kstate'

@connect('someState')
export default class Input extends Component {
  render() {
    return (<input
      onChange={(e) => this.props.someState.set({
        someTextValue: e.target.value
      })}/>)
  }
}
```

File 2
- When you dont specify the fields you want, you get all in props
```js
import React, { Component } from 'react'
import { connect } from 'react-kstate'

@connect('someState')
export default class Output extends Component {
  render() {
    return (<h1>{this.props.someTextValue}</h1>)
  }
}
```
#### Advanced
File 2 with fields specified
- Or you can specify an array with what you want
```js
import React, { Component } from 'react'
import { connect } from 'react-kstate'

@connect('someState', ['someTextValue'])
export default class Output extends Component {
  render() {
    return (<h1>{this.props.someTextValue}</h1>)
  }
}
```

File 2 with fields modified
- You can also pass a function which gets the values of the state as an object.
- You have to return an object which will then be passed into the component props
```js
import React, { Component } from 'react'
import { connect } from 'react-kstate'

@connect('someState', (state) => { ...state, header: someTextValue && someTextValue.toUpperCase()})
export default class Output extends Component {
  render() {
    //now the header ist always in CAPS
    return (<h1>{this.props.header}</h1>)
  }
}
```

#### Modify state from somewhere else

```js
import KState from 'react-kstate'
//set single/multiple values
KState.set('someState', { header: 'Hello' })
KState.set('someState', { header1: 'Hello', header2: 'World' })
```
