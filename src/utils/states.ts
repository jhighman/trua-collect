import Fuse from 'fuse.js';

export interface State {
  name: string;
  code: string;
  country: string;
}

// US States
export const usStates: State[] = [
  { name: 'Alabama', code: 'AL', country: 'US' },
  { name: 'Alaska', code: 'AK', country: 'US' },
  { name: 'Arizona', code: 'AZ', country: 'US' },
  { name: 'Arkansas', code: 'AR', country: 'US' },
  { name: 'California', code: 'CA', country: 'US' },
  { name: 'Colorado', code: 'CO', country: 'US' },
  { name: 'Connecticut', code: 'CT', country: 'US' },
  { name: 'Delaware', code: 'DE', country: 'US' },
  { name: 'Florida', code: 'FL', country: 'US' },
  { name: 'Georgia', code: 'GA', country: 'US' },
  { name: 'Hawaii', code: 'HI', country: 'US' },
  { name: 'Idaho', code: 'ID', country: 'US' },
  { name: 'Illinois', code: 'IL', country: 'US' },
  { name: 'Indiana', code: 'IN', country: 'US' },
  { name: 'Iowa', code: 'IA', country: 'US' },
  { name: 'Kansas', code: 'KS', country: 'US' },
  { name: 'Kentucky', code: 'KY', country: 'US' },
  { name: 'Louisiana', code: 'LA', country: 'US' },
  { name: 'Maine', code: 'ME', country: 'US' },
  { name: 'Maryland', code: 'MD', country: 'US' },
  { name: 'Massachusetts', code: 'MA', country: 'US' },
  { name: 'Michigan', code: 'MI', country: 'US' },
  { name: 'Minnesota', code: 'MN', country: 'US' },
  { name: 'Mississippi', code: 'MS', country: 'US' },
  { name: 'Missouri', code: 'MO', country: 'US' },
  { name: 'Montana', code: 'MT', country: 'US' },
  { name: 'Nebraska', code: 'NE', country: 'US' },
  { name: 'Nevada', code: 'NV', country: 'US' },
  { name: 'New Hampshire', code: 'NH', country: 'US' },
  { name: 'New Jersey', code: 'NJ', country: 'US' },
  { name: 'New Mexico', code: 'NM', country: 'US' },
  { name: 'New York', code: 'NY', country: 'US' },
  { name: 'North Carolina', code: 'NC', country: 'US' },
  { name: 'North Dakota', code: 'ND', country: 'US' },
  { name: 'Ohio', code: 'OH', country: 'US' },
  { name: 'Oklahoma', code: 'OK', country: 'US' },
  { name: 'Oregon', code: 'OR', country: 'US' },
  { name: 'Pennsylvania', code: 'PA', country: 'US' },
  { name: 'Rhode Island', code: 'RI', country: 'US' },
  { name: 'South Carolina', code: 'SC', country: 'US' },
  { name: 'South Dakota', code: 'SD', country: 'US' },
  { name: 'Tennessee', code: 'TN', country: 'US' },
  { name: 'Texas', code: 'TX', country: 'US' },
  { name: 'Utah', code: 'UT', country: 'US' },
  { name: 'Vermont', code: 'VT', country: 'US' },
  { name: 'Virginia', code: 'VA', country: 'US' },
  { name: 'Washington', code: 'WA', country: 'US' },
  { name: 'West Virginia', code: 'WV', country: 'US' },
  { name: 'Wisconsin', code: 'WI', country: 'US' },
  { name: 'Wyoming', code: 'WY', country: 'US' }
];

// Canadian Provinces
export const canadianProvinces: State[] = [
  { name: 'Alberta', code: 'AB', country: 'CA' },
  { name: 'British Columbia', code: 'BC', country: 'CA' },
  { name: 'Manitoba', code: 'MB', country: 'CA' },
  { name: 'New Brunswick', code: 'NB', country: 'CA' },
  { name: 'Newfoundland and Labrador', code: 'NL', country: 'CA' },
  { name: 'Nova Scotia', code: 'NS', country: 'CA' },
  { name: 'Ontario', code: 'ON', country: 'CA' },
  { name: 'Prince Edward Island', code: 'PE', country: 'CA' },
  { name: 'Quebec', code: 'QC', country: 'CA' },
  { name: 'Saskatchewan', code: 'SK', country: 'CA' }
];

// Combine all states/provinces
export const allStates: State[] = [...usStates, ...canadianProvinces];

// Initialize Fuse.js for fuzzy matching
const fuse = new Fuse(allStates, {
  keys: ['name', 'code'],
  threshold: 0.3,
  minMatchCharLength: 2
});

export const getStatesByCountry = (countryCode: string): State[] => {
  return allStates.filter(state => state.country === countryCode);
};

export const getStateByCode = (code: string, country: string): State | undefined => {
  return allStates.find(state => state.code === code && state.country === country);
};

export const searchStates = (query: string, countryCode: string): State[] => {
  const results = fuse.search(query);
  return results
    .map(result => result.item)
    .filter(state => state.country === countryCode);
}; 