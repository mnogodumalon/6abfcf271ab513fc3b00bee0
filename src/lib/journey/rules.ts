/**
 * Field rules — GENERATED from the app metadata. Do not edit.
 *
 * The mechanical truth about every field: what kind it is, whether the
 * platform's base view marks it required, which lookup keys exist, where an
 * applookup points, what the label is. `useStepForm` validates against these
 * rules and phrases its messages with the real labels; `toWirePayload` uses
 * them to shape the create payload; `SHAPES` tells a page which input FORM
 * fits the data (a date pair wants a calendar, not two fields) — it is a
 * signal, not a gate.
 */
import { appLabel, fieldLabel, lookupLabel } from '@/i18n';
import { policyLabel } from './policy';
import { LOOKUP_OPTIONS } from '@/types/app';

export type EntityKey = 'tische' | 'gaeste_und_einladungen' | 'dienstleister' | 'aufgaben' | 'budget' | 'fotogalerie';

/** The text fields of each entity — what a search may run over (generated;
 *  `never` for an entity without text of its own, e.g. a link table). */
export interface StringFields {
  "tische": "tischname" | "standort" | "bemerkung";
  "gaeste_und_einladungen": "gast_firstname" | "gast_lastname" | "email" | "telefon" | "strasse" | "hausnummer" | "plz" | "ort" | "allergien" | "bemerkung";
  "dienstleister": "firmenname" | "ansprechpartner_firstname" | "ansprechpartner_lastname" | "email" | "telefon" | "website" | "notizen";
  "aufgaben": "titel" | "beschreibung" | "verantwortlich_firstname" | "verantwortlich_lastname";
  "budget": "bezeichnung";
  "fotogalerie": "titel" | "beschreibung";
}
export type StringFieldKey<E extends EntityKey> = E extends keyof StringFields ? StringFields[E] : never;

/** The applookup fields of each entity (generated). A pick stored through
 *  `form.set` on one of these must carry its display name — at compile time
 *  (`StepForm.set`), because the review would otherwise show the id. */
export interface RecordFields {
  "tische": never;
  "gaeste_und_einladungen": "tisch";
  "dienstleister": never;
  "aufgaben": "dienstleister";
  "budget": "dienstleister";
  "fotogalerie": "gast";
}
export type RecordFieldKey<E extends EntityKey> = E extends keyof RecordFields ? RecordFields[E] : never;

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'multilookup'
  | 'record'
  | 'multirecord'
  | 'file'
  | 'geo';

export interface FieldRule {
  key: string;
  fulltype: string;
  kind: FieldKind;
  /** From the app's base view. A public page may override this per field. */
  required: boolean;
  /** Build-time label — `labelOf()` prefers the runtime i18n bundle. */
  label: string;
  /** Whether a journey may write it (`file` is upload-only, never via a journey). */
  writable: boolean;
  maxLength?: number;
  /** lookup / multilookup: the ONLY valid write values. */
  options?: string[];
  /** record / multirecord: the target app (always) and its entity key (when inside this appgroup). */
  targetAppId?: string;
  targetEntity?: EntityKey;
  format?: 'currency';
  /** HTML autocomplete token derived from the field name (given-name, email, tel, …). */
  autoComplete?: string;
}

export interface EntityInfo {
  key: EntityKey;
  appId: string;
  label: string;
  /** PascalCase plural — `get<pascal>()` on the service. */
  pascal: string;
  /** The single-record suffix — `create<single>()` on the service. */
  single: string;
}

/** Input-form signals per entity: which data shape each field (pair) has.
 *  `range`  — two date fields that form a stay/period → AvailabilityRangePicker
 *  `choice` — a lookup with few options → ChoiceGroup pills instead of a select
 *  `record` — an applookup → EntitySelectStep with search, never a raw id field
 *  `stock`  — a quantity that has a stock/capacity counterpart → show it, warn on overshoot */
export type Shape =
  | { kind: 'range'; from: string; to: string }
  | { kind: 'choice'; field: string; count: number }
  | { kind: 'record'; field: string; targetEntity?: EntityKey }
  | { kind: 'stock'; field: string };

