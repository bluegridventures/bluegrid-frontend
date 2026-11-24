/**
 * Stores that hold server data register a reset function here; signing out calls resetAllStores()
 * so the next user never sees the previous user's lists.
 */
const resetters = new Set();
export const registerReset = (fn) => resetters.add(fn);
export const resetAllStores = () => resetters.forEach((fn) => fn());
