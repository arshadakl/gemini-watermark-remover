/**
 * Minimal IndexedDB persistence for processed results.
 *
 * Used to survive page reloads without re-processing, and to keep the large
 * output blob out of a reactive ref where it could be double-buffered. Data is
 * cleared when the user uploads a new file, resets, or leaves the page.
 */

import type { ProcessingMode } from '~/lib/types'

export interface PersistedResult {
  mode: ProcessingMode
  inputFile: File
  resultBlob: Blob
  createdAt: number
}

function toFile(blob: Blob, name: string, type: string): File {
  if (blob instanceof File && blob.name) return blob
  return new File([blob], name, { type })
}

const DB_NAME = 'watermark-remover'
const STORE = 'results'
const VERSION = 1

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not supported in this browser'))
  }
  if (dbPromise) return dbPromise
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'mode' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
    req.onblocked = () => reject(new Error('IndexedDB open blocked'))
  })
  return dbPromise
}

/** Persist an input file + processed result blob, keyed by mode. */
export async function saveResult(entry: PersistedResult): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const t = db.transaction(STORE, 'readwrite')
      t.objectStore(STORE).put(entry)
      t.oncomplete = () => resolve()
      t.onerror = () => reject(t.error)
      t.onabort = () => reject(t.error)
    })
  } catch (e) {
    // Persistence is best-effort; never block the user on a storage failure.
    console.warn('[useIndexedDb] saveResult failed', e)
  }
}

/** Load a previously persisted result for a given mode, if any. */
export async function loadResult(mode: ProcessingMode): Promise<PersistedResult | null> {
  try {
    const db = await openDb()
    return await new Promise<PersistedResult | null>((resolve, reject) => {
      const t = db.transaction(STORE, 'readonly')
      const req = t.objectStore(STORE).get(mode)
      req.onsuccess = () => {
        const raw = req.result as PersistedResult | undefined
        if (!raw || !raw.inputFile || !raw.resultBlob) {
          resolve(null)
          return
        }
        // Normalise the input back to a File (some browsers return a plain Blob).
        raw.inputFile = toFile(raw.inputFile, raw.inputFile.name, raw.inputFile.type)
        resolve(raw)
      }
      req.onerror = () => reject(req.error)
    })
  } catch (e) {
    console.warn('[useIndexedDb] loadResult failed', e)
    return null
  }
}

/** Remove a single persisted result. */
export async function clearResult(mode: ProcessingMode): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const t = db.transaction(STORE, 'readwrite')
      t.objectStore(STORE).delete(mode)
      t.oncomplete = () => resolve()
      t.onerror = () => reject(t.error)
      t.onabort = () => reject(t.error)
    })
  } catch (e) {
    console.warn('[useIndexedDb] clearResult failed', e)
  }
}

/** Remove every persisted result. */
export async function clearAllResults(): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const t = db.transaction(STORE, 'readwrite')
      t.objectStore(STORE).clear()
      t.oncomplete = () => resolve()
      t.onerror = () => reject(t.error)
      t.onabort = () => reject(t.error)
    })
  } catch (e) {
    console.warn('[useIndexedDb] clearAllResults failed', e)
  }
}
