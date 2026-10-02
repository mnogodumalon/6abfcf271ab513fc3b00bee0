import type { Aufgaben, Dienstleister } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';

export interface AufgabenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Aufgaben;
  /** N:1-Ziel „Dienstleister": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  dienstleisterList: Dienstleister[];
  /** Klick auf die Dienstleister-Relation → overlay.push auf dessen Detail. */
  onOpenDienstleister?: (record: Dienstleister) => void;
}

export function AufgabenDetails({
  record,
  dienstleisterList,
  onOpenDienstleister,
}: AufgabenDetailsProps) {
  const dienstleisterTarget = dienstleisterList.find(r => r.record_id === extractRecordId(record.fields.dienstleister));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('aufgaben', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('aufgaben', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('aufgaben', 'kategorie')} value={record.fields.kategorie} format="pill" />
        <RecordField label={fieldLabel('aufgaben', 'faelligkeitsdatum')} value={record.fields.faelligkeitsdatum} format="date" />
        <RecordField label={fieldLabel('aufgaben', 'prioritaet')} value={record.fields.prioritaet} format="pill" />
        <RecordField label={fieldLabel('aufgaben', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('aufgaben', 'verantwortlich_firstname')} value={record.fields.verantwortlich_firstname} format="text" />
        <RecordField label={fieldLabel('aufgaben', 'verantwortlich_lastname')} value={record.fields.verantwortlich_lastname} format="text" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('aufgaben', 'dienstleister')}
          name={dienstleisterTarget?.fields.firmenname ?? '—'}
          meta={[dienstleisterTarget?.fields.email, dienstleisterTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={dienstleisterTarget && onOpenDienstleister ? () => onOpenDienstleister!(dienstleisterTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.AUFGABEN} recordId={record.record_id} />
    </>
  );
}
