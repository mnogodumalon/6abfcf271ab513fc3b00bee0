/**
 * Aufgabe abschließen — 2-Schritt-Wizard.
 * Steps: 1) Offene Aufgabe auswählen → 2) Prüfen & Status auf erledigt setzen.
 * Reads: aufgaben (nur offen / in Arbeit). Writes: aufgaben (status = erledigt, via useAufgabeAbschliessenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldDate, fieldLookup, formatFieldValue } from '@/lib/journey';
import { useAufgabeAbschliessenFlow } from '@/lib/journey/flows/AufgabeAbschliessen';
import { tx } from '@/i18n';

export default function AufgabeAbschliessenPage() {
  const [step, setStep] = useState(1);
  const flow = useAufgabeAbschliessenFlow({
    steps: { aufgaben: 1 },
    items: {
      aufgaben: r => {
        const due = fieldDate(r, 'faelligkeitsdatum');
        const prio = fieldLookup(r, 'prioritaet');
        const parts = [
          due ? tx`Fällig ${formatFieldValue('aufgaben', 'faelligkeitsdatum', due)}` : tx('Ohne Fälligkeit'),
          prio ? tx`Priorität ${prio.label}` : '',
        ].filter(Boolean);
        return {
          id: r.id,
          title: fieldText(r, 'titel'),
          subtitle: parts.join(' · '),
          status: fieldLookup(r, 'status') ?? undefined,
        };
      },
    },
  });

  return (
    <IntentWizardShell
      title={tx('Aufgabe abschließen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine offene Aufgabe auswählen und als erledigt markieren.'),
        needs: [tx('Eine offene Aufgabe')],
      }}
    >
      <WizardStep label={tx('Aufgabe')} description={tx('Welche Aufgabe ist erledigt?')}>
        <EntitySelectStep
          {...flow.picks.aufgaben.select}
          {...flow.pick('aufgaben')}
          searchPlaceholder={tx('Titel der Aufgabe …')}
          emptyText={tx('Es gibt keine offene Aufgabe mehr.')}
        />
      </WizardStep>
      <WizardStep label={tx('Prüfen')} description={tx('Der Status wird auf „Erledigt“ gesetzt.')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'status', label: tx('Neuer Status'), value: tx('Erledigt') }]}
            whatHappensNext={tx('Die Aufgabe gilt sofort als erledigt.')}
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
            { label: tx('Dienstleister buchen'), href: '#/intents/dienstleister-buchen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
