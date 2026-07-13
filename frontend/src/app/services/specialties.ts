// Single source of truth for the specialty list used across signup,
// doctor setup, and (once wired in) profile settings / doctor search filters.
// Add new specialties here ONCE and every screen picks it up automatically.

export const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "General Practice",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Oncology",
] as const;

export const OTHERS_VALUE = "Others";

/**
 * Returns true if `value` is one of our known specialties (case-insensitive).
 * Useful for deciding whether to show a saved specialty as a matched option
 * or fall back to treating it as a custom / "Others" value.
 */
export function isKnownSpecialty(value?: string | null): boolean {
  if (!value) return false;
  return SPECIALTIES.some(s => s.toLowerCase() === value.toLowerCase());
}

/**
 * Given a specialty possibly saved as free text (e.g. via "Others"),
 * returns the dropdown/button selection state: either the matching known
 * specialty, or OTHERS_VALUE if it's a custom one — plus the custom text
 * to prefill into a free-text input.
 */
export function resolveSpecialtySelection(saved?: string | null): {
  selected: string;
  customText: string;
} {
  if (!saved) return { selected: "", customText: "" };
  if (isKnownSpecialty(saved)) {
    const match = SPECIALTIES.find(s => s.toLowerCase() === saved.toLowerCase())!;
    return { selected: match, customText: "" };
  }
  return { selected: OTHERS_VALUE, customText: saved };
}

/**
 * Given the current selection + custom text (from a form using OTHERS_VALUE),
 * returns the final string that should actually be sent to the backend.
 */
export function resolveSpecialtyForSubmit(selected: string, customText: string): string {
  if (selected === OTHERS_VALUE) return customText.trim();
  return selected;
}