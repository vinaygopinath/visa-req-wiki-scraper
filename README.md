# Visa Requirements Wikipedia Scraper

Scrapes the visa requirements for citizens of all countries and creates arrays of countries for each visa type. This data is used by Nomad Couple - https://nomadcouple.vinaygopinath.me

### Visa types

* `required`: Visa required
* `not-required`: Visa not required for a certain period, or freedom of movement
* `evisa`: Electronic visa/Online visa/ETA
* `on-arrival`: Visa on arrival
* `refused`: Admission refused/Travel banned
* `unknown`: Visa status could not be parsed by this scraper

### Example

Scraping the [Visa requirements for Polish citizens](https://en.wikipedia.org/wiki/Visa_requirements_for_Polish_citizens) Wikipedia page creates `dist/output/poland.json` with the JSON in the following format. (Countries that have a visa note available on Wikipedia may have a "note" property)

```json
  {
    "required": [
      {
        "name": "Afghanistan"
      },
      {
        "name": "Algeria"
      },
      ...
    ],
    "not-required": [
      {
        "name": "Albania",
        "note": "90 days; ID card valid"
      },
      {
        "name": "Andorra",
        "note": "ID card valid"
      },
      ...
    ],
    "evisa": [
      {
        "name": "Australia",
        "note": "90 days on each visit in 12-month period if granted"
      },
      {
        "name": "Ivory Coast",
        "note": "3 months; eVisa holders must arrive via Port Bouet Airport."
      },
      ...
    ],
    "on-arrival": [
      {
        "name": "Bahrain",
        "note": "14 days. Visa is also obtainable online."
      },
      {
        "name": "Bangladesh",
        "note": "30 days"
      },
      ...
    ],
    "refused": [],
    "unknown": []
  }
```

## Build

```shell
npm run scrape
```

## Licence

MIT Licence
