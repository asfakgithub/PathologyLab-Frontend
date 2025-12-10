import { useEffect, useRef } from 'react';
import { searchTests, getTest } from '../../services/api';

// Hook that exposes simple fetchers for test and parameter suggestions.
// Improvements:
// - separate debounce timers for tests and params
// - normalize backend responses to extract `tests` array when present
export default function useAutoSuggestionOnTestAndParam() {
  const debounceTestRef = useRef(null);
  const debounceParamRef = useRef(null);

  const normalizeTestsArray = (res) => {
    // res is expected to be the API response body due to interceptor
    // Try common shapes: { data: { tests: [...] } }, { data: [...] }, { tests: [...] }, [...]
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.tests && Array.isArray(res.tests)) return res.tests;
    if (res.data) {
      if (Array.isArray(res.data)) return res.data;
      if (res.data.tests && Array.isArray(res.data.tests)) return res.data.tests;
      // sometimes data itself is the entity list
      if (res.data.tests && Array.isArray(res.data.tests)) return res.data.tests;
    }
    return [];
  };

  const fetchTestSuggestions = (query) => {
    return new Promise((resolve) => {
      if (!query || query.length < 2) return resolve([]);
      if (debounceTestRef.current) clearTimeout(debounceTestRef.current);
      debounceTestRef.current = setTimeout(async () => {
        try {
          const res = await searchTests(query);
          const tests = normalizeTestsArray(res);
          resolve(tests);
        } catch (err) {
          console.error('fetchTestSuggestions error', err);
          resolve([]);
        }
      }, 250);
    });
  };

  const fetchParamSuggestions = (testId, query) => {
    return new Promise((resolve) => {
      if (!query || query.length < 1) return resolve([]);
      if (debounceParamRef.current) clearTimeout(debounceParamRef.current);
      debounceParamRef.current = setTimeout(async () => {
        try {
          if (testId) {
            const res = await getTest(testId);
            const test = res && res.data ? res.data : res;
            const params = test?.parameters || [];
            const out = params.filter(p => (p.name || '').toLowerCase().includes(query.toLowerCase()));
            resolve(out);
          } else {
            const res = await searchTests(query);
            const tests = normalizeTestsArray(res);
            const params = [];
            (tests || []).forEach(t => {
              (t.parameters || []).forEach(p => {
                if (p && p.name && p.name.toLowerCase().includes(query.toLowerCase())) {
                  params.push({ ...p, parentTest: t });
                }
              });
            });
            resolve(params);
          }
        } catch (err) {
          console.error('fetchParamSuggestions error', err);
          resolve([]);
        }
      }, 200);
    });
  };

  useEffect(() => {
    return () => {
      if (debounceTestRef.current) clearTimeout(debounceTestRef.current);
      if (debounceParamRef.current) clearTimeout(debounceParamRef.current);
    };
  }, []);

  return { fetchTestSuggestions, fetchParamSuggestions };
}
