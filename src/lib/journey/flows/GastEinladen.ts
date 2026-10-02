/**
 * useGastEinladenFlow — the plumbing of the flow « Gast einladen », generated from the plan.
 *
 * Writes `gaeste_und_einladungen`: asks `gast_firstname`, `gast_lastname`, `email`, `telefon`, `strasse`, `hausnummer`, `plz`, `ort`, `seite`, `anzahl_personen`, `menuewunsch`, `allergien`; sets `einladungsstatus` itself.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 2)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useGastEinladenFlow({
 *     steps: { gast_firstname: 1, gast_lastname: 1, email: 1, telefon: 1, strasse: 1, hausnummer: 1, plz: 1, ort: 1, seite: 1, anzahl_personen: 1, menuewunsch: 1, allergien: 1 },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <Bound form={flow.forms.gaeste_und_einladungen} name="gast_firstname" />
 *     <Bound form={flow.forms.gaeste_und_einladungen} name="gast_lastname" />
 *     <Bound form={flow.forms.gaeste_und_einladungen} name="email" />
 *     <Bound form={flow.forms.gaeste_und_einladungen} name="telefon" />
 *     <Bound form={flow.forms.gaeste_und_einladungen} name="strasse" />
 *     <Bound form={flow.forms.gaeste_und_einladungen} name="hausnummer" />
 *     <Bound form={flow.forms.gaeste_und_einladungen} name="plz" />
 *     <Bound form={flow.forms.gaeste_und_einladungen} name="ort" />
 *     <Bound form={flow.forms.gaeste_und_einladungen} name="seite" />
 *     <Bound form={flow.forms.gaeste_und_einladungen} name="anzahl_personen" />
 *     <Bound form={flow.forms.gaeste_und_einladungen} name="menuewunsch" />
 *     <Bound form={flow.forms.gaeste_und_einladungen} name="allergien" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep, type SummaryItem,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
export type GastEinladenFieldKey = 'allergien' | 'anzahl_personen' | 'email' | 'gast_firstname' | 'gast_lastname' | 'hausnummer' | 'menuewunsch' | 'ort' | 'plz' | 'seite' | 'strasse' | 'telefon';

export interface GastEinladenForms {
  gaeste_und_einladungen: StepForm<'gaeste_und_einladungen'>;
}

// Alias so the option generics stay readable.
type Key = GastEinladenFieldKey;

export interface GastEinladenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
}

const DEFAULT_STEPS: Record<string, number> = {"allergien": 1, "anzahl_personen": 1, "email": 1, "gast_firstname": 1, "gast_lastname": 1, "hausnummer": 1, "menuewunsch": 1, "ort": 1, "plz": 1, "seite": 1, "strasse": 1, "telefon": 1};
export const GASTEINLADEN_REVIEW_STEP = 2;

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

export function useGastEinladenFlow(options: GastEinladenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const gaeste_und_einladungen = useStepForm('gaeste_und_einladungen', {
    fields: ["gast_firstname", "gast_lastname", "email", "telefon", "strasse", "hausnummer", "plz", "ort", "seite", "anzahl_personen", "menuewunsch", "allergien"],
    steps: only(steps, ["gast_firstname", "gast_lastname", "email", "telefon", "strasse", "hausnummer", "plz", "ort", "seite", "anzahl_personen", "menuewunsch", "allergien"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["gast_firstname", "gast_lastname", "email", "telefon", "strasse", "hausnummer", "plz", "ort", "seite", "anzahl_personen", "menuewunsch", "allergien"]),
    messages: only(options.messages as Record<string, string> | undefined, ["gast_firstname", "gast_lastname", "email", "telefon", "strasse", "hausnummer", "plz", "ort", "seite", "anzahl_personen", "menuewunsch", "allergien"]),
  });
  const forms: GastEinladenForms = { gaeste_und_einladungen };
  const formList: StepForm[] = [gaeste_und_einladungen];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // a fixed value the flow sets itself, as a review row with the link that changes it
  const setting = (entity: EntityKey, field: string, value: unknown): SummaryItem => ({
    key: `setting:${entity}.${field}`, label: labelOf(entity, field),
    value: optionsOf(entity, field).find(o => o.key === String(value))?.label ?? String(value ?? ''),
    href: `#/verwaltung/anwendung?line=intent:gast-einladen:write:${entity}.${field}`,
  });
  const picks = {
  };

  const plan: PlanStep[] = [
    {
      key: 'gaeste_und_einladungen', entity: 'gaeste_und_einladungen', form: gaeste_und_einladungen, primary: true,
      values: (): FormValues => ({
        einladungsstatus: policyFixedValue('gaeste_und_einladungen', 'einladungsstatus') ?? "eingeladen",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('gaeste_und_einladungen', 'einladungsstatus', policyFixedValue('gaeste_und_einladungen', 'einladungsstatus') ?? "eingeladen")],
    },
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'gast-einladen' });

  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: GastEinladenFieldKey) => {
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
  const pickMany = (field: GastEinladenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)));
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); };

  return {
    slug: 'gast-einladen' as const,
    draftKey: 'gast-einladen' as const,
    entity: 'gaeste_und_einladungen' as const,
    form: gaeste_und_einladungen,
    forms, formList, picks, submit, steps,    reviewStep: GASTEINLADEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
  };
}

export type GastEinladenFlow = ReturnType<typeof useGastEinladenFlow>;
