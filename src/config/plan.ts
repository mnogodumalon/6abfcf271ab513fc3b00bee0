// The orchestrator's plan, as far as the running app needs it
// (docs/orchestrator/SPEC.md). Generated — do not edit; regenerated on every
// build and update from the stored plan. Without a plan every map is empty.
//
//   SYSTEM_ASSIGNED entity → fields a tool fills when a record is CREATED — the
//                   value does not exist before; dialogs hide these on create and
//                   the form-polish sets no default on them. A scheduled or
//                   update-triggered tool owns its field but is NOT in here.
//   PLAN_SENTENCES  slug → the plan in the owner's words (flows' field page)
//
// The runtime write guard (FLOW_WRITES/OWNERSHIP, planGuard.ts) left on
// 23.09.2026: a flow page composes against its generated hook, whose submit
// plan IS the Schreibliste — there is no way to spell a write outside it.

export const SYSTEM_ASSIGNED: Record<string, string[]> = {};

export const PLAN_SENTENCES: Record<string, string[]> = {
  "gast-einladen": [
    "Legt an: gaeste_und_einladungen",
    "Automatisch: einladungsstatus (fester Wert „eingeladen“)"
  ],
  "rueckmeldung-erfassen": [
    "Ändert: gaeste_und_einladungen",
    "Automatisch: rueckmeldedatum (heutiges Datum, automatisch)"
  ],
  "gast-an-tisch-setzen": [
    "Ändert: gaeste_und_einladungen"
  ],
  "dienstleister-buchen": [
    "Legt an: aufgaben, budget",
    "Ändert: dienstleister",
    "Automatisch: status (fester Wert „gebucht“), zahlungsstatus (fester Wert „offen“), status (fester Wert „offen“)"
  ],
  "zahlung-erfassen": [
    "Ändert: budget",
    "Automatisch: zahlungsdatum (heutiges Datum, automatisch)"
  ],
  "aufgabe-abschliessen": [
    "Ändert: aufgaben",
    "Automatisch: status (fester Wert „erledigt“)"
  ]
};

export const PLAN_SUMMARY = "Die Anwendung hilft dem Brautpaar, die Hochzeit zu organisieren: Gäste und Einladungen verwalten, Tische und Sitzordnung planen, Dienstleister im Blick behalten, Aufgaben abarbeiten, das Budget kontrollieren und Fotos sammeln.";
