import type { EnrichedAufgaben, EnrichedBudget, EnrichedFotogalerie, EnrichedGaesteUndEinladungen } from '@/types/enriched';
import type { Aufgaben, Budget, Dienstleister, Fotogalerie, GaesteUndEinladungen, Tische } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface GaesteUndEinladungenMaps {
  tischeMap: Map<string, Tische>;
}

export function enrichGaesteUndEinladungen(
  gaesteUndEinladungen: GaesteUndEinladungen[],
  maps: GaesteUndEinladungenMaps
): EnrichedGaesteUndEinladungen[] {
  return gaesteUndEinladungen.map(r => ({
    ...r,
    tischName: resolveDisplay(r.fields.tisch, maps.tischeMap, 'tischname'),
  }));
}

interface AufgabenMaps {
  dienstleisterMap: Map<string, Dienstleister>;
}

export function enrichAufgaben(
  aufgaben: Aufgaben[],
  maps: AufgabenMaps
): EnrichedAufgaben[] {
  return aufgaben.map(r => ({
    ...r,
    dienstleisterName: resolveDisplay(r.fields.dienstleister, maps.dienstleisterMap, 'firmenname'),
  }));
}

interface BudgetMaps {
  dienstleisterMap: Map<string, Dienstleister>;
}

export function enrichBudget(
  budget: Budget[],
  maps: BudgetMaps
): EnrichedBudget[] {
  return budget.map(r => ({
    ...r,
    dienstleisterName: resolveDisplay(r.fields.dienstleister, maps.dienstleisterMap, 'firmenname'),
  }));
}

interface FotogalerieMaps {
  gaesteUndEinladungenMap: Map<string, GaesteUndEinladungen>;
}

export function enrichFotogalerie(
  fotogalerie: Fotogalerie[],
  maps: FotogalerieMaps
): EnrichedFotogalerie[] {
  return fotogalerie.map(r => ({
    ...r,
    gastName: resolveDisplay(r.fields.gast, maps.gaesteUndEinladungenMap, 'gast_firstname'),
  }));
}
