// Copyright (c) 2023-present VexFlow contributors: https://github.com/vexflow/vexflow/graphs/contributors
// MIT License
// @author Mohit Cheppudira
// MIT License

import { BoundingBox } from './boundingbox';
import { Font, FontInfo } from './font';
import { Registry } from './registry';
import { RenderContext } from './rendercontext';
import { Tables } from './tables';
import { Category } from './typeguard';
import { defined, prefix, RuntimeError } from './util';

/** Element attributes. */
export interface ElementAttributes {
  [name: string]: string | undefined;
  id: string;
  type: string;
  class: string;
}

/** Element style */
export interface ElementStyle {
  /**
   * CSS color used for the shadow.
   *
   * Examples: 'red', '#ff0000', '#ff000010', 'rgb(255,0,0)'
   *
   * See [CSS Legal Color Values](https://www.w3schools.com/cssref/cssColorsLegal.asp)
   */
  shadowColor?: string;
  /**
   * Level of blur applied to shadows.
   *
   * Values that are not finite numbers greater than or equal to zero are ignored.
   */
  shadowBlur?: number;
  /**
   * CSS color used with context fill command.
   *
   * Examples: 'red', '#ff0000', '#ff000010', 'rgb(255,0,0)'
   *
   * See [CSS Legal Color Values](https://www.w3schools.com/cssref/cssColorsLegal.asp)
   */
  fillStyle?: string;
  /**
   * CSS color used with context stroke command.
   *
   * Examples: 'red', '#ff0000', '#ff000010', 'rgb(255,0,0)'
   *
   * See [CSS Legal Color Values](https://www.w3schools.com/cssref/cssColorsLegal.asp)
   */
  strokeStyle?: string;
  /**
   * Line width, 1.0 by default.
   */
  lineWidth?: number;
}

/**
 * Element implements a generic base class for VexFlow, with implementations
 * of general functions and properties that can be inherited by all VexFlow elements.
 *
 * The Element handles style and text-font properties for the Element and any child
 * elements, along with working with the Registry to create unique ids, but does not
 * have any tools for formatting x or y positions or connections to a Stave.
 */
export class Element {
  static get CATEGORY(): string {
    return Category.Element;
  }

  // all Element objects keep a list of children that they are responsible and which
  // inherit the style of their parents.
  protected children: Element[] = [];
  protected static ID: number = 1000;
  protected static newID(): string {
    return `auto${Element.ID++}`;
  }

  private context?: RenderContext;
  protected rendered: boolean;
  protected style?: ElementStyle;
  private attrs: ElementAttributes;
  protected boundingBox?: BoundingBox;
  protected registry?: Registry;

  /**
   * The `textFont` property contains information required to style the text (i.e., font family, size, weight, and style).
   */
  protected textFont: Required<FontInfo>;
  protected text = '';
  protected textMetrics: TextMetrics = {
    fontBoundingBoxAscent: 0,
    fontBoundingBoxDescent: 0,
    actualBoundingBoxAscent: 0,
    actualBoundingBoxDescent: 0,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: 0,
    width: 0,
  };

  protected width: number = 0;
  protected yShift: number = 0;
  protected xShift: number = 0;

  constructor(category?: string) {
    this.attrs = {
      id: Element.newID(),
      type: category ? category : (<typeof Element>this.constructor).CATEGORY,
      class: '',
    };

    this.rendered = false;
    this.textFont = {
      family: Tables.lookupMetric(`${this.attrs.type}.fontFamily`),
      size: Tables.lookupMetric(`${this.attrs.type}.fontSize`),
      weight: Tables.lookupMetric(`${this.attrs.type}.fontWeight`),
      style: Tables.lookupMetric(`${this.attrs.type}.fontStyle`),
    };

    // If a default registry exist, then register with it right away.
    Registry.getDefaultRegistry()?.register(this);
  }

  /**
   * Adds a child Element to the Element, which lets it inherit the
   * same style as the parent when setGroupStyle() is called.
   *
   * Examples of children are noteheads and stems.  Modifiers such
   * as Accidentals are generally not set as children.
   *
   * Note that StaveNote calls setGroupStyle() when setStyle() is called.
   */
  addChildElement(child: Element): this {
    this.children.push(child);
    return this;
  }

  getCategory(): string {
    return `${this.attrs.type}`;
  }

