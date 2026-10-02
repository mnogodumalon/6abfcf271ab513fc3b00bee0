/**
 * EntityCrud — pre-generated CRUD + overlay plumbing for the dashboard.
 * Compose it; NEVER re-roll dialog state, submit handlers, an overlay stack
 * or a RecordOverlayHost in the page — this file owns all of it.
 *
 * API at a glance:
 *   const data = useDashboardData();
 *   const crud = useEntityCrud(data, {
 *     // optional — the ONE semantic slot on the overlay: the record's next
 *     // workflow step. Return undefined for types without one.
 *     footer: (top) => top.type === 'tische'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` is the SAME camelCase key as `crud.<entity>` — one spelling
 *   per entity, everywhere in this API.
 *   …
 *   crud.tische.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.tische.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.tische.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   crud.enriched.tische              // the display-ready array for EVERY entity —
 *                                       // Enriched* where relations exist, the raw array
 *                                       // otherwise. Reuse these; never call enrich*()
 *                                       // in the page, and never guess which entity has
 *                                       // one: they all do.
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled; list-field back-references additionally get a
 * "choose existing" picker that links an EXISTING record — built in, do not
 * re-roll). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   tische: tischname, tischnummer, anzahl_plaetze, standort, bemerkung  ·  ← gaeste_und_einladungen (list + contextual +)
 *   gaeste_und_einladungen: gast_firstname, gast_lastname, email, telefon, strasse, hausnummer, plz, ort, …  ·  → tische · ← fotogalerie (list + contextual +)
 *   dienstleister: firmenname, kategorie, ansprechpartner_firstname, ansprechpartner_lastname, email, telefon, website, status, …  ·  ← aufgaben (list + contextual +) · ← budget (list + contextual +)
 *   aufgaben: titel, beschreibung, kategorie, faelligkeitsdatum, prioritaet, status, verantwortlich_firstname, verantwortlich_lastname, …  ·  → dienstleister
 *   budget: bezeichnung, kategorie, geplanter_betrag, tatsaechlicher_betrag, zahlungsstatus, zahlungsdatum, dienstleister  ·  → dienstleister
 *   fotogalerie: titel, foto, beschreibung, aufnahmedatum, anlass, gast  ·  → gaeste_und_einladungen
 */
import { useState, useMemo, type ReactNode } from 'react';
import type { Tische, GaesteUndEinladungen, Dienstleister, Aufgaben, Budget, Fotogalerie } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { enrichGaesteUndEinladungen, enrichAufgaben, enrichBudget, enrichFotogalerie } from '@/lib/enrich';
import type { EnrichedGaesteUndEinladungen, EnrichedAufgaben, EnrichedBudget, EnrichedFotogalerie } from '@/types/enriched';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { TischeDialog, type TischeDialogDefaults } from '@/components/dialogs/TischeDialog';
import { TischeDetails } from '@/components/details/TischeDetails';
import { GaesteUndEinladungenDialog, type GaesteUndEinladungenDialogDefaults } from '@/components/dialogs/GaesteUndEinladungenDialog';
import { GaesteUndEinladungenDetails } from '@/components/details/GaesteUndEinladungenDetails';
import { DienstleisterDialog, type DienstleisterDialogDefaults } from '@/components/dialogs/DienstleisterDialog';
import { DienstleisterDetails } from '@/components/details/DienstleisterDetails';
import { AufgabenDialog, type AufgabenDialogDefaults } from '@/components/dialogs/AufgabenDialog';
import { AufgabenDetails } from '@/components/details/AufgabenDetails';
import { BudgetDialog, type BudgetDialogDefaults } from '@/components/dialogs/BudgetDialog';
import { BudgetDetails } from '@/components/details/BudgetDetails';
import { FotogalerieDialog, type FotogalerieDialogDefaults } from '@/components/dialogs/FotogalerieDialog';
import { FotogalerieDetails } from '@/components/details/FotogalerieDetails';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';
import { formatDate } from '@/lib/formatters';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'tische'; record: Tische }
  | { type: 'gaesteUndEinladungen'; record: EnrichedGaesteUndEinladungen }
  | { type: 'dienstleister'; record: Dienstleister }
  | { type: 'aufgaben'; record: EnrichedAufgaben }
  | { type: 'budget'; record: EnrichedBudget }
  | { type: 'fotogalerie'; record: EnrichedFotogalerie };

/** The useDashboardData() return — pass it in, never re-fetch inside. */
export type EntityCrudData = ReturnType<typeof useDashboardData>;

