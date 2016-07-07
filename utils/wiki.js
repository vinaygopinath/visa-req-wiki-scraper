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

const VISA_NOT_REQUIRED = ['visa not required', 'freedom of movement', 'notrequired', 'freedom of movement', 'reciprocity fee', 'visa is not required'];
const EVISA = ['evisa', 'etourist visa', 'electronic travel', 'evisitor', 'online visitor', 'electronic entry visa', 'electronic visa', 'electronic visa waiver', 'electronic visitor e600 visa', 'electronic authorization', 'e600Visa'];
const VISA_ON_ARRIVAL = ['visa on arrival', 'visitor\'s permit on arrival', 'permit on arrival', 'tourist card on arrival', 'visa is granted on arrival'];
const VISA_REFUSED = ['visa refused', 'admission refused', 'invalid passport', 'travel banned'];
const VISA_REQUIRED = ['visa required', 'tourist card required', 'visa de facto required', 'with home return permit only', 'admission partially refused / partially allowed', 'entry clearance required', 'special authorization required', 'visa is required', 'special provisions', 'visa for italy required'];

//Uncommon terms to be checked when all other matches fail
//Checking these terms after others reduces the likelihood of false positives
const RARE_EVISA = ['eta'];

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
    if (RARE_EVISA.some(evisaStr => reqText.includes(evisaStr))) {
      return VISA_REQUIREMENT.EVISA;
    }
    return VISA_REQUIREMENT.UNKNOWN;
  }
};
