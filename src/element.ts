// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
//
// ## Description
//
// This file implements a generic base class for VexFlow, with implementations
// of general functions and properties that can be inherited by all VexFlow elements.

import { Vex } from './vex';
import { Registry } from './registry';
import { Flow } from './tables';
import { BoundingBox } from './boundingbox';
import { Font } from './smufl';

import { IRenderContext, IStyle, IElementAttributes } from './types/common';
export class Element {
  static ID: number;
  context: IRenderContext | null; //DrawContext;
  rendered: boolean;
  style: IStyle | null;
  attrs: IElementAttributes;
  boundingBox: BoundingBox | null;
  fontStack: Font[];
  musicFont: Font;
  registry: Registry | null;

  static newID(): string {
    return 'auto' + Element.ID++;
  }

  constructor() {
    this.attrs = {
      id: Element.newID(),
      el: null,
      type: 'Base',
      classes: {},
    };

    this.boundingBox = null;
    this.context = null;
    this.style = null;
    this.registry = null;
    this.rendered = false;
    this.fontStack = Flow.DEFAULT_FONT_STACK;
    this.musicFont = Flow.DEFAULT_FONT_STACK[0];

    // If a default registry exist, then register with it right away.
    if (Registry.getDefaultRegistry()) {
      Registry.getDefaultRegistry().register(this);
    }
  }

  // set music font
  setFontStack(fontStack: Font[]): this {
    this.fontStack = fontStack;
    this.musicFont = fontStack[0];
    return this;
  }

  getFontStack(): Font[] {
    return this.fontStack;
  }

  // set the draw style of a stemmable note:
  setStyle(style: IStyle): this {
    this.style = style;
    return this;
  }

  getStyle(): IStyle | null {
    return this.style;
  }

  // Apply current style to Canvas `context`
  applyStyle(context: IRenderContext | null = this.context, style: IStyle | null = this.getStyle()) {
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

  restoreStyle(context: IRenderContext | null = this.context, style: IStyle | null = this.getStyle()): this {
    if (!style) return this;
    if (!context) return this;
    context.restore();
    return this;
  }

  // draw with style of an element.
  drawWithStyle() {
    this.checkContext();
    this.applyStyle();
    this.draw();
    this.restoreStyle();
  }

  // eslint-disable-next-line no-unused-vars
  draw(element?: Element, x_shift?: number): void {
    // do nothing
  }

  // An element can have multiple class labels.
  hasClass(className: string): boolean {
    return this.attrs.classes[className] === true;
  }

  addClass(className: string): this {
    this.attrs.classes[className] = true;
    if (this.registry) {
      this.registry.onUpdate({
        id: this.getAttribute('id'),
        name: 'class',
        value: className,
        oldValue: null,
      });
    }
    return this;
  }

  removeClass(className: string): this {
    delete this.attrs.classes[className];
    if (this.registry) {
      this.registry.onUpdate({
        id: this.getAttribute('id'),
        name: 'class',
        value: null,
        oldValue: className,
      });
    }
    return this;
  }

  // This is called by the registry after the element is registered.
  onRegister(registry: Registry): this {
    this.registry = registry;
    return this;
  }

  isRendered(): boolean {
    return this.rendered;
  }

  setRendered(rendered: boolean = true): this {
    this.rendered = rendered;
    return this;
  }

  getAttributes(): IElementAttributes | null {
    return this.attrs;
  }

  getAttribute(name: string): string {
    return this.attrs[name];
  }

  setAttribute(name: string, value: string) {
    const id = this.attrs.id;
    const oldValue = this.attrs[name];
    this.attrs[name] = value;
    if (this.registry) {
      // Register with old id to support id changes.
      this.registry.onUpdate({ id, name, value, oldValue });
    }
    return this;
  }

  getContext(): IRenderContext | null {
    return this.context;
  }

  setContext(context: IRenderContext) {
    this.context = context;
    return this;
  }

  getBoundingBox(): BoundingBox | null {
    return this.boundingBox;
  }

  // Validators
  checkContext(): IRenderContext {
    if (!this.context) {
      throw new Vex.RERR('NoContext', 'No rendering context attached to instance');
    }
    return this.context;
  }
}

Element.ID = 1000;
