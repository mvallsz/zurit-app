export class City {
  id: number;
  idState: number;
  name: string;

  constructor(city) {
    this.id = city.id;
    this.idState = city.idState;
    this.name = city.name;
  }

}
