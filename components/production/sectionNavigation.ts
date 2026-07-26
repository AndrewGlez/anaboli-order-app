export const SECTIONS = [
  { id: "date-selector", label: "Fecha" },
  { id: "summary", label: "Resumen" },
  { id: "production-table", label: "Producción" },
  { id: "customer-distribution", label: "Clientes" },
  { id: "version-history", label: "Historial" },
  { id: "legacy-fixes", label: "Correcciones" },
];

export function getSectionId(index: number): string | null {
  if (index < 0 || index >= SECTIONS.length) {
    return null;
  }
  return SECTIONS[index].id;
}

export function getActiveSection(scrollY: number): string {
  // Approximate section positions
  if (scrollY < 150) return "date-selector";
  if (scrollY < 300) return "summary";
  if (scrollY < 700) return "production-table";
  if (scrollY < 1000) return "customer-distribution";
  if (scrollY < 1300) return "version-history";
  return "legacy-fixes";
}

export function isMobileNav(breakpoint: string): boolean {
  return breakpoint === "phone";
}

// Approximate scroll positions for each section
const SECTION_POSITIONS: Record<string, number> = {
  "date-selector": 0,
  "summary": 200,
  "production-table": 500,
  "customer-distribution": 800,
  "version-history": 1100,
  "legacy-fixes": 1400,
};

export function getScrollPositionForSection(sectionId: string): number | null {
  const position = SECTION_POSITIONS[sectionId];
  return position !== undefined ? position : null;
}