export interface EntityCrudOptions {
  /** Per-type overlay footer — the record's next workflow step. */
  footer?: (top: OverlayItem) => ReactNode | { label: ReactNode; onClick: () => void } | undefined;
  placement?: 'side' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface EntityCrudApi<TRecord, TDefaults> {
  /** Open the create dialog, optionally prefilled (shape-tolerant defaults). */
  openCreate: (defaults?: TDefaults) => void;
  /** Open the edit dialog for a record (recordId + defaults are wired). */
  openEdit: (record: TRecord) => void;
  /** Open the record overlay (raw record is fine — enrichment resolved inside). */
  openDetail: (record: TRecord) => void;
}

export interface EntityCrud {
  /** The overlay stack for drills: push / pop / replace / close. */
  overlay: RecordOverlayStack<OverlayItem>;
  /** Render ONCE at the end of the page JSX — all dialogs + the overlay host. */
  surfaces: ReactNode;
  tische: EntityCrudApi<Tische, TischeDialogDefaults>;
  gaesteUndEinladungen: EntityCrudApi<GaesteUndEinladungen, GaesteUndEinladungenDialogDefaults>;
  dienstleister: EntityCrudApi<Dienstleister, DienstleisterDialogDefaults>;
  aufgaben: EntityCrudApi<Aufgaben, AufgabenDialogDefaults>;
  budget: EntityCrudApi<Budget, BudgetDialogDefaults>;
  fotogalerie: EntityCrudApi<Fotogalerie, FotogalerieDialogDefaults>;
  /** The display-ready array per entity: Enriched* where an enrich function
   *  exists, the raw array otherwise. One key per entity so no page has to
   *  know which is which. Reuse these; never re-enrich in the page. */
  enriched: { tische: Tische[]; gaesteUndEinladungen: EnrichedGaesteUndEinladungen[]; dienstleister: Dienstleister[]; aufgaben: EnrichedAufgaben[]; budget: EnrichedBudget[]; fotogalerie: EnrichedFotogalerie[] };
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  const [tischeDialog, setTischeDialog] = useState<{ defaults?: TischeDialogDefaults; editing?: Tische } | null>(null);
  const [gaesteUndEinladungenDialog, setGaesteUndEinladungenDialog] = useState<{ defaults?: GaesteUndEinladungenDialogDefaults; editing?: GaesteUndEinladungen } | null>(null);
  const [dienstleisterDialog, setDienstleisterDialog] = useState<{ defaults?: DienstleisterDialogDefaults; editing?: Dienstleister } | null>(null);
  const [aufgabenDialog, setAufgabenDialog] = useState<{ defaults?: AufgabenDialogDefaults; editing?: Aufgaben } | null>(null);
  const [budgetDialog, setBudgetDialog] = useState<{ defaults?: BudgetDialogDefaults; editing?: Budget } | null>(null);
  const [fotogalerieDialog, setFotogalerieDialog] = useState<{ defaults?: FotogalerieDialogDefaults; editing?: Fotogalerie } | null>(null);
  const enrichedGaesteUndEinladungen = useMemo(() => enrichGaesteUndEinladungen(data.gaesteUndEinladungen, { tischeMap: data.tischeMap }), [data.gaesteUndEinladungen, data.tischeMap]);
  const enrichedAufgaben = useMemo(() => enrichAufgaben(data.aufgaben, { dienstleisterMap: data.dienstleisterMap }), [data.aufgaben, data.dienstleisterMap]);
  const enrichedBudget = useMemo(() => enrichBudget(data.budget, { dienstleisterMap: data.dienstleisterMap }), [data.budget, data.dienstleisterMap]);
  const enrichedFotogalerie = useMemo(() => enrichFotogalerie(data.fotogalerie, { gaesteUndEinladungenMap: data.gaesteUndEinladungenMap }), [data.fotogalerie, data.gaesteUndEinladungenMap]);

