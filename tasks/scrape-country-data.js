const Promise = require('bluebird');
const Nightmare = require('nightmare');
const WikiUtils = require('../utils/wiki');
const VISA_REQUIREMENT = WikiUtils.VISA_REQUIREMENT;

module.exports = function(country) {
  if (!country) {
    return Promise.reject(new TypeError('Undefined country'));
  }
  console.log('\n\n*****\nScraping Wiki page - Visa requirements for ' + country + ' citizens');
  return new Promise(function(resolve, reject) {
    const wikiUrl = 'http://en.wikipedia.org/wiki/Visa_requirements_for_' + WikiUtils.capitalize(country) + '_citizens';
    // return Promise.resolve(
    Promise.resolve(
      new Nightmare().goto(wikiUrl)
        .wait('table.sortable.wikitable:first-of-type tbody tr')
        .on('console', function(type, args) {
          if (type === 'log') {
            console.log(args);
          } else if (type === 'error') {
            console.error(args);
          }
        })
        // .screenshot('./image.png')
        .evaluate(function() {
          var trArr = document.querySelectorAll('table.sortable.wikitable:first-of-type tbody tr'); //eslint-disable-line no-undef
          var countries = [];
          for (var i = 0; i < trArr.length; i++) {
            var tr = trArr[i];
            var tdArr = tr.getElementsByTagName('td');
            if (!tdArr) {
              console.log('Invalid table structure - no TD elements');
              console.error(new Error('Invalid table structure - Table row does not have <td> elements'));
              continue;
            }
            if (tdArr.length < 2) {
              console.error(new Error('Invalid table structure - Table row has less than two <td> elements'));
              continue;
            }
            let countryTitle = tdArr[0].getElementsByTagName('a')[0].title;
            let visaRequirement = tdArr[1].textContent;
            let note;
            if (tdArr.length > 2) {
              note = tdArr[2].textContent;
            }
            var countryJSON = {
              name: countryTitle,
              visa: visaRequirement,
              note: note
            };
            countries.push(countryJSON);
          }
          return countries;
        })
        .end())
      .then(function(countries) {
        console.log('Received scraping response with %d countries', countries.length);
        if (!countries || !countries.length) {
          return reject(new Error('Unable to fetch Wikipedia table rows for ' + country));
        }

        const res = {};
        for (let visaReq in VISA_REQUIREMENT) {
          res[VISA_REQUIREMENT[visaReq]] = [];
        }

        for (let rawCountry of countries) {
          const countryJSON = {
            name: rawCountry.name
          };
          if (rawCountry.note) {
            countryJSON.note = WikiUtils.removeBrackets(rawCountry.note);
          }
          let visaRequirement = WikiUtils.getVisaRequirement(rawCountry.visa);
          if (visaRequirement === VISA_REQUIREMENT.UNKNOWN) {
            countryJSON.visa = rawCountry.visa;
          }
          res[visaRequirement].push(countryJSON);
          resolve(res);
        }
      }, function(err) {
        console.log('Something went wrong = ', err);
        reject(err);
      });
  });
};
