/**
 * Occupancy semantics — DECIDED BY THE BUILD AGENT, never by a heuristic.
 *
 * The Phase-2 orchestrator writes its decision to `.intents-staging/occupancy.json`
 * (stay pair, booked resource, statuses that do not occupy); the integration
 * step validates it against the app metadata and renders it into the block
 * below. Scaffold updates keep the block. Do not edit outside the markers.
 *
 * Both doors read this and nothing else: `occupancyFor` (internal flows AND
 * public pages) and the owner service (the public grant's occupancy read).
 * No rule for an entity = no availability calendar, no occupancy claim —
 * a plain date field pair is shown instead.
 *
 * Facts from the metadata — candidates, NOT decisions:
 *   - tische: no date pair, no references
 *   - gaeste_und_einladungen: applookups tisch→tische · lookups seite[braut|braeutigam|gemeinsam], einladungsstatus[zugesagt|abgesagt|nicht_eingeladen|eingeladen], menuewunsch[fleisch|fisch|vegetarisch|vegan|kindermenue]
 *   - dienstleister: lookups kategorie[location|catering|fotograf|musik|floristik|sonstiges], status[anfrage|angebot_erhalten|gebucht|abgesagt]
 *   - aufgaben: applookups dienstleister→dienstleister · lookups kategorie[organisation|einladungen|dekoration|kleidung|verpflegung|sonstiges], prioritaet[niedrig|mittel|hoch], status[offen|in_arbeit|erledigt]
 *   - budget: applookups dienstleister→dienstleister · lookups kategorie[location|catering|kleidung|dekoration|fotograf|musik|sonstiges], zahlungsstatus[offen|teilweise_bezahlt|bezahlt]
 *   - fotogalerie: applookups gast→gaeste_und_einladungen · lookups anlass[vorbereitung|trauung|feier|sonstiges]
 */
import type { EntityKey } from '@/lib/journey/rules';

export interface OccupancyRule {
  /** Arrival / departure fields (the departure day is exclusive). */
  from: string;
  to: string;
  /** applookup field naming the booked RESOURCE (room, vehicle, court).
   *  Omit when the entity itself is the one resource (a single holiday flat). */
  resource?: string;
  /** lookup field + the keys that mean "does NOT occupy" (cancelled, no-show). */
  statusField?: string;
  freeKeys?: string[];
}

export const OCCUPANCY: Partial<Record<EntityKey, OccupancyRule>> = {
  // <custom:occupancy>
  // </custom:occupancy>
};
