/**
 * useRueckmeldungErfassenFlow — the plumbing of the flow « Rückmeldung erfassen », generated from the plan.
 *
 * Changes `gaeste_und_einladungen`: the record to change is picked (`flow.pick('gaeste_und_einladungen')`), the form is prefilled with its values; asks `einladungsstatus`, `anzahl_personen`, `menuewunsch`, `allergien`; sets `rueckmeldedatum` itself.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 3)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useRueckmeldungErfassenFlow({
 *     steps: { gaeste_und_einladungen: 1, einladungsstatus: 2, anzahl_personen: 2, menuewunsch: 2, allergien: 2 },
 *     items: { gaeste_und_einladungen: r => ({ id: r.id, title: fieldText(r, 'gast_firstname') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.gaeste_und_einladungen.select} {...flow.pick('gaeste_und_einladungen')} />
 *     <Bound form={flow.forms.gaeste_und_einladungen} name="einladungsstatus" />
 *     <Bound form={flow.forms.gaeste_und_einladungen} name="anzahl_personen" />
 *     <Bound form={flow.forms.gaeste_und_einladungen} name="menuewunsch" />
 *     <Bound form={flow.forms.gaeste_und_einladungen} name="allergien" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import { useState } from 'react';
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
import { entityLabel } from '@/lib/journey/rules';
export type RueckmeldungErfassenFieldKey = 'allergien' | 'anzahl_personen' | 'einladungsstatus' | 'gaeste_und_einladungen' | 'menuewunsch';

export interface RueckmeldungErfassenForms {
  gaeste_und_einladungen: StepForm<'gaeste_und_einladungen'>;
}

// Alias so the option generics stay readable.
type Key = RueckmeldungErfassenFieldKey;

export interface RueckmeldungErfassenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    gaeste_und_einladungen?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"allergien": 2, "anzahl_personen": 2, "einladungsstatus": 2, "gaeste_und_einladungen": 1, "menuewunsch": 2};
export const RUECKMELDUNGERFASSEN_REVIEW_STEP = 3;

function fromPick<T>(pick: { recordOf(id: string): JourneyRecord | undefined }, form: StepForm, field: string, read: (r: JourneyRecord) => T): T | undefined {
  const id = form.get(field);
  const rec = typeof id === 'string' && id ? pick.recordOf(id) : undefined;
  return rec ? read(rec) : undefined;
}
function isoDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Returns T, not Partial<T>: a Record's index signature is already "maybe
// absent", and Partial<Record<string, string>> does not assign to the
// Record<string, string> useStepForm wants (tsc, live 23.09.2026 — eight
// errors, one per hook, caught only in the sandbox build).
function only<T extends Record<string, unknown>>(obj: T | undefined, keys: string[]): T | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out as T;
}

function hasValues(form: StepForm): boolean {
  return form.keys.some(k => !isEmptyValue(form.values[k]));
}

export function useRueckmeldungErfassenFlow(options: RueckmeldungErfassenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const [gaeste_und_einladungenTargetId, setGaesteUndEinladungenTargetId] = useState<string | null>(null);
  const gaeste_und_einladungen = useStepForm('gaeste_und_einladungen', {
    fields: ["einladungsstatus", "anzahl_personen", "menuewunsch", "allergien"],
    steps: only(steps, ["einladungsstatus", "anzahl_personen", "menuewunsch", "allergien"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["einladungsstatus", "anzahl_personen", "menuewunsch", "allergien"]),
    messages: only(options.messages as Record<string, string> | undefined, ["einladungsstatus", "anzahl_personen", "menuewunsch", "allergien"]),
  });
  const forms: RueckmeldungErfassenForms = { gaeste_und_einladungen };
  const formList: StepForm[] = [gaeste_und_einladungen];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    gaeste_und_einladungen: useRecordSearch(servicePort, 'gaeste_und_einladungen', withPickPolicy('gaeste_und_einladungen', {
      searchFields: ["gast_firstname", "gast_lastname"] as never,
      filter: "r.v_einladungsstatus == 'eingeladen'",
      where: (r: JourneyRecord) => (fieldLookup(r, "einladungsstatus")?.key ?? null) === "eingeladen",
      toItem: options.items?.gaeste_und_einladungen as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:rueckmeldung-erfassen:read:${entity}`);
  const picks = {
    gaeste_und_einladungen: { ...searches.gaeste_und_einladungen, select: { ...searches.gaeste_und_einladungen.select, create: false as boolean, hint: hintFor('gaeste_und_einladungen', 'gaeste_und_einladungen', {"conditions": [{"field": "einladungsstatus", "op": "eq", "value": "eingeladen"}], "mode": "all"} as PickWhere | null) } },
  };

  const plan: PlanStep[] = [
    {
      key: 'gaeste_und_einladungen', entity: 'gaeste_und_einladungen', form: gaeste_und_einladungen, primary: true,
      updates: () => gaeste_und_einladungenTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => gaeste_und_einladungenTargetId
        ? { key: 'target:gaeste_und_einladungen', label: entityLabel('gaeste_und_einladungen'), value: picks.gaeste_und_einladungen.labelOf(gaeste_und_einladungenTargetId) ?? gaeste_und_einladungenTargetId, step: steps.gaeste_und_einladungen }
        : undefined,
      values: (): FormValues => ({
        rueckmeldedatum: policyFixedValue('gaeste_und_einladungen', 'rueckmeldedatum') ?? todayIso(),
      }),
    },
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'rueckmeldung-erfassen' });

  /** The record(s) this flow CHANGES: picked through {...flow.picks.<entity>.select} {...flow.pick('<entity>')};
   *  picking prefills the form with the record's current values, and the plan step updates that record. */
  const targets = {
    gaeste_und_einladungen: {
      selectedId: gaeste_und_einladungenTargetId,
      onSelect: (id: string) => {
        setGaesteUndEinladungenTargetId(id);
        const rec = picks.gaeste_und_einladungen.recordOf(id);
        if (rec) gaeste_und_einladungen.reset({ einladungsstatus: fieldLookup(rec, "einladungsstatus")?.key, anzahl_personen: fieldNumber(rec, "anzahl_personen"), menuewunsch: fieldLookup(rec, "menuewunsch")?.key, allergien: fieldText(rec, "allergien"), });
      },
      get record(): JourneyRecord | undefined { return gaeste_und_einladungenTargetId ? picks.gaeste_und_einladungen.recordOf(gaeste_und_einladungenTargetId) : undefined; },
    },
  };
  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: RueckmeldungErfassenFieldKey) => {
    if (field in targets) {
      const t = targets[field as keyof typeof targets];
      return { selectedId: t.selectedId, onSelect: t.onSelect };
    }
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return {
      selectedId: (typeof owner.get(field) === 'string' ? (owner.get(field) as string) : null) || null,
      // `field as never` collapsed the conditional SetArgs<E, never> to never and
      // no argument was assignable any more (tsc, live 23.09.2026); widen `set`
      // itself instead — the label stays a required third argument.
      onSelect: (id: string) => (owner.set as (k: string, v: unknown, l?: string) => void)(field, id, search?.labelOf(id)),
    };
  };
  /** Props for a multi-record pick step: {...flow.picks.x.select} {...flow.pickMany('x')} */
  const pickMany = (field: RueckmeldungErfassenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)))    && Object.entries(targets).every(([k, t]) => steps[k] !== n || !!t.selectedId);
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); setGaesteUndEinladungenTargetId(null); };

  return {
    slug: 'rueckmeldung-erfassen' as const,
    draftKey: 'rueckmeldung-erfassen' as const,
    entity: 'gaeste_und_einladungen' as const,
    form: gaeste_und_einladungen,
    forms, formList, picks, submit, steps, targets,    reviewStep: RUECKMELDUNGERFASSEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
  };
}

export type RueckmeldungErfassenFlow = ReturnType<typeof useRueckmeldungErfassenFlow>;
