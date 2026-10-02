/**
 * Required-field messages — WRITTEN BY THE BUILD AGENT, never by a heuristic.
 *
 * The layer knows two things about an empty required field: that it is
 * required and what its label is. Out of that it can only say „„Anreise" ist
 * ein Pflichtfeld". What the person should do instead („Bitte einen Gast
 * auswählen.") is meaning, and meaning is the agent's: the Phase-2 orchestrator
 * writes one short instruction per required field — what is needed, not why — to
 * `.intents-staging/messages.json`, the integration step validates it against
 * the app metadata and renders it into the block below. Scaffold updates keep
 * the block. Do not edit outside the markers.
 *
 * Every door reads this and nothing else: `useStepForm` (flows and public
 * pages), the generated {Entity}Dialog and the public form's server-error line.
 * A field without a sentence falls back to the label sentence — never to a
 * bare „Dieses Feld ist erforderlich".
 *
 * Required fields per entity (from the base view):
 *   - tische: tischname (Tischname), anzahl_plaetze (Anzahl Plätze)
 *   - gaeste_und_einladungen: gast_firstname (Vorname), gast_lastname (Nachname), einladungsstatus (Einladungsstatus)
 *   - dienstleister: firmenname (Firmenname), kategorie (Kategorie)
 *   - aufgaben: titel (Titel), status (Status)
 *   - budget: bezeichnung (Bezeichnung)
 *   - fotogalerie: titel (Titel)
 */
import { t, tx } from '@/i18n';
import { labelOf, type EntityKey } from './rules';

/** The writable fields of each entity — the keys a message may address (generated). */
export interface MessageFields {
  "tische": "tischname" | "tischnummer" | "anzahl_plaetze" | "standort" | "bemerkung";
  "gaeste_und_einladungen": "gast_firstname" | "gast_lastname" | "email" | "telefon" | "strasse" | "hausnummer" | "plz" | "ort" | "seite" | "anzahl_personen" | "einladungsstatus" | "einladungsdatum" | "rueckmeldedatum" | "menuewunsch" | "allergien" | "tisch" | "bemerkung";
  "dienstleister": "firmenname" | "kategorie" | "ansprechpartner_firstname" | "ansprechpartner_lastname" | "email" | "telefon" | "website" | "status" | "notizen";
  "aufgaben": "titel" | "beschreibung" | "kategorie" | "faelligkeitsdatum" | "prioritaet" | "status" | "verantwortlich_firstname" | "verantwortlich_lastname" | "dienstleister";
  "budget": "bezeichnung" | "kategorie" | "geplanter_betrag" | "tatsaechlicher_betrag" | "zahlungsstatus" | "zahlungsdatum" | "dienstleister";
  "fotogalerie": "titel" | "beschreibung" | "aufnahmedatum" | "anlass" | "gast";
}
export type MessageFieldKey<E extends EntityKey> = E extends keyof MessageFields ? MessageFields[E] : never;

export const REQUIRED_MESSAGES: { [E in EntityKey]?: Partial<Record<MessageFieldKey<E>, string>> } = {
  // <custom:messages>
  tische: { tischname: "Bitte den Tischnamen eingeben.", anzahl_plaetze: "Bitte die Anzahl der Plätze eingeben." },
  gaeste_und_einladungen: { gast_firstname: "Bitte den Vornamen eingeben.", gast_lastname: "Bitte den Nachnamen eingeben.", einladungsstatus: "Bitte den Einladungsstatus wählen." },
  dienstleister: { firmenname: "Bitte den Firmennamen eingeben.", kategorie: "Bitte eine Kategorie wählen." },
  aufgaben: { titel: "Bitte einen Titel eingeben.", status: "Bitte einen Status wählen." },
  budget: { bezeichnung: "Bitte eine Bezeichnung eingeben." },
  fotogalerie: { titel: "Bitte einen Titel eingeben." },
  // </custom:messages>
};

/** The sentence shown when `key` of `entity` is required and empty — the
 *  agent's own text (translated at runtime like every page string), else the
 *  label sentence. Call it while rendering, not at module scope. */
export function requiredMessage(entity: EntityKey, key: string): string {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  if (own && own.trim()) return tx(own);
  return t('v_required', { label: labelOf(entity, key) });
}

/** True when the agent wrote a sentence for the field. */
export function hasOwnMessage(entity: EntityKey, key: string): boolean {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  return Boolean(own && own.trim());
}
