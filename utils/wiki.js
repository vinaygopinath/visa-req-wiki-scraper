const VISA_REQUIREMENT = {
  REQUIRED: 'required',
  NOT_REQUIRED: 'not-required',
  ON_ARRIVAL: 'on-arrival',
  UNKNOWN: 'unknown'
};

const removeBrackets = function(input) {
  return input.replace(/\[.*?\]/g, '');
};

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
    let reqText = removeBrackets(rawWikiText).trim().toLowerCase();
    switch (reqText) {
      case 'visa required': //eslint-disable-line indent
        return VISA_REQUIREMENT.REQUIRED; //eslint-disable-line indent
      case 'visa not required': //eslint-disable-line indent
        return VISA_REQUIREMENT.NOT_REQUIRED; //eslint-disable-line indent
      case 'visa on arrival': //eslint-disable-line indent
        return VISA_REQUIREMENT.ON_ARRIVAL; //eslint-disable-line indent
      //TODO Add additional cases/visa requirement types
      default: //eslint-disable-line indent
        return VISA_REQUIREMENT.UNKNOWN; //eslint-disable-line indent
    }
  }
};
