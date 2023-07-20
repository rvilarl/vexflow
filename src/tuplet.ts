// Copyright (c) 2023-present VexFlow contributors: https://github.com/vexflow/vexflow/graphs/contributors

/**
 * ## Description
 *
 * Create a new tuplet from the specified notes. The notes must
 * be part of the same voice. If they are of different rhythmic
 * values, then options.numNotes must be set.
 *
 * @constructor
 * @param {Array.<Vex.Flow.StaveNote>} A set of notes: staveNotes,
 *   notes, etc... any class that inherits stemmableNote at some
 *   point in its prototype chain.
 * @param options: object {
 *
 *   numNotes: fit this many notes into...
 *   notesOccupied: ...the space of this many notes
 *
 *       Together, these two properties make up the tuplet ratio
 *     in the form of numNotes : notesOccupied.
 *       numNotes defaults to the number of notes passed in, so
 *     it is important that if you omit this property, all of
 *     the notes passed should be of the same note value.
 *       notesOccupied defaults to 2 -- so you should almost
 *     certainly pass this parameter for anything other than
 *     a basic triplet.
 *
 *   location:
 *     default 1, which is above the notes: ┌─── 3 ───┐
 *      -1 is below the notes └─── 3 ───┘
 *
 *   bracketed: boolean, draw a bracket around the tuplet number
 *     when true: ┌─── 3 ───┐   when false: 3
 *     defaults to true if notes are not beamed, false otherwise
 *
 *   ratioed: boolean
 *     when true: ┌─── 7:8 ───┐, when false: ┌─── 7 ───┐
 *     defaults to true if the difference between numNotes and
 *     notesOccupied is greater than 1.
 *
 *   yOffset: int, default 0
 *     manually offset a tuplet, for instance to avoid collisions
 *     with articulations, etc...
 * }
 */

import { Element } from './element';
import { Formatter } from './formatter';
import { Note } from './note';
import { Stem } from './stem';
import { StemmableNote } from './stemmablenote';
import { Tables } from './tables';
import { Category } from './typeguard';
import { RuntimeError } from './util';

export interface TupletOptions {
  bracketed?: boolean;
  location?: number;
  notesOccupied?: number;
  numNotes?: number;
  ratioed?: boolean;
  yOffset?: number;
}

export interface TupletMetrics {
  noteHeadOffset: number;
  stemOffset: number;
  bottomLine: number;
  topModifierOffset: number;
}

export const enum TupletLocation {
  BOTTOM = -1,
  TOP = +1,
}

export class Tuplet extends Element {
  static get CATEGORY(): string {
    return Category.Tuplet;
  }

  notes: Note[];

  protected options: TupletOptions;
  protected numNotes: number;

  protected bracketed: boolean;
  protected txtElement: Element;
  // location is initialized by the constructor via setTupletLocation(...).
  protected location!: number;

  protected notesOccupied: number;
  protected ratioed: boolean;

  static get LOCATION_TOP(): number {
    return TupletLocation.TOP;
  }
  static get LOCATION_BOTTOM(): number {
    return TupletLocation.BOTTOM;
  }
  static get NESTING_OFFSET(): number {
    return 15;
  }

  constructor(notes: Note[], options: TupletOptions = {}) {
    super();

    if (!notes || !notes.length) {
      throw new RuntimeError('BadArguments', 'No notes provided for tuplet.');
    }

    this.options = options;
    this.notes = notes;
    this.numNotes = this.options.numNotes != undefined ? this.options.numNotes : notes.length;

    this.notesOccupied = this.options.notesOccupied || 2;
    if (this.options.bracketed != undefined) {
      this.bracketed = this.options.bracketed;
    } else {
      this.bracketed = notes.some((note) => !note.hasBeam());
    }

    this.ratioed =
      this.options.ratioed != undefined ? this.options.ratioed : Math.abs(this.notesOccupied - this.numNotes) > 1;
    this.txtElement = new Element();
    this.txtElement.setFontSize((Tables.lookupMetric('fontSize') * 3) / 5);

    this.setTupletLocation(this.options.location || Tuplet.LOCATION_TOP);

    Formatter.AlignRestsToNotes(notes, true, true);
    this.resolveGlyphs();
    this.attach();
  }

