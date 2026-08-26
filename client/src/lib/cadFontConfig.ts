export const CAD_DATA_BASE_URL = "/assets/vendor/v1/cad-data/";

/** Map proprietary/system DWG font names to self-hosted OFL-1.1 fonts. */
export const CAD_OPEN_SOURCE_FONT_MAPPING: Record<string, string> = {
  Arial: "Noto Sans",
  Helvetica: "Noto Sans",
  SimSun: "Noto Sans CJK SC",
  simsun: "Noto Sans CJK SC",
  SimHei: "Noto Sans CJK SC",
  simhei: "Noto Sans CJK SC",
  SimKai: "Noto Sans CJK SC",
  simkai: "Noto Sans CJK SC",
  "Microsoft YaHei": "Noto Sans CJK SC",
  "Courier New": "Noto Sans Mono",
};
