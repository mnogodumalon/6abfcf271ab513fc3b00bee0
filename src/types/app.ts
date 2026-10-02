import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Tische {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    tischname?: string;
    tischnummer?: number;
    anzahl_plaetze?: number;
    standort?: string;
    bemerkung?: string;
  };
}

export interface GaesteUndEinladungen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    gast_firstname?: string;
    gast_lastname?: string;
    email?: string;
    telefon?: string;
    strasse?: string;
    hausnummer?: string;
    plz?: string;
    ort?: string;
    seite?: LookupValue;
    anzahl_personen?: number;
    einladungsstatus?: LookupValue;
    einladungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    rueckmeldedatum?: string; // Format: YYYY-MM-DD oder ISO String
    menuewunsch?: LookupValue;
    allergien?: string;
    tisch?: RecordUrl; // applookup -> URL zu 'Tische' Record
    bemerkung?: string;
  };
}

export interface Dienstleister {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    firmenname?: string;
    kategorie?: LookupValue;
    ansprechpartner_firstname?: string;
    ansprechpartner_lastname?: string;
    email?: string;
    telefon?: string;
    website?: string;
    status?: LookupValue;
    notizen?: string;
  };
}

export interface Aufgaben {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    titel?: string;
    beschreibung?: string;
    kategorie?: LookupValue;
    faelligkeitsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    prioritaet?: LookupValue;
    status?: LookupValue;
    verantwortlich_firstname?: string;
    verantwortlich_lastname?: string;
    dienstleister?: RecordUrl; // applookup -> URL zu 'Dienstleister' Record
  };
}

export interface Budget {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    bezeichnung?: string;
    kategorie?: LookupValue;
    geplanter_betrag?: number;
    tatsaechlicher_betrag?: number;
    zahlungsstatus?: LookupValue;
    zahlungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    dienstleister?: RecordUrl; // applookup -> URL zu 'Dienstleister' Record
  };
}

export interface Fotogalerie {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    titel?: string;
    foto?: string;
    beschreibung?: string;
    aufnahmedatum?: string; // Format: YYYY-MM-DD oder ISO String
    anlass?: LookupValue;
    gast?: RecordUrl; // applookup -> URL zu 'GaesteUndEinladungen' Record
  };
}

