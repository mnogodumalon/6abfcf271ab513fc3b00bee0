import type { GaesteUndEinladungen, Tische, Fotogalerie } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface GaesteUndEinladungenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: GaesteUndEinladungen;
  /** N:1-Ziel „Tische": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  tischeList: Tische[];
  /** Klick auf die Tische-Relation → overlay.push auf dessen Detail. */
  onOpenTische?: (record: Tische) => void;
  /** 1:N „Fotogalerie" (gast): VOLLE Liste — der Block filtert auf diesen Record. */
  fotogalerieList: Fotogalerie[];
  /** Zeilen-Klick → overlay.push auf das Fotogalerie-Detail (nie der Edit-Dialog). */
  onOpenFotogalerie: (record: Fotogalerie) => void;
  /** Kontextuelles „+": öffnet den Fotogalerie-Dialog mit diesem Record vorgesetzt. */
  onAddFotogalerie: () => void;
}

export function GaesteUndEinladungenDetails({
  record,
  tischeList,
  onOpenTische,
  fotogalerieList,
  onOpenFotogalerie,
  onAddFotogalerie,
}: GaesteUndEinladungenDetailsProps) {
  const tischTarget = tischeList.find(r => r.record_id === extractRecordId(record.fields.tisch));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('gaeste_und_einladungen', 'gast_firstname')} value={record.fields.gast_firstname} format="text" />
        <RecordField label={fieldLabel('gaeste_und_einladungen', 'gast_lastname')} value={record.fields.gast_lastname} format="text" />
        <RecordField label={fieldLabel('gaeste_und_einladungen', 'email')} value={record.fields.email} format="email" />
        <RecordField label={fieldLabel('gaeste_und_einladungen', 'telefon')} value={record.fields.telefon} format="text" />
        <RecordField label={fieldLabel('gaeste_und_einladungen', 'strasse')} value={record.fields.strasse} format="text" />
        <RecordField label={fieldLabel('gaeste_und_einladungen', 'hausnummer')} value={record.fields.hausnummer} format="text" />
        <RecordField label={fieldLabel('gaeste_und_einladungen', 'plz')} value={record.fields.plz} format="text" />
        <RecordField label={fieldLabel('gaeste_und_einladungen', 'ort')} value={record.fields.ort} format="text" />
        <RecordField label={fieldLabel('gaeste_und_einladungen', 'seite')} value={record.fields.seite} format="pill" />
        <RecordField label={fieldLabel('gaeste_und_einladungen', 'anzahl_personen')} value={record.fields.anzahl_personen} format="text" />
        <RecordField label={fieldLabel('gaeste_und_einladungen', 'einladungsstatus')} value={record.fields.einladungsstatus} format="pill" />
        <RecordField label={fieldLabel('gaeste_und_einladungen', 'einladungsdatum')} value={record.fields.einladungsdatum} format="date" />
        <RecordField label={fieldLabel('gaeste_und_einladungen', 'rueckmeldedatum')} value={record.fields.rueckmeldedatum} format="date" />
        <RecordField label={fieldLabel('gaeste_und_einladungen', 'menuewunsch')} value={record.fields.menuewunsch} format="pill" />
        <RecordField label={fieldLabel('gaeste_und_einladungen', 'allergien')} value={record.fields.allergien} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('gaeste_und_einladungen', 'bemerkung')} value={record.fields.bemerkung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('gaeste_und_einladungen', 'tisch')}
          name={tischTarget?.fields.tischname ?? '—'}
          meta={[tischTarget?.fields.standort].filter(Boolean).join(' · ') || undefined}
          onClick={tischTarget && onOpenTische ? () => onOpenTische!(tischTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('fotogalerie')}
        items={fotogalerieList.filter(r => extractRecordId(r.fields.gast) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('fotogalerie'), meta: r.fields.aufnahmedatum })}
        onOpen={onOpenFotogalerie}
        onAdd={onAddFotogalerie}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.GAESTE_UND_EINLADUNGEN} recordId={record.record_id} />
    </>
  );
}
