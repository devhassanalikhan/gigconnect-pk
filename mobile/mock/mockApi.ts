// Lightweight frontend mock API for demo recordings and offline mode
import { MOCK_DELAY_MS } from '../config';

const SEED_PROVIDERS = [
  { id: 'm1', name: 'Demo Plumber One', category: 'Plumber', rating: 4.7, lat: 33.6350, lng: 72.9810, address: 'G-13 Sector, Islamabad', base_cost: 1500 },
  { id: 'm2', name: 'Demo Electrician', category: 'Electrician', rating: 4.5, lat: 33.6420, lng: 72.9700, address: 'G-13 Markaz, Islamabad', base_cost: 1200 },
  { id: 'm3', name: 'Demo AC Tech', category: 'AC Technician', rating: 4.6, lat: 33.6480, lng: 72.9750, address: 'F-11 Markaz, Islamabad', base_cost: 1800 },
];

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function getProvidersMock(centerLat: number, centerLng: number) {
  await delay(MOCK_DELAY_MS);
  // Return a shallow clone to avoid mutation
  return { providers: SEED_PROVIDERS.map(p => ({ ...p })) };
}

export async function matchMock(text: string) {
  await delay(MOCK_DELAY_MS + 200);
  const lowered = text.toLowerCase();
  // Simple intent parse for demo
  const isGreeting = /(assalam|hello|hi|salam)/i.test(lowered);
  if (isGreeting) return { pipeline_status: 'greeting', greeting_response: 'Assalam-o-Alaikum! Ye demo response hai.' };

  // Return providers matching common keywords
  const matched = SEED_PROVIDERS.filter(p =>
    lowered.includes(p.category.toLowerCase()) || lowered.includes(p.name.toLowerCase()) || lowered.includes('near')
  );

  return {
    pipeline_status: 'ok',
    parsed_request: { text },
    providers: matched.length ? matched.map(p => ({ ...p })) : [],
  };
}
