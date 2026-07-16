export function isSampleReport(slug: string) {
  return slug === "sample-neil-fox-agency";
}

export function stripOuterQuotationMarks(value: string) {
  return value
    .trim()
    .replace(/^["'“”‘’]+/, "")
    .replace(/["'“”‘’]+$/, "")
    .trim();
}
