import { Fraction } from '../fraction';
import { Font } from '../smufl';

// from @types/vexflow
export interface IElementAttributes {
  [name: string]: any;
  id: string;
  el: SVGSVGElement | null;
  type: string;
  classes: Record<string, boolean>;
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
  setFont(family: string, size: number, weight?: string): IRenderContext;
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

export interface IStyle {
  shadowColor?: string;
  shadowBlur?: string;
  fillStyle?: string;
  strokeStyle?: string;
  lineWidth?: number;
}

// from wassertim/vexflow
export const GLYPH_PROPS_VALID_TYPES: Record<string, Record<string, string>> = {
  'n': { name: 'note' },
  'r': { name: 'rest' },
  'h': { name: 'harmonic' },
  'm': { name: 'muted' },
  's': { name: 'slash' },
};

export interface ICoordinates {
  x: number;
  y: number;
}

export interface IFormatterMetrics {
  duration: string;
  freedom: ILeftRight;
  iterations: number;
  space: ISpace;
}

export interface IGlyphProps {
  code_head: string;
  dot_shiftY: number;
  position: string;
  rest: boolean;
  line_below: number;
  line_above: number;
  stem_up_extension: never;
  stem_down_extension: never;
  stem: never;
  code: string;
  code_flag_upstem: string;
  code_flag_downstem: string;
  flag: boolean;
  width: number;
  text: string;
  tabnote_stem_down_extension: number;
  tabnote_stem_up_extension: number;
  beam_count: number;
  duration_codes: Record<string, IDurationCode>;
  validTypes: Record<string, INameValue>;
  shift_y: number;

  getWidth(a?: number): number;

  getMetrics(): IGlyphMetrics;
}

export interface IGlyphOptions {
  fontStack: any;
  category: any;
}

export interface IGlyphMetrics {
  width: number;
  height: number;
  x_min: number;
  x_max: number;
  x_shift: number;
  y_shift: number;
  scale: number;
  ha: number;
  outline: number[];
  font: Font;
}

export interface ILeftRight {
  left: number;
  right: number;
}

export interface IMetrics {
  totalLeftPx?: number;
  totalRightPx?: number;
  width: number;
  glyphWidth: number;
  notePx: number;
  modLeftPx: number;
  modRightPx: number;
  leftDisplacedHeadPx: number;
  glyphPx?: number;
  rightDisplacedHeadPx: number;
}

export interface INoteDuration {
  duration: string;
  dots: number;
  type: string;
}

export interface INoteRenderOptions {
  draw_stem_through_stave?: boolean;
  draw_dots?: boolean;
  draw_stem?: any;
  y_shift?: number;
  extend_left?: number;
  extend_right?: number;
  glyph_font_scale?: number;
  annotation_spacing: number;
  glyph_font_size?: number;
  scale?: number;
  font?: string;
  stroke_px?: number;
}

export interface IParsedNote {
  duration: string;
  type: string;
  customTypes: string[];
  dots: number;
  ticks: number;
}

export interface ISpace {
  mean: number;
  deviation: number;
  used: number;
}

export interface IStaveNoteStruct {
  ignore_ticks: boolean;
  smooth: boolean;
  glyph: string;
  font: IFont;
  subscript: string;
  superscript: string;
  text: string;
  positions: never[];
  slashed: any;
  style: any;
  stem_down_x_offset: number;
  stem_up_x_offset: number;
  custom_glyph_code: any;
  x_shift: number;
  displaced: boolean;
  note_type: any;
  y: number;
  x: number;
  index: number;
  line: number;
  align_center: boolean;
  duration_override: Fraction;
  slash: boolean;
  stroke_px: number;
  glyph_font_scale: number;
  stem_direction: number;
  auto_stem: boolean;
  octave_shift: number;
  clef: string;
  keys: string[];
  duration: string;
  dots: number;
  type: string;
}

export interface ITabNotePositon {
  fret: string;
  str: number;
}
