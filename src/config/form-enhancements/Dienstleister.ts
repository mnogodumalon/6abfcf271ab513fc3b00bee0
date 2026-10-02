// Auto-generated. Per-entity form-enhancements config for "Dienstleister".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["firmenname", "kategorie", "status", {"row": ["ansprechpartner_firstname", "ansprechpartner_lastname"]}, {"row": ["email", "telefon"], "cols": "1fr 1fr"}, "website", "notizen"],
  defaults: {
    'status': { kind: 'lookup', key: 'anfrage', label: 'Anfrage' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
