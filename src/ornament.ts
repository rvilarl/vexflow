// Copyright (c) 2023-present VexFlow contributors: https://github.com/vexflow/vexflow/graphs/contributors
// @author Cyril Silverman
// MIT License

import { Element } from './element';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { Stem } from './stem';
import { StemmableNote } from './stemmablenote';
import { Tables } from './tables';
import { TickContext } from './tickcontext';
import { Category, isTabNote } from './typeguard';
import { defined, log } from './util';

// eslint-disable-next-line
function L(...args: any[]) {
  if (Ornament.DEBUG) log('Vex.Flow.Ornament', args);
}

/**
 * Ornament implements ornaments as modifiers that can be
 * attached to notes. The complete list of ornaments is available in
 * `tables.ts` under `Vex.Flow.ornamentCodes`.
 *
 * See `tests/ornamentTests.ts` for usage examples.
 */
export class Ornament extends Modifier {
  /** To enable logging for this class. Set `Vex.Flow.Ornament.DEBUG` to `true`. */
  static DEBUG: boolean = false;

  /** Ornaments category string. */
  static get CATEGORY(): string {
    return Category.Ornament;
  }
  static get minPadding(): number {
    return Tables.lookupMetric('noteHead.minPadding');
  }

  protected ornamentAlignWithNoteHead: string[] | boolean;
  protected type: string;

  protected delayed: boolean;
  protected adjustForStemDirection: boolean;
  public renderOptions: {
    accidentalUpperPadding: number;
    accidentalLowerPadding: number;
  };
  protected accidentalUpper?: Element;
  protected accidentalLower?: Element;
  protected delayXShift?: number;

  /** Arrange ornaments inside `ModifierContext` */
  static format(ornaments: Ornament[], state: ModifierContextState): boolean {
    if (!ornaments || ornaments.length === 0) return false;

    let width = 0; // width is used by ornaments, which are always centered on the note head
    let rightShift = state.rightShift; // jazz ornaments calculate r/l shift separately
    let leftShift = state.leftShift;

    for (let i = 0; i < ornaments.length; ++i) {
      const ornament = ornaments[i];
      const increment = 2;

      if (Ornament.ornamentRelease.indexOf(ornament.type) >= 0) {
        ornament.xShift += rightShift + 2;
      }
      if (Ornament.ornamentAttack.indexOf(ornament.type) >= 0) {
        ornament.xShift -= leftShift + 2;
      }
      if (ornament.width && ornament.xShift < 0) {
        leftShift += ornament.width;
      } else if (ornament.width && ornament.xShift >= 0) {
        rightShift += ornament.width + Ornament.minPadding;
      } else {
        width = Math.max(ornament.getWidth(), width);
      }
      // articulations above/below the line can be stacked.
      if (Ornament.ornamentArticulation.indexOf(ornament.type) >= 0) {
        // Unfortunately we don't know the stem direction.  So we base it
        // on the line number, but also allow it to be overridden.
        const ornamentNote = defined(ornament.note, 'NoAttachedNote');
        if (ornamentNote.getLineNumber() >= 3) {
          ornament.position = Modifier.Position.ABOVE;
          ornament.setTextLine(state.topTextLine);
          state.topTextLine += ornament.getHeight() / Tables.STAVE_LINE_DISTANCE;
        } else {
          ornament.position = Modifier.Position.BELOW;
          ornament.setTextLine(state.textLine);
          state.textLine += ornament.getHeight() / Tables.STAVE_LINE_DISTANCE;
        }
      } else {
        if (ornament.getPosition() === Modifier.Position.ABOVE) {
          ornament.setTextLine(state.topTextLine);
          state.topTextLine += increment;
        } else {
          ornament.setTextLine(state.textLine);
          state.textLine += increment;
        }
      }
    }

    // Note: 'legit' ornaments don't consider other modifiers when calculating their
    // X position, but jazz ornaments sometimes need to.
    state.leftShift = leftShift + width / 2;
    state.rightShift = rightShift + width / 2;
    return true;
  }

  /**
   * ornamentNoteTransition means the jazz ornament represents an effect from one note to another,
   * these are generally on the top of the staff.
   */
  static get ornamentNoteTransition(): string[] {
    return ['flip', 'jazzTurn', 'smear'];
  }

  /**
   * ornamentAttack indicates something that happens in the attach, placed before the note and
   * any accidentals
   */
  static get ornamentAttack(): string[] {
    return ['scoop'];
  }

  /**
   * The ornament is aligned based on the note head, but without regard to whether the
   * stem goes up or down.
   */
  static get ornamentAlignWithNoteHead(): string[] {
    return ['doit', 'fall', 'fallLong', 'doitLong', 'bend', 'plungerClosed', 'plungerOpen', 'scoop'];
  }

  /**
   * An ornament that happens on the release of the note, generally placed after the
   * note and overlapping the next beat/measure..
   */
  static get ornamentRelease(): string[] {
    return ['doit', 'fall', 'fallLong', 'doitLong', 'jazzTurn', 'smear', 'flip'];
  }

  static get ornamentLeft(): string[] {
    return ['scoop'];
  }

  static get ornamentRight(): string[] {
    return ['doit', 'fall', 'fallLong', 'doitLong'];
  }

  static get ornamentYShift(): string[] {
    return ['fallLong'];
  }

  /** ornamentArticulation goes above/below the note based on space availablity */
  static get ornamentArticulation(): string[] {
    return ['bend', 'plungerClosed', 'plungerOpen'];
  }

