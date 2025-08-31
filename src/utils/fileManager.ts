import { DonationData, Donation, Expense } from '../types';

const DONATIONS_URL = 'https://sayprob.github.io/website-for-yassin/src/data/donations.json';
const EXPENSES_URL = 'https://sayprob.github.io/website-for-yassin/src/data/expenses.json';

export const saveDonationsToFile = async (donations: DonationData): Promise<void> => {
  try {
    // Note: Direct writing to GitHub Pages URLs requires GitHub API or Git operations
    // For now, we'll store in localStorage and log the data that should be saved
    localStorage.setItem('donations', JSON.stringify(donations, null, 2));
    
    // Log the data that should be saved to the GitHub repository
    console.log('Donations data to save to GitHub:', JSON.stringify(donations, null, 2));
    console.log('Save this data to:', DONATIONS_URL);
    
    // In a production environment, you would need to:
    // 1. Use GitHub API with authentication
    // 2. Or implement a backend service that can write to the repository
    // 3. Or use GitHub Actions to update the files
    
  } catch (error) {
    console.error('Error saving donations:', error);
    throw new Error('Failed to save donations');
  }
};

export const loadDonationsFromFile = async (): Promise<DonationData> => {
  try {
    // First try to load from the GitHub Pages URL
    const response = await fetch(DONATIONS_URL);
    if (response.ok) {
      const data = await response.json();
      console.log('Loaded donations from GitHub Pages');
      return data as DonationData;
    }
    
    // Fallback to localStorage if GitHub fetch fails
    const stored = localStorage.getItem('donations');
    if (stored) {
      console.log('Loaded donations from localStorage');
      return JSON.parse(stored);
    }
    
    // Final fallback to local JSON file
    const { default: donationsData } = await import('../data/donations.json');
    console.log('Loaded donations from local file');
    return donationsData as DonationData;
  } catch (error) {
    console.error('Error loading donations:', error);
    
    // Try localStorage as final fallback
    try {
      const stored = localStorage.getItem('donations');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (storageError) {
      console.error('Error loading from localStorage:', storageError);
    }
    
    return {};
  }
};

export const loadExpensesFromFile = async (): Promise<Expense[]> => {
  try {
    // First try to load from the GitHub Pages URL
    const response = await fetch(EXPENSES_URL);
    if (response.ok) {
      const data = await response.json();
      console.log('Loaded expenses from GitHub Pages');
      return data as Expense[];
    }
    
    // Fallback to localStorage if GitHub fetch fails
    const stored = localStorage.getItem('expenses');
    if (stored) {
      console.log('Loaded expenses from localStorage');
      return JSON.parse(stored);
    }
    
    // Final fallback to local JSON file
    const { default: expensesData } = await import('../data/expenses.json');
    console.log('Loaded expenses from local file');
    return expensesData as Expense[];
  } catch (error) {
    console.error('Error loading expenses:', error);
    
    // Try localStorage as final fallback
    try {
      const stored = localStorage.getItem('expenses');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (storageError) {
      console.error('Error loading from localStorage:', storageError);
    }
    
    return [];
  }
};

export const saveExpensesToFile = async (expenses: Expense[]): Promise<void> => {
  try {
    // Store in localStorage and log the data that should be saved
    localStorage.setItem('expenses', JSON.stringify(expenses, null, 2));
    
    // Log the data that should be saved to the GitHub repository
    console.log('Expenses data to save to GitHub:', JSON.stringify(expenses, null, 2));
    console.log('Save this data to:', EXPENSES_URL);
    
    // In a production environment, you would need to:
    // 1. Use GitHub API with authentication
    // 2. Or implement a backend service that can write to the repository
    // 3. Or use GitHub Actions to update the files
    
  } catch (error) {
    console.error('Error saving expenses:', error);
    throw new Error('Failed to save expenses');
  }
};