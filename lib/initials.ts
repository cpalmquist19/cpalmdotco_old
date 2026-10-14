// The monogram letters: the first letter of the first and last word, in upper case.
// "Caleb Palmquist" -> "CP". A one-word name gives one letter.
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  const first = words[0] ?? "";
  const last = words[words.length - 1] ?? "";
  return (first.charAt(0) + (words.length > 1 ? last.charAt(0) : "")).toUpperCase();
}
