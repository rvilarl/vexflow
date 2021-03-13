export interface IElementAttributes {
  [name: string]: any;
  id: string;
  el: SVGSVGElement | null;
  type: string;
  classes: Record<string, boolean>;
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

export interface IStyle {
  shadowColor?: string;
  shadowBlur?: string;
  fillStyle?: string;
  strokeStyle?: string;
  lineWidth?: number;
}