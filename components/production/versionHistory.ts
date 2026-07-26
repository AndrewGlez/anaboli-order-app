export interface VersionInfo {
  version: number;
  createdAt: string;
  date: string;
}

export function formatVersionLabel(version: VersionInfo): string {
  return `Versión ${version.version}`;
}

export function isHistoricalVersion(versions: VersionInfo[], currentVersion: number): boolean {
  if (versions.length === 0) return false;
  const latestVersion = Math.max(...versions.map(v => v.version));
  return currentVersion < latestVersion;
}

export function getReadOnlyMessage(isHistorical: boolean): string | null {
  if (isHistorical) {
    return "Estás viendo una versión anterior. Modo sólo lectura.";
  }
  return null;
}

export function sortVersionsDesc(versions: VersionInfo[]): VersionInfo[] {
  return [...versions].sort((a, b) => b.version - a.version);
}

export function formatVersionTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
