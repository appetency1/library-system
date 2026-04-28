export function assertValidDate(value: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("INVALID_DATE");
  }
}

export function assertValidTime(value: string): void {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new Error("INVALID_TIME");
  }
}

export function timeToMinutes(value: string): number {
  assertValidTime(value);
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function assertTimeWindow(startTime: string, endTime: string): void {
  assertValidTime(startTime);
  assertValidTime(endTime);

  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    throw new Error("INVALID_TIME_RANGE");
  }
}

export function slotsOverlap(
  leftStart: string,
  leftEnd: string,
  rightStart: string,
  rightEnd: string
): boolean {
  return (
    timeToMinutes(leftStart) < timeToMinutes(rightEnd) &&
    timeToMinutes(rightStart) < timeToMinutes(leftEnd)
  );
}

export function todayDate(reference = new Date()): string {
  const offset = reference.getTimezoneOffset() * 60_000;
  return new Date(reference.getTime() - offset).toISOString().slice(0, 10);
}

export function currentTimestamp(reference = new Date()): string {
  return reference.toISOString();
}