  attach(): void {
    for (let i = 0; i < this.notes.length; i++) {
      const note = this.notes[i];
      note.setTuplet(this);
    }
  }

  detach(): void {
    for (let i = 0; i < this.notes.length; i++) {
      const note = this.notes[i];
      note.resetTuplet(this);
    }
  }

  /**
   * Set whether or not the bracket is drawn.
   */
  setBracketed(bracketed: boolean): this {
    this.bracketed = !!bracketed;
    return this;
  }

  /**
   * Set whether or not the ratio is shown.
   */
  setRatioed(ratioed: boolean): this {
    this.ratioed = !!ratioed;
    return this;
  }

  /**
   * Set the tuplet indicator to be displayed either on the top or bottom of the stave.
   */
  setTupletLocation(location: number): this {
    if (location !== Tuplet.LOCATION_TOP && location !== Tuplet.LOCATION_BOTTOM) {
      // eslint-disable-next-line
      console.warn(`Invalid tuplet location [${location}]. Using Tuplet.LOCATION_TOP.`);
      location = Tuplet.LOCATION_TOP;
    }

    this.location = location;
    return this;
  }

  getNotes(): Note[] {
    return this.notes;
  }

  getNoteCount(): number {
    return this.numNotes;
  }

  getNotesOccupied(): number {
    return this.notesOccupied;
  }

  setNotesOccupied(notes: number): void {
    this.detach();
    this.notesOccupied = notes;
    this.resolveGlyphs();
    this.attach();
  }

  resolveGlyphs(): void {
    let numerator = '';
    let denominator = '';
    let n = this.numNotes;
    while (n >= 1) {
      numerator = String.fromCharCode(parseInt('E880', 16) + (n % 10)) + numerator;
      n = parseInt((n / 10).toString(), 10);
    }
    if (this.ratioed) {
      n = this.notesOccupied;
      while (n >= 1) {
        denominator = String.fromCharCode(parseInt('E880', 16) + (n % 10)) + denominator;
        n = parseInt((n / 10).toString(), 10);
      }
      denominator = String.fromCharCode(parseInt('E88A', 16)) + denominator;
    }
    this.txtElement.setText(numerator + denominator);
    this.txtElement.measureText();
  }

  // determine how many tuplets are nested within this tuplet
  // on the same side (above/below), to calculate a y
  // offset for this tuplet:
  getNestedTupletCount(): number {
    const location = this.location;
    const firstNote = this.notes[0];
    let maxTupletCount = countTuplets(firstNote, location);
    let minTupletCount = countTuplets(firstNote, location);

    // Count the tuplets that are on the same side (above/below)
    // as this tuplet:
    function countTuplets(note: Note, location: number) {
      return note.getTupletStack().filter((tuplet) => tuplet.location === location).length;
    }

    this.notes.forEach((note) => {
      const tupletCount = countTuplets(note, location);
      maxTupletCount = tupletCount > maxTupletCount ? tupletCount : maxTupletCount;
      minTupletCount = tupletCount < minTupletCount ? tupletCount : minTupletCount;
    });

    return maxTupletCount - minTupletCount;
  }

