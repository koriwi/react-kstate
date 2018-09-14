import React, { Component } from 'react'

function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
 }

class Wrapper extends Component {
  constructor(props) {
    super(props)
    this.state = { [props.state.name]: props.state  }
    this.props.register((fields) => {
      let modified = fields
      if (Array.isArray(this.props.fields)) {
        const keys = Object.keys(fields)
        keys.filter(k => !this.props.fields.includes(k)).forEach(f => delete modified[f])
      }
      if (isFunction(this.props.fields)) {
        modified = this.props.fields(fields)
      }
      this.setState({ ...modified })
    })
  }
  render() {
    const childWithProp = React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, { ...this.state });
    });
    return (<div>{childWithProp}</div>)
  }
}

export default class KState {
  static states = []
  
  static register = (name, vars) => {
    if (!name) return
    KState.states.push(new KState(name, vars))
  }

  static getState = (name) => {
    let state = KState.states.find(s => s.name === name)
    if (state === undefined) { 
      state = new KState(name)
      KState.states.push(state)
    }
    return state
  }
  
  static connect = (name, fields) => (Component) => (props) => {
    if (!name) throw new Error('name is mandatory')
    const state = KState.getState(name)
    return (
      <Wrapper
        register={state.register}
        state={state}
        fields={fields}
      >
        <Component { ...props } />
      </Wrapper>
    )
  }

  static set(name, fields) {
    const state = KState.getState(name)
    state.set(fields)
  }

  constructor(name, vars) {
    this.name = name
    this.vars = vars || {}
    this.funcs = []
  }

  register = (func) => {
    this.funcs.push(func)
  }
  
  emit = (vars) => {
    this.funcs.forEach(f => f(vars))
  }

  set = (varName, value) => {
    if (typeof varName === 'string' && value !== undefined) this.vars[varName] = value
    else if (varName !== null && typeof varName === 'object') this.vars = { ...this.vars, ...varName }
    this.emit(this.vars)
  }
}

export const connect = KState.connect