/**
 * Rückmeldung erfassen — 4-Schritt-Wizard.
 * Steps: 1) Eingeladenen Gast auswählen → 2) Zusage oder Absage wählen → 3) Personen, Menü & Allergien → 4) Prüfen & speichern.
 * Reads: gaeste_und_einladungen (nur Status „eingeladen"). Writes: gaeste_und_einladungen (Update, über useRueckmeldungErfassenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup, todayIso } from '@/lib/journey';
import { useRueckmeldungErfassenFlow } from '@/lib/journey/flows/RueckmeldungErfassen';
import { formatDate } from '@/lib/formatters';
import { tx } from '@/i18n';

export default function RueckmeldungErfassenPage() {
  const [step, setStep] = useState(1);
  const flow = useRueckmeldungErfassenFlow({
    steps: { gaeste_und_einladungen: 1, einladungsstatus: 2, anzahl_personen: 3, menuewunsch: 3, allergien: 3 },
    items: {
      gaeste_und_einladungen: r => ({
        id: r.id,
        title: `${fieldText(r, 'gast_firstname')} ${fieldText(r, 'gast_lastname')}`.trim(),
        subtitle: fieldText(r, 'email'),
        status: fieldLookup(r, 'einladungsstatus') ?? undefined,
      }),
    },
  });
  const f = flow.forms.gaeste_und_einladungen;

  return (
    <IntentWizardShell
      title={tx('Rückmeldung erfassen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Zu- oder Absage eines eingeladenen Gastes eintragen.'),
        needs: [tx('Name des Gastes'), tx('Zusage oder Absage')],
      }}
    >
      <WizardStep label={tx('Gast')} heading={tx('Eingeladenen Gast auswählen')} description={tx('Wer hat sich zurückgemeldet?')}>
        <EntitySelectStep
          {...flow.picks.gaeste_und_einladungen.select}
          {...flow.pick('gaeste_und_einladungen')}
          searchPlaceholder={tx('Name oder E-Mail …')}
          emptyText={tx('Kein Gast wartet auf eine Rückmeldung. Lade zuerst einen Gast ein.')}
        />
        <p data-field="gast_einladen_hinweis" className="text-sm text-muted-foreground">
          {tx('Dein Gast fehlt in der Liste?')}{' '}
          <a href="#/intents/gast-einladen" className="font-medium text-primary underline underline-offset-4">
            {tx('Gast einladen')}
          </a>
        </p>
        <StepNav hideBack onNext={() => flow.validateStep(1)} nextStepLabel={tx('Antwort')} />
      </WizardStep>

      <WizardStep label={tx('Antwort')} heading={tx('Zusage oder Absage')} description={tx('Wie hat der Gast geantwortet?')} needs={['gaeste_und_einladungen']}>
        <div className="space-y-4">
          <Bound form={f} name="einladungsstatus" />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Details')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Details')} heading={tx('Personen, Menü und Allergien')} description={tx('Wie viele Personen kommen und was wünschen sie sich?')} needs={['gaeste_und_einladungen']}>
        <div className="space-y-4">
          <Bound form={f} name="anzahl_personen" />
          <Bound form={f} name="menuewunsch" allowClear />
          <Bound form={f} name="allergien" rows={3} />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'rueckmeldedatum', label: tx('Rückmeldedatum'), value: formatDate(todayIso()) }]}
            whatHappensNext={tx('Der Status des Gastes wird aktualisiert und das heutige Datum als Rückmeldung vermerkt.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Gast an Tisch setzen'), href: '#/intents/gast-an-tisch-setzen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Zugesagte Gäste kannst du jetzt einem Tisch zuweisen.')}
        />
      )}
    </IntentWizardShell>
  );
}