export const ENTITIES: Record<EntityKey, EntityInfo> = {
  "tische": {
    "key": "tische",
    "appId": "6abfcef796d2c11262346c3a",
    "label": "Tische",
    "pascal": "Tische",
    "single": "TischeEntry"
  },
  "gaeste_und_einladungen": {
    "key": "gaeste_und_einladungen",
    "appId": "6abfcefedf29d3c3500ddc43",
    "label": "Gäste und Einladungen",
    "pascal": "GaesteUndEinladungen",
    "single": "GaesteUndEinladungenEntry"
  },
  "dienstleister": {
    "key": "dienstleister",
    "appId": "6abfceffbfc167b80627c8a6",
    "label": "Dienstleister",
    "pascal": "Dienstleister",
    "single": "DienstleisterEntry"
  },
  "aufgaben": {
    "key": "aufgaben",
    "appId": "6abfceff7fc030c248606fb1",
    "label": "Aufgaben",
    "pascal": "Aufgaben",
    "single": "AufgabenEntry"
  },
  "budget": {
    "key": "budget",
    "appId": "6abfcf000d4ceec4fbe4df9a",
    "label": "Budget",
    "pascal": "Budget",
    "single": "BudgetEntry"
  },
  "fotogalerie": {
    "key": "fotogalerie",
    "appId": "6abfcf01aab6f57ae44dbeb6",
    "label": "Fotogalerie",
    "pascal": "Fotogalerie",
    "single": "FotogalerieEntry"
  }
};

