declare module 'all-the-cities' {
  const cities: {
    name: string;
    country: string;
    population: number;
    lat: number;
    lon: number;
    [key: string]: any;
  }[];
  export default cities;
}
