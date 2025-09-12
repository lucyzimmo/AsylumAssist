// US Immigration Courts List
// Source: Executive Office for Immigration Review (EOIR)

export interface ImmigrationCourt {
  code: string;
  name: string;
  city: string;
  state: string;
  address: string;
  phone?: string;
}

export const US_IMMIGRATION_COURTS: ImmigrationCourt[] = [
  // Alabama
  {
    code: 'ATL-AL',
    name: 'Atlanta Immigration Court - Alabama',
    city: 'Birmingham',
    state: 'AL',
    address: '1800 5th Ave N, Birmingham, AL 35203'
  },
  
  // Arizona
  {
    code: 'PHX',
    name: 'Phoenix Immigration Court',
    city: 'Phoenix',
    state: 'AZ',
    address: '2035 N Central Ave, Phoenix, AZ 85004'
  },
  {
    code: 'TUC',
    name: 'Tucson Immigration Court',
    city: 'Tucson',
    state: 'AZ',
    address: '6431 S Country Club Rd, Tucson, AZ 85706'
  },
  
  // California
  {
    code: 'LAX',
    name: 'Los Angeles Immigration Court',
    city: 'Los Angeles',
    state: 'CA',
    address: '606 S Olive St, Los Angeles, CA 90014'
  },
  {
    code: 'SF',
    name: 'San Francisco Immigration Court',
    city: 'San Francisco',
    state: 'CA',
    address: '630 Sansome St, San Francisco, CA 94111'
  },
  {
    code: 'SD',
    name: 'San Diego Immigration Court',
    city: 'San Diego',
    state: 'CA',
    address: '880 Front St, San Diego, CA 92101'
  },
  {
    code: 'SAC',
    name: 'Sacramento Immigration Court',
    city: 'Sacramento',
    state: 'CA',
    address: '650 Capitol Mall, Sacramento, CA 95814'
  },
  {
    code: 'SJO',
    name: 'San Jose Immigration Court',
    city: 'San Jose',
    state: 'CA',
    address: '280 S 1st St, San Jose, CA 95113'
  },
  {
    code: 'FRE',
    name: 'Fresno Immigration Court',
    city: 'Fresno',
    state: 'CA',
    address: '1130 O St, Fresno, CA 93721'
  },
  
  // Colorado
  {
    code: 'DEN',
    name: 'Denver Immigration Court',
    city: 'Denver',
    state: 'CO',
    address: '12851 W Alameda Pkwy, Lakewood, CO 80228'
  },
  
  // Connecticut
  {
    code: 'HAR',
    name: 'Hartford Immigration Court',
    city: 'Hartford',
    state: 'CT',
    address: '450 Main St, Hartford, CT 06103'
  },
  
  // Florida
  {
    code: 'MIA',
    name: 'Miami Immigration Court',
    city: 'Miami',
    state: 'FL',
    address: '3180 SW 38th Ave, Miami, FL 33146'
  },
  {
    code: 'ORL',
    name: 'Orlando Immigration Court',
    city: 'Orlando',
    state: 'FL',
    address: '1 N First St, Orlando, FL 32801'
  },
  {
    code: 'TAM',
    name: 'Tampa Immigration Court',
    city: 'Tampa',
    state: 'FL',
    address: '5880 E Fowler Ave, Tampa, FL 33617'
  },
  {
    code: 'JAX',
    name: 'Jacksonville Immigration Court',
    city: 'Jacksonville',
    state: 'FL',
    address: '1703 N Parramore Ave, Orlando, FL 32804'
  },
  
  // Georgia
  {
    code: 'ATL',
    name: 'Atlanta Immigration Court',
    city: 'Atlanta',
    state: 'GA',
    address: '2 Martin Luther King Jr Dr SE, Atlanta, GA 30334'
  },
  
  // Hawaii
  {
    code: 'HNL',
    name: 'Honolulu Immigration Court',
    city: 'Honolulu',
    state: 'HI',
    address: '595 Ala Moana Blvd, Honolulu, HI 96813'
  },
  
  // Illinois
  {
    code: 'CHI',
    name: 'Chicago Immigration Court',
    city: 'Chicago',
    state: 'IL',
    address: '525 W Van Buren St, Chicago, IL 60607'
  },
  
  // Louisiana
  {
    code: 'NO',
    name: 'New Orleans Immigration Court',
    city: 'New Orleans',
    state: 'LA',
    address: '1250 Poydras St, New Orleans, LA 70113'
  },
  
  // Maryland
  {
    code: 'BAL',
    name: 'Baltimore Immigration Court',
    city: 'Baltimore',
    state: 'MD',
    address: '31 Hopkins Plz, Baltimore, MD 21201'
  },
  
  // Massachusetts
  {
    code: 'BOS',
    name: 'Boston Immigration Court',
    city: 'Boston',
    state: 'MA',
    address: '1 Federal St, Boston, MA 02110'
  },
  
  // Michigan
  {
    code: 'DET',
    name: 'Detroit Immigration Court',
    city: 'Detroit',
    state: 'MI',
    address: '333 Mt Elliott St, Detroit, MI 48207'
  },
  
  // Minnesota
  {
    code: 'MSP',
    name: 'Minneapolis Immigration Court',
    city: 'Bloomington',
    state: 'MN',
    address: '2901 Metro Dr, Bloomington, MN 55425'
  },
  
  // Nevada
  {
    code: 'LV',
    name: 'Las Vegas Immigration Court',
    city: 'Las Vegas',
    state: 'NV',
    address: '3850 Meadows Ln, Las Vegas, NV 89107'
  },
  
  // New Jersey
  {
    code: 'NEW',
    name: 'Newark Immigration Court',
    city: 'Newark',
    state: 'NJ',
    address: '970 Broad St, Newark, NJ 07102'
  },
  
  // New York
  {
    code: 'NYC',
    name: 'New York City Immigration Court',
    city: 'New York',
    state: 'NY',
    address: '26 Federal Plz, New York, NY 10278'
  },
  {
    code: 'BUF',
    name: 'Buffalo Immigration Court',
    city: 'Buffalo',
    state: 'NY',
    address: '130 Delaware Ave, Buffalo, NY 14202'
  },
  {
    code: 'BAT',
    name: 'Batavia Immigration Court',
    city: 'Batavia',
    state: 'NY',
    address: '4250 Federal Dr, Batavia, NY 14020'
  },
  
  // North Carolina
  {
    code: 'CHA',
    name: 'Charlotte Immigration Court',
    city: 'Charlotte',
    state: 'NC',
    address: '210 E Woodlawn Rd, Charlotte, NC 28217'
  },
  
  // Ohio
  {
    code: 'CLE',
    name: 'Cleveland Immigration Court',
    city: 'Cleveland',
    state: 'OH',
    address: '1375 Euclid Ave, Cleveland, OH 44115'
  },
  
  // Oregon
  {
    code: 'POR',
    name: 'Portland Immigration Court',
    city: 'Portland',
    state: 'OR',
    address: '511 NW Broadway, Portland, OR 97209'
  },
  
  // Pennsylvania
  {
    code: 'PHI',
    name: 'Philadelphia Immigration Court',
    city: 'Philadelphia',
    state: 'PA',
    address: '1600 Callowhill St, Philadelphia, PA 19130'
  },
  {
    code: 'YOR',
    name: 'York Immigration Court',
    city: 'York',
    state: 'PA',
    address: '1390 Columbia Ave, Lancaster, PA 17603'
  },
  
  // Tennessee
  {
    code: 'MEM',
    name: 'Memphis Immigration Court',
    city: 'Memphis',
    state: 'TN',
    address: '1341 Sycamore View Rd, Memphis, TN 38134'
  },
  
  // Texas
  {
    code: 'HOU',
    name: 'Houston Immigration Court',
    city: 'Houston',
    state: 'TX',
    address: '126 Northpoint Dr, Houston, TX 77060'
  },
  {
    code: 'DAL',
    name: 'Dallas Immigration Court',
    city: 'Dallas',
    state: 'TX',
    address: '8101 N Stemmons Fwy, Dallas, TX 75247'
  },
  {
    code: 'SA',
    name: 'San Antonio Immigration Court',
    city: 'San Antonio',
    state: 'TX',
    address: '1545 Hawkins Blvd, El Paso, TX 79925'
  },
  {
    code: 'EP',
    name: 'El Paso Immigration Court',
    city: 'El Paso',
    state: 'TX',
    address: '1545 Hawkins Blvd, El Paso, TX 79925'
  },
  {
    code: 'HAR-TX',
    name: 'Harlingen Immigration Court',
    city: 'Harlingen',
    state: 'TX',
    address: '1717 Zoy St, Harlingen, TX 78552'
  },
  
  // Utah
  {
    code: 'SLC',
    name: 'Salt Lake City Immigration Court',
    city: 'West Valley City',
    state: 'UT',
    address: '2746 S Decker Lake Blvd, West Valley City, UT 84119'
  },
  
  // Virginia
  {
    code: 'ARL',
    name: 'Arlington Immigration Court',
    city: 'Arlington',
    state: 'VA',
    address: '5107 Leesburg Pike, Falls Church, VA 22041'
  },
  
  // Washington
  {
    code: 'SEA',
    name: 'Seattle Immigration Court',
    city: 'Tukwila',
    state: 'WA',
    address: '12500 Tukwila International Blvd, Tukwila, WA 98168'
  },
  
  // Special Courts
  {
    code: 'CONS',
    name: 'Consular Processing',
    city: 'Various',
    state: 'N/A',
    address: 'US Consulates Worldwide'
  },
  {
    code: 'CBPO',
    name: 'CBP One Processing',
    city: 'Various',
    state: 'Border',
    address: 'Ports of Entry'
  }
];

export const getCourtsByState = (state: string): ImmigrationCourt[] => {
  return US_IMMIGRATION_COURTS.filter(court => court.state === state);
};

export const getCourtByCode = (code: string): ImmigrationCourt | undefined => {
  return US_IMMIGRATION_COURTS.find(court => court.code === code);
};

export const getAllStates = (): string[] => {
  const states = [...new Set(US_IMMIGRATION_COURTS.map(court => court.state))];
  return states.sort();
};

export const getCourtOptions = () => {
  return US_IMMIGRATION_COURTS.map(court => ({
    label: `${court.name} (${court.city}, ${court.state})`,
    value: court.code,
    searchText: `${court.name} ${court.city} ${court.state}`
  }));
};