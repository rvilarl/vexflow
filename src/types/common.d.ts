export interface IElementAttributes {
  [name: string]: any;
  id: string;
  el: SVGSVGElement | null;
  type: string;
  classes: Record<string, boolean>;
}

export interface IStyle {
  shadowColor?: string;
  shadowBlur?: string;
  fillStyle?: string;
  strokeStyle?: string;
  lineWidth?: number;
}

export interface IFont {
  glyphs: { x_min: number; x_max: number; ha: number; o: string[] }[];
  cssFontWeight: string;
  ascender: number;
  underlinePosition: number;
  cssFontStyle: string;
  boundingBox: { yMin: number; xMin: number; yMax: number; xMax: number };
  resolution: number;
  descender: number;
  familyName: string;
  lineHeight: number;
  underlineThickness: number;
  /**
   * This property is missing in vexflow_font.js, but present in gonville_original.js and gonville_all.js.
   */
  original_font_information?: {
    postscript_name: string;
    version_string: string;
    vendor_url: string;
    full_font_name: string;
    font_family_name: string;
    copyright: string;
    description: string;
    trademark: string;
    designer: string;
    designer_url: string;
    unique_font_identifier: string;
    license_url: string;
    license_description: string;
    manufacturer_name: string;
    font_sub_family_name: string;
  };
}

export interface IRenderContext {
  clear(): void;
  setFont(family: string, size: number, weight?: number): IRenderContext;
  setRawFont(font: string): IRenderContext;
  setFillStyle(style: string): IRenderContext;
  setBackgroundFillStyle(style: string): IRenderContext;
  setStrokeStyle(style: string): IRenderContext;
  setShadowColor(color: string): IRenderContext;
  setShadowBlur(blur: string): IRenderContext;
  setLineWidth(width: number): IRenderContext;
  setLineCap(cap_type: string): IRenderContext;
  setLineDash(dash: string): IRenderContext;
  scale(x: number, y: number): IRenderContext;
  resize(width: number, height: number): IRenderContext;
  fillRect(x: number, y: number, width: number, height: number): IRenderContext;
  clearRect(x: number, y: number, width: number, height: number): IRenderContext;
  beginPath(): IRenderContext;
  moveTo(x: number, y: number): IRenderContext;
  lineTo(x: number, y: number): IRenderContext;
  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): IRenderContext;
  quadraticCurveTo(x1: number, y1: number, x2: number, y2: number): IRenderContext;
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    antiClockwise: boolean
  ): IRenderContext;
  glow(): IRenderContext;
  fill(): IRenderContext;
  stroke(): IRenderContext;
  closePath(): IRenderContext;
  fillText(text: string, x: number, y: number): IRenderContext;
  save(): IRenderContext;
  restore(): IRenderContext;
  openGroup(): Node | undefined;
  closeGroup(): void;

  /**
   * canvas returns TextMetrics, SVG returns SVGRect, Raphael returns {width : number, height : number}. Only width is used throughout VexFlow.
   */
  measureText(text: string): { width: number };
}
