const VISA_REQUIREMENT = {
  REQUIRED: 'required',
  NOT_REQUIRED: 'not-required',
  EVISA: 'evisa',
  ON_ARRIVAL: 'on-arrival',
  REFUSED: 'refused',
  UNKNOWN: 'unknown'
};

const removeBrackets = function(input) {
  return input.replace(/\[.*?\]/g, '');
};

const VISA_NOT_REQUIRED = ['visa not required'];
const EVISA = ['evisa', 'etourist visa', 'electronic travel', 'evisitor', 'online visitor', 'electronic entry visa'];
const VISA_ON_ARRIVAL = ['visa on arrival', 'visitor\'s permit on arrival', 'entry permit on arrival', 'tourist card on arrival'];
const VISA_REQUIRED = ['visa required', 'tourist card required'];
const VISA_REFUSED = ['visa refused', 'admission refused', 'invalid passport'];

module.exports = {
  VISA_REQUIREMENT,
  capitalize: function(country) {
    return country[0].toUpperCase() + country.slice(1);
  },
  removeBrackets,
  getVisaRequirement: function(rawWikiText) {
    if (!rawWikiText || !rawWikiText.trim()) {
      throw new Error('Visa requirement text is missing');
    }
    //Remove square brackets, trim whitespace and convert to lowercase
    let reqText = removeBrackets(rawWikiText).trim().toLowerCase().replace(/-/g, '');

    if (VISA_REFUSED.some(visaRefusedStr => reqText.includes(visaRefusedStr))) {
      return VISA_REQUIREMENT.REFUSED;
    }
    if (VISA_NOT_REQUIRED.some(visaNotReqStr => reqText.includes(visaNotReqStr))) {
      return VISA_REQUIREMENT.NOT_REQUIRED;
    }
    if (VISA_ON_ARRIVAL.some(visaOnArrStr => reqText.includes(visaOnArrStr))) {
      return VISA_REQUIREMENT.ON_ARRIVAL;
    }
    if (EVISA.some(evisaStr => reqText.includes(evisaStr))) {
      return VISA_REQUIREMENT.EVISA;
    }
    if (VISA_REQUIRED.some(visaReqStr => reqText.includes(visaReqStr))) {
      return VISA_REQUIREMENT.REQUIRED;
    }
    return VISA_REQUIREMENT.UNKNOWN;
  }
};
