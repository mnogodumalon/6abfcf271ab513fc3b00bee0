import type { Budget, Dienstleister } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';

export interface BudgetDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Budget;
  /** N:1-Ziel „Dienstleister": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  dienstleisterList: Dienstleister[];
  /** Klick auf die Dienstleister-Relation → overlay.push auf dessen Detail. */
  onOpenDienstleister?: (record: Dienstleister) => void;
}

export function BudgetDetails({
  record,
  dienstleisterList,
  onOpenDienstleister,
}: BudgetDetailsProps) {
  const dienstleisterTarget = dienstleisterList.find(r => r.record_id === extractRecordId(record.fields.dienstleister));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('budget', 'bezeichnung')} value={record.fields.bezeichnung} format="text" />
        <RecordField label={fieldLabel('budget', 'kategorie')} value={record.fields.kategorie} format="pill" />
        <RecordField label={fieldLabel('budget', 'geplanter_betrag')} value={record.fields.geplanter_betrag} format="text" />
        <RecordField label={fieldLabel('budget', 'tatsaechlicher_betrag')} value={record.fields.tatsaechlicher_betrag} format="text" />
        <RecordField label={fieldLabel('budget', 'zahlungsstatus')} value={record.fields.zahlungsstatus} format="pill" />
        <RecordField label={fieldLabel('budget', 'zahlungsdatum')} value={record.fields.zahlungsdatum} format="date" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('budget', 'dienstleister')}
          name={dienstleisterTarget?.fields.firmenname ?? '—'}
          meta={[dienstleisterTarget?.fields.email, dienstleisterTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={dienstleisterTarget && onOpenDienstleister ? () => onOpenDienstleister!(dienstleisterTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.BUDGET} recordId={record.record_id} />
    </>
  );
}
