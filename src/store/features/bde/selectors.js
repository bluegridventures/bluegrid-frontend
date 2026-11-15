import { isOwned } from './bdeFns';

/** Open follow-ups for the signed-in BDE, soonest first. */
export const getFollowUps = (leads) =>
  leads.filter((l) => isOwned(l) && l.follow && !l.follow.done).sort((a, b) => a.follow.at - b.follow.at);
