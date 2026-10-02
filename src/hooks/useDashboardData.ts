import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Tische, GaesteUndEinladungen, Dienstleister, Aufgaben, Budget, Fotogalerie } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { t } from '@/i18n';

/** Dashboard data + the OPTIMISTIC-WRITE API.
 *
 *  The per-entity setters (`set<Entity>`) are exported for exactly one job:
 *  optimistic updates on drag writes (onEventDrop / onEventResize /
 *  onCardMove). Call the setter FIRST — the bar/card lands instantly — then
 *  fire the PATCH in the background and call `fetchAll()` ONLY in the catch.
 *  Never await the PATCH before updating state (the UI freezes for the full
 *  round-trip on every drag) and never refetch after a successful write.
 *  There is no other mechanism (no `__optimistic`, no `mutate`).
 */
/** Entities this hook can load — the same keys the journey layer uses. */
export type DashboardEntity = 'tische' | 'gaeste_und_einladungen' | 'dienstleister' | 'aufgaben' | 'budget' | 'fotogalerie';

export interface DashboardDataOptions {
  /** Entities this page does NOT need (picked through useRecordSearch instead).
   *  Every flow page mounts this hook on its own route, so without `omit` a
   *  page that searches 3.000 guests server-side would still pull all 3.000
   *  through the side door. */
  omit?: DashboardEntity[];
}

export function useDashboardData(options: DashboardDataOptions = {}) {
  // A string key, not the array: an inline `omit={['gaeste']}` is a new array
  // on every render and would restart the fetch forever.
  const omitKey = (options.omit ?? []).slice().sort().join('|');
  const [tische, setTische] = useState<Tische[]>([]);
  const [gaesteUndEinladungen, setGaesteUndEinladungen] = useState<GaesteUndEinladungen[]>([]);
  const [dienstleister, setDienstleister] = useState<Dienstleister[]>([]);
  const [aufgaben, setAufgaben] = useState<Aufgaben[]>([]);
  const [budget, setBudget] = useState<Budget[]>([]);
  const [fotogalerie, setFotogalerie] = useState<Fotogalerie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    const omit = new Set(omitKey ? omitKey.split('|') : []);
    try {
      const [tischeData, gaesteUndEinladungenData, dienstleisterData, aufgabenData, budgetData, fotogalerieData] = await Promise.all([
        omit.has('tische') ? Promise.resolve([] as Tische[]) : LivingAppsService.getTische(),
        omit.has('gaeste_und_einladungen') ? Promise.resolve([] as GaesteUndEinladungen[]) : LivingAppsService.getGaesteUndEinladungen(),
        omit.has('dienstleister') ? Promise.resolve([] as Dienstleister[]) : LivingAppsService.getDienstleister(),
        omit.has('aufgaben') ? Promise.resolve([] as Aufgaben[]) : LivingAppsService.getAufgaben(),
        omit.has('budget') ? Promise.resolve([] as Budget[]) : LivingAppsService.getBudget(),
        omit.has('fotogalerie') ? Promise.resolve([] as Fotogalerie[]) : LivingAppsService.getFotogalerie(),
      ]);
      setTische(tischeData);
      setGaesteUndEinladungen(gaesteUndEinladungenData);
      setDienstleister(dienstleisterData);
      setAufgaben(aufgabenData);
      setBudget(budgetData);
      setFotogalerie(fotogalerieData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(t('data_load_failed')));
    } finally {
      setLoading(false);
    }
  }, [omitKey]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    const omit = new Set(omitKey ? omitKey.split('|') : []);
    async function silentRefresh() {
      try {
        const [tischeData, gaesteUndEinladungenData, dienstleisterData, aufgabenData, budgetData, fotogalerieData] = await Promise.all([
          omit.has('tische') ? Promise.resolve([] as Tische[]) : LivingAppsService.getTische(),
          omit.has('gaeste_und_einladungen') ? Promise.resolve([] as GaesteUndEinladungen[]) : LivingAppsService.getGaesteUndEinladungen(),
          omit.has('dienstleister') ? Promise.resolve([] as Dienstleister[]) : LivingAppsService.getDienstleister(),
          omit.has('aufgaben') ? Promise.resolve([] as Aufgaben[]) : LivingAppsService.getAufgaben(),
          omit.has('budget') ? Promise.resolve([] as Budget[]) : LivingAppsService.getBudget(),
          omit.has('fotogalerie') ? Promise.resolve([] as Fotogalerie[]) : LivingAppsService.getFotogalerie(),
        ]);
        setTische(tischeData);
        setGaesteUndEinladungen(gaesteUndEinladungenData);
        setDienstleister(dienstleisterData);
        setAufgaben(aufgabenData);
        setBudget(budgetData);
        setFotogalerie(fotogalerieData);
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    // assistant:data-changed comes from the assistant (<la-klar-assistant>)
    // after every mutation. The element additionally fires the legacy
    // dashboard-refresh event for OLD deployed bundles — do NOT subscribe to
    // both here, or every mutation fetches twice.
    window.addEventListener('assistant:data-changed', handleRefresh);
    return () => window.removeEventListener('assistant:data-changed', handleRefresh);
  }, [omitKey]);

  const tischeMap = useMemo(() => {
    const m = new Map<string, Tische>();
    tische.forEach(r => m.set(r.record_id, r));
    return m;
  }, [tische]);

  const gaesteUndEinladungenMap = useMemo(() => {
    const m = new Map<string, GaesteUndEinladungen>();
    gaesteUndEinladungen.forEach(r => m.set(r.record_id, r));
    return m;
  }, [gaesteUndEinladungen]);

  const dienstleisterMap = useMemo(() => {
    const m = new Map<string, Dienstleister>();
    dienstleister.forEach(r => m.set(r.record_id, r));
    return m;
  }, [dienstleister]);

  return { tische, setTische, gaesteUndEinladungen, setGaesteUndEinladungen, dienstleister, setDienstleister, aufgaben, setAufgaben, budget, setBudget, fotogalerie, setFotogalerie, loading, error, fetchAll, tischeMap, gaesteUndEinladungenMap, dienstleisterMap };
}

/** The hook's return — the `data` prop of DashboardOverview in the Ready-Wrapper form. */
export type DashboardData = ReturnType<typeof useDashboardData>;