  /**
   * Set the element style used to render.
   *
   * Example:
   * ```typescript
   * element.setStyle({ fillStyle: 'red', strokeStyle: 'red' });
   * element.draw();
   * ```
   * Note: If the element draws additional sub-elements (ie.: Modifiers in a Stave),
   * the style can be applied to all of them by means of the context:
   * ```typescript
   * element.setStyle({ fillStyle: 'red', strokeStyle: 'red' });
   * element.getContext().setFillStyle('red');
   * element.getContext().setStrokeStyle('red');
   * element.draw();
   * ```
   * or using drawWithStyle:
   * ```typescript
   * element.setStyle({ fillStyle: 'red', strokeStyle: 'red' });
   * element.drawWithStyle();
   * ```
   */
  setStyle(style: ElementStyle | undefined): this {
    this.style = style;
    return this;
  }

  /** Set the element & associated children style used for rendering. */
  setGroupStyle(style: ElementStyle): this {
    this.style = style;
    this.children.forEach((child) => child.setGroupStyle(style));
    return this;
  }

  /** Get the element style used for rendering. */
  getStyle(): ElementStyle | undefined {
    return this.style;
  }

  /** Apply the element style to `context`. */
  applyStyle(
    context: RenderContext | undefined = this.context,
    style: ElementStyle | undefined = this.getStyle()
  ): this {
    if (!style) return this;
    if (!context) return this;

    context.save();
    if (style.shadowColor) context.setShadowColor(style.shadowColor);
    if (style.shadowBlur) context.setShadowBlur(style.shadowBlur);
    if (style.fillStyle) context.setFillStyle(style.fillStyle);
    if (style.strokeStyle) context.setStrokeStyle(style.strokeStyle);
    if (style.lineWidth) context.setLineWidth(style.lineWidth);
    return this;
  }

  /** Restore the style of `context`. */
  restoreStyle(
    context: RenderContext | undefined = this.context,
    style: ElementStyle | undefined = this.getStyle()
  ): this {
    if (!style) return this;
    if (!context) return this;
    context.restore();
    return this;
  }

  /**
   * Draw the element and all its sub-elements (ie.: Modifiers in a Stave)
   * with the element's style (see `getStyle()` and `setStyle()`)
   */
  drawWithStyle(): void {
    this.checkContext();
    this.applyStyle();
    this.draw();
    this.restoreStyle();
  }

  /** Draw an element. */
  draw(): void {
    throw new RuntimeError('Element', 'Draw not defined');
  }

  /** Check if it has a class label (An element can have multiple class labels).  */
  hasClass(className: string): boolean {
    if (!this.attrs.class) return false;
    return this.attrs.class?.split(' ').indexOf(className) != -1;
  }

  /** Add a class label (An element can have multiple class labels).  */
  addClass(className: string): this {
    if (this.hasClass(className)) return this;
    if (!this.attrs.class) this.attrs.class = `${className}`;
    else this.attrs.class = `${this.attrs.class} ${className}`;
    this.registry?.onUpdate({
      id: this.attrs.id,
      name: 'class',
      value: className,
      oldValue: undefined,
    });
    return this;
  }

  /** Remove a class label (An element can have multiple class labels).  */
  removeClass(className: string): this {
    if (!this.hasClass(className)) return this;
    const arr = this.attrs.class?.split(' ');
    if (arr) {
      arr.splice(arr.indexOf(className));
      this.attrs.class = arr.join(' ');
    }
    this.registry?.onUpdate({
      id: this.attrs.id,
      name: 'class',
      value: undefined,
      oldValue: className,
    });
    return this;
  }

  /** Call back from registry after the element is registered. */
  onRegister(registry: Registry): this {
    this.registry = registry;
    return this;
  }

  /** Return the rendered status. */
  isRendered(): boolean {
    return this.rendered;
  }

  /** Set the rendered status. */
  setRendered(rendered = true): this {
    this.rendered = rendered;
    return this;
  }

  /** Return the element attributes. */
  getAttributes(): ElementAttributes {
    return this.attrs;
  }

  /** Return an attribute, such as 'id', 'type' or 'class'. */
  // eslint-disable-next-line
  getAttribute(name: string): any {
    return this.attrs[name];
  }

  /** Return associated SVGElement. */
  getSVGElement(suffix: string = ''): SVGElement | undefined {
    const id = prefix(this.attrs.id + suffix);
    const element = document.getElementById(id);
    if (element) return element as unknown as SVGElement;
  }

