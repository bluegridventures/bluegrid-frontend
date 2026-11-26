/** Provider local time, computed in the browser from the provider's IANA zone (never from the API). */
export const providerLocalTime = (timeZone) => {
  try {
    return new Date().toLocaleTimeString('en-US', { timeZone, hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  } catch {
    return '—';
  }
};

export const quotaExhausted = (quota) => !!quota && quota.used >= quota.limit;
