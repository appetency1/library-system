function formatLocalDate(reference = new Date()) {
  const offset = reference.getTimezoneOffset() * 60_000;
  return new Date(reference.getTime() - offset).toISOString().slice(0, 10);
}

function formatLocalTime(reference = new Date()) {
  return `${String(reference.getHours()).padStart(2, "0")}:${String(
    reference.getMinutes()
  ).padStart(2, "0")}`;
}

export function isReservationWindowInPast(reserveDate, startTime, reference = new Date()) {
  if (!reserveDate || !startTime) {
    return false;
  }

  const today = formatLocalDate(reference);
  if (reserveDate < today) {
    return true;
  }
  if (reserveDate > today) {
    return false;
  }

  return startTime < formatLocalTime(reference);
}
