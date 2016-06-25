const scrapeCountryData = require('./tasks/scrape-country-data');
const writeToFile = require('./tasks/write-to-file');
const Promise = require('bluebird');
const readFile = Promise.promisify(require('fs').readFile);

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
          console.log('\n*****\n' + country.name + ' stats:');
          console.log('Visa not required: %d', scrapeResponse['not-required'].length);
          console.log('Visa required: %d', scrapeResponse['required'].length);
          console.log('Visa on arrival: %d', scrapeResponse['on-arrival'].length);
          console.log('Visa status unknown: %d', scrapeResponse['unknown'].length);
          console.log('Total countries: %d\n*****\n', scrapeResponse['not-required'].length
            + scrapeResponse['required'].length + scrapeResponse['on-arrival'].length
            + scrapeResponse['unknown'].length);
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
