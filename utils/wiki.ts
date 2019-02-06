const nightmare = require('nightmare');
import { CountryData } from '../models/country-data';
import { CountryOutput } from '../models/country-output';

export enum VisaRequirement {
  REQUIRED = 'required',
  NOT_REQUIRED = 'not-required',
  EVISA = 'evisa',
  ON_ARRIVAL = 'on-arrival',
  REFUSED = 'refused',
  UNKNOWN = 'unknown'
}

export class WikiUtil {

  private static VISA_NOT_REQUIRED = ['visa not required', 'freedom of movement', 'notrequired', 'freedom of movement', 'reciprocity fee', 'visa is not required', 'visa waiver program'];
  private static EVISA = ['evisa', 'etourist visa', 'electronic travel', 'evisitor', 'online visitor', 'electronic entry visa', 'electronic visa',
    'electronic visa waiver', 'electronic visitor e600 visa', 'electronic authorization', 'e600visa'];
  private static VISA_ON_ARRIVAL = ['visa on arrival', 'visitor\'s permit on arrival', 'permit on arrival', 'tourist card on arrival', 'visa is granted on arrival',
  'visitor\'s permit is granted on arrival'];
  private static VISA_REFUSED = ['visa refused', 'admission refused', 'invalid passport', 'travel banned', 'travel restricted'];
  private static VISA_REQUIRED = ['visa required', 'tourist card required', 'visa de facto required', 'with home return permit only', 'admission partially refused / partially allowed',
    'entry clearance required', 'special authorization required', 'visa is required', 'special provisions', 'visa for italy required', 'disputed', 'travel certificate required',
    'particular visit regime'];

  // Uncommon terms to be checked when all other matches fail
  // Checking these terms after others reduces the likelihood of false positives
  private static RARE_EVISA = ['eta'];

  static camelCaseVisaRequirement(visaRequirement: VisaRequirement | string): 'required' | 'notRequired' | 'evisa' | 'onArrival' | 'refused' | 'unknown' {
    switch (visaRequirement) {
      case VisaRequirement.NOT_REQUIRED:
        return 'notRequired';

      case VisaRequirement.ON_ARRIVAL:
        return 'onArrival';

      case VisaRequirement.EVISA:
      case VisaRequirement.REFUSED:
      case VisaRequirement.UNKNOWN:
      case VisaRequirement.REQUIRED:
        return visaRequirement;

      default:
        throw new Error(`Unexpected visa requirement type "${visaRequirement}"`);
    }
  }

  static capitalize(country: string): string {
    return `${country[0].toUpperCase()}${country.slice(1)}`;
  }

  static removeBrackets(input: string): string {
    return input.replace(/\[.*?\]/g, '');
  }

  static getVisaRequirement(rawWikiText: string | null | undefined): VisaRequirement {
    if (!rawWikiText || !rawWikiText.trim()) {
      throw new Error('Visa requirement text is missing');
    }
    // Remove square brackets, trim whitespace and convert to lowercase
    const reqText = this.removeBrackets(rawWikiText).trim().toLowerCase().replace(/-/g, '');

    if (WikiUtil.VISA_REFUSED.some((visaRefusedStr: string) => reqText.includes(visaRefusedStr))) {
      return VisaRequirement.REFUSED;
    }

    if (WikiUtil.VISA_NOT_REQUIRED.some((visaNotReqStr: string) => reqText.includes(visaNotReqStr))) {
      return VisaRequirement.NOT_REQUIRED;
    }

    if (WikiUtil.VISA_ON_ARRIVAL.some((visaOnArrStr: string) => reqText.includes(visaOnArrStr))) {
      return VisaRequirement.ON_ARRIVAL;
    }

    if (WikiUtil.EVISA.some((evisaStr: string) => reqText.includes(evisaStr))) {
      return VisaRequirement.EVISA;
    }

    if (WikiUtil.VISA_REQUIRED.some((visaReqStr: string) => reqText.includes(visaReqStr))) {
      return VisaRequirement.REQUIRED;
    }

    if (WikiUtil.RARE_EVISA.some((evisaStr: string) => reqText.includes(evisaStr))) {
      return VisaRequirement.EVISA;
    }

    return VisaRequirement.UNKNOWN;
  }

  static scrapeCountryData(country: string): Promise<CountryData> {
    if (!country) {
      return Promise.reject(new TypeError('Undefined country'));
    }

    return new Promise((resolve, reject) => {
      const wikiUrl = `http://en.wikipedia.org/wiki/Visa_requirements_for_${WikiUtil.capitalize(country)}_citizens`;

      nightmare({
        Promise: require('bluebird')
      })
        .goto(wikiUrl)
        .wait('table.sortable.wikitable tbody tr')
        .on('console', (type: string, args: any) => {
          if (type === 'log') {
            console.log(args); // tslint:disable-line
          } else if (type === 'error') {
            console.error(args);
          }
        })
        .evaluate(() => {
          const wikiTable = document.querySelector('table.sortable.wikitable');
          if (!wikiTable) {
            throw new Error(`Could not find a visa requirements table in the Wiki page for ${country}\nURL = ${wikiUrl}`);
          }
          const trArr = wikiTable.querySelectorAll('tbody tr');
          const countries = [];
          for (const tr of trArr) {
            const tdArr = tr.getElementsByTagName('td');
            if (!tdArr) {
              console.error(new Error('Invalid table structure - Table row does not have <td> elements'));
              continue;
            }
            if (tdArr.length < 2) {
              console.error(new Error('Invalid table structure - Table row has less than two <td> elements'));
              continue;
            }
            const countryTitle = tdArr[0].getElementsByTagName('a')[0].title;
            const visaRequirement = tdArr[1].textContent;
            let note: string | null = null;
            if (tdArr.length > 2) {
              note = tdArr[2].textContent;
            }
            const countryJSON: { name: string, visa: string | null, note: string | null } = {
              name: countryTitle,
              visa: visaRequirement as string,
              note
            };
            countries.push(countryJSON);
          }

          return countries;
        })
        .end()
        .then((countries: CountryOutput[]) => {
          if (!countries || !countries.length) {
            reject(new Error('Unable to fetch Wikipedia table rows for ' + country));

            return;
          }

          const countryData: CountryData = new CountryData([], [], [], [], [], []);

          for (const rawCountry of countries) {
            const countryOutput: CountryOutput = new CountryOutput(rawCountry.name);
            if (rawCountry.note) {
              countryOutput.note = WikiUtil.removeBrackets(rawCountry.note);
            }
            try {
              const visaRequirement = WikiUtil.getVisaRequirement(rawCountry.visa);
              if (visaRequirement === VisaRequirement.UNKNOWN) {
                countryOutput.visa = rawCountry.visa;
              }
              countryData[WikiUtil.camelCaseVisaRequirement(visaRequirement)].push(countryOutput);
            } catch (err) {
              console.warn(`Invalid visa requirement for ${rawCountry.name}: "${rawCountry.visa}"`);
            }
            resolve(countryData);
          }
        }, (err: Error) => {
          console.error('Unknown error');
          console.dir(err);
          reject(err);
        });
    });
  }
}
