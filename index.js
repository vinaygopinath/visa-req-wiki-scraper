const scrapeCountryData = require('./tasks/scrape-country-data');
const writeToFile = require('./tasks/write-to-file');
const Promise = require('bluebird');
const readFile = Promise.promisify(require('fs').readFile);
const VISA_REQUIREMENT = require('./utils/wiki').VISA_REQUIREMENT;

readFile('./input/countries.json', 'utf8')
  .then(function(countriesStr) {
    return Promise.resolve(JSON.parse(countriesStr));
  }, function(err) {
    console.error('Could not load list of countries. Check if countries.json exists');
    console.dir(err);
  })
  .then(function(countries) {
    // console.log('Number of countries = ' + countries.length);
    return Promise.mapSeries(countries, function(country) {
      // console.log('Processing ' + country.name);
      return scrapeCountryData(country.demonym)
        .then(function(scrapeResponse) {
          console.log('\n%s stats:\n****', country.name);
          let total = 0;
          for (let visaReq in VISA_REQUIREMENT) {
            console.log('%s: %d', VISA_REQUIREMENT[visaReq], scrapeResponse[VISA_REQUIREMENT[visaReq]].length);
            total += scrapeResponse[VISA_REQUIREMENT[visaReq]].length;
            if (VISA_REQUIREMENT[visaReq] === VISA_REQUIREMENT.UNKNOWN) {
              scrapeResponse[VISA_REQUIREMENT[visaReq]].forEach(country => {
                console.log('Unknown: %s -> %s', country.name, country.visa);
              });
            }
          }
          console.log('Total: %d\n****', total);
          return writeToFile(country.name, scrapeResponse);
        })
        .then(function() {
          //Add a mandatory delay of 5s between page loads
          return Promise.delay(5000);
        })
        .catch(function(err) {
          console.log('Error in promise chain: ', err);
        });
    });
  }, function(err) {
    console.error('Error parsing string from countries.json. Please check the file contents');
    console.dir(err);
  })
  .then(function() {
    console.log('Processed all Wikipedia pages');
  });
