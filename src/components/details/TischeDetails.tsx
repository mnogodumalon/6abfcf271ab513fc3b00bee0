import type { Tische, GaesteUndEinladungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface TischeDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Tische;
  /** 1:N „Gäste und Einladungen" (tisch): VOLLE Liste — der Block filtert auf diesen Record. */
  gaesteUndEinladungenList: GaesteUndEinladungen[];
  /** Zeilen-Klick → overlay.push auf das GaesteUndEinladungen-Detail (nie der Edit-Dialog). */
  onOpenGaesteUndEinladungen: (record: GaesteUndEinladungen) => void;
  /** Kontextuelles „+": öffnet den GaesteUndEinladungen-Dialog mit diesem Record vorgesetzt. */
  onAddGaesteUndEinladungen: () => void;
}

export function TischeDetails({
  record,
  gaesteUndEinladungenList,
  onOpenGaesteUndEinladungen,
  onAddGaesteUndEinladungen,
}: TischeDetailsProps) {
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('tische', 'tischname')} value={record.fields.tischname} format="text" />
        <RecordField label={fieldLabel('tische', 'tischnummer')} value={record.fields.tischnummer} format="text" />
        <RecordField label={fieldLabel('tische', 'anzahl_plaetze')} value={record.fields.anzahl_plaetze} format="text" />
        <RecordField label={fieldLabel('tische', 'standort')} value={record.fields.standort} format="text" />
        <RecordField label={fieldLabel('tische', 'bemerkung')} value={record.fields.bemerkung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('gaeste_und_einladungen')}
        items={gaesteUndEinladungenList.filter(r => extractRecordId(r.fields.tisch) === record.record_id)}
        map={r => ({ name: r.fields.gast_firstname ?? appLabel('gaeste_und_einladungen'), meta: r.fields.einladungsdatum })}
        onOpen={onOpenGaesteUndEinladungen}
        onAdd={onAddGaesteUndEinladungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.TISCHE} recordId={record.record_id} />
    </>
  );
}
