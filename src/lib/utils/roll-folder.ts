/**
 * Remember a local src/lib/roll folder so later sends write straight into it.
 * Chromium only; the handle lives in IndexedDB on this device.
 */

interface DirectoryPickerOptions {
  mode?: 'read' | 'readwrite';
  id?: string;
}

declare global {
  interface FileSystemDirectoryHandle {
    queryPermission(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
    requestPermission(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
  }

  interface Window {
    showDirectoryPicker(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
  }
}

declare function showDirectoryPicker(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;

const DB = 'roll-sink';
const STORE = 'handles';
const KEY = 'dir';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(): Promise<FileSystemDirectoryHandle | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve(req.result as FileSystemDirectoryHandle | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(handle: FileSystemDirectoryHandle | undefined): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const store = db.transaction(STORE, 'readwrite').objectStore(STORE);
    const req = handle ? store.put(handle, KEY) : store.delete(KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function canPickRollFolder(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

async function permit(dir: FileSystemDirectoryHandle, ask: boolean): Promise<boolean> {
  const mode = { mode: 'readwrite' as const };
  const current = await dir.queryPermission(mode);
  if (current === 'granted') return true;
  if (!ask) return false;
  return (await dir.requestPermission(mode)) === 'granted';
}

/** The folder picked earlier, if this browser still has it and can write. */
export async function savedRollFolder(ask = false): Promise<FileSystemDirectoryHandle | null> {
  try {
    const dir = await idbGet();
    if (!dir) return null;
    if (!(await permit(dir, ask))) return ask ? null : dir;
    return dir;
  } catch {
    return null;
  }
}

export async function pickRollFolder(): Promise<FileSystemDirectoryHandle> {
  const dir = await showDirectoryPicker({ mode: 'readwrite', id: 'roll' });
  await idbSet(dir);
  return dir;
}

export async function forgetRollFolder(): Promise<void> {
  try {
    await idbSet(undefined);
  } catch {
    /* private mode */
  }
}

export async function writeRollFiles(
  dir: FileSystemDirectoryHandle,
  files: { name: string; blob: Blob }[],
): Promise<void> {
  if (!(await permit(dir, true))) throw new Error('permission');
  for (const file of files) {
    const handle = await dir.getFileHandle(file.name, { create: true });
    const writable = await handle.createWritable();
    await writable.write(file.blob);
    await writable.close();
  }
}
