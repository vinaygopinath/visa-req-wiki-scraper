const BluebirdPromise = require('bluebird'); // tslint:disable-line
const process = require('process');
const readFile: (filename: string, encoding: string) => Promise<string> = BluebirdPromise.promisify(require('fs').readFile);
import { CountryInput } from './models/country-input';
import { CountryOutput } from './models/country-output';
import { FileUtil } from './utils/file';
import { VisaRequirement, WikiUtil } from './utils/wiki';

/**
 * The number of Electron/Nightmare instances that should
 * run simultaneously. This is equivalent to the number of Wiki pages
 * that are simultaneously scraped.
 */
const CONCURRENT_SCRAPE_INSTANCES = 5;

(async () => {
  let countries: CountryInput[] | null = null;
  try {
    const countriesStr = await readFile('./input/countries.json', 'utf8');
    countries = JSON.parse(countriesStr);
  } catch (ex) {
    console.error('Could not load list of countries. Check if countries.json exists and ensure that it is valid JSON');
  }

  if (!countries) {
    process.exit(1);
  }

  const unknownCountriesMap: { parentCountry: string, unknownCountries: CountryOutput[] }[] = [];

  BluebirdPromise.map(countries as CountryInput[], async (country: CountryInput) => {
    const countryData = await WikiUtil.scrapeCountryData(country.demonym);

    console.info(`\n\n****\nVisa requirements for ${country.demonym} citizens`);
    const wikiUrl = `http://en.wikipedia.org/wiki/Visa_requirements_for_${WikiUtil.capitalize(country.demonym)}_citizens`;
    console.info(`Wiki URL = ${wikiUrl}`);

    console.info(`\n${country.name} stats:\n`);
    let total = 0;

    for (const visaReq in VisaRequirement) { // tslint:disable-line
      const countryOutput: CountryOutput[] = countryData[WikiUtil.camelCaseVisaRequirement(VisaRequirement[visaReq])];
      console.info(`${visaReq}: ${countryOutput.length}`);
      total += countryOutput.length;

      if (VisaRequirement[visaReq] === VisaRequirement.UNKNOWN && countryOutput.length) {
        unknownCountriesMap.push({ parentCountry: country.name, unknownCountries: countryOutput });
      }
    }

    console.info(`TOTAL: ${total}`);
    countryData[WikiUtil.camelCaseVisaRequirement(VisaRequirement.NOT_REQUIRED)].push(new CountryOutput(country.name, null, 'home'));

    return FileUtil.writeToFile(country.name, countryData);
  }, { concurrency: CONCURRENT_SCRAPE_INSTANCES })
    .then(
      () => {
        if (unknownCountriesMap.length) {
          console.info(`\nOne or more Wiki pages has an unrecognised visa status. This could be due to
* A typo in the Wiki page
* A new visa status term not expected by the Wiki parser (Refer: https://github.com/vinaygopinath/visa-req-wiki-scraper/blob/master/utils/wiki.ts#L15
* A newly introduced visa status`);
          unknownCountriesMap.forEach((it) => {
            console.error(`\n${it.parentCountry} wiki page`);
            it.unknownCountries.forEach((itt) => {
              console.error(`Name: ${itt.name}\tVisa: ${itt.visa || 'N/A'}\tNote: ${itt.note || 'N/A'}`);
            });
          });
          console.error('\nWiki scraper failed');
          process.exit(1);
        } else {
          console.info('\nAll Wiki pages processed successfully');
        }
      }
    );

})();
