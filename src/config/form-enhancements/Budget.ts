// Auto-generated. Per-entity form-enhancements config for "Budget".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["bezeichnung", {"row": ["kategorie", "dienstleister"], "cols": "1fr 1fr"}, {"row": ["geplanter_betrag", "tatsaechlicher_betrag"], "cols": "1fr 1fr"}, {"row": ["zahlungsstatus", "zahlungsdatum"], "cols": "1fr 1fr"}],
  defaults: {
    'zahlungsstatus': { kind: 'lookup', key: 'offen', label: 'Offen' },
  },
  computed: {
    '_budget_differenz': { op: 'sub', left: { kind: 'field', key: 'geplanter_betrag' }, right: { kind: 'field', key: 'tatsaechlicher_betrag' } },
  },
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
