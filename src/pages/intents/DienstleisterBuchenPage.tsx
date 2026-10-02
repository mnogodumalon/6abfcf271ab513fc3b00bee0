/**
 * Dienstleister buchen — 4-Schritt-Wizard.
 * Steps: 1) Dienstleister wählen → 2) Budgetposten anlegen (Status wird auf „gebucht“ gesetzt)
 *        → 3) Optional Folgeaufgabe → 4) Prüfen & buchen.
 * Reads: dienstleister. Writes: dienstleister (update status), budget (create), aufgaben (create, optional).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IconCircleCheck } from '@tabler/icons-react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup } from '@/lib/journey';
import { useDienstleisterBuchenFlow } from '@/lib/journey/flows/DienstleisterBuchen';
import { tx } from '@/i18n';

export default function DienstleisterBuchenPage() {
  const [step, setStep] = useState(1);
  const flow = useDienstleisterBuchenFlow({
    steps: {
      dienstleister: 1,
      bezeichnung: 2,
      kategorie: 2,
      geplanter_betrag: 2,
      titel: 3,
      faelligkeitsdatum: 3,
      prioritaet: 3,
    },
    items: {
      dienstleister: r => ({
        id: r.id,
        title: fieldText(r, 'firmenname'),
        subtitle: fieldLookup(r, 'kategorie')?.label,
        status: fieldLookup(r, 'status') ?? undefined,
      }),
    },
  });

  const dl = flow.picks.dienstleister;
  const pickProps = flow.pick('dienstleister');
  const pickedId = pickProps.selectedId;
  const pickedName = pickedId ? dl.labelOf(pickedId) ?? '' : '';
  const pickedRecord = pickedId ? dl.recordOf(pickedId) : undefined;
  const currentStatus = pickedRecord ? fieldLookup(pickedRecord, 'status')?.label : undefined;

  const aufgabe = flow.forms.aufgaben;
  const aufgabeStarted = Boolean(
    aufgabe.get('titel') || aufgabe.get('faelligkeitsdatum') || aufgabe.get('prioritaet'),
  );

  return (
    <IntentWizardShell
      title={tx('Dienstleister buchen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Einen Dienstleister fest buchen und gleich Budget und Aufgabe dazu anlegen.'),
        needs: [tx('Name des Dienstleisters'), tx('Geplanter Betrag')],
      }}
    >
      <WizardStep label={tx('Dienstleister')} description={tx('Welchen Dienstleister möchtest du buchen?')}>
        <EntitySelectStep
          {...dl.select}
          {...pickProps}
          searchPlaceholder={tx('Firmenname oder Ansprechpartner …')}
          emptyText={tx('Kein Dienstleister wartet auf eine Buchung — nur Anfragen und erhaltene Angebote werden angezeigt.')}
        />
      </WizardStep>

      <WizardStep
        label={tx('Budget')}
        description={tx('Lege den Budgetposten mit dem geplanten Betrag an.')}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border bg-card p-4 overflow-hidden">
            <IconCircleCheck size={24} className="shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="font-medium truncate">{pickedName || tx('Noch kein Dienstleister gewählt')}</p>
              <p className="text-sm text-muted-foreground">
                {currentStatus
                  ? tx`Status wechselt von „${currentStatus}“ auf „Gebucht“.`
                  : tx('Status wechselt auf „Gebucht“.')}
              </p>
            </div>
          </div>
          <Bound form={flow.forms.budget} name="bezeichnung" />
          <Bound form={flow.forms.budget} name="kategorie" />
          <Bound form={flow.forms.budget} name="geplanter_betrag" hint={tx('In Euro, z. B. 2500')} />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => (pickedId ? flow.validateStep(2) : tx('Wähle zuerst in Schritt 1 einen Dienstleister aus.'))}
            nextStepLabel={tx('Folgeaufgabe')}
          />
        </div>
      </WizardStep>

      <WizardStep
        label={tx('Aufgabe')}
        description={tx('Optional: eine Folgeaufgabe zu diesem Dienstleister anlegen — oder einfach weiter.')}
      >
        <div className="space-y-4">
          <Bound form={aufgabe} name="titel" />
          <Bound form={aufgabe} name="faelligkeitsdatum" />
          <Bound form={aufgabe} name="prioritaet" allowClear />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => (aufgabeStarted ? flow.validateStep(3) : true)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Der Dienstleister gilt als gebucht, der Budgetposten steht auf „offen“.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          actions={{ copy: false, print: false }}
          next={[
            { label: tx('Zahlung erfassen'), href: '#/intents/zahlung-erfassen' },
            { label: tx('Aufgabe abschließen'), href: '#/intents/aufgabe-abschliessen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Sobald eine Rechnung bezahlt ist, kannst du die Zahlung erfassen.')}
        />
      )}
    </IntentWizardShell>
  );
}
