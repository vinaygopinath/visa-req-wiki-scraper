const scrapeCountryData = require('./tasks/scrape-country-data');
const fs = require('fs');
const Promise = require('bluebird');

const countries = JSON.parse(fs.readFileSync('./input/countries.json', 'utf8'));

if (!countries || !countries.length) {
  console.error('Could not load list of countries. Check if countries.json exists');
  return;
}
console.log('countries loaded, proceeding with scraping');
Promise.mapSeries(countries, function(country) {
  return scrapeCountryData(country)
  .then(function(data) {
    return Promise.delay(5000, data);
  });
})
.then(function(allCountiesData) {
  allCountiesData = allCountiesData || [];
  allCountiesData.forEach(function(countryData) {
    console.log('countryData = ',countryData);
  });
  //TODO Write data to corresponding country file
});
