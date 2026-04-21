/** Encurta GUID para exibição em listas (prefixo … sufixo). */
export function shortId(id: string): string {
  const t = id.trim()
  if (t.length <= 12) return t
  return `${t.slice(0, 4)}…${t.slice(-4)}`
}
