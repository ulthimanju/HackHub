/**
 * Normalize a value to UPPER_CASE before sending to the API.
 * e.g. "active" → "ACTIVE", "Registration_Open" → "REGISTRATION_OPEN"
 */
export const toEnumValue = (value) =>
  value?.toString().toUpperCase().trim() ?? null;

/**
 * Format an enum value for display.
 * e.g. "REGISTRATION_OPEN" → "Registration Open"
 */
export const formatEnum = (value) =>
  value
    ? value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : '';
