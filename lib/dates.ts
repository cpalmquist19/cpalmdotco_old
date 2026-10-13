// Months come from the content files as YYYY-MM. Dates are built in UTC, so no time zone can move the month.
const MONTH = /^(\d{4})-(\d{2})$/;
const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

// "2021-03" -> "Mar 2021"
export function formatMonth(month: string): string {
  const match = MONTH.exec(month);
  if (match === null) throw new Error(`not a YYYY-MM month: ${month}`);
  const [, year = "", monthNumber = ""] = match;
  return monthFormat.format(new Date(Date.UTC(Number(year), Number(monthNumber) - 1)));
}

// "2021-03", "present" -> "Mar 2021 – Present". The spaces round the en dash.
export function formatRange(start: string, end: string): string {
  const to = end === "present" ? "Present" : formatMonth(end);
  return `${formatMonth(start)} – ${to}`;
}
