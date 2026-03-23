const ALPHA = "abcdefghjkmnpqrstuvwxyz"; // removed look-alike chars (i, l, o)

export const generateCVToken = (length = 6): string =>
  Array.from(
    { length },
    () => ALPHA[Math.floor(Math.random() * ALPHA.length)],
  ).join("");

/**
 * Build the full download filename for a CV.
 *   formatCVFileName("Matthew DeLano")  →  "matthew-delano-cv-kxbmqz.pdf"
 */
export const formatCVFileName = (fullName?: string): string => {
  const slug = (fullName ?? "resume")
    .toLowerCase()
    .trim()
    .replace(/[^a-z\s-]/g, "") // strip non-alpha
    .replace(/\s+/g, "-"); // spaces → hyphens
  return `${slug}-cv-${generateCVToken()}.pdf`;
};
