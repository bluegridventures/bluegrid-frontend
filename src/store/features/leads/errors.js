/** Friendly text for the common failure cases; everything else keeps the server's own message. */
export function friendlyError(err) {
  if (!err) return 'Something went wrong. Please try again.';
  if (err.status === 429 || err.code === 'RATE_LIMITED') return 'Too many requests, try again in a few minutes.';
  if (err.code === 'FORBIDDEN') return 'You do not have permission to do this.';
  if (err.code === 'NOT_FOUND') return 'This lead was not found or is not available to you.';
  return err.message || 'Something went wrong. Please try again.';
}