  // determine the y position of the tuplet:
  getYPosition(): number {
    // offset the tuplet for any nested tuplets between
    // it and the notes:
    const nestedTupletYOffset = this.getNestedTupletCount() * Tuplet.NESTING_OFFSET * -this.location;

    // offset the tuplet for any manual yOffset:
    const yOffset = this.options.yOffset || 0;

    // now iterate through the notes and find our highest
    // or lowest locations, to form a base yPosition
    const firstNote = this.notes[0];
    let yPosition;
    if (this.location === Tuplet.LOCATION_TOP) {
      yPosition = firstNote.checkStave().getYForLine(0) - 1.5 * Tables.STAVE_LINE_DISTANCE;

      // check modifiers above note to see if they will collide with tuplet beam
      for (let i = 0; i < this.notes.length; ++i) {
        const note = this.notes[i];
        let modLines = 0;
        const mc = note.getModifierContext();
        if (mc) {
          modLines = Math.max(modLines, mc.getState().topTextLine);
        }
        const modY = note.getYForTopText(modLines) - 2 * Tables.STAVE_LINE_DISTANCE;
        if (note.hasStem() || note.isRest()) {
          const topY =
            note.getStemDirection() === Stem.UP
              ? note.getStemExtents().topY - Tables.STAVE_LINE_DISTANCE
              : note.getStemExtents().baseY - 2 * Tables.STAVE_LINE_DISTANCE;
          yPosition = Math.min(topY, yPosition);
          if (modLines > 0) {
            yPosition = Math.min(modY, yPosition);
          }
        }
      }
    } else {
      let lineCheck = 4; // tuplet default on line 4
      // check modifiers below note to see if they will collide with tuplet beam
      this.notes.forEach((nn) => {
        const mc = nn.getModifierContext();
        if (mc) {
          lineCheck = Math.max(lineCheck, mc.getState().textLine + 1);
        }
      });
      yPosition = firstNote.checkStave().getYForLine(lineCheck) + 2 * Tables.STAVE_LINE_DISTANCE;

      for (let i = 0; i < this.notes.length; ++i) {
        if (this.notes[i].hasStem() || this.notes[i].isRest()) {
          const bottomY =
            this.notes[i].getStemDirection() === Stem.UP
              ? this.notes[i].getStemExtents().baseY + 2 * Tables.STAVE_LINE_DISTANCE
              : this.notes[i].getStemExtents().topY + Tables.STAVE_LINE_DISTANCE;
          if (bottomY > yPosition) {
            yPosition = bottomY;
          }
        }
      }
    }

    return yPosition + nestedTupletYOffset + yOffset;
  }

  draw(): void {
    const ctx = this.checkContext();
    let xPos = 0;
    let yPos = 0;
    this.setRendered();

    // determine x value of left bound of tuplet
    const firstNote = this.notes[0] as StemmableNote;
    const lastNote = this.notes[this.notes.length - 1] as StemmableNote;

    if (!this.bracketed) {
      xPos = firstNote.getStemX();
      this.width = lastNote.getStemX() - xPos;
    } else {
      xPos = firstNote.getTieLeftX() - 5;
      this.width = lastNote.getTieRightX() - xPos + 5;
    }

    // determine y value for tuplet
    yPos = this.getYPosition();

    const notationCenterX = xPos + this.width / 2;
    const notationStartX = notationCenterX - this.txtElement.getWidth() / 2;

    // draw bracket if the tuplet is not beamed
    if (this.bracketed) {
      const lineWidth = this.width / 2 - this.txtElement.getWidth() / 2 - 5;

      // only draw the bracket if it has positive length
      if (lineWidth > 0) {
        ctx.fillRect(xPos, yPos, lineWidth, 1);
        ctx.fillRect(xPos + this.width / 2 + this.txtElement.getWidth() / 2 + 5, yPos, lineWidth, 1);
        ctx.fillRect(xPos, yPos + (this.location === Tuplet.LOCATION_BOTTOM ? 1 : 0), 1, this.location * 10);
        ctx.fillRect(
          xPos + this.width,
          yPos + (this.location === Tuplet.LOCATION_BOTTOM ? 1 : 0),
          1,
          this.location * 10
        );
      }
    }

    // draw text
    this.txtElement.renderText(ctx, notationStartX, yPos + this.txtElement.getHeight() / 2);
  }
}
