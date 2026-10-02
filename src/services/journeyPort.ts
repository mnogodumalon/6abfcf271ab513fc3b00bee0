/**
 * The INTERNAL door of the journey port — authenticated, via LivingAppsService.
 * GENERATED: one lister and one creator per entity. Do not edit.
 *
 *   import { servicePort } from '@/services/journeyPort';
 *
 * Intent pages hand this to `useJourneySubmit` and to shared step blocks. It
 * exposes only list · create · ref — the public subset — so a step written
 * against it also runs on a public page. Undo, edit and delete stay on the
 * page itself (LivingAppsService), never inside a shared step.
 */
import { LivingAppsService, createRecordUrl, type RecordQuery } from '@/services/livingAppsService';
import { toWirePayload, type InternalJourneyPort, type JourneyRecord } from '@/lib/journey/port';
import { buildSearchFilter, byIdFilter, combineFilters } from '@/lib/journey/search';
import type { EntityKey } from '@/lib/journey/rules';

type RawRecord = { record_id: string; fields: Record<string, unknown>; createdat?: string | null };
type RawMutation = { record_id: string; fields?: Record<string, unknown>; created_at?: string | null };

const listers: Record<EntityKey, () => Promise<RawRecord[]>> = {
  'tische': () => LivingAppsService.getTische() as Promise<RawRecord[]>,
  'gaeste_und_einladungen': () => LivingAppsService.getGaesteUndEinladungen() as Promise<RawRecord[]>,
  'dienstleister': () => LivingAppsService.getDienstleister() as Promise<RawRecord[]>,
  'aufgaben': () => LivingAppsService.getAufgaben() as Promise<RawRecord[]>,
  'budget': () => LivingAppsService.getBudget() as Promise<RawRecord[]>,
  'fotogalerie': () => LivingAppsService.getFotogalerie() as Promise<RawRecord[]>,
};

/** The query/count half — the REST parameters the plain listers never send. */
const queriers: Record<EntityKey, (q: RecordQuery) => Promise<RawRecord[]>> = {
  'tische': q => LivingAppsService.queryTische(q) as Promise<RawRecord[]>,
  'gaeste_und_einladungen': q => LivingAppsService.queryGaesteUndEinladungen(q) as Promise<RawRecord[]>,
  'dienstleister': q => LivingAppsService.queryDienstleister(q) as Promise<RawRecord[]>,
  'aufgaben': q => LivingAppsService.queryAufgaben(q) as Promise<RawRecord[]>,
  'budget': q => LivingAppsService.queryBudget(q) as Promise<RawRecord[]>,
  'fotogalerie': q => LivingAppsService.queryFotogalerie(q) as Promise<RawRecord[]>,
};

const counters: Record<EntityKey, (filter?: string, signal?: AbortSignal) => Promise<number>> = {
  'tische': (filter, signal) => LivingAppsService.countTische(filter, signal),
  'gaeste_und_einladungen': (filter, signal) => LivingAppsService.countGaesteUndEinladungen(filter, signal),
  'dienstleister': (filter, signal) => LivingAppsService.countDienstleister(filter, signal),
  'aufgaben': (filter, signal) => LivingAppsService.countAufgaben(filter, signal),
  'budget': (filter, signal) => LivingAppsService.countBudget(filter, signal),
  'fotogalerie': (filter, signal) => LivingAppsService.countFotogalerie(filter, signal),
};

const creators: Record<EntityKey, (fields: Record<string, unknown>) => Promise<RawMutation>> = {
  'tische': fields => LivingAppsService.createTischeEntry(fields as never),
  'gaeste_und_einladungen': fields => LivingAppsService.createGaesteUndEinladungenEntry(fields as never),
  'dienstleister': fields => LivingAppsService.createDienstleisterEntry(fields as never),
  'aufgaben': fields => LivingAppsService.createAufgabenEntry(fields as never),
  'budget': fields => LivingAppsService.createBudgetEntry(fields as never),
  'fotogalerie': fields => LivingAppsService.createFotogalerieEntry(fields as never),
};

const updaters: Record<EntityKey, (id: string, fields: Record<string, unknown>) => Promise<RawMutation>> = {
  'tische': (id, fields) => LivingAppsService.updateTischeEntry(id, fields as never),
  'gaeste_und_einladungen': (id, fields) => LivingAppsService.updateGaesteUndEinladungenEntry(id, fields as never),
  'dienstleister': (id, fields) => LivingAppsService.updateDienstleisterEntry(id, fields as never),
  'aufgaben': (id, fields) => LivingAppsService.updateAufgabenEntry(id, fields as never),
  'budget': (id, fields) => LivingAppsService.updateBudgetEntry(id, fields as never),
  'fotogalerie': (id, fields) => LivingAppsService.updateFotogalerieEntry(id, fields as never),
};

function toJourneyRecord(r: RawRecord): JourneyRecord {
  return { id: r.record_id, fields: r.fields ?? {}, createdAt: r.createdat ?? null };
}

export const servicePort: InternalJourneyPort = {
  door: 'internal',
  async list(entity, opts) {
    // Only a bare list(entity) (or an empty options object) takes the historic
    // load-everything path. ANY explicit option — `limit` included — goes to the
    // server: useRecordSearch's first page of a big entity must not pull the
    // whole table (live 2026-09-02: all 263 employees travelled for a limit-50
    // first page because `limit` alone did not count as a query).
    const usesQuery = !!opts && (opts.search !== undefined || opts.offset !== undefined
      || opts.orderby !== undefined || opts.fields !== undefined || opts.signal !== undefined
      || opts.limit !== undefined || opts.filter !== undefined);
    if (!usesQuery) {
      const rows = await listers[entity]();
      const limited = opts?.limit ? rows.slice(0, opts.limit) : rows;
      return limited.map(toJourneyRecord);
    }
    const filter = combineFilters(opts.filter, opts.search ? buildSearchFilter(opts.search.query, opts.search.fields) : undefined);
    const rows = await queriers[entity]({
      filter, orderby: opts.orderby, limit: opts.limit, offset: opts.offset, fields: opts.fields, signal: opts.signal,
    });
    return rows.map(toJourneyRecord);
  },
  async count(entity, opts) {
    const filter = combineFilters(opts?.filter, opts?.search ? buildSearchFilter(opts.search.query, opts.search.fields) : undefined);
    return counters[entity](filter, opts?.signal);
  },
  async get(entity, id) {
    // One query on the server, not the whole table: `r.id` is the vSQL name
    // of the record id (a live page wrote `r.record_id` and got a 400).
    const rows = await queriers[entity]({ filter: byIdFilter(id), limit: 1 });
    return rows[0] ? toJourneyRecord(rows[0]) : null;
  },
  async create(entity, values) {
    const r = await creators[entity](toWirePayload(entity, values, servicePort));
    return { id: r.record_id, fields: r.fields ?? {}, createdAt: r.created_at ?? null };
  },
  // The same payload rules as create — plain ids in, references shaped here.
  async update(entity, id, values) {
    const r = await updaters[entity](id, toWirePayload(entity, values, servicePort));
    return { id: r.record_id || id, fields: r.fields ?? {}, createdAt: r.created_at ?? null };
  },
  ref: (appId, recordId) => createRecordUrl(appId, recordId),
};
