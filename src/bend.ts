// Copyright (c) 2023-present VexFlow contributors: https://github.com/vexflow/vexflow/graphs/contributors
// MIT License

import { Element } from './element';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { Category, isTabNote } from './typeguard';
import { RuntimeError } from './util';

class BendElement extends Element {
  type: number;
  drawWidth: number;

  constructor(type: number, text: string, width?: number) {
    super('Bend');
    this.type = type;
    this.setText(text);
    this.measureText();
    this.drawWidth = Math.max(width ?? 0, this.getWidth()) / 2 + 5;
  }
}

/** Bend implements tablature bends. */
export class Bend extends Modifier {
  static get CATEGORY(): string {
    return Category.Bend;
  }

  static get UP(): number {
    return 0;
  }

  static get DOWN(): number {
    return 1;
  }

  // Arrange bends in `ModifierContext`
  static format(bends: Bend[], state: ModifierContextState): boolean {
    if (!bends || bends.length === 0) return false;

    let lastWidth = 0;
    // Format Bends
    for (let i = 0; i < bends.length; ++i) {
      const bend = bends[i];
      const note = bend.checkAttachedNote();

      if (isTabNote(note)) {
        const stringPos = note.leastString() - 1;
        if (state.topTextLine < stringPos) {
          state.topTextLine = stringPos;
        }
      }
      bend.setXShift(lastWidth + 5);
      lastWidth = bend.getWidth();
      bend.setTextLine(state.topTextLine);
    }

    state.rightShift += lastWidth;
    state.topTextLine += 1;
    return true;
  }

  protected tap: Element;
  protected phrase: BendElement[] = [];

  public renderOptions: {
    lineWidth: number;
    releaseWidth: number;
    bendWidth: number;
    lineStyle: string;
  };

  /**
   * Example of a phrase:
   * ```
   *    [{
   *     type: UP,
   *     text: "whole"
   *     width: 8;
   *   },
   *   {
   *     type: DOWN,
   *     text: "whole"
   *     width: 8;
   *   },
   *   {
   *     type: UP,
   *     text: "half"
   *     width: 8;
   *   },
   *   {
   *     type: UP,
   *     text: "whole"
   *     width: 8;
   *   },
   *   {
   *     type: DOWN,
   *     text: "1 1/2"
   *     width: 8;
   *   }]
   * ```
   */
  constructor(
    phrase: {
      type: number;
      text: string;
      width?: number;
    }[]
  ) {
    super();

    this.xShift = 0;
    this.tap = new Element('Bend');
    this.renderOptions = {
      lineWidth: 1.5,
      lineStyle: '#777777',
      bendWidth: 8,
      releaseWidth: 8,
    };

    phrase.forEach((value) => {
      const width =
        value.width ?? value.type === Bend.UP ? this.renderOptions.bendWidth : this.renderOptions.releaseWidth;
      this.phrase.push(new BendElement(value.type, value.text, width));
    });

    this.updateWidth();
  }

  /** Set horizontal shift in pixels. */
  setXShift(value: number): this {
    this.xShift = value;
    this.updateWidth();
    return this;
  }

  setTap(value: string): this {
    this.tap.setText(value);
    this.tap.measureText();
    return this;
  }

  getTextHeight(): number {
    return this.phrase[0].getHeight();
  }

  /** Recalculate width. */
  protected updateWidth(): this {
    let totalWidth = 0;
    for (let i = 0; i < this.phrase.length; ++i) {
      const bend = this.phrase[i];
      totalWidth += bend.getWidth();
    }

    this.setWidth(totalWidth + this.xShift);
    return this;
  }

  /** Draw the bend on the rendering context. */
  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote();
    this.setRendered();

    const start = note.getModifierStartXY(Modifier.Position.RIGHT, this.index);
    start.x += 3;
    start.y += 0.5;
    const xShift = this.xShift;

    const stave = note.checkStave();
    const spacing = stave.getSpacingBetweenLines();
    const lowestY = note.getYs().reduce((a, b) => (a < b ? a : b));
    // this.textLine is relative to top string in the group.
    const bendHeight = start.y - ((this.textLine + 1) * spacing + start.y - lowestY) + 3;
    const annotationY = start.y - ((this.textLine + 1) * spacing + start.y - lowestY) - 1;

    const renderBend = (x: number, y: number, width: number, height: number) => {
      const cpX = x + width;
      const cpY = y;

      ctx.save();
      ctx.beginPath();
      ctx.setLineWidth(this.renderOptions.lineWidth);
      ctx.setStrokeStyle(this.renderOptions.lineStyle);
      ctx.setFillStyle(this.renderOptions.lineStyle);
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(cpX, cpY, x + width, height);
      ctx.stroke();
      ctx.restore();
    };

    const renderRelease = (x: number, y: number, width: number, height: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.setLineWidth(this.renderOptions.lineWidth);
      ctx.setStrokeStyle(this.renderOptions.lineStyle);
      ctx.setFillStyle(this.renderOptions.lineStyle);
      ctx.moveTo(x, height);
      ctx.quadraticCurveTo(x + width, height, x + width, y);
      ctx.stroke();
      ctx.restore();
    };

    const renderArrowHead = (x: number, y: number, direction: number) => {
      const width = 4;
      const yBase = y + width * direction;

      ctx.beginPath();
      ctx.moveTo(x, y); // tip of the arrow
      ctx.lineTo(x - width, yBase);
      ctx.lineTo(x + width, yBase);
      ctx.closePath();
      ctx.fill();
    };

    let lastBend = undefined;
    let lastBendDrawWidth = 0;
    let lastDrawnWidth = 0;
    if (this.tap.getText().length) {
      const tapStart = note.getModifierStartXY(Modifier.Position.CENTER, this.index);
      this.tap.renderText(ctx, tapStart.x - this.tap.getWidth() / 2, annotationY);
    }

    for (let i = 0; i < this.phrase.length; ++i) {
      const bend = this.phrase[i];
      if (i === 0) bend.drawWidth += xShift;

      lastDrawnWidth = bend.drawWidth + lastBendDrawWidth - (i === 1 ? xShift : 0);
      if (bend.type === Bend.UP) {
        if (lastBend && lastBend.type === Bend.UP) {
          renderArrowHead(start.x, bendHeight, +1);
        }

        renderBend(start.x, start.y, lastDrawnWidth, bendHeight);
      }

      if (bend.type === Bend.DOWN) {
        if (lastBend && lastBend.type === Bend.UP) {
          renderRelease(start.x, start.y, lastDrawnWidth, bendHeight);
        }

        if (lastBend && lastBend.type === Bend.DOWN) {
          renderArrowHead(start.x, start.y, -1);
          renderRelease(start.x, start.y, lastDrawnWidth, bendHeight);
        }

        if (!lastBend) {
          lastDrawnWidth = bend.drawWidth;
          renderRelease(start.x, start.y, lastDrawnWidth, bendHeight);
        }
      }

      bend.renderText(ctx, start.x + lastDrawnWidth - bend.getWidth() / 2, annotationY);
      lastBend = bend;
      lastBendDrawWidth = bend.drawWidth;
      lastBend.setX(start.x);

      start.x += lastDrawnWidth;
    }

    if (!lastBend) {
      throw new RuntimeError('NoLastBendForBend', 'Internal error.');
    }

    // Final arrowhead and text
    if (lastBend.type === Bend.UP) {
      renderArrowHead(lastBend.getX() + lastDrawnWidth, bendHeight, +1);
    } else if (lastBend.type === Bend.DOWN) {
      renderArrowHead(lastBend.getX() + lastDrawnWidth, start.y, -1);
    }
  }
}
