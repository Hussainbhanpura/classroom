import pkg from 'bloom-filters';
const { BloomFilter } = pkg;
import User from '../models/userSchema.js';

// Set size to handle expected number of items with desired false positive rate
// Using formula: size = -(n * ln(p)) / (ln(2))^2
// where n = expected items, p = false positive rate
const EXPECTED_ITEMS = 1000;
const FALSE_POSITIVE_RATE = 0.01;
const OPTIMAL_SIZE = Math.ceil(-(EXPECTED_ITEMS * Math.log(FALSE_POSITIVE_RATE)) / Math.pow(Math.log(2), 2));

// Calculate optimal number of hash functions
// Using formula: k = (size/n) * ln(2)
const OPTIMAL_HASH_FUNCTIONS = Math.ceil((OPTIMAL_SIZE / EXPECTED_ITEMS) * Math.log(2));

let bloomFilter = new BloomFilter(OPTIMAL_SIZE, OPTIMAL_HASH_FUNCTIONS);
let isInitialized = false;

// Function to initialize Bloom filter with existing emails
export async function initializeBloomFilter() {
  if (isInitialized) return;
  
  try {
    const users = await User.find({}, 'email');
    users.forEach(user => {
      bloomFilter.add(user.email);
    });
    isInitialized = true;
    console.log('Bloom filter initialized successfully');
  } catch (error) {
    console.error('Error initializing Bloom filter:', error);
    throw error;
  }
}

// Function to add email to Bloom filter
export function addEmail(email) {
  if (!email) return;
  bloomFilter.add(email);
}

// Function to check if email might exist in Bloom filter
export async function mightContainEmail(email) {
  if (!isInitialized) {
    await initializeBloomFilter();
  }
  return bloomFilter.has(email);
}
