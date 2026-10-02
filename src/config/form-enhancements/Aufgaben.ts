// Auto-generated. Per-entity form-enhancements config for "Aufgaben".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["titel", "status", "kategorie", "prioritaet", "faelligkeitsdatum", {"row": ["verantwortlich_firstname", "verantwortlich_lastname"]}, "dienstleister", "beschreibung"],
  defaults: {
    'status': { kind: 'lookup', key: 'offen', label: 'Offen' },
    'faelligkeitsdatum': { kind: 'todayOffset', days: 14 },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
