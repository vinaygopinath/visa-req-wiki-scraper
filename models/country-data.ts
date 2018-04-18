import { CountryOutput } from './country-output';

export class CountryData {

  constructor(
    public required: CountryOutput[],
    public notRequired: CountryOutput[],
    public evisa: CountryOutput[],
    public onArrival: CountryOutput[],
    public refused: CountryOutput[],
    public unknown: CountryOutput[]
  ) { }
}
