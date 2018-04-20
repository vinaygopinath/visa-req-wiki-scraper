const BluebirdPromise = require('bluebird'); // tslint:disable-line
import * as path from 'path';
import { CountryData } from '../models/country-data';
const writeFileAsync: (countryFilePath: string, countryDataStr: string) => Promise<void> = BluebirdPromise.promisify(require('fs').writeFile);
const mkdirAsync: (folderName: string) => Promise<void> = BluebirdPromise.promisify(require('fs').mkdir);

export class FileUtil {

  static writeToFile(country: string, countryData: CountryData): Promise<void> {

    return writeFileAsync(path.join(__dirname, '../output', `${country.toLowerCase()}.json`), JSON.stringify(countryData, null, 2))
      .catch(() => {
        console.error(`Error writing to file. Will attempt to create directory`);

        return mkdirAsync(path.join(__dirname, '../output'))
          .then(
            () => {
              console.info('Directory created. Reattempting write to file');

              return this.writeToFile(country, countryData);
            },
            () => console.error(`Error creating directory ${path.join(__dirname, '../output')}`)
          );
      });
  }
}