  function detailTische(record: Tische, push = false) {
    const item: OverlayItem = { type: 'tische', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitTische(fields: Tische['fields']) {
    const editing = tischeDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setTische(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateTischeEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('tische')} — ${t('crud_updated')}`, async () => {
        data.setTische(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateTischeEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createTischeEntry(fields);
      undoToast(`${appLabel('tische')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailGaesteUndEinladungen(record: GaesteUndEinladungen, push = false) {
    const rec = enrichedGaesteUndEinladungen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'gaesteUndEinladungen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitGaesteUndEinladungen(fields: GaesteUndEinladungen['fields']) {
    const editing = gaesteUndEinladungenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setGaesteUndEinladungen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateGaesteUndEinladungenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('gaeste_und_einladungen')} — ${t('crud_updated')}`, async () => {
        data.setGaesteUndEinladungen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateGaesteUndEinladungenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createGaesteUndEinladungenEntry(fields);
      undoToast(`${appLabel('gaeste_und_einladungen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailDienstleister(record: Dienstleister, push = false) {
    const item: OverlayItem = { type: 'dienstleister', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitDienstleister(fields: Dienstleister['fields']) {
    const editing = dienstleisterDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setDienstleister(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateDienstleisterEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('dienstleister')} — ${t('crud_updated')}`, async () => {
        data.setDienstleister(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateDienstleisterEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createDienstleisterEntry(fields);
      undoToast(`${appLabel('dienstleister')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailAufgaben(record: Aufgaben, push = false) {
    const rec = enrichedAufgaben.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'aufgaben', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitAufgaben(fields: Aufgaben['fields']) {
    const editing = aufgabenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setAufgaben(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateAufgabenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('aufgaben')} — ${t('crud_updated')}`, async () => {
        data.setAufgaben(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateAufgabenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createAufgabenEntry(fields);
      undoToast(`${appLabel('aufgaben')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailBudget(record: Budget, push = false) {
    const rec = enrichedBudget.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'budget', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitBudget(fields: Budget['fields']) {
    const editing = budgetDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setBudget(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateBudgetEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('budget')} — ${t('crud_updated')}`, async () => {
        data.setBudget(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateBudgetEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createBudgetEntry(fields);
      undoToast(`${appLabel('budget')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailFotogalerie(record: Fotogalerie, push = false) {
    const rec = enrichedFotogalerie.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'fotogalerie', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitFotogalerie(fields: Fotogalerie['fields']) {
    const editing = fotogalerieDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setFotogalerie(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateFotogalerieEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('fotogalerie')} — ${t('crud_updated')}`, async () => {
        data.setFotogalerie(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateFotogalerieEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createFotogalerieEntry(fields);
      undoToast(`${appLabel('fotogalerie')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <TischeDialog
        open={tischeDialog !== null}
        onClose={() => setTischeDialog(null)}
        onSubmit={submitTische}
        defaultValues={tischeDialog?.defaults}
        recordId={tischeDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Tische']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Tische']}
      />
      <GaesteUndEinladungenDialog
        open={gaesteUndEinladungenDialog !== null}
        onClose={() => setGaesteUndEinladungenDialog(null)}
        onSubmit={submitGaesteUndEinladungen}
        defaultValues={gaesteUndEinladungenDialog?.defaults}
        recordId={gaesteUndEinladungenDialog?.editing?.record_id}
        tischeList={data.tische}
        enablePhotoScan={AI_PHOTO_SCAN['GaesteUndEinladungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['GaesteUndEinladungen']}
      />
      <DienstleisterDialog
        open={dienstleisterDialog !== null}
        onClose={() => setDienstleisterDialog(null)}
        onSubmit={submitDienstleister}
        defaultValues={dienstleisterDialog?.defaults}
        recordId={dienstleisterDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Dienstleister']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Dienstleister']}
      />
      <AufgabenDialog
        open={aufgabenDialog !== null}
        onClose={() => setAufgabenDialog(null)}
        onSubmit={submitAufgaben}
        defaultValues={aufgabenDialog?.defaults}
        recordId={aufgabenDialog?.editing?.record_id}
        dienstleisterList={data.dienstleister}
        enablePhotoScan={AI_PHOTO_SCAN['Aufgaben']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Aufgaben']}
      />
      <BudgetDialog
        open={budgetDialog !== null}
        onClose={() => setBudgetDialog(null)}
        onSubmit={submitBudget}
        defaultValues={budgetDialog?.defaults}
        recordId={budgetDialog?.editing?.record_id}
        dienstleisterList={data.dienstleister}
        enablePhotoScan={AI_PHOTO_SCAN['Budget']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Budget']}
      />
      <FotogalerieDialog
        open={fotogalerieDialog !== null}
        onClose={() => setFotogalerieDialog(null)}
        onSubmit={submitFotogalerie}
        defaultValues={fotogalerieDialog?.defaults}
        recordId={fotogalerieDialog?.editing?.record_id}
        gaesteUndEinladungenList={data.gaesteUndEinladungen}
        enablePhotoScan={AI_PHOTO_SCAN['Fotogalerie']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Fotogalerie']}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'tische') {
            return (
              <>
                <RecordHeader title={top.record.fields.tischname ?? appLabel('tische')} subtitle={undefined} />
                <TischeDetails
                  record={top.record}
                  gaesteUndEinladungenList={data.gaesteUndEinladungen}
                  onOpenGaesteUndEinladungen={(r) => detailGaesteUndEinladungen(r, true)}
                  onAddGaesteUndEinladungen={() => setGaesteUndEinladungenDialog({ defaults: { tisch: createRecordUrl(APP_IDS.TISCHE, top.record.record_id) } })}
                />
              </>
            );
          }
          if (top.type === 'gaesteUndEinladungen') {
            return (
              <>
                <RecordHeader title={top.record.fields.gast_firstname ?? appLabel('gaeste_und_einladungen')} subtitle={top.record.fields.einladungsdatum ? formatDate(top.record.fields.einladungsdatum) : undefined} />
                <GaesteUndEinladungenDetails
                  record={top.record}
                  tischeList={data.tische}
                  onOpenTische={(r) => detailTische(r, true)}
                  fotogalerieList={data.fotogalerie}
                  onOpenFotogalerie={(r) => detailFotogalerie(r, true)}
                  onAddFotogalerie={() => setFotogalerieDialog({ defaults: { gast: createRecordUrl(APP_IDS.GAESTE_UND_EINLADUNGEN, top.record.record_id) } })}
                />
              </>
            );
          }
          if (top.type === 'dienstleister') {
            return (
              <>
                <RecordHeader title={top.record.fields.firmenname ?? appLabel('dienstleister')} subtitle={undefined} />
                <DienstleisterDetails
                  record={top.record}
                  aufgabenList={data.aufgaben}
                  onOpenAufgaben={(r) => detailAufgaben(r, true)}
                  onAddAufgaben={() => setAufgabenDialog({ defaults: { dienstleister: createRecordUrl(APP_IDS.DIENSTLEISTER, top.record.record_id) } })}
                  budgetList={data.budget}
                  onOpenBudget={(r) => detailBudget(r, true)}
                  onAddBudget={() => setBudgetDialog({ defaults: { dienstleister: createRecordUrl(APP_IDS.DIENSTLEISTER, top.record.record_id) } })}
                />
              </>
            );
          }
          if (top.type === 'aufgaben') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('aufgaben')} subtitle={top.record.fields.faelligkeitsdatum ? formatDate(top.record.fields.faelligkeitsdatum) : undefined} />
                <AufgabenDetails
                  record={top.record}
                  dienstleisterList={data.dienstleister}
                  onOpenDienstleister={(r) => detailDienstleister(r, true)}
                />
              </>
            );
          }
          if (top.type === 'budget') {
            return (
              <>
                <RecordHeader title={top.record.fields.bezeichnung ?? appLabel('budget')} subtitle={top.record.fields.zahlungsdatum ? formatDate(top.record.fields.zahlungsdatum) : undefined} />
                <BudgetDetails
                  record={top.record}
                  dienstleisterList={data.dienstleister}
                  onOpenDienstleister={(r) => detailDienstleister(r, true)}
                />
              </>
            );
          }
          if (top.type === 'fotogalerie') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('fotogalerie')} subtitle={top.record.fields.aufnahmedatum ? formatDate(top.record.fields.aufnahmedatum) : undefined} />
                <FotogalerieDetails
                  record={top.record}
                  gaesteUndEinladungenList={data.gaesteUndEinladungen}
                  onOpenGaesteUndEinladungen={(r) => detailGaesteUndEinladungen(r, true)}
                />
              </>
            );
          }
          return null;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'tische') setTischeDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'gaesteUndEinladungen') setGaesteUndEinladungenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'dienstleister') setDienstleisterDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'aufgaben') setAufgabenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'budget') setBudgetDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'fotogalerie') setFotogalerieDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    tische: {
      openCreate: (defaults?: TischeDialogDefaults) => setTischeDialog({ defaults }),
      openEdit: (record: Tische) => setTischeDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Tische) => detailTische(record, false),
    },
    gaesteUndEinladungen: {
      openCreate: (defaults?: GaesteUndEinladungenDialogDefaults) => setGaesteUndEinladungenDialog({ defaults }),
      openEdit: (record: GaesteUndEinladungen) => setGaesteUndEinladungenDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: GaesteUndEinladungen) => detailGaesteUndEinladungen(record, false),
    },
    dienstleister: {
      openCreate: (defaults?: DienstleisterDialogDefaults) => setDienstleisterDialog({ defaults }),
      openEdit: (record: Dienstleister) => setDienstleisterDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Dienstleister) => detailDienstleister(record, false),
    },
    aufgaben: {
      openCreate: (defaults?: AufgabenDialogDefaults) => setAufgabenDialog({ defaults }),
      openEdit: (record: Aufgaben) => setAufgabenDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Aufgaben) => detailAufgaben(record, false),
    },
    budget: {
      openCreate: (defaults?: BudgetDialogDefaults) => setBudgetDialog({ defaults }),
      openEdit: (record: Budget) => setBudgetDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Budget) => detailBudget(record, false),
    },
    fotogalerie: {
      openCreate: (defaults?: FotogalerieDialogDefaults) => setFotogalerieDialog({ defaults }),
      openEdit: (record: Fotogalerie) => setFotogalerieDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Fotogalerie) => detailFotogalerie(record, false),
    },
    enriched: { tische: data.tische, gaesteUndEinladungen: enrichedGaesteUndEinladungen, dienstleister: data.dienstleister, aufgaben: enrichedAufgaben, budget: enrichedBudget, fotogalerie: enrichedFotogalerie },
  };
}
