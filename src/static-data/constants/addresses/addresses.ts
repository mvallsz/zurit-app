import states from './states.json';
import cities from './cities.json';
import countries from './countries.json';

export type City = {
  id: number;
  idState: number;
  name: string;
};

export type State = {
  id: number;
  idCountry: number;
  name: string;
};

export type Country = {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  phoneCode: string;
};

export const COUNTRIES: Country[] = countries as Country[];
export const STATES: State[] = states as State[];
export const CITIES: City[] = cities as City[];

export const ESTADOS_VE = STATES.filter((state) => state.idCountry === 95);
export const CIUDADES_VE = CITIES.filter((city) => ESTADOS_VE.find((estado) => estado.id === city.idState));
export const ESTADOS = states;
export const CIUDADES = cities;
export const PAISES = countries;
