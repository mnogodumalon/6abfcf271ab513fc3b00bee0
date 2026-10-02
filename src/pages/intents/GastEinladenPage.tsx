/**
 * Gast einladen — 3-Schritt-Wizard.
 * Steps: 1) Name und Kontaktdaten → 2) Seite, Personen, Menü, Allergien → 3) Prüfen & als eingeladen speichern.
 * Reads: —. Writes: gaeste_und_einladungen (einladungsstatus = eingeladen, set by the flow hook).
 * Composes: IntentWizardShell, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { useGastEinladenFlow } from '@/lib/journey/flows/GastEinladen';
import { tx } from '@/i18n';

export default function GastEinladenPage() {
  const [step, setStep] = useState(1);
  const flow = useGastEinladenFlow({
    steps: {
      gast_firstname: 1, gast_lastname: 1, email: 1, telefon: 1,
      strasse: 1, hausnummer: 1, plz: 1, ort: 1,
      seite: 2, anzahl_personen: 2, menuewunsch: 2, allergien: 2,
    },
  });
  const f = flow.forms.gaeste_und_einladungen;

  return (
    <IntentWizardShell
      title={tx('Gast einladen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Einen Gast erfassen und die Einladung als versendet markieren.'),
        needs: [tx('Vor- und Nachname'), tx('Kontaktdaten des Gastes')],
      }}
    >
      <WizardStep label={tx('Kontakt')} description={tx('Wie heißt dein Gast und wie erreichst du ihn?')}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Bound form={f} name="gast_firstname" />
            <Bound form={f} name="gast_lastname" />
            <Bound form={f} name="email" />
            <Bound form={f} name="telefon" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2"><Bound form={f} name="strasse" /></div>
            <Bound form={f} name="hausnummer" />
            <Bound form={f} name="plz" />
            <div className="sm:col-span-2"><Bound form={f} name="ort" /></div>
          </div>
          <StepNav onNext={() => flow.validateStep(1)} nextStepLabel={tx('Details')} hideBack />
        </div>
      </WizardStep>
      <WizardStep label={tx('Details')} description={tx('Zu welcher Seite gehört dein Gast und was möchte er essen?')}>
        <div className="space-y-4">
          <Bound form={f} name="seite" allowClear />
          <Bound form={f} name="anzahl_personen" />
          <Bound form={f} name="menuewunsch" allowClear />
          <Bound form={f} name="allergien" rows={3} />
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'einladungsstatus', label: tx('Einladungsstatus'), value: tx('Eingeladen') }]}
            whatHappensNext={tx('Der Gast wird mit dem heutigen Einladungsdatum als eingeladen gespeichert.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Rückmeldung erfassen'), href: '#/intents/rueckmeldung-erfassen' },
            { label: tx('Gast an Tisch setzen'), href: '#/intents/gast-an-tisch-setzen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Sobald der Gast antwortet, kannst du die Rückmeldung erfassen.')}
        />
      )}
    </IntentWizardShell>
  );
}
