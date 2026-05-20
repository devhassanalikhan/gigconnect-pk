// Diagnostic check for real backend & map issues
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { API_BASE_URL, GOOGLE_MAPS_API_KEY, fetchWithTimeout } from '../config';

export default function DiagnosticScreen() {
  const [diagnostics, setDiagnostics] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const logs: string[] = [];

      // Check 1: Backend connectivity (uses configured API_BASE_URL)
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/api/providers`, {}, 8000);
        logs.push(`✓ Backend reachable (${response.status})`);
        const data = await response.json();
        logs.push(`✓ Backend returned: ${JSON.stringify(data).slice(0, 100)}...`);
      } catch (e) {
        logs.push(`✗ Backend failed: ${(e as Error).message}`);
      }

      // Check 2: Google Maps API key
      const key = GOOGLE_MAPS_API_KEY;
      if (key && key !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' && key.length > 5) {
        logs.push(`✓ Google Maps API key configured`);
      } else {
        logs.push(`✗ Google Maps API key NOT configured (${String(key)})`);
      }

      // Check 3: Places API (New & Legacy fallback)
      if (key && key !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        try {
          const newAutocompleteUrl = 'https://places.googleapis.com/v1/places:autocomplete';
          const response = await fetch(newAutocompleteUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': key,
            },
            body: JSON.stringify({
              input: 'ali',
              includedRegionCodes: ['pk'],
            }),
          });
          if (response.ok) {
            const data = await response.json();
            logs.push(`✓ Places API (New) working: ${data.suggestions?.length || 0} results`);
          } else {
            const legacyUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=ali&key=${key}&components=country:pk`;
            const responseLegacy = await fetch(legacyUrl);
            const dataLegacy = await responseLegacy.json();
            if (dataLegacy.predictions) {
              logs.push(`✓ Legacy Places API working: ${dataLegacy.predictions.length || 0} results`);
            } else {
              logs.push(`✗ Places API returned error: ${dataLegacy.error_message || JSON.stringify(dataLegacy)}`);
            }
          }
        } catch (e) {
          logs.push(`✗ Places API failed: ${(e as Error).message}`);
        }
      }

      setDiagnostics(logs);
    })();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 DIAGNOSTIC REPORT</Text>
      {diagnostics.map((log, i) => (
        <Text key={i} style={styles.log}>
          {log}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  log: { color: '#0f0', fontSize: 12, marginBottom: 8, fontFamily: 'monospace' },
});
