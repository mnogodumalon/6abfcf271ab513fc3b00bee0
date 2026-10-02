import { useMemo } from 'react';
import { format } from 'date-fns';
import { IconAlertTriangle, IconPlus, IconUsers, IconCash, IconChecklist, IconHeartHandshake } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import type { EnrichedGaesteUndEinladungen } from '@/types/enriched';
import type { Aufgaben, Budget, Dienstleister } from '@/types/app';
import { LOOKUP_OPTIONS, lookupOption } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { formatDate, formatCurrency, lookupKey } from '@/lib/formatters';
import { useClock, gruss, namen, undoToast } from '@/lib/polish';
import { tx } from '@/i18n';
import { Button } from '@/components/ui/button';
import { DashboardGrid } from '@/components/DashboardGrid';
import { WorkList } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { KanbanWidget, type KanbanCard, type KanbanColumn, type KanbanTone } from '@/components/widgets/KanbanWidget';
import { ChartWidget, type ChartRow } from '@/components/widgets/ChartWidget';

const TASK_NEXT: Record<string, string> = { offen: 'in_arbeit', in_arbeit: 'erledigt' };
const VENDOR_NEXT: Record<string, string> = { anfrage: 'angebot_erhalten', angebot_erhalten: 'gebucht' };

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const {
    gaesteUndEinladungen, dienstleister, aufgaben, budget, tische,
    setAufgaben, setDienstleister, setBudget, fetchAll,
  } = data;
  const clock = useClock();
  const today = format(clock, 'yyyy-MM-dd');

  // ---- writes (one path each: hero, work lists, kanban and overlay footer) ----
  const setTaskStatus = (a: Aufgaben, key: string, msg: string) => {
    const prev = lookupKey(a.fields.status);
    setAufgaben(list => list.map(x => x.record_id === a.record_id ? { ...x, fields: { ...x.fields, status: lookupOption('aufgaben', 'status', key) } } : x));
    LivingAppsService.updateAufgabenEntry(a.record_id, { status: key }).catch(() => fetchAll());
    undoToast(msg, () => {
      if (!prev) return;
      setAufgaben(list => list.map(x => x.record_id === a.record_id ? { ...x, fields: { ...x.fields, status: lookupOption('aufgaben', 'status', prev) } } : x));
      LivingAppsService.updateAufgabenEntry(a.record_id, { status: prev }).catch(() => fetchAll());
    });
  };
  const advanceTask = (a: Aufgaben) => {
    const next = TASK_NEXT[lookupKey(a.fields.status) ?? 'offen'];
    if (!next) return;
    const title = a.fields.titel ?? '';
    setTaskStatus(a, next, next === 'erledigt' ? tx`${title} — erledigt` : tx`${title} — in Arbeit`);
  };

  const advanceVendor = (d: Dienstleister) => {
    const prev = lookupKey(d.fields.status) ?? 'anfrage';
    const next = VENDOR_NEXT[prev];
    if (!next) return;
    const name = d.fields.firmenname ?? '';
    const apply = (key: string) => {
      setDienstleister(list => list.map(x => x.record_id === d.record_id ? { ...x, fields: { ...x.fields, status: lookupOption('dienstleister', 'status', key) } } : x));
      LivingAppsService.updateDienstleisterEntry(d.record_id, { status: key }).catch(() => fetchAll());
    };
    apply(next);
    undoToast(next === 'gebucht' ? tx`${name} — gebucht` : tx`${name} — Angebot erhalten`, () => apply(prev));
  };

  const payBudget = (b: Budget) => {
    const prevStatus = lookupKey(b.fields.zahlungsstatus) ?? 'offen';
    const prevAmount = b.fields.tatsaechlicher_betrag;
    const prevDate = b.fields.zahlungsdatum;
    const amount = prevAmount ?? b.fields.geplanter_betrag;
    const name = b.fields.bezeichnung ?? '';
    setBudget(list => list.map(x => x.record_id === b.record_id ? { ...x, fields: { ...x.fields, zahlungsstatus: lookupOption('budget', 'zahlungsstatus', 'bezahlt'), tatsaechlicher_betrag: amount, zahlungsdatum: today } } : x));
    LivingAppsService.updateBudgetEntry(b.record_id, { zahlungsstatus: 'bezahlt', tatsaechlicher_betrag: amount, zahlungsdatum: today }).catch(() => fetchAll());
    undoToast(tx`${name} — als bezahlt markiert`, () => {
      setBudget(list => list.map(x => x.record_id === b.record_id ? { ...x, fields: { ...x.fields, zahlungsstatus: lookupOption('budget', 'zahlungsstatus', prevStatus), tatsaechlicher_betrag: prevAmount, zahlungsdatum: prevDate } } : x));
      LivingAppsService.updateBudgetEntry(b.record_id, { zahlungsstatus: prevStatus, tatsaechlicher_betrag: prevAmount, zahlungsdatum: prevDate }).catch(() => fetchAll());
    });
  };

  const crud = useEntityCrud(data, {
    footer: (top) => {
      if (top.type === 'aufgaben') {
        const s = lookupKey(top.record.fields.status) ?? 'offen';
        const rec = aufgaben.find(x => x.record_id === top.record.record_id);
        if (!rec || !TASK_NEXT[s]) return undefined;
        return { label: s === 'offen' ? tx('Jetzt starten') : tx('Als erledigt markieren'), onClick: () => advanceTask(rec) };
      }
      if (top.type === 'dienstleister') {
        const s = lookupKey(top.record.fields.status) ?? 'anfrage';
        const rec = dienstleister.find(x => x.record_id === top.record.record_id);
        if (!rec || !VENDOR_NEXT[s]) return undefined;
        return { label: s === 'anfrage' ? tx('Angebot erhalten') : tx('Als gebucht markieren'), onClick: () => advanceVendor(rec) };
      }
      if (top.type === 'budget') {
        const rec = budget.find(x => x.record_id === top.record.record_id);
        if (!rec || lookupKey(rec.fields.zahlungsstatus) === 'bezahlt') return undefined;
        return { label: tx('Als bezahlt markieren'), onClick: () => payBudget(rec) };
      }
      return undefined;
    },
  });
  const enrichedGaeste = crud.enriched.gaesteUndEinladungen;

  // ---- derived data ----
  const guestName = (g: EnrichedGaesteUndEinladungen) => [g.fields.gast_firstname, g.fields.gast_lastname].filter(Boolean).join(' ') || tx('Gast');
  const persons = (g: EnrichedGaesteUndEinladungen) => g.fields.anzahl_personen ?? 1;

  const openTasks = useMemo(() => aufgaben.filter(a => lookupKey(a.fields.status) !== 'erledigt'), [aufgaben]);
  const overdue = useMemo(
    () => openTasks
      .filter(a => a.fields.faelligkeitsdatum && a.fields.faelligkeitsdatum.slice(0, 10) < today)
      .sort((a, b) => (a.fields.faelligkeitsdatum ?? '').localeCompare(b.fields.faelligkeitsdatum ?? '')),
    [openTasks, today],
  );
  const nextTask = useMemo(
    () => openTasks.filter(a => a.fields.faelligkeitsdatum && a.fields.faelligkeitsdatum.slice(0, 10) >= today)
      .sort((a, b) => (a.fields.faelligkeitsdatum ?? '').localeCompare(b.fields.faelligkeitsdatum ?? ''))[0],
    [openTasks, today],
  );

  const activeGuests = enrichedGaeste.filter(g => {
    const s = lookupKey(g.fields.einladungsstatus);
    return s !== 'abgesagt' && s !== 'nicht_eingeladen';
  });
  const ohneTisch = activeGuests.filter(g => !g.fields.tisch);
  const invited = enrichedGaeste.filter(g => lookupKey(g.fields.einladungsstatus) !== 'nicht_eingeladen');
  const zugesagt = enrichedGaeste.filter(g => lookupKey(g.fields.einladungsstatus) === 'zugesagt');
  const zugesagtPersons = zugesagt.reduce((s, g) => s + persons(g), 0);
  const invitedPersons = invited.reduce((s, g) => s + persons(g), 0);
  const ohneAntwort = enrichedGaeste.filter(g => lookupKey(g.fields.einladungsstatus) === 'eingeladen');

  const offeneZahlungen = budget.filter(b => lookupKey(b.fields.zahlungsstatus) !== 'bezahlt');
  const offenSumme = offeneZahlungen.reduce((s, b) => s + ((b.fields.tatsaechlicher_betrag ?? b.fields.geplanter_betrag) ?? 0), 0);
  const geplant = budget.reduce((s, b) => s + (b.fields.geplanter_betrag ?? 0), 0);
  const ausgegeben = budget.reduce((s, b) => s + (b.fields.tatsaechlicher_betrag ?? 0), 0);

  const ungebucht = dienstleister.filter(d => {
    const s = lookupKey(d.fields.status);
    return s !== 'gebucht' && s !== 'abgesagt';
  });

  const tableRows = useMemo<ChartRow<EnrichedGaesteUndEinladungen>[]>(
    () => enrichedGaeste
      .filter(g => g.tischName && lookupKey(g.fields.einladungsstatus) !== 'abgesagt')
      .map(g => ({ id: `gast:${g.record_id}`, data: g })),
    [enrichedGaeste],
  );

  // ---- kanban ----
  const columns: KanbanColumn[] = (LOOKUP_OPTIONS['aufgaben']?.['status'] ?? []).map(o => ({ key: o.key, label: o.label }));
  const toneFor = (s: string): KanbanTone => (s === 'erledigt' ? 'success' : s === 'in_arbeit' ? 'primary' : 'default');
  const cards: KanbanCard[] = aufgaben
    .slice()
    .sort((a, b) => (a.fields.faelligkeitsdatum ?? '9999').localeCompare(b.fields.faelligkeitsdatum ?? '9999'))
    .map(a => {
      const s = lookupKey(a.fields.status) ?? 'offen';
      const due = a.fields.faelligkeitsdatum ? formatDate(a.fields.faelligkeitsdatum) : '';
      return {
        id: `aufgabe:${a.record_id}`,
        column: s,
        title: a.fields.titel ?? tx('Ohne Titel'),
        subtitle: [due, a.fields.prioritaet?.label].filter(Boolean).join(' · '),
        tone: toneFor(s),
      };
    });

  // ---- header ----
  const total = tische.length + gaesteUndEinladungen.length + dienstleister.length + aufgaben.length + budget.length;
  let context: string;
  if (total === 0) context = tx('Fang mit den Gästen oder den ersten Aufgaben an.');
  else if (ohneTisch.length > 0) context = tx`${namen(ohneTisch.map(g => g.fields.gast_firstname ?? ''))} brauchen noch einen Tisch.`;
  else if (offeneZahlungen.length > 0) context = tx`Noch zu bezahlen: ${offeneZahlungen.slice(0, 2).map(b => b.fields.bezeichnung ?? '').join(', ')}.`;
  else if (ungebucht.length > 0) context = tx`Noch nicht gebucht: ${ungebucht.slice(0, 2).map(d => d.fields.firmenname ?? '').join(', ')}.`;
  else if (nextTask) context = tx`Als Nächstes: ${nextTask.fields.titel ?? ''} bis ${formatDate(nextTask.fields.faelligkeitsdatum)}.`;
  else context = tx('Alles im Plan — die Hochzeit kann kommen.');

  const hero = total === 0 ? (
    <HeroBanner icon={<IconHeartHandshake size={48} />} action={{ label: tx('Ersten Gast anlegen'), onClick: () => crud.gaesteUndEinladungen.openCreate({ einladungsstatus: 'nicht_eingeladen' }) }}>
      {tx('Noch ist alles leer — leg deine Gästeliste an und plane Schritt für Schritt.')}
    </HeroBanner>
  ) : overdue.length > 0 ? (
    <HeroBanner icon={<IconAlertTriangle size={18} />} action={{ label: tx('Als erledigt markieren'), onClick: () => setTaskStatus(overdue[0], 'erledigt', tx`${overdue[0].fields.titel ?? ''} — erledigt`) }}>
      <b>{overdue.slice(0, 3).map(a => a.fields.titel ?? '').join(', ')}</b>{' '}
      {overdue.length === 1 ? tx`ist überfällig — fällig war ${formatDate(overdue[0].fields.faelligkeitsdatum)}.` : tx`sind überfällig — die älteste war fällig am ${formatDate(overdue[0].fields.faelligkeitsdatum)}.`}
    </HeroBanner>
  ) : null;

  const tasksDone = aufgaben.length - openTasks.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight truncate">{gruss(clock)}</h1>
          <p className="text-sm text-muted-foreground">{context}</p>
        </div>
        <Button onClick={() => crud.aufgaben.openCreate({ status: 'offen' })} className="w-full sm:w-auto">
          <IconPlus size={16} className="shrink-0" />
          {tx('Neue Aufgabe')}
        </Button>
      </div>

      <DashboardGrid
        variant="wide"
        hero={hero}
        kpis={total === 0 ? undefined : (
          <StatStrip>
            <StatStripItem
              title={tx('Zusagen')}
              value={`${zugesagtPersons} / ${invitedPersons}`}
              icon={<IconUsers size={18} className="text-muted-foreground" />}
              tone={ohneAntwort.length > 0 ? 'warning' : 'success'}
            />
            <StatStripItem
              title={tx('Ohne Antwort')}
              value={ohneAntwort.length}
              icon={<IconUsers size={18} className="text-muted-foreground" />}
            />
            <StatStripItem
              title={tx('Budget ausgegeben')}
              value={`${formatCurrency(ausgegeben)} / ${formatCurrency(geplant)}`}
              icon={<IconCash size={18} className="text-muted-foreground" />}
              tone={geplant > 0 && ausgegeben > geplant ? 'destructive' : 'default'}
            />
            <StatStripItem
              title={tx('Aufgaben erledigt')}
              value={`${tasksDone} / ${aufgaben.length}`}
              icon={<IconChecklist size={18} className="text-muted-foreground" />}
            />
          </StatStrip>
        )}
        primary={
          <KanbanWidget
            cards={cards}
            columns={columns}
            defaultCollapsed={['erledigt']}
            onCardClick={card => {
              const rec = aufgaben.find(a => a.record_id === card.id.split(':')[1]);
              if (rec) crud.aufgaben.openDetail(rec);
            }}
            onCardMove={(cardId, newColumn) => {
              const rec = aufgaben.find(a => a.record_id === cardId.split(':')[1]);
              if (!rec || lookupKey(rec.fields.status) === newColumn) return;
              const title = rec.fields.titel ?? '';
              setTaskStatus(rec, newColumn, tx`${title} verschoben`);
            }}
            onAddCard={column => crud.aufgaben.openCreate({ status: column })}
          />
        }
        aside={
          <>
            <WorkList
              title={tx('Gäste ohne Tisch')}
              items={ohneTisch.map(g => ({
                id: g.record_id,
                title: guestName(g),
                secondLine: <span className="text-muted-foreground">{g.fields.einladungsstatus?.label} · {persons(g)} {tx('Pers.')}</span>,
                action: { label: tx('Tisch zuweisen'), onClick: () => crud.gaesteUndEinladungen.openEdit(g) },
              }))}
              onItemClick={id => { const g = gaesteUndEinladungen.find(x => x.record_id === id); if (g) crud.gaesteUndEinladungen.openDetail(g); }}
              empty={{ text: tx('Alle Gäste haben einen Platz.'), action: { label: tx('Gast anlegen'), onClick: () => crud.gaesteUndEinladungen.openCreate({}) } }}
            />
            <WorkList
              title={tx('Offene Zahlungen')}
              items={offeneZahlungen.map(b => ({
                id: b.record_id,
                title: b.fields.bezeichnung ?? tx('Posten'),
                secondLine: <span className="text-muted-foreground">{formatCurrency(b.fields.tatsaechlicher_betrag ?? b.fields.geplanter_betrag)} · {b.fields.zahlungsstatus?.label}</span>,
                action: { label: tx('Bezahlt'), onClick: () => payBudget(b) },
              }))}
              onItemClick={id => { const b = budget.find(x => x.record_id === id); if (b) crud.budget.openDetail(b); }}
              empty={{ text: tx('Alles bezahlt.'), action: { label: tx('Posten anlegen'), onClick: () => crud.budget.openCreate({}) } }}
            />
            <WorkList
              title={tx('Noch nicht gebucht')}
              items={ungebucht.map(d => ({
                id: d.record_id,
                title: d.fields.firmenname ?? tx('Dienstleister'),
                secondLine: <span className="text-muted-foreground">{d.fields.kategorie?.label} · {d.fields.status?.label}</span>,
                action: { label: lookupKey(d.fields.status) === 'angebot_erhalten' ? tx('Buchen') : tx('Angebot da'), onClick: () => advanceVendor(d) },
              }))}
              onItemClick={id => { const d = dienstleister.find(x => x.record_id === id); if (d) crud.dienstleister.openDetail(d); }}
              empty={{ text: tx('Alle Dienstleister sind gebucht.'), action: { label: tx('Dienstleister anlegen'), onClick: () => crud.dienstleister.openCreate({ status: 'anfrage' }) } }}
            />
            <ChartWidget<EnrichedGaesteUndEinladungen>
              title={tx('Belegung der Tische')}
              rows={tableRows}
              dimension={{ kind: 'category', accessor: r => r.data.tischName, label: tx('Tisch') }}
              measure={{ aggregate: 'sum', label: tx('Personen'), value: r => r.data.fields.anzahl_personen ?? 1, format: 'number' }}
            />
          </>
        }
      />
      {crud.surfaces}
    </div>
  );
}
