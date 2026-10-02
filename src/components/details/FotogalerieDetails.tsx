import type { Fotogalerie, GaesteUndEinladungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { MediaThumbnail } from '@/components/widgets/MediaViewer';

export interface FotogalerieDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Fotogalerie;
  /** N:1-Ziel „GaesteUndEinladungen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  gaesteUndEinladungenList: GaesteUndEinladungen[];
  /** Klick auf die GaesteUndEinladungen-Relation → overlay.push auf dessen Detail. */
  onOpenGaesteUndEinladungen?: (record: GaesteUndEinladungen) => void;
}

export function FotogalerieDetails({
  record,
  gaesteUndEinladungenList,
  onOpenGaesteUndEinladungen,
}: FotogalerieDetailsProps) {
  const gastTarget = gaesteUndEinladungenList.find(r => r.record_id === extractRecordId(record.fields.gast));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('fotogalerie', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('fotogalerie', 'foto')} className="md:col-span-2">
          {record.fields.foto ? (
            <MediaThumbnail src={record.fields.foto as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('fotogalerie', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('fotogalerie', 'aufnahmedatum')} value={record.fields.aufnahmedatum} format="date" />
        <RecordField label={fieldLabel('fotogalerie', 'anlass')} value={record.fields.anlass} format="pill" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('fotogalerie', 'gast')}
          name={gastTarget?.fields.gast_firstname ?? '—'}
          meta={[gastTarget?.fields.email, gastTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={gastTarget && onOpenGaesteUndEinladungen ? () => onOpenGaesteUndEinladungen!(gastTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.FOTOGALERIE} recordId={record.record_id} />
    </>
  );
}
