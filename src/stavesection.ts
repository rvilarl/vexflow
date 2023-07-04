// Copyright (c) 2023-present VexFlow contributors: https://github.com/vexflow/vexflow/graphs/contributors
// @author: Larry Kuhns 2011

import { Font } from './font';
import { Stave } from './stave';
import { StaveModifier } from './stavemodifier';
import { Category } from './typeguard';

export class StaveSection extends StaveModifier {
  static get CATEGORY(): string {
    return Category.StaveSection;
  }

  protected section: string;
  protected shiftX: number;
  protected shiftY: number;
  protected drawRect: boolean;

  constructor(section: string, x: number, shiftY: number, drawRect = true) {
    super();

    this.setWidth(16);
    this.section = section;
    this.x = x;
    this.shiftX = 0;
    this.shiftY = shiftY;
    this.drawRect = drawRect;
  }

  setStaveSection(section: string): this {
    this.section = section;
    return this;
  }

  setShiftX(x: number): this {
    this.shiftX = x;
    return this;
  }

  setShiftY(y: number): this {
    this.shiftY = y;
    return this;
  }

  draw(stave: Stave, shiftX: number): this {
    const borderWidth = 2;
    const padding = 2;
    const ctx = stave.checkContext();
    this.setRendered();

    ctx.save();
    ctx.setLineWidth(borderWidth);
    ctx.setFont(this.textFont);

    const textMeasurements = Font.textMetrics(this.section, this.textFont);
    const textWidth = textMeasurements.width;
    const textHeight = textMeasurements.actualBoundingBoxAscent + textMeasurements.actualBoundingBoxDescent;
    const headroom = -1 * textMeasurements.actualBoundingBoxDescent;
    const width = textWidth + 2 * padding; // add left & right padding
    const height = textHeight + 2 * padding; // add top & bottom padding

    //  Seems to be a good default y
    const y = stave.getYForTopText(1.5) + this.shiftY;
    const x = this.x + shiftX;
    if (this.drawRect) {
      ctx.beginPath();
      ctx.rect(x, y - height + headroom, width, height);
      ctx.stroke();
    }
    ctx.fillText(this.section, x + padding, y - padding);
    ctx.restore();
    return this;
  }
}
