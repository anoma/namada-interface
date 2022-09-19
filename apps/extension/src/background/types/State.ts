export interface IState<T> {
  state: T;
  update(state: Partial<T>): void;
}

export class State<T> implements IState<T> {
  constructor(public state: T) {}

  public update(state: Partial<T>) {
    this.state = {
      ...this.state,
      ...state,
    };
  }
}
