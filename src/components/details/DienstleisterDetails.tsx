import type { Dienstleister, Aufgaben, Budget } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface DienstleisterDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Dienstleister;
  /** 1:N „Aufgaben" (dienstleister): VOLLE Liste — der Block filtert auf diesen Record. */
  aufgabenList: Aufgaben[];
  /** Zeilen-Klick → overlay.push auf das Aufgaben-Detail (nie der Edit-Dialog). */
  onOpenAufgaben: (record: Aufgaben) => void;
  /** Kontextuelles „+": öffnet den Aufgaben-Dialog mit diesem Record vorgesetzt. */
  onAddAufgaben: () => void;
  /** 1:N „Budget" (dienstleister): VOLLE Liste — der Block filtert auf diesen Record. */
  budgetList: Budget[];
  /** Zeilen-Klick → overlay.push auf das Budget-Detail (nie der Edit-Dialog). */
  onOpenBudget: (record: Budget) => void;
  /** Kontextuelles „+": öffnet den Budget-Dialog mit diesem Record vorgesetzt. */
  onAddBudget: () => void;
}

export function DienstleisterDetails({
  record,
  aufgabenList,
  onOpenAufgaben,
  onAddAufgaben,
  budgetList,
  onOpenBudget,
  onAddBudget,
}: DienstleisterDetailsProps) {
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('dienstleister', 'firmenname')} value={record.fields.firmenname} format="text" />
        <RecordField label={fieldLabel('dienstleister', 'kategorie')} value={record.fields.kategorie} format="pill" />
        <RecordField label={fieldLabel('dienstleister', 'ansprechpartner_firstname')} value={record.fields.ansprechpartner_firstname} format="text" />
        <RecordField label={fieldLabel('dienstleister', 'ansprechpartner_lastname')} value={record.fields.ansprechpartner_lastname} format="text" />
        <RecordField label={fieldLabel('dienstleister', 'email')} value={record.fields.email} format="email" />
        <RecordField label={fieldLabel('dienstleister', 'telefon')} value={record.fields.telefon} format="text" />
        <RecordField label={fieldLabel('dienstleister', 'website')} value={record.fields.website} format="url" />
        <RecordField label={fieldLabel('dienstleister', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('dienstleister', 'notizen')} value={record.fields.notizen} format="longtext" className="md:col-span-2" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('aufgaben')}
        items={aufgabenList.filter(r => extractRecordId(r.fields.dienstleister) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('aufgaben'), meta: r.fields.faelligkeitsdatum })}
        onOpen={onOpenAufgaben}
        onAdd={onAddAufgaben}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('budget')}
        items={budgetList.filter(r => extractRecordId(r.fields.dienstleister) === record.record_id)}
        map={r => ({ name: r.fields.bezeichnung ?? appLabel('budget'), meta: r.fields.zahlungsdatum })}
        onOpen={onOpenBudget}
        onAdd={onAddBudget}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.DIENSTLEISTER} recordId={record.record_id} />
    </>
  );
}