  /**
   * Create a new ornament of type `type`, which is an entry in
   * `Vex.Flow.ornamentCodes` in `tables.ts`.
   */
  constructor(type: string) {
    super();

    // Default position ABOVE
    this.position = Modifier.Position.ABOVE;
    if (Ornament.ornamentRight.indexOf(type) >= 0) {
      this.position = Modifier.Position.RIGHT;
    }
    if (Ornament.ornamentLeft.indexOf(type) >= 0) {
      this.position = Modifier.Position.LEFT;
    }
    this.type = type;
    this.delayed = false;

    this.renderOptions = {
      accidentalLowerPadding: 3,
      accidentalUpperPadding: 3,
    };

    // some jazz ornaments are above or below depending on stem direction.
    this.adjustForStemDirection = false;

    this.ornamentAlignWithNoteHead = Ornament.ornamentAlignWithNoteHead.indexOf(this.type) >= 0;

    // Is this a jazz ornament that goes between this note and the next note.
    if (Ornament.ornamentNoteTransition.indexOf(this.type) >= 0) {
      this.delayed = true;
    }

    this.text = String.fromCharCode(Tables.ornamentCodes(this.type));
    this.measureText();
  }

  /** Set whether the ornament is to be delayed. */
  setDelayed(delayed: boolean): this {
    this.delayed = delayed;
    return this;
  }

  /** Set the upper accidental for the ornament. */
  setUpperAccidental(accid: string): this {
    this.accidentalUpper = new Element();
    this.accidentalUpper.setText(Tables.accidentalCodes(accid));
    this.accidentalUpper.measureText();
    return this;
  }

  /** Set the lower accidental for the ornament. */
  setLowerAccidental(accid: string): this {
    this.accidentalLower = new Element();
    this.accidentalLower.setText(Tables.accidentalCodes(accid));
    this.accidentalLower.measureText();
    return this;
  }

  /** Render ornament in position next to note. */
  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote() as StemmableNote;
    this.setRendered();

    const stemDir = note.getStemDirection();
    const stave = note.checkStave();

    this.applyStyle();
    ctx.openGroup('ornament', this.getAttribute('id'));

    // Get stem extents
    const stemExtents = note.checkStem().getExtents();
    let y = stemDir === Stem.DOWN ? stemExtents.baseY : stemExtents.topY;

    // TabNotes don't have stems attached to them. Tab stems are rendered outside the stave.
    if (isTabNote(note)) {
      if (note.hasStem()) {
        if (stemDir === Stem.DOWN) {
          y = stave.getYForTopText(this.textLine);
        }
      } else {
        // Without a stem
        y = stave.getYForTopText(this.textLine);
      }
    }

    const isPlacedOnNoteheadSide = stemDir === Stem.DOWN;
    const spacing = stave.getSpacingBetweenLines();
    let lineSpacing = 1;

    // Beamed stems are longer than quarter note stems, adjust accordingly
    if (!isPlacedOnNoteheadSide && note.hasBeam()) {
      lineSpacing += 0.5;
    }

    const totalSpacing = spacing * (this.textLine + lineSpacing);
    const glyphYBetweenLines = y - totalSpacing;

    // Get initial coordinates for the modifier position
    const start = note.getModifierStartXY(this.position, this.index);
    let glyphX = start.x;

    // If the ornament is aligned with the note head, don't consider the stave y
    // but use the 'natural' modifier y
    let glyphY = start.y;
    switch (this.position) {
      case Modifier.Position.ABOVE:
        glyphY = Math.min(stave.getYForTopText(this.textLine), glyphYBetweenLines);
        break;
      case Modifier.Position.BELOW:
        glyphY = stave.getYForBottomText(this.textLine) + 10;
        break;
    }
    glyphY += this.yShift;

    // Ajdust x position if ornament is delayed
    if (this.delayed) {
      let delayXShift = 0;
      const startX = glyphX - (stave.getX() - 10);
      if (this.delayXShift !== undefined) {
        delayXShift = this.delayXShift;
      } else {
        delayXShift += this.getWidth() / 2;
        const nextContext = TickContext.getNextContext(note.getTickContext());
        if (nextContext) {
          delayXShift += (nextContext.getX() - startX) * 0.5;
        } else {
          delayXShift += (stave.getX() + stave.getWidth() - startX) * 0.5;
        }
        this.delayXShift = delayXShift;
      }
      glyphX += delayXShift;
    }

    L('Rendering ornament: ', this.text.charCodeAt(0), glyphX, glyphY);
    if (this.accidentalLower) {
      this.accidentalLower.renderText(
        ctx,
        glyphX - this.accidentalLower.getWidth() * 0.5,
        glyphY - this.accidentalLower.getTextMetrics().actualBoundingBoxDescent
      );
      glyphY -= this.accidentalLower.getHeight() + this.renderOptions.accidentalLowerPadding;
    }

    if (Ornament.ornamentYShift.indexOf(this.type) >= 0) {
      glyphY += this.getHeight();
    }

    let center = 0;
    if (this.position == Modifier.Position.ABOVE || this.position == Modifier.Position.BELOW) center = this.width * 0.5;
    if (this.position == Modifier.Position.LEFT) center = this.width;

    this.renderText(ctx, glyphX + this.xShift - center, glyphY);

    if (this.accidentalUpper) {
      glyphY -= this.getTextMetrics().actualBoundingBoxAscent + this.renderOptions.accidentalUpperPadding;
      this.accidentalUpper.renderText(
        ctx,
        glyphX - this.accidentalUpper.getWidth() * 0.5,
        glyphY - this.accidentalUpper.getTextMetrics().actualBoundingBoxDescent
      );
    }
    ctx.closeGroup();
    this.restoreStyle();
  }
}
