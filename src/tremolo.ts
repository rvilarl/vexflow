// Copyright (c) 2023-present VexFlow contributors: https://github.com/vexflow/vexflow/graphs/contributors
// @author Mike Corrigan <corrigan@gmail.com>
// MIT License

import { GraceNote } from './gracenote';
import { Modifier } from './modifier';
import { Note } from './note';
import { Stem } from './stem';
import { Tables } from './tables';
import { Category, isGraceNote } from './typeguard';

/** Tremolo implements tremolo notation. */
export class Tremolo extends Modifier {
  static get CATEGORY(): string {
    return Category.Tremolo;
  }

  protected readonly num: number;

  /**
   * @param num number of bars
   */
  constructor(num: number) {
    super();

    this.num = num;
    this.position = Modifier.Position.CENTER;
    this.text = String.fromCharCode(parseInt('E220' /*tremolo1*/, 16));
    this.measureText();
  }

  /** Draw the tremolo on the rendering context. */
  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote();
    this.setRendered();

    const stemDirection = note.getStemDirection();

    const start = note.getModifierStartXY(this.position, this.index);
    let x = start.x;

    const gn = isGraceNote(note);
    const scale = gn ? GraceNote.SCALE : 1;
    const category = `tremolo.${gn ? 'grace' : 'default'}`;

    const ySpacing = Tables.lookupMetric(`${category}.spacing`) * stemDirection;
    const height = this.num * ySpacing;
    let y = note.getStemExtents().baseY - height;

    if (stemDirection < 0) {
      y += Tables.lookupMetric(`${category}.offsetYStemDown`) * scale;
    } else {
      y += Tables.lookupMetric(`${category}.offsetYStemUp`) * scale;
    }

    this.textFont.size = Tables.lookupMetric(`${category}.point`) ?? Note.getPoint(gn ? 'grace' : 'default');

    x += Tables.lookupMetric(`${category}.offsetXStem${stemDirection === Stem.UP ? 'Up' : 'Down'}`);
    for (let i = 0; i < this.num; ++i) {
      this.renderText(ctx, x, y);
      y += ySpacing;
    }
  }
}
