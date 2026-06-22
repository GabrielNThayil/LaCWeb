// Reusable blur placeholder for Next.js Image — prevents layout shift.
// Pass a base64 string from any blur generator (plaiceholder, sharp, etc.)
// or use the warm cream solid fallback below for zero-dependency.
export const blurPlaceholder =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAQFBAYFBQYJBgUGCQsIBgYICwwKCgsKCgwQDAwMDAwMEAwODxAPDgwTExQUExMcGxsbHCAgICAgICAgICD/2wBDAQcHBw0MDRgQEBgaFREVGiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICD/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUE/8QAIhAAAQMDBQEBAAAAAAAAAAAAAQIDBAAFEQYSIRMxQWH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AvNJ1G1bLTCt8iI44qO0lCHEqGFAAgcH3yMf2qj1LqS5z7nNuEW8S4TMqSt9LCJDgS2VHJAAPjj2jilJRFNGl6nujE+4y5LU2Qhch9bi20PrCUqUSSAM8cn3SlKSKf/2Q==";

// Warm cream fallback matching the crown-paper bg (#FFF8EC)
export const creamBlurred =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#FFF8EC"/><rect width="4" height="4" fill="#F7F0E4" opacity="0.5"/></svg>`
  ).replace(/\n/g, "");

/**
 * Returns a tiny base64-encoded SVG of a given hex color.
 * Use with Next.js Image placeholder="blur" blurDataURL prop.
 */
export function solidBlur(color: string, width = 4, height = 4): string {
  return (
    "data:image/svg+xml;base64," +
    btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="${color}"/></svg>`)
  );
}

// Pre-computed theme-color placeholders (reuse across images)
export const PLACEHOLDERS = {
  paper: solidBlur("#FFF8EC"),       // crown-paper — warm off-white
  cream:  solidBlur("#F7F0E4"),      // crown-cream — slightly warmer
  espresso: solidBlur("#61481C"),   // crown-espresso — dark brown
};