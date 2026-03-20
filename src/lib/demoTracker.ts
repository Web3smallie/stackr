/**
 * Tracks whether a user has ever interacted with each section.
 * Once a user creates real data in a section, demo is permanently hidden
 * even if they later delete all their data.
 */

const STORAGE_KEY = "stackr:demo-dismissed";

type Section = "vaults" | "pools" | "fundraising" | "gates" | "transactions" | "analytics" | "referrals" | "stacks";

function getState(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function markSectionUsed(section: Section): void {
  const state = getState();
  state[section] = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function wasSectionEverUsed(section: Section): boolean {
  return !!getState()[section];
}

/**
 * Returns true if demo should be shown for a section.
 * Demo shows ONLY if user has no real data AND has never had real data.
 */
export function shouldShowDemo(section: Section, hasRealData: boolean): boolean {
  if (hasRealData) {
    markSectionUsed(section);
    return false;
  }
  return !wasSectionEverUsed(section);
}
