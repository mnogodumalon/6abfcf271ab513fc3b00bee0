// Auto-generated. Per-entity form-enhancements config for "Gäste und Einladungen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: [{"row": ["gast_firstname", "gast_lastname"], "cols": "1fr 1fr"}, "einladungsstatus", "seite", "email", "telefon", {"row": ["strasse", "hausnummer"], "cols": "2fr 1fr"}, {"row": ["plz", "ort"], "cols": "1fr 2fr"}, "anzahl_personen", {"row": ["einladungsdatum", "rueckmeldedatum"], "cols": "1fr 1fr"}, "menuewunsch", "tisch", "allergien", "bemerkung"],
  defaults: {
    'einladungsstatus': { kind: 'lookup', key: 'eingeladen', label: 'Eingeladen' },
    'anzahl_personen': { kind: 'literal', value: 1 },
    'einladungsdatum': { kind: 'today' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
