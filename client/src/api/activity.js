let pending = 0;
const listeners = new Set();
export const subscribeActivity = callback => { listeners.add(callback); return () => listeners.delete(callback); };
export const getActivity = () => pending;
export function changeActivity(delta) { pending = Math.max(0, pending + delta); listeners.forEach(callback => callback()); }
