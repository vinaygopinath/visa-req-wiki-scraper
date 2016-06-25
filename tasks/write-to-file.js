const Promise = require('bluebird');
const writeFile = Promise.promisify(require('fs').writeFile);
const mkdir = Promise.promisify(require('fs').mkdir);

const writeCountryFile = function(country, data) {
  return writeFile('./output/' + country.toLowerCase() + '.json', JSON.stringify(data, null, 2));
};

module.exports = function(country, scrapeResponse) {
  return writeCountryFile(country, scrapeResponse)
    .catch(function(err) {
      console.log('Error writing file = ' + err);
      console.log('Creating output directory');
      return mkdir('./output')
        .then(function() {
          console.log('Directory created, retrying file write');
          return writeCountryFile(country, scrapeResponse);
        }, function(err) {
          console.log('Directory creation failed with err = ', err);
        });
    })
    .then(function() {
      // console.log('File written to output folder');
    });
};
