export class State {
  id: number;
  idCountry: number;
  name: string;

  constructor(state) {
    this.id = state.id;
    this.idCountry = state.idCountry;
    this.name = state.name;
  }

}
