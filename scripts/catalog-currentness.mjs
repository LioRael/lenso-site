export function catalogIsCurrent(expiresAt, now = Date.now()) {
  return Number.isSafeInteger(expiresAt) && expiresAt > 0 && expiresAt * 1000 > now;
}

export function adoptionIsCurrent(expirations, now = Date.now()) {
  return expirations.length > 0 && expirations.every((expiry) => catalogIsCurrent(expiry, now));
}
