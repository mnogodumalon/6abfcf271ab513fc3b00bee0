/**
 * Gast an Tisch setzen — 3-Schritt-Wizard.
 * Steps: 1) Zugesagten Gast ohne Tisch wählen → 2) Tisch mit freien Plätzen wählen → 3) Prüfen & speichern.
 * Reads: gaeste_und_einladungen, tische. Writes: gaeste_und_einladungen (tisch, via useGastAnTischSetzenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldNumber } from '@/lib/journey';
import { useGastAnTischSetzenFlow } from '@/lib/journey/flows/GastAnTischSetzen';
import { tx } from '@/i18n';

export default function GastAnTischSetzenPage() {
  const [step, setStep] = useState(1);
  const flow = useGastAnTischSetzenFlow({
    steps: { gaeste_und_einladungen: 1, tisch: 2 },
    items: {
      gaeste_und_einladungen: g => {
        const personen = fieldNumber(g, 'anzahl_personen') ?? 1;
        return {
          id: g.id,
          title: `${fieldText(g, 'gast_firstname')} ${fieldText(g, 'gast_lastname')}`.trim(),
          subtitle: tx`${personen} Person(en)`,
        };
      },
      tisch: t => {
        const plaetze = fieldNumber(t, 'anzahl_plaetze') ?? 0;
        const standort = fieldText(t, 'standort');
        const nummer = fieldNumber(t, 'tischnummer');
        const plaetzeText = tx`${plaetze} Plätze`;
        return {
          id: t.id,
          title: nummer != null ? `${fieldText(t, 'tischname')} (${nummer})` : fieldText(t, 'tischname'),
          subtitle: standort ? `${plaetzeText} · ${standort}` : plaetzeText,
        };
      },
    },
  });

  const guestId = flow.targets.gaeste_und_einladungen.selectedId;
  const guest = flow.targets.gaeste_und_einladungen.record;
  const tischId = flow.forms.gaeste_und_einladungen.get('tisch');
  const tischRecord = typeof tischId === 'string' && tischId ? flow.picks.tisch.recordOf(tischId) : undefined;

  const checkSeats = (): boolean | string => {
    if (!flow.validateStep(2)) return false;
    if (guest && tischRecord) {
      const plaetze = fieldNumber(tischRecord, 'anzahl_plaetze') ?? 0;
      const personen = fieldNumber(guest, 'anzahl_personen') ?? 1;
      if (plaetze < personen) return tx('Am gewählten Tisch sind nicht genug Plätze frei.');
    }
    return true;
  };

  return (
    <IntentWizardShell
      title={tx('Gast an Tisch setzen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Einen zugesagten Gast einem Tisch mit freien Plätzen zuweisen.'),
        needs: [tx('Ein Gast mit Zusage'), tx('Ein Tisch mit genug Plätzen')],
      }}
    >
      <WizardStep label={tx('Gast')} description={tx('Welcher zugesagte Gast braucht noch einen Tisch?')}>
        <EntitySelectStep
          {...flow.picks.gaeste_und_einladungen.select}
          {...flow.pick('gaeste_und_einladungen')}
          mode="combobox"
          searchPlaceholder={tx('Vor- oder Nachname …')}
          emptyText={tx('Kein zugesagter Gast wartet auf einen Tisch. Erfasse zuerst die Zusage in „Rückmeldung erfassen“.')}
        />
        <p className="mt-3 text-sm">
          <a className="text-primary underline" href="#/intents/rueckmeldung-erfassen">{tx('Rückmeldung erfassen')}</a>
        </p>
        <StepNav onNext={() => flow.validateStep(1)} nextStepLabel={tx('Weiter')} />
      </WizardStep>
      <WizardStep label={tx('Tisch')} description={tx('An welchen Tisch soll der Gast sitzen?')}>
        {guestId ? (
          <>
            {guest && (
              <p className="mb-3 text-sm text-muted-foreground">
                {tx`${fieldText(guest, 'gast_firstname')} ${fieldText(guest, 'gast_lastname')} braucht ${fieldNumber(guest, 'anzahl_personen') ?? 1} Platz/Plätze.`}
              </p>
            )}
            <EntitySelectStep
              {...flow.picks.tisch.select}
              {...flow.pick('tisch')}
              searchPlaceholder={tx('Tischname oder Standort …')}
            />
            <StepNav onBack={() => setStep(1)} onNext={checkSeats} nextStepLabel={tx('Prüfen')} />
          </>
        ) : (
          <StepNav onBack={() => setStep(1)} nextDisabled>
            {tx('Dieser Schritt braucht die Auswahl aus Schritt 1.')}
          </StepNav>
        )}
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Der Gast ist danach diesem Tisch zugeordnet.')}
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
            { label: tx('Gast einladen'), href: '#/intents/gast-einladen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
