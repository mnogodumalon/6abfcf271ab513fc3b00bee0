import type { Aufgaben, Budget, Fotogalerie, GaesteUndEinladungen } from './app';

export type EnrichedGaesteUndEinladungen = GaesteUndEinladungen & {
  tischName: string;
};

export type EnrichedAufgaben = Aufgaben & {
  dienstleisterName: string;
};

export type EnrichedBudget = Budget & {
  dienstleisterName: string;
};

export type EnrichedFotogalerie = Fotogalerie & {
  gastName: string;
};