export const FIELD_RULES: Record<EntityKey, Record<string, FieldRule>> = {
  "tische": {
    "tischname": {
      "key": "tischname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Tischname",
      "writable": true,
      "maxLength": 4000
    },
    "tischnummer": {
      "key": "tischnummer",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Tischnummer",
      "writable": true
    },
    "anzahl_plaetze": {
      "key": "anzahl_plaetze",
      "fulltype": "number",
      "kind": "number",
      "required": true,
      "label": "Anzahl Plätze",
      "writable": true
    },
    "standort": {
      "key": "standort",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Standort im Raum",
      "writable": true,
      "maxLength": 4000
    },
    "bemerkung": {
      "key": "bemerkung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bemerkung",
      "writable": true
    }
  },
  "gaeste_und_einladungen": {
    "gast_firstname": {
      "key": "gast_firstname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "gast_lastname": {
      "key": "gast_lastname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "email": {
      "key": "email",
      "fulltype": "string/email",
      "kind": "email",
      "required": false,
      "label": "E-Mail",
      "writable": true,
      "autoComplete": "email"
    },
    "telefon": {
      "key": "telefon",
      "fulltype": "string/tel",
      "kind": "tel",
      "required": false,
      "label": "Telefon",
      "writable": true,
      "autoComplete": "tel"
    },
    "strasse": {
      "key": "strasse",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Straße",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "address-line1"
    },
    "hausnummer": {
      "key": "hausnummer",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Hausnummer",
      "writable": true,
      "maxLength": 4000
    },
    "plz": {
      "key": "plz",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Postleitzahl",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "postal-code"
    },
    "ort": {
      "key": "ort",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Ort",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "address-level2"
    },
    "seite": {
      "key": "seite",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Seite",
      "writable": true,
      "options": [
        "braut",
        "braeutigam",
        "gemeinsam"
      ]
    },
    "anzahl_personen": {
      "key": "anzahl_personen",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Anzahl Personen",
      "writable": true
    },
    "einladungsstatus": {
      "key": "einladungsstatus",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Einladungsstatus",
      "writable": true,
      "options": [
        "zugesagt",
        "abgesagt",
        "nicht_eingeladen",
        "eingeladen"
      ]
    },
    "einladungsdatum": {
      "key": "einladungsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Einladungsdatum",
      "writable": true
    },
    "rueckmeldedatum": {
      "key": "rueckmeldedatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Rückmeldedatum",
      "writable": true
    },
    "menuewunsch": {
      "key": "menuewunsch",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Menüwunsch",
      "writable": true,
      "options": [
        "fleisch",
        "fisch",
        "vegetarisch",
        "vegan",
        "kindermenue"
      ]
    },
    "allergien": {
      "key": "allergien",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Allergien und Unverträglichkeiten",
      "writable": true
    },
    "tisch": {
      "key": "tisch",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Tisch",
      "writable": true,
      "targetAppId": "6abfcef796d2c11262346c3a",
      "targetEntity": "tische"
    },
    "bemerkung": {
      "key": "bemerkung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bemerkung",
      "writable": true
    }
  },
  "dienstleister": {
    "firmenname": {
      "key": "firmenname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Firmenname",
      "writable": true,
      "maxLength": 4000
    },
    "kategorie": {
      "key": "kategorie",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Kategorie",
      "writable": true,
      "options": [
        "location",
        "catering",
        "fotograf",
        "musik",
        "floristik",
        "sonstiges"
      ]
    },
    "ansprechpartner_firstname": {
      "key": "ansprechpartner_firstname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Vorname Ansprechpartner",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "ansprechpartner_lastname": {
      "key": "ansprechpartner_lastname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Nachname Ansprechpartner",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "email": {
      "key": "email",
      "fulltype": "string/email",
      "kind": "email",
      "required": false,
      "label": "E-Mail",
      "writable": true,
      "autoComplete": "email"
    },
    "telefon": {
      "key": "telefon",
      "fulltype": "string/tel",
      "kind": "tel",
      "required": false,
      "label": "Telefon",
      "writable": true,
      "autoComplete": "tel"
    },
    "website": {
      "key": "website",
      "fulltype": "string/url",
      "kind": "url",
      "required": false,
      "label": "Website",
      "writable": true,
      "autoComplete": "url"
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Status",
      "writable": true,
      "options": [
        "anfrage",
        "angebot_erhalten",
        "gebucht",
        "abgesagt"
      ]
    },
    "notizen": {
      "key": "notizen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Notizen",
      "writable": true
    }
  },
  "aufgaben": {
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel",
      "writable": true,
      "maxLength": 4000
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    },
    "kategorie": {
      "key": "kategorie",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Kategorie",
      "writable": true,
      "options": [
        "organisation",
        "einladungen",
        "dekoration",
        "kleidung",
        "verpflegung",
        "sonstiges"
      ]
    },
    "faelligkeitsdatum": {
      "key": "faelligkeitsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Fälligkeitsdatum",
      "writable": true
    },
    "prioritaet": {
      "key": "prioritaet",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Priorität",
      "writable": true,
      "options": [
        "niedrig",
        "mittel",
        "hoch"
      ]
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "offen",
        "in_arbeit",
        "erledigt"
      ]
    },
    "verantwortlich_firstname": {
      "key": "verantwortlich_firstname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Vorname Verantwortlicher",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "verantwortlich_lastname": {
      "key": "verantwortlich_lastname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Nachname Verantwortlicher",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "dienstleister": {
      "key": "dienstleister",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Dienstleister",
      "writable": true,
      "targetAppId": "6abfceffbfc167b80627c8a6",
      "targetEntity": "dienstleister"
    }
  },
  "budget": {
    "bezeichnung": {
      "key": "bezeichnung",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Bezeichnung",
      "writable": true,
      "maxLength": 4000
    },
    "kategorie": {
      "key": "kategorie",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Kategorie",
      "writable": true,
      "options": [
        "location",
        "catering",
        "kleidung",
        "dekoration",
        "fotograf",
        "musik",
        "sonstiges"
      ]
    },
    "geplanter_betrag": {
      "key": "geplanter_betrag",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Geplanter Betrag in Euro",
      "writable": true,
      "format": "currency"
    },
    "tatsaechlicher_betrag": {
      "key": "tatsaechlicher_betrag",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Tatsächlicher Betrag in Euro",
      "writable": true,
      "format": "currency"
    },
    "zahlungsstatus": {
      "key": "zahlungsstatus",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Zahlungsstatus",
      "writable": true,
      "options": [
        "offen",
        "teilweise_bezahlt",
        "bezahlt"
      ]
    },
    "zahlungsdatum": {
      "key": "zahlungsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Zahlungsdatum",
      "writable": true
    },
    "dienstleister": {
      "key": "dienstleister",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Dienstleister",
      "writable": true,
      "targetAppId": "6abfceffbfc167b80627c8a6",
      "targetEntity": "dienstleister"
    }
  },
  "fotogalerie": {
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel",
      "writable": true,
      "maxLength": 4000
    },
    "foto": {
      "key": "foto",
      "fulltype": "file",
      "kind": "file",
      "required": true,
      "label": "Foto",
      "writable": false
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    },
    "aufnahmedatum": {
      "key": "aufnahmedatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Aufnahmedatum",
      "writable": true
    },
    "anlass": {
      "key": "anlass",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Anlass",
      "writable": true,
      "options": [
        "vorbereitung",
        "trauung",
        "feier",
        "sonstiges"
      ]
    },
    "gast": {
      "key": "gast",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Abgebildeter Gast",
      "writable": true,
      "targetAppId": "6abfcefedf29d3c3500ddc43",
      "targetEntity": "gaeste_und_einladungen"
    }
  }
};

export const SHAPES: Record<EntityKey, Shape[]> = {
  "tische": [],
  "gaeste_und_einladungen": [
    {
      "kind": "choice",
      "field": "seite",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "einladungsstatus",
      "count": 4
    },
    {
      "kind": "choice",
      "field": "menuewunsch",
      "count": 5
    },
    {
      "kind": "record",
      "field": "tisch",
      "targetEntity": "tische"
    }
  ],
  "dienstleister": [
    {
      "kind": "choice",
      "field": "kategorie",
      "count": 6
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 4
    }
  ],
  "aufgaben": [
    {
      "kind": "choice",
      "field": "kategorie",
      "count": 6
    },
    {
      "kind": "choice",
      "field": "prioritaet",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 3
    },
    {
      "kind": "record",
      "field": "dienstleister",
      "targetEntity": "dienstleister"
    }
  ],
  "budget": [
    {
      "kind": "choice",
      "field": "zahlungsstatus",
      "count": 3
    },
    {
      "kind": "record",
      "field": "dienstleister",
      "targetEntity": "dienstleister"
    }
  ],
  "fotogalerie": [
    {
      "kind": "choice",
      "field": "anlass",
      "count": 4
    },
    {
      "kind": "record",
      "field": "gast",
      "targetEntity": "gaeste_und_einladungen"
    }
  ]
};

/** The fields a record of this entity is recognised by (a person: first and
 *  last name; else its title-like text field) — the same choice the dashboard's
 *  enrichment makes for `<key>Name`. `useRecordSearch` resolves an applookup to
 *  this name (`ctx.ref('gast')` in `toItem`). */
export const DISPLAY_FIELDS: Record<EntityKey, string[]> = {
  "tische": [
    "tischname"
  ],
  "gaeste_und_einladungen": [
    "gast_firstname"
  ],
  "dienstleister": [
    "firmenname"
  ],
  "aufgaben": [
    "titel"
  ],
  "budget": [
    "bezeichnung"
  ],
  "fotogalerie": [
    "titel"
  ]
};

/** The display name of a record: its display fields joined, else the first
 *  non-empty text value, else ''. */
/** A display-field value as text: strings as they are, a lookup `{ key, label }`
 *  (either door hydrates lookups to objects) by its label — an entity whose
 *  only title-like field is a lookup/select otherwise had no name at all. */
function displayPart(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object' && 'label' in v) {
    const l = (v as { label?: unknown }).label;
    return l === null || l === undefined ? '' : String(l).trim();
  }
  return '';
}