export const APP_IDS = {
  TISCHE: '6abfcef796d2c11262346c3a',
  GAESTE_UND_EINLADUNGEN: '6abfcefedf29d3c3500ddc43',
  DIENSTLEISTER: '6abfceffbfc167b80627c8a6',
  AUFGABEN: '6abfceff7fc030c248606fb1',
  BUDGET: '6abfcf000d4ceec4fbe4df9a',
  FOTOGALERIE: '6abfcf01aab6f57ae44dbeb6',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'gaeste_und_einladungen': {
    seite: [{ key: "braut", get label() { return lookupLabel('gaeste_und_einladungen', 'seite', "braut") ?? "Braut"; } }, { key: "braeutigam", get label() { return lookupLabel('gaeste_und_einladungen', 'seite', "braeutigam") ?? "Bräutigam"; } }, { key: "gemeinsam", get label() { return lookupLabel('gaeste_und_einladungen', 'seite', "gemeinsam") ?? "Gemeinsam"; } }],
    einladungsstatus: [{ key: "zugesagt", get label() { return lookupLabel('gaeste_und_einladungen', 'einladungsstatus', "zugesagt") ?? "Zugesagt"; } }, { key: "abgesagt", get label() { return lookupLabel('gaeste_und_einladungen', 'einladungsstatus', "abgesagt") ?? "Abgesagt"; } }, { key: "nicht_eingeladen", get label() { return lookupLabel('gaeste_und_einladungen', 'einladungsstatus', "nicht_eingeladen") ?? "Nicht eingeladen"; } }, { key: "eingeladen", get label() { return lookupLabel('gaeste_und_einladungen', 'einladungsstatus', "eingeladen") ?? "Eingeladen"; } }],
    menuewunsch: [{ key: "fleisch", get label() { return lookupLabel('gaeste_und_einladungen', 'menuewunsch', "fleisch") ?? "Fleisch"; } }, { key: "fisch", get label() { return lookupLabel('gaeste_und_einladungen', 'menuewunsch', "fisch") ?? "Fisch"; } }, { key: "vegetarisch", get label() { return lookupLabel('gaeste_und_einladungen', 'menuewunsch', "vegetarisch") ?? "Vegetarisch"; } }, { key: "vegan", get label() { return lookupLabel('gaeste_und_einladungen', 'menuewunsch', "vegan") ?? "Vegan"; } }, { key: "kindermenue", get label() { return lookupLabel('gaeste_und_einladungen', 'menuewunsch', "kindermenue") ?? "Kindermenü"; } }],
  },
  'dienstleister': {
    kategorie: [{ key: "location", get label() { return lookupLabel('dienstleister', 'kategorie', "location") ?? "Location"; } }, { key: "catering", get label() { return lookupLabel('dienstleister', 'kategorie', "catering") ?? "Catering"; } }, { key: "fotograf", get label() { return lookupLabel('dienstleister', 'kategorie', "fotograf") ?? "Fotograf"; } }, { key: "musik", get label() { return lookupLabel('dienstleister', 'kategorie', "musik") ?? "Musik"; } }, { key: "floristik", get label() { return lookupLabel('dienstleister', 'kategorie', "floristik") ?? "Floristik"; } }, { key: "sonstiges", get label() { return lookupLabel('dienstleister', 'kategorie', "sonstiges") ?? "Sonstiges"; } }],
    status: [{ key: "anfrage", get label() { return lookupLabel('dienstleister', 'status', "anfrage") ?? "Anfrage"; } }, { key: "angebot_erhalten", get label() { return lookupLabel('dienstleister', 'status', "angebot_erhalten") ?? "Angebot erhalten"; } }, { key: "gebucht", get label() { return lookupLabel('dienstleister', 'status', "gebucht") ?? "Gebucht"; } }, { key: "abgesagt", get label() { return lookupLabel('dienstleister', 'status', "abgesagt") ?? "Abgesagt"; } }],
  },
  'aufgaben': {
    kategorie: [{ key: "organisation", get label() { return lookupLabel('aufgaben', 'kategorie', "organisation") ?? "Organisation"; } }, { key: "einladungen", get label() { return lookupLabel('aufgaben', 'kategorie', "einladungen") ?? "Einladungen"; } }, { key: "dekoration", get label() { return lookupLabel('aufgaben', 'kategorie', "dekoration") ?? "Dekoration"; } }, { key: "kleidung", get label() { return lookupLabel('aufgaben', 'kategorie', "kleidung") ?? "Kleidung"; } }, { key: "verpflegung", get label() { return lookupLabel('aufgaben', 'kategorie', "verpflegung") ?? "Verpflegung"; } }, { key: "sonstiges", get label() { return lookupLabel('aufgaben', 'kategorie', "sonstiges") ?? "Sonstiges"; } }],
    prioritaet: [{ key: "niedrig", get label() { return lookupLabel('aufgaben', 'prioritaet', "niedrig") ?? "Niedrig"; } }, { key: "mittel", get label() { return lookupLabel('aufgaben', 'prioritaet', "mittel") ?? "Mittel"; } }, { key: "hoch", get label() { return lookupLabel('aufgaben', 'prioritaet', "hoch") ?? "Hoch"; } }],
    status: [{ key: "offen", get label() { return lookupLabel('aufgaben', 'status', "offen") ?? "Offen"; } }, { key: "in_arbeit", get label() { return lookupLabel('aufgaben', 'status', "in_arbeit") ?? "In Arbeit"; } }, { key: "erledigt", get label() { return lookupLabel('aufgaben', 'status', "erledigt") ?? "Erledigt"; } }],
  },
  'budget': {
    kategorie: [{ key: "location", get label() { return lookupLabel('budget', 'kategorie', "location") ?? "Location"; } }, { key: "catering", get label() { return lookupLabel('budget', 'kategorie', "catering") ?? "Catering"; } }, { key: "kleidung", get label() { return lookupLabel('budget', 'kategorie', "kleidung") ?? "Kleidung"; } }, { key: "dekoration", get label() { return lookupLabel('budget', 'kategorie', "dekoration") ?? "Dekoration"; } }, { key: "fotograf", get label() { return lookupLabel('budget', 'kategorie', "fotograf") ?? "Fotograf"; } }, { key: "musik", get label() { return lookupLabel('budget', 'kategorie', "musik") ?? "Musik"; } }, { key: "sonstiges", get label() { return lookupLabel('budget', 'kategorie', "sonstiges") ?? "Sonstiges"; } }],
    zahlungsstatus: [{ key: "offen", get label() { return lookupLabel('budget', 'zahlungsstatus', "offen") ?? "Offen"; } }, { key: "teilweise_bezahlt", get label() { return lookupLabel('budget', 'zahlungsstatus', "teilweise_bezahlt") ?? "Teilweise bezahlt"; } }, { key: "bezahlt", get label() { return lookupLabel('budget', 'zahlungsstatus', "bezahlt") ?? "Bezahlt"; } }],
  },
  'fotogalerie': {
    anlass: [{ key: "vorbereitung", get label() { return lookupLabel('fotogalerie', 'anlass', "vorbereitung") ?? "Vorbereitung"; } }, { key: "trauung", get label() { return lookupLabel('fotogalerie', 'anlass', "trauung") ?? "Trauung"; } }, { key: "feier", get label() { return lookupLabel('fotogalerie', 'anlass', "feier") ?? "Feier"; } }, { key: "sonstiges", get label() { return lookupLabel('fotogalerie', 'anlass', "sonstiges") ?? "Sonstiges"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'tische': {
    'tischname': 'string/text',
    'tischnummer': 'number',
    'anzahl_plaetze': 'number',
    'standort': 'string/text',
    'bemerkung': 'string/textarea',
  },
  'gaeste_und_einladungen': {
    'gast_firstname': 'string/text',
    'gast_lastname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'strasse': 'string/text',
    'hausnummer': 'string/text',
    'plz': 'string/text',
    'ort': 'string/text',
    'seite': 'lookup/radio',
    'anzahl_personen': 'number',
    'einladungsstatus': 'lookup/select',
    'einladungsdatum': 'date/date',
    'rueckmeldedatum': 'date/date',
    'menuewunsch': 'lookup/select',
    'allergien': 'string/textarea',
    'tisch': 'applookup/select',
    'bemerkung': 'string/textarea',
  },
  'dienstleister': {
    'firmenname': 'string/text',
    'kategorie': 'lookup/select',
    'ansprechpartner_firstname': 'string/text',
    'ansprechpartner_lastname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'website': 'string/url',
    'status': 'lookup/select',
    'notizen': 'string/textarea',
  },
  'aufgaben': {
    'titel': 'string/text',
    'beschreibung': 'string/textarea',
    'kategorie': 'lookup/select',
    'faelligkeitsdatum': 'date/date',
    'prioritaet': 'lookup/radio',
    'status': 'lookup/select',
    'verantwortlich_firstname': 'string/text',
    'verantwortlich_lastname': 'string/text',
    'dienstleister': 'applookup/select',
  },
  'budget': {
    'bezeichnung': 'string/text',
    'kategorie': 'lookup/select',
    'geplanter_betrag': 'number',
    'tatsaechlicher_betrag': 'number',
    'zahlungsstatus': 'lookup/radio',
    'zahlungsdatum': 'date/date',
    'dienstleister': 'applookup/select',
  },
  'fotogalerie': {
    'titel': 'string/text',
    'foto': 'file',
    'beschreibung': 'string/textarea',
    'aufnahmedatum': 'date/date',
    'anlass': 'lookup/select',
    'gast': 'applookup/select',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateTische = StripLookup<Tische['fields']>;
export type CreateGaesteUndEinladungen = StripLookup<GaesteUndEinladungen['fields']>;
export type CreateDienstleister = StripLookup<Dienstleister['fields']>;
export type CreateAufgaben = StripLookup<Aufgaben['fields']>;
export type CreateBudget = StripLookup<Budget['fields']>;
export type CreateFotogalerie = StripLookup<Fotogalerie['fields']>;