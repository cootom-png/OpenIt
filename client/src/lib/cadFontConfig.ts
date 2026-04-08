/**
 * CAD Font CDN Configuration
 * 
 * Maps original font filenames to CDN URLs.
 * These fonts are pre-uploaded to CDN to avoid downloading from external sources
 * (mlightcad.gitlab.io) every time a DWG file is opened.
 * 
 * This significantly improves loading speed, especially for users in China.
 */

const CDN_BASE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663486221484/3j4sFbGUefQfhYED2wtVaa";

/** Mapping of original font filename -> CDN URL */
export const CAD_FONT_CDN_MAP: Record<string, string> = {
  // Chinese fonts
  "chineset.shx": `${CDN_BASE}/chineset_c20f0549.shx`,
  "gbcbig.shx": `${CDN_BASE}/gbcbig_da180861.shx`,
  "gbeitc.shx": `${CDN_BASE}/gbeitc_359383da.shx`,
  "gbenor.shx": `${CDN_BASE}/gbenor_94813189.shx`,
  "gbgdt.woff": `${CDN_BASE}/gbgdt_50140bfb.woff`,
  "hztxt.shx": `${CDN_BASE}/hztxt_209e5b91.shx`,
  "simkai.woff": `${CDN_BASE}/simkai_6129c684.woff`,
  "simhei.woff": `${CDN_BASE}/simhei_c90a8c36.woff`,
  "simsun.woff": `${CDN_BASE}/simsun_9f2da142.woff`,
  // Common CAD fonts
  "simplex.shx": `${CDN_BASE}/simplex_c7d90801.shx`,
  "txt.shx": `${CDN_BASE}/txt_15450d58.shx`,
  "romans.shx": `${CDN_BASE}/romans_8a6f1da3.shx`,
  "italic.shx": `${CDN_BASE}/italic_77b96ace.shx`,
  "monotxt.shx": `${CDN_BASE}/monotxt_b73cee6c.shx`,
  "complex.shx": `${CDN_BASE}/complex_24fe6414.shx`,
  "isocp.shx": `${CDN_BASE}/isocp_21827e97.shx`,
  "isocpeur.shx": `${CDN_BASE}/isocpeur_2101024a.shx`,
  // Other commonly used
  "arial.woff": `${CDN_BASE}/arial_4ba43879.woff`,
  "bold.shx": `${CDN_BASE}/bold_fbf00604.shx`,
  "bigfont.shx": `${CDN_BASE}/bigfont_599c33ce.shx`,
  "extfont.shx": `${CDN_BASE}/extfont_491db51b.shx`,
  "ltypeshp.shx": `${CDN_BASE}/ltypeshp_37a3ca4d.shx`,
};

/** CDN URL for fonts.json */
export const CAD_FONTS_JSON_URL = `${CDN_BASE}/fonts_601a77e7.json`;

/**
 * Get CDN URL for a font file.
 * Returns the CDN URL if the font is pre-cached, otherwise returns null.
 */
export function getCdnFontUrl(filename: string): string | null {
  return CAD_FONT_CDN_MAP[filename] || null;
}

/**
 * Check if a font is available in CDN cache.
 */
export function isFontCached(filename: string): boolean {
  return filename in CAD_FONT_CDN_MAP;
}
