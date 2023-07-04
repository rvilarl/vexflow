// Copyright (c) 2023-present VexFlow contributors: https://github.com/vexflow/vexflow/graphs/contributors
//
// This class implements varies types of ties between contiguous notes. The
// ties include: regular ties, hammer ons, pull offs, and slides.

import { Element } from './element';
import { Note } from './note';
import { Category } from './typeguard';
import { RuntimeError } from './util';

// For backwards compatibility with 3.0.9, firstNote and/or lastNote can be undefined or null.
// We prefer undefined instead of null.
// However, some of our test cases used to pass in null, so maybe there is client code relying on it.
export interface TieNotes {
  firstNote?: Note | null;
  lastNote?: Note | null;
  firstIndices?: number[];
  lastIndices?: number[];
}

export class StaveTie extends Element {
  static get CATEGORY(): string {
    return Category.StaveTie;
  }

  public renderOptions: {
    cp2: number;
    lastXShift: number;
    tieSpacing: number;
    cp1: number;
    firstXShift: number;
    textShiftX: number;
    yShift: number;
  };

  // notes is initialized by the constructor via this.setNotes(notes).
  protected notes!: TieNotes;

  protected direction?: number;

  /**
   * @param notes is a struct that has:
   *
   *  {
   *    firstNote: Note,
   *    lastNote: Note,
   *    firstIndices: [n1, n2, n3],
   *    lastIndices: [n1, n2, n3]
   *  }
   *
   * @param text
   */
  constructor(notes: TieNotes, text = '') {
    super();
    this.setNotes(notes);
    this.text = text;
    this.renderOptions = {
      cp1: 8, // Curve control point 1
      cp2: 12, // Curve control point 2
      textShiftX: 0,
      firstXShift: 0,
      lastXShift: 0,
      yShift: 7,
      tieSpacing: 0,
    };
}

  setDirection(direction: number): this {
    this.direction = direction;
    return this;
  }

  /**
   * Set the notes to attach this tie to.
   *
   * @param {!Object} notes The notes to tie up.
   */
  setNotes(notes: TieNotes): this {
    if (!notes.firstNote && !notes.lastNote) {
      throw new RuntimeError('BadArguments', 'Tie needs to have either firstNote or lastNote set.');
    }

    if (!notes.firstIndices) {
      notes.firstIndices = [0];
    }
    if (!notes.lastIndices) {
      notes.lastIndices = [0];
    }

    if (notes.firstIndices.length !== notes.lastIndices.length) {
      throw new RuntimeError('BadArguments', 'Tied notes must have same number of indices.');
    }

    this.notes = notes;
    return this;
  }

  /**
   * @return {boolean} Returns true if this is a partial bar.
   */
  isPartial(): boolean {
    return !this.notes.firstNote || !this.notes.lastNote;
  }

  renderTie(params: {
    direction: number;
    firstXPx: number;
    lastXPx: number;
    lastYs: number[];
    firstYs: number[];
  }): void {
    if (params.firstYs.length === 0 || params.lastYs.length === 0) {
      throw new RuntimeError('BadArguments', 'No Y-values to render');
    }

    const ctx = this.checkContext();
    let cp1 = this.renderOptions.cp1;
    let cp2 = this.renderOptions.cp2;

    if (Math.abs(params.lastXPx - params.firstXPx) < 10) {
      cp1 = 2;
      cp2 = 8;
    }

    const firstXShift = this.renderOptions.firstXShift;
    const lastXShift = this.renderOptions.lastXShift;
    const yShift = this.renderOptions.yShift * params.direction;

    // setNotes(...) verified that firstIndices and lastIndices are not undefined.
    // As a result, we use the ! non-null assertion operator here.
    // eslint-disable-next-line
    const firstIndices = this.notes.firstIndices!;
    // eslint-disable-next-line
    const lastIndices = this.notes.lastIndices!;
    this.applyStyle();
    ctx.openGroup('stavetie', this.getAttribute('id'));
    for (let i = 0; i < firstIndices.length; ++i) {
      const cpX = (params.lastXPx + lastXShift + (params.firstXPx + firstXShift)) / 2;
      const firstYPx = params.firstYs[firstIndices[i]] + yShift;
      const lastYPx = params.lastYs[lastIndices[i]] + yShift;

      if (isNaN(firstYPx) || isNaN(lastYPx)) {
        throw new RuntimeError('BadArguments', 'Bad indices for tie rendering.');
      }

      const topCpY = (firstYPx + lastYPx) / 2 + cp1 * params.direction;
      const bottomCpY = (firstYPx + lastYPx) / 2 + cp2 * params.direction;

      ctx.beginPath();
      ctx.moveTo(params.firstXPx + firstXShift, firstYPx);
      ctx.quadraticCurveTo(cpX, topCpY, params.lastXPx + lastXShift, lastYPx);
      ctx.quadraticCurveTo(cpX, bottomCpY, params.firstXPx + firstXShift, firstYPx);
      ctx.closePath();
      ctx.fill();
    }
    ctx.closeGroup();
    this.restoreStyle();
  }

  renderTieText(firstXPx: number, lastXPx: number): void {
    if (this.text == '') return;
    const ctx = this.checkContext();
    let centerX = (firstXPx + lastXPx) / 2;
    centerX -= ctx.measureText(this.text).width / 2;
    const stave = this.notes.firstNote?.checkStave() ?? this.notes.lastNote?.checkStave();
    if (stave) {
      this.renderText(ctx, centerX + this.renderOptions.textShiftX, stave.getYForTopText() - 1);
    }
  }

  /**
   * Returns the TieNotes structure of the first and last note this tie connects.
   */
  getNotes(): TieNotes {
    return this.notes;
  }

  draw(): boolean {
    this.checkContext();
    this.setRendered();

    const firstNote = this.notes.firstNote;
    const lastNote = this.notes.lastNote;

    // Provide some default values so the compiler doesn't complain.
    let firstXPx = 0;
    let lastXPx = 0;
    let firstYs: number[] = [0];
    let lastYs: number[] = [0];
    let stemDirection = 0;
    if (firstNote) {
      firstXPx = firstNote.getTieRightX() + this.renderOptions.tieSpacing;
      stemDirection = firstNote.getStemDirection();
      firstYs = firstNote.getYs();
    } else if (lastNote) {
      const stave = lastNote.checkStave();
      firstXPx = stave.getTieStartX();
      firstYs = lastNote.getYs();
      this.notes.firstIndices = this.notes.lastIndices;
    }

    if (lastNote) {
      lastXPx = lastNote.getTieLeftX() + this.renderOptions.tieSpacing;
      stemDirection = lastNote.getStemDirection();
      lastYs = lastNote.getYs();
    } else if (firstNote) {
      const stave = firstNote.checkStave();
      lastXPx = stave.getTieEndX();
      lastYs = firstNote.getYs();
      this.notes.lastIndices = this.notes.firstIndices;
    }

    if (this.direction) {
      stemDirection = this.direction;
    }

    this.renderTie({
      firstXPx,
      lastXPx,
      firstYs,
      lastYs,
      direction: stemDirection,
    });

    this.renderTieText(firstXPx, lastXPx);
    return true;
  }
}
