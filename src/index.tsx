import * as React from 'react'
import { cloneElement ,Component, ReactElement } from 'react'


interface ModFunction {
  (props: Object): Object
}

type FieldModifier = string[] | ModFunction | undefined

interface WrapperProps {
  register: Function,
  fields: FieldModifier,
  state: KState
}

interface Accessible extends Object {
  [key: string]: any
}

function isFunc(func: FieldModifier): func is ModFunction {
  return func !== undefined && func.length === undefined
}

class Wrapper extends Component<WrapperProps, any> {
  constructor(props: WrapperProps) {
    super(props)
    this.state = { [props.state.name]: props.state  }
    this.props.register((fields: Accessible) => {
      if (Array.isArray(this.props.fields)) {
        const modified = fields
        const fieldArray: string[] = this.props.fields 
        const keys = Object.keys(fields)
        keys.filter(k => !fieldArray.includes(k)).forEach(f => delete modified[f])
        this.setState({ ...modified })
      }
      if (isFunc(this.props.fields)) {
        const modFunction: ModFunction = this.props.fields
        const modified = modFunction(fields)
        this.setState({ ...modified })
      }
      this.setState({ ...fields })
    })
  }
  render() {
    const childWithProp = cloneElement(this.props.children as ReactElement<WrapperProps>, { ...this.state });
    return (<div>{childWithProp}</div>)
  }
}

export default class KState {
  static states: KState[] = []
  
  static register = (name: string, vars: Object): void => {
    if (!name) return
    KState.states.push(new KState(name, vars))
  }

  static getState = (name: string): KState => {
    let state = KState.states.find((s: KState) => s.name === name)
    if (state === undefined) { 
      state = new KState(name)
      KState.states.push(state)
    }
    return state
  }
  
  static connect = (name: string, fields: FieldModifier) => <T1 extends {}>(Component: new() => Component) => (props: Object) => {
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

  static set(name: string, fields: Object) {
    const state = KState.getState(name)
    state.set(fields)
  }

  public name: string
  private vars: any = {}
  private funcs: Function[]

  constructor(name: string, vars: any = {}) {
    this.name = name
    this.vars = vars
    this.funcs = []
  }

  register = (func: (fields: Object) => {}) => {
    this.funcs.push(func)
  }
  
  emit(vars: Object): void {
    this.funcs.forEach(f => f(vars))
  }
  set(vars: Object): void{
    this.vars = { ...this.vars, ...vars }
    this.emit(this.vars)
  }
}

export const connect = KState.connect