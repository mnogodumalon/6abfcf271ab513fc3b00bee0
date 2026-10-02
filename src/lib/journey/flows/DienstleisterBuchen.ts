/**
 * useDienstleisterBuchenFlow — the plumbing of the flow « Dienstleister buchen », generated from the plan.
 *
 * Changes `dienstleister`: the record to change is picked (`flow.pick('dienstleister')`), the form is prefilled with its values; ; sets `status` itself.
Writes `budget`: asks `bezeichnung`, `kategorie`, `geplanter_betrag`, `dienstleister`; sets `zahlungsstatus` itself.
Writes `aufgaben` (only when the person fills it): asks `titel`, `faelligkeitsdatum`, `prioritaet`, `dienstleister`; sets `status` itself.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 5)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useDienstleisterBuchenFlow({
 *     steps: { dienstleister: 3, bezeichnung: 4, kategorie: 4, geplanter_betrag: 4, titel: 4, faelligkeitsdatum: 4, prioritaet: 4 },
 *     items: { dienstleister: r => ({ id: r.id, title: fieldText(r, 'firmenname') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.dienstleister.select} {...flow.pick('dienstleister')} />
 *     <EntitySelectStep {...flow.picks.budget_dienstleister.select} {...flow.pick('dienstleister')} />
 *     <EntitySelectStep {...flow.picks.aufgaben_dienstleister.select} {...flow.pick('dienstleister')} />
 *     <Bound form={flow.forms.budget} name="bezeichnung" />
 *     <Bound form={flow.forms.budget} name="kategorie" />
 *     <Bound form={flow.forms.budget} name="geplanter_betrag" />
 *     <Bound form={flow.forms.aufgaben} name="titel" />
 *     <Bound form={flow.forms.aufgaben} name="faelligkeitsdatum" />
 *     <Bound form={flow.forms.aufgaben} name="prioritaet" />
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
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep, type SummaryItem,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
import { entityLabel } from '@/lib/journey/rules';
export type DienstleisterBuchenFieldKey = 'bezeichnung' | 'dienstleister' | 'faelligkeitsdatum' | 'geplanter_betrag' | 'kategorie' | 'prioritaet' | 'titel';

export interface DienstleisterBuchenForms {
  dienstleister: StepForm<'dienstleister'>;
  budget: StepForm<'budget'>;
  aufgaben: StepForm<'aufgaben'>;
}

// Alias so the option generics stay readable.
type Key = DienstleisterBuchenFieldKey;

export interface DienstleisterBuchenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    dienstleister?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    budget_dienstleister?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    aufgaben_dienstleister?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"bezeichnung": 4, "dienstleister": 3, "faelligkeitsdatum": 4, "geplanter_betrag": 4, "kategorie": 4, "prioritaet": 4, "titel": 4};
export const DIENSTLEISTERBUCHEN_REVIEW_STEP = 5;

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

export function useDienstleisterBuchenFlow(options: DienstleisterBuchenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const [dienstleisterTargetId, setDienstleisterTargetId] = useState<string | null>(null);
  const dienstleister = useStepForm('dienstleister', {
    fields: [],
    steps: only(steps, []) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, []),
    messages: only(options.messages as Record<string, string> | undefined, []),
  });
  const budget = useStepForm('budget', {
    fields: ["bezeichnung", "kategorie", "geplanter_betrag", "dienstleister"],
    steps: only(steps, ["bezeichnung", "kategorie", "geplanter_betrag", "dienstleister"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["bezeichnung", "kategorie", "geplanter_betrag", "dienstleister"]),
    messages: only(options.messages as Record<string, string> | undefined, ["bezeichnung", "kategorie", "geplanter_betrag", "dienstleister"]),
  });
  const aufgaben = useStepForm('aufgaben', {
    fields: ["titel", "faelligkeitsdatum", "prioritaet", "dienstleister"],
    steps: only(steps, ["titel", "faelligkeitsdatum", "prioritaet", "dienstleister"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["titel", "faelligkeitsdatum", "prioritaet", "dienstleister"]),
    messages: only(options.messages as Record<string, string> | undefined, ["titel", "faelligkeitsdatum", "prioritaet", "dienstleister"]),
  });
  const forms: DienstleisterBuchenForms = { dienstleister, budget, aufgaben };
  const formList: StepForm[] = [dienstleister, budget, aufgaben];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    dienstleister: useRecordSearch(servicePort, 'dienstleister', withPickPolicy('dienstleister', {
      searchFields: ["firmenname"] as never,
      filter: "r.v_status in ['anfrage', 'angebot_erhalten']",
      where: (r: JourneyRecord) => ["anfrage", "angebot_erhalten"].includes(fieldLookup(r, "status")?.key ?? ''),
      toItem: options.items?.dienstleister as never,
    })),
    budget_dienstleister: useRecordSearch(servicePort, 'dienstleister', withPickPolicy('budget_dienstleister', {
      searchFields: ["firmenname"] as never,
      filter: "r.v_status in ['anfrage', 'angebot_erhalten']",
      where: (r: JourneyRecord) => ["anfrage", "angebot_erhalten"].includes(fieldLookup(r, "status")?.key ?? ''),
      toItem: options.items?.budget_dienstleister as never,
    })),
    aufgaben_dienstleister: useRecordSearch(servicePort, 'dienstleister', withPickPolicy('aufgaben_dienstleister', {
      searchFields: ["firmenname"] as never,
      filter: "r.v_status in ['anfrage', 'angebot_erhalten']",
      where: (r: JourneyRecord) => ["anfrage", "angebot_erhalten"].includes(fieldLookup(r, "status")?.key ?? ''),
      toItem: options.items?.aufgaben_dienstleister as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:dienstleister-buchen:read:${entity}`);
  // a fixed value the flow sets itself, as a review row with the link that changes it
  const setting = (entity: EntityKey, field: string, value: unknown): SummaryItem => ({
    key: `setting:${entity}.${field}`, label: labelOf(entity, field),
    value: optionsOf(entity, field).find(o => o.key === String(value))?.label ?? String(value ?? ''),
    href: `#/verwaltung/anwendung?line=intent:dienstleister-buchen:write:${entity}.${field}`,
  });
  const picks = {
    dienstleister: { ...searches.dienstleister, select: { ...searches.dienstleister.select, create: false as boolean, hint: hintFor('dienstleister', 'dienstleister', {"conditions": [{"field": "status", "op": "in", "value": ["anfrage", "angebot_erhalten"]}], "mode": "all"} as PickWhere | null) } },
    budget_dienstleister: { ...searches.budget_dienstleister, select: { ...searches.budget_dienstleister.select, create: true as boolean, hint: hintFor('budget_dienstleister', 'dienstleister', {"conditions": [{"field": "status", "op": "in", "value": ["anfrage", "angebot_erhalten"]}], "mode": "all"} as PickWhere | null) } },
    aufgaben_dienstleister: { ...searches.aufgaben_dienstleister, select: { ...searches.aufgaben_dienstleister.select, create: true as boolean, hint: hintFor('aufgaben_dienstleister', 'dienstleister', {"conditions": [{"field": "status", "op": "in", "value": ["anfrage", "angebot_erhalten"]}], "mode": "all"} as PickWhere | null) } },
  };

  const aufgabenFilled = hasValues(aufgaben);
  const plan: PlanStep[] = [
    {
      key: 'dienstleister', entity: 'dienstleister', form: dienstleister,
      updates: () => dienstleisterTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => dienstleisterTargetId
        ? { key: 'target:dienstleister', label: entityLabel('dienstleister'), value: picks.dienstleister.labelOf(dienstleisterTargetId) ?? dienstleisterTargetId, step: steps.dienstleister }
        : undefined,
      values: (): FormValues => ({
        status: policyFixedValue('dienstleister', 'status') ?? "gebucht",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('dienstleister', 'status', policyFixedValue('dienstleister', 'status') ?? "gebucht")],
    },
    {
      key: 'budget', entity: 'budget', form: budget, primary: true,
      values: (): FormValues => ({
        zahlungsstatus: policyFixedValue('budget', 'zahlungsstatus') ?? "offen",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('budget', 'zahlungsstatus', policyFixedValue('budget', 'zahlungsstatus') ?? "offen")],
    },
    ...(aufgabenFilled ? [{
      key: 'aufgaben', entity: 'aufgaben', form: aufgaben,
      values: (): FormValues => ({
        status: policyFixedValue('aufgaben', 'status') ?? "offen",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('aufgaben', 'status', policyFixedValue('aufgaben', 'status') ?? "offen")],
    } as PlanStep] : []),
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'dienstleister-buchen' });

  /** The record(s) this flow CHANGES: picked through {...flow.picks.<entity>.select} {...flow.pick('<entity>')};
   *  picking prefills the form with the record's current values, and the plan step updates that record. */
  const targets = {
    dienstleister: {
      selectedId: dienstleisterTargetId,
      onSelect: (id: string) => {
        setDienstleisterTargetId(id);
        const rec = picks.dienstleister.recordOf(id);
        if (rec) dienstleister.reset({ });
      },
      get record(): JourneyRecord | undefined { return dienstleisterTargetId ? picks.dienstleister.recordOf(dienstleisterTargetId) : undefined; },
    },
  };
  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: DienstleisterBuchenFieldKey) => {
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
  const pickMany = (field: DienstleisterBuchenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)))    && Object.entries(targets).every(([k, t]) => steps[k] !== n || !!t.selectedId);
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); setDienstleisterTargetId(null); };

  return {
    slug: 'dienstleister-buchen' as const,
    draftKey: 'dienstleister-buchen' as const,
    entity: 'budget' as const,
    form: budget,
    forms, formList, picks, submit, steps, targets,    reviewStep: DIENSTLEISTERBUCHEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
  };
}

export type DienstleisterBuchenFlow = ReturnType<typeof useDienstleisterBuchenFlow>;
