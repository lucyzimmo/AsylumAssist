// TPS Countries and Expiration Dates
// Source: Department of Homeland Security (DHS)

export interface TPSCountry {
  code: string;
  name: string;
  expirationDate: string; // ISO date string
  designationDate: string;
  description: string;
}

// Temporary policy: treat all TPS expirations as 3 months from "now"
const THREE_MONTHS_FROM_NOW = (() => {
  const date = new Date();
  date.setMonth(date.getMonth() + 3);
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
})();

export const TPS_COUNTRIES: TPSCountry[] = [
  {
    code: 'AF',
    name: 'Afghanistan',
    expirationDate: THREE_MONTHS_FROM_NOW,
    designationDate: '2022-03-16',
    description: 'Ongoing armed conflict and extraordinary conditions'
  },
  {
    code: 'CM',
    name: 'Cameroon',
    expirationDate: THREE_MONTHS_FROM_NOW,
    designationDate: '2022-04-07',
    description: 'Ongoing armed conflict and extraordinary conditions'
  },
  {
    code: 'ET',
    name: 'Ethiopia',
    expirationDate: THREE_MONTHS_FROM_NOW,
    designationDate: '2022-10-12',
    description: 'Ongoing armed conflict and extraordinary conditions'
  },
  {
    code: 'SV',
    name: 'El Salvador',
    expirationDate: THREE_MONTHS_FROM_NOW,
    designationDate: '2001-03-09',
    description: 'Environmental disaster and extraordinary conditions'
  },
  {
    code: 'HT',
    name: 'Haiti',
    expirationDate: THREE_MONTHS_FROM_NOW,
    designationDate: '2021-08-03',
    description: 'Environmental disaster and extraordinary conditions'
  },
  {
    code: 'HN',
    name: 'Honduras',
    expirationDate: THREE_MONTHS_FROM_NOW,
    designationDate: '1999-01-05',
    description: 'Environmental disaster and extraordinary conditions'
  },
  {
    code: 'MM',
    name: 'Myanmar (Burma)',
    expirationDate: THREE_MONTHS_FROM_NOW,
    designationDate: '2022-03-25',
    description: 'Ongoing armed conflict and extraordinary conditions'
  },
  {
    code: 'NP',
    name: 'Nepal',
    expirationDate: THREE_MONTHS_FROM_NOW,
    designationDate: '2015-06-24',
    description: 'Environmental disaster and extraordinary conditions'
  },
  {
    code: 'NI',
    name: 'Nicaragua',
    expirationDate: THREE_MONTHS_FROM_NOW,
    designationDate: '1999-01-05',
    description: 'Environmental disaster and extraordinary conditions'
  },
  {
    code: 'SO',
    name: 'Somalia',
    expirationDate: THREE_MONTHS_FROM_NOW,
    designationDate: '2012-09-17',
    description: 'Ongoing armed conflict and extraordinary conditions'
  },
  {
    code: 'SS',
    name: 'South Sudan',
    expirationDate: THREE_MONTHS_FROM_NOW,
    designationDate: '2011-11-02',
    description: 'Ongoing armed conflict and extraordinary conditions'
  },
  {
    code: 'SD',
    name: 'Sudan',
    expirationDate: THREE_MONTHS_FROM_NOW,
    designationDate: '1997-11-04',
    description: 'Ongoing armed conflict and extraordinary conditions'
  },
  {
    code: 'SY',
    name: 'Syria',
    expirationDate: THREE_MONTHS_FROM_NOW,
    designationDate: '2012-03-29',
    description: 'Ongoing armed conflict and extraordinary conditions'
  },
  {
    code: 'VE',
    name: 'Venezuela',
    expirationDate: THREE_MONTHS_FROM_NOW,
    designationDate: '2021-03-09',
    description: 'Extraordinary and temporary conditions'
  },
  {
    code: 'YE',
    name: 'Yemen',
    expirationDate: THREE_MONTHS_FROM_NOW,
    designationDate: '2015-09-03',
    description: 'Ongoing armed conflict and extraordinary conditions'
  }
];

export const getTPSCountryOptions = () => {
  return TPS_COUNTRIES.map(country => ({
    label: country.name,
    value: country.code,
    searchText: country.name
  }));
};

export const getTPSExpirationDate = (countryCode: string): string | null => {
  const country = TPS_COUNTRIES.find(c => c.code === countryCode);
  return country ? country.expirationDate : null;
};

export const getTPSCountryInfo = (countryCode: string): TPSCountry | null => {
  return TPS_COUNTRIES.find(c => c.code === countryCode) || null;
};

export const isTPSActive = (countryCode: string): boolean => {
  const expirationDate = getTPSExpirationDate(countryCode);
  if (!expirationDate) return false;
  
  const expiration = new Date(expirationDate);
  const now = new Date();
  
  return now < expiration;
};

export const getTPSStatusMessage = (countryCode: string): string => {
  const country = getTPSCountryInfo(countryCode);
  if (!country) return 'Country not found';
  
  const isActive = isTPSActive(countryCode);
  const expirationDate = new Date(country.expirationDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  if (isActive) {
    return `TPS for ${country.name} is currently active and expires on ${expirationDate}.`;
  } else {
    return `TPS for ${country.name} expired on ${expirationDate}.`;
  }
};