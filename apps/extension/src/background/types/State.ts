export interface IState<T> {
  state: T;
  update(state: Partial<T>): void;
}

/**
 * A simple class representing a state of generic type,
 * that implements an update method accepting a partial state.
 */
export abstract class State<T> implements IState<T> {
  constructor(public state: T) {}

  public update(state: Partial<T>) {
    this.state = {
      ...this.state,
      ...state,
    };
  }
}