export function displayNameOf(entity: EntityKey, fields: Record<string, unknown>): string {
  const parts = (DISPLAY_FIELDS[entity] ?? [])
    .map(k => displayPart(fields[k]))
    .filter(v => v !== '');
  if (parts.length > 0) return parts.join(' ');
  for (const [k, rule] of Object.entries(FIELD_RULES[entity] ?? {})) {
    if (rule.kind !== 'text' && rule.kind !== 'email') continue;
    const v = fields[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

export function ruleOf(entity: EntityKey, key: string): FieldRule | undefined {
  return FIELD_RULES[entity]?.[key];
}

/** The field label as the user sees it — the owner's policy label first (a
 *  public page's "Felder anpassen"), runtime bundle second, generated label last. */
export function labelOf(entity: EntityKey, key: string): string {
  const own = policyLabel(entity, key);
  if (own) return own;
  const fromBundle = fieldLabel(entity, key);
  if (fromBundle !== key) return fromBundle;
  return ruleOf(entity, key)?.label ?? key;
}

export function entityLabel(entity: EntityKey): string {
  const fromBundle = appLabel(entity);
  if (fromBundle !== entity) return fromBundle;
  return ENTITIES[entity]?.label ?? entity;
}

/** Lookup options with runtime labels — the only legitimate source of `{key,label}` pairs. */
export function optionsOf(entity: EntityKey, key: string): Array<{ key: string; label: string }> {
  const generated = (LOOKUP_OPTIONS as Record<string, Record<string, Array<{ key: string; label: string }>>>)[entity]?.[key];
  if (generated && generated.length) return generated.map(o => ({ key: o.key, label: o.label }));
  const keys = ruleOf(entity, key)?.options ?? [];
  return keys.map(k => ({ key: k, label: lookupLabel(entity, key, k) ?? k }));
}

export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'from' in (v as object) && 'to' in (v as object)) {
    const r = v as { from: unknown; to: unknown };
    return isEmptyValue(r.from) && isEmptyValue(r.to);
  }
  return false;
}
