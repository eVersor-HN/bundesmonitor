// Hilfen, um einzelne Filterdimensionen (topic/party/bundesland) in der URL zu
// aendern, ohne die anderen zu verlieren.

export function withParam(
  current: URLSearchParams,
  name: string,
  values: string[],
): string {
  const sp = new URLSearchParams(current.toString());
  sp.delete(name);
  for (const v of values) sp.append(name, v);
  return sp.toString();
}

export function toggleInParam(
  current: URLSearchParams,
  name: string,
  value: string,
): string {
  const existing = current.getAll(name);
  const next = existing.includes(value)
    ? existing.filter((v) => v !== value)
    : [...existing, value];
  return withParam(current, name, next);
}
