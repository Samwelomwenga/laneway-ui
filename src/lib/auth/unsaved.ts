const entries = new Set<{ name: string }>()

/**
 * An input with unsaved changes registers a name, like `Card description`, and calls the returned
 * function once it saves or clears. A tab signed out from another tab lists these as lost.
 */
export function registerUnsaved(name: string): () => void {
  const entry = { name }
  entries.add(entry)
  return () => {
    entries.delete(entry)
  }
}

export function unsavedNames(): string[] {
  return [
    ...new Set(Array.from(entries, entry => entry.name)),
  ]
}
