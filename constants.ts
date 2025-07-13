
export const CURRENCY_DATA = {
  'INR': { rates: [3, 3.5, 4, 4.5, 5], defaultRate: 4, symbol: '₹' },
  'USD': { rates: [0.10, 0.12, 0.15], defaultRate: 0.10, symbol: '$' },
  'EUR': { rates: [0.09, 0.11, 0.14], defaultRate: 0.09, symbol: '€' },
  'GBP': { rates: [0.08, 0.10, 0.12], defaultRate: 0.08, symbol: '£' },
};

export type Currency = keyof typeof CURRENCY_DATA;

export const TABLE_NUMBERS = ['1', '2', '3', '4', '5', '6'];