  /** Set an attribute such as 'id', 'class', or 'type'. */
  setAttribute(name: string, value: string | undefined): this {
    const oldID = this.attrs.id;
    const oldValue = this.attrs[name];
    this.attrs[name] = value;
    // Register with old id to support id changes.
    this.registry?.onUpdate({ id: oldID, name, value, oldValue });
    return this;
  }

  /** Get the boundingBox. */
  getBoundingBox(): BoundingBox | undefined {
    return this.boundingBox;
  }

  /** Return the context, such as an SVGContext or CanvasContext object. */
  getContext(): RenderContext | undefined {
    return this.context;
  }

  /** Set the context to an SVGContext or CanvasContext object */
  setContext(context?: RenderContext): this {
    this.context = context;
    return this;
  }

  /** Validate and return the rendering context. */
  checkContext(): RenderContext {
    return defined(this.context, 'NoContext', 'No rendering context attached to instance.');
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Font Handling

  /**
   * Provide a CSS compatible font string (e.g., 'bold 16px Arial') that will be applied
   * to text (not glyphs).
   */
  set font(f: string) {
    this.setFont(f);
  }

  /** Returns the CSS compatible font string for the text font. */
  get font(): string {
    return Font.toCSSString(this.textFont);
  }

  /**
   * Set the element's text font family, size, weight, style
   * (e.g., `Arial`, `10pt`, `bold`, `italic`).
   *
   * This attribute does not determine the font used for musical Glyphs like treble clefs.
   *
   * @param font is 1) a `FontInfo` object or
   *                2) a string formatted as CSS font shorthand (e.g., 'bold 10pt Arial') or
   *                3) a string representing the font family (at least one of `size`, `weight`, or `style` must also be provided).
   * @param size a string specifying the font size and unit (e.g., '16pt'), or a number (the unit is assumed to be 'pt').
   * @param weight is a string (e.g., 'bold', 'normal') or a number (100, 200, ... 900).
   * @param style is a string (e.g., 'italic', 'normal').
   * If no arguments are provided, then the font is set to the default font.
   * Each Element subclass may specify its own default by overriding the static `TEXT_FONT` property.
   */
  setFont(font?: string | FontInfo, size?: string | number, weight?: string | number, style?: string): this {
    const defaultTextFont: Required<FontInfo> = {
      family: Tables.lookupMetric(`${this.attrs.type}.fontFamily`),
      size: Tables.lookupMetric(`${this.attrs.type}.fontSize`),
      weight: Tables.lookupMetric(`${this.attrs.type}.fontWeight`),
      style: Tables.lookupMetric(`${this.attrs.type}.fontStyle`),
    };

    const fontIsObject = typeof font === 'object';
    const fontIsString = typeof font === 'string';
    const sizeWeightStyleAreUndefined = size === undefined && weight === undefined && style === undefined;

    if (fontIsObject) {
      // `font` is case 1) a FontInfo object
      this.textFont = { ...defaultTextFont, ...font };
    } else if (fontIsString && sizeWeightStyleAreUndefined) {
      // `font` is case 2) CSS font shorthand.
      this.textFont = Font.fromCSSString(font);
     } else {
      // `font` is case 3) a font family string (e.g., 'Times New Roman').
      // The other parameters represent the size, weight, and style.
      // It is okay for `font` to be undefined while one or more of the other arguments is provided.
      // Following CSS conventions, unspecified params are reset to the default.
      this.textFont = Font.validate(
        font ?? defaultTextFont.family,
        size ?? defaultTextFont.size,
        weight ?? defaultTextFont.weight,
        style ?? defaultTextFont.style
      );
    }
    this.measureText();
    return this;
  }

  /**
   * Get the css string describing this Element's text font. e.g.,
   * 'bold 10pt Arial'.
   */
  getFont(): string {
    return Font.toCSSString(this.textFont);
  }

  /** Return a copy of the current FontInfo object. */
  get fontInfo(): Required<FontInfo> {
    // We can cast to Required<FontInfo> here, because
    // we just called resetFont() above to ensure this.textFont is set.
    return this.textFont;
  }

  set fontInfo(fontInfo: FontInfo) {
    this.setFont(fontInfo);
  }

  /** Change the font size, while keeping everything else the same. */
  setFontSize(size?: string | number): this {
    const fontInfo = this.fontInfo;
    this.setFont(fontInfo.family, size, fontInfo.weight, fontInfo.style);
    return this;
  }

  /**
   * @returns a CSS font-size string (e.g., '18pt', '12px', '1em').
   * See Element.fontSizeInPixels or Element.fontSizeInPoints if you need to get a number for calculation purposes.
   */
  getFontSize(): string {
    return this.fontSize;
  }

  /**
   * The size is 1) a string of the form '10pt' or '16px', compatible with the CSS font-size property.
   *          or 2) a number, which is interpreted as a point size (i.e. 12 == '12pt').
   */
  set fontSize(size: string | number) {
    this.setFontSize(size);
  }

  /**
   * @returns a CSS font-size string (e.g., '18pt', '12px', '1em').
   */
  get fontSize(): string {
    let size = this.fontInfo.size;
    if (typeof size === 'number') {
      size = `${size}pt`;
    }
    return size;
  }

  /**
   * @returns the font size in `pt`.
   */
  get fontSizeInPoints(): number {
    return Font.convertSizeToPointValue(this.fontSize);
  }

  /**
   * @returns the font size in `px`.
   */
  get fontSizeInPixels(): number {
    return Font.convertSizeToPixelValue(this.fontSize);
  }

  /**
   * @returns a CSS font-style string (e.g., 'italic').
   */
  get fontStyle(): string {
    return this.fontInfo.style;
  }

  set fontStyle(style: string) {
    const fontInfo = this.fontInfo;
    this.setFont(fontInfo.family, fontInfo.size, fontInfo.weight, style);
  }

  /**
   * @returns a CSS font-weight string (e.g., 'bold').
   * As in CSS, font-weight is always returned as a string, even if it was set as a number.
   */
  get fontWeight(): string {
    return this.fontInfo.weight + '';
  }

  set fontWeight(weight: string | number) {
    const fontInfo = this.fontInfo;
    this.setFont(fontInfo.family, fontInfo.size, weight, fontInfo.style);
  }

  /** Get element width. */
  getWidth(): number {
    return this.width;
  }

  /** Set element width. */
  setWidth(width: number): this {
    this.width = width;
    return this;
  }

  /** Shift element down `y` pixels. Negative values shift up. */
  setYShift(y: number): this {
    this.yShift = y;
    return this;
  }

  /** Get shift element `y` */
  getYShift(): number {
    return this.yShift;
  }

  /**
   * Set shift element right `x` pixels. Negative values shift left.
   */
  setXShift(x: number): this {
    this.xShift = x;
    return this;
  }

  /** Get shift element `x` */
  getXShift(): number {
    return this.xShift;
  }

  /**
   * Set element text
   */
  setText(txt: string): this {
    this.text = txt;
    return this;
  }

  /** Get element text */
  getText(): string {
    return this.text;
  }

  /**
   * Render the element text .
   */
  renderText(ctx: RenderContext, xPos: number, yPos: number): void {
    ctx.save();
    ctx.setFont(this.textFont);
    ctx.fillText(this.text, xPos + this.xShift, yPos + this.yShift);
    ctx.restore();
  }

  /** Canvas used to measure text */
  protected static txtCanvas?: HTMLCanvasElement;

  measureText(): TextMetrics {
    let txtCanvas = Element.txtCanvas;
    if (!txtCanvas) {
      // Create the SVG text element that will be used to measure text in the event
      // of a cache miss.
      txtCanvas = document.createElement('canvas');
      Element.txtCanvas = txtCanvas;
    }
    const context = txtCanvas.getContext('2d');
    if (!context) throw new RuntimeError('Font', 'No txt context');
    context.font = Font.toCSSString(Font.validate(this.textFont));
    this.textMetrics = context.measureText(this.text);
    this.boundingBox = new BoundingBox(
      0,
      -this.textMetrics.actualBoundingBoxAscent,
      this.textMetrics.width,
      this.textMetrics.actualBoundingBoxDescent + this.textMetrics.actualBoundingBoxAscent
    );
    this.width = this.textMetrics.width;
    return this.textMetrics;
  }

  getTextMetrics(): TextMetrics {
    return this.textMetrics;
  }

  getHeight() {
    return this.textMetrics.actualBoundingBoxDescent + this.textMetrics.actualBoundingBoxAscent;
  }
}
