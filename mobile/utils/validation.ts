// Input validation and data sanitization utilities

export interface ValidatedProvider {
  id: string;
  name: string;
  address: string;
  category: string;
  rating: number;
  lat: number;
  lng: number;
  base_cost: number;
}

interface RawProvider {
  id?: any;
  name?: any;
  address?: any;
  service_type?: any;
  category?: any;
  rating?: any;
  lat?: any;
  lng?: any;
  base_cost?: any;
}

// Validate coordinate is within Pakistan bounds
export function isValidCoordinate(lat: number, lng: number): boolean {
  const MIN_LAT = 23.5;
  const MAX_LAT = 37.1;
  const MIN_LNG = 60.9;
  const MAX_LNG = 77.8;

  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= MIN_LAT &&
    lat <= MAX_LAT &&
    lng >= MIN_LNG &&
    lng <= MAX_LNG
  );
}

// Validate rating is 0-5
export function isValidRating(rating: any): boolean {
  const num = Number(rating);
  return typeof num === 'number' && !isNaN(num) && num >= 0 && num <= 5;
}

// Validate base cost is positive number
export function isValidCost(cost: any): boolean {
  const num = Number(cost);
  return typeof num === 'number' && !isNaN(num) && num > 0 && num < 1000000;
}

// Sanitize string input (max 200 chars, no special chars)
export function sanitizeString(input: any, maxLength = 200): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength).replace(/[<>]/g, '');
}

// Validate and sanitize provider data
export function validateProvider(provider: RawProvider): ValidatedProvider | null {
  if (!provider || typeof provider !== 'object') return null;

  const id = sanitizeString(provider.id, 50);
  const name = sanitizeString(provider.name, 100);
  const address = sanitizeString(provider.address, 150);
  const category = sanitizeString(provider.service_type || provider.category, 50);

  if (!id || !name || !category) return null;

  const lat = Number(provider.lat);
  const lng = Number(provider.lng);
  const rating = Number(provider.rating);
  const base_cost = Number(provider.base_cost);

  if (!isValidCoordinate(lat, lng)) return null;
  if (!isValidRating(rating)) return null;
  if (!isValidCost(base_cost)) return null;

  return {
    id,
    name,
    address: address || `${category} service in Islamabad`,
    category,
    rating,
    lat,
    lng,
    base_cost,
  };
}

// Validate array of providers
export function validateProviderList(providers: any[]): ValidatedProvider[] {
  if (!Array.isArray(providers)) return [];
  return providers
    .map(p => validateProvider(p))
    .filter((p): p is ValidatedProvider => p !== null);
}

// Validate search query (max 100 chars, alphanumeric + spaces)
export function validateSearchQuery(query: string, maxLength = 100): string {
  if (typeof query !== 'string') return '';
  return query.trim().slice(0, maxLength);
}
