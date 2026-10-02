/**
 * Zahlung erfassen — 3-Schritt-Wizard.
 * Steps: 1) Offenen Budgetposten wählen → 2) Tatsächlichen Betrag und Zahlungsstatus eingeben → 3) Prüfen & speichern (Zahlungsdatum = heute).
 * Reads: budget. Writes: budget (update, via useZahlungErfassenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { format } from 'date-fns';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldNumber, fieldLookup } from '@/lib/journey';
import { useZahlungErfassenFlow } from '@/lib/journey/flows/ZahlungErfassen';
import { formatCurrency } from '@/lib/formatters';
import { tx } from '@/i18n';

export default function ZahlungErfassenPage() {
  const [step, setStep] = useState(1);
  const flow = useZahlungErfassenFlow({
    steps: { budget: 1, tatsaechlicher_betrag: 2, zahlungsstatus: 2 },
    items: {
      budget: r => {
        const planned = fieldNumber(r, 'geplanter_betrag');
        return {
          id: r.id,
          title: fieldText(r, 'bezeichnung'),
          subtitle: planned != null ? tx`Geplant: ${formatCurrency(planned)}` : undefined,
          status: fieldLookup(r, 'zahlungsstatus') ?? undefined,
        };
      },
    },
  });

  const budgetId = flow.pick('budget').selectedId as string | undefined;
  const picked = budgetId ? flow.picks.budget.recordOf(budgetId) : undefined;
  const planned = picked ? fieldNumber(picked, 'geplanter_betrag') : null;
  const today = format(new Date(), 'dd.MM.yyyy');

  return (
    <IntentWizardShell
      title={tx('Zahlung erfassen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Trage ein, was du tatsächlich für einen Budgetposten bezahlt hast.'),
        needs: [tx('Gezahlter Betrag'), tx('Zahlungsstatus')],
      }}
    >
      <WizardStep label={tx('Budgetposten')} description={tx('Welcher offene Posten wurde bezahlt?')}>
        <EntitySelectStep
          {...flow.picks.budget.select}
          {...flow.pick('budget')}
          searchPlaceholder={tx('Bezeichnung suchen …')}
          emptyText={tx('Es gibt keinen offenen oder teilweise bezahlten Budgetposten.')}
        />
      </WizardStep>

      <WizardStep label={tx('Zahlung')} description={tx('Betrag und Status der Zahlung angeben.')} needs={['budget']}>
        <div className="space-y-4">
          {picked && (
            <div className="rounded-2xl bg-secondary p-4 text-sm">
              <p className="font-medium text-foreground truncate">{fieldText(picked, 'bezeichnung')}</p>
              {planned != null && (
                <p className="text-muted-foreground">{tx`Geplanter Betrag: ${formatCurrency(planned)}`}</p>
              )}
            </div>
          )}
          <Bound form={flow.forms.budget} name="tatsaechlicher_betrag" hint={tx('In Euro, z. B. 1250')} />
          <Bound form={flow.forms.budget} name="zahlungsstatus" />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'zahlungsdatum', label: tx('Zahlungsdatum'), value: today }]}
            whatHappensNext={tx('Der Budgetposten wird mit Betrag, Status und heutigem Zahlungsdatum aktualisiert.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Dienstleister buchen'), href: '#/intents/dienstleister-buchen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
