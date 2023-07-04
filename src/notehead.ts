// Copyright (c) 2023-present VexFlow contributors: https://github.com/vexflow/vexflow/graphs/contributors
// MIT License

import { BoundingBox } from './boundingbox';
import { ElementStyle } from './element';
import { Note, NoteStruct } from './note';
import { Stave } from './stave';
import { Stem } from './stem';
import { Tables } from './tables';
import { Category } from './typeguard';
import { defined, log } from './util';

// eslint-disable-next-line
function L(...args: any[]) {
  if (NoteHead.DEBUG) log('Vex.Flow.NoteHead', args);
}

export interface NoteHeadMetrics {
  minPadding?: number;
  displacedShiftX?: number;
}
export interface NoteHeadStruct extends NoteStruct {
  line?: number;
  glyphFontScale?: number;
  slashed?: boolean;
  style?: ElementStyle;
  customGlyphCode?: number;
  stemDirection?: number;
  displaced?: boolean;
  noteType?: string;
  x?: number;
  y?: number;
  index?: number;
}

/**
 * `NoteHeads` are typically not manipulated
 * directly, but used internally in `StaveNote`.
 *
 * See `tests/noteheadTests.ts` for usage examples.
 */
export class NoteHead extends Note {
  /** To enable logging for this class. Set `Vex.Flow.NoteHead.DEBUG` to `true`. */
  static DEBUG: boolean = false;

  static get CATEGORY(): string {
    return Category.NoteHead;
  }

  glyphCode: number;

  protected customGlyph: boolean = false;
  protected displaced: boolean;
  protected stemDirection: number;

  protected x: number;
  protected y: number;
  protected line: number;
  protected index?: number;
  protected slashed: boolean;

  protected ledger: Record<number, number> = {
    0xe4e3 /*restWhole*/: 0xe4f4 /*restWholeLegerLine*/,
    0xe4e4 /*restHalf*/: 0xe4f5 /*restHalfLegerLine*/,
  };

  constructor(noteStruct: NoteHeadStruct) {
    super(noteStruct);

    this.index = noteStruct.index;
    this.x = noteStruct.x || 0;
    this.y = noteStruct.y || 0;
    if (noteStruct.noteType) this.noteType = noteStruct.noteType;
    this.displaced = noteStruct.displaced || false;
    this.stemDirection = noteStruct.stemDirection || Stem.UP;
    this.line = noteStruct.line || 0;

    // Get glyph code based on duration and note type. This could be
    // regular notes, rests, or other custom codes.
    this.glyphProps = Note.getGlyphProps(this.duration, this.noteType);
    defined(
      this.glyphProps,
      'BadArguments',
      `No glyph found for duration '${this.duration}' and type '${this.noteType}'`
    );

    // Swap out the glyph with ledger lines
    if ((this.line > 5 || this.line < 0) && this.ledger[this.glyphProps.codeHead]) {
      this.glyphProps.codeHead = this.ledger[this.glyphProps.codeHead];
    }
    this.glyphCode = this.glyphProps.codeHead;
    if (noteStruct.customGlyphCode) {
      this.customGlyph = true;
      this.glyphCode = noteStruct.customGlyphCode;
    }

    this.setStyle(noteStruct.style);
    this.slashed = noteStruct.slashed || false;

    this.renderOptions = {
      ...this.renderOptions,
      // font size for note heads
      glyphFontScale: noteStruct.glyphFontScale || Tables.lookupMetric('fontSize'),
    };

    this.text = String.fromCharCode(this.glyphCode);
    this.textFont.size = this.renderOptions.glyphFontScale;
    this.measureText();
    this.width = this.textMetrics.width;
  }
  /** Get the width of the notehead. */
  getWidth(): number {
    return this.width;
  }

  /** Determine if the notehead is displaced. */
  isDisplaced(): boolean {
    return this.displaced === true;
  }

  /** Set the X coordinate. */
  setX(x: number): this {
    this.x = x;
    return this;
  }

  /** Get the Y coordinate. */
  getY(): number {
    return this.y;
  }

  /** Set the Y coordinate. */
  setY(y: number): this {
    this.y = y;
    return this;
  }

  /** Get the stave line the notehead is placed on. */
  getLine(): number {
    return this.line;
  }

  /** Set the stave line the notehead is placed on. */
  setLine(line: number): this {
    this.line = line;
    return this;
  }

  /** Get the canvas `x` coordinate position of the notehead. */
  getAbsoluteX(): number {
    // If the note has not been preformatted, then get the static x value
    // Otherwise, it's been formatted and we should use it's x value relative
    // to its tick context
    const x = !this.preFormatted ? this.x : super.getAbsoluteX();

    // For a more natural displaced notehead, we adjust the displacement amount
    // by half the stem width in order to maintain a slight overlap with the stem
    const displacementStemAdjustment = Stem.WIDTH / 2;
    const fontShift = Tables.lookupMetric('notehead.shiftX', 0) * this.stemDirection;
    const displacedFontShift = Tables.lookupMetric('noteHead.displacedShiftX', 0) * this.stemDirection;

    return (
      x +
      fontShift +
      (this.displaced ? (this.width - displacementStemAdjustment) * this.stemDirection + displacedFontShift : 0)
    );
  }

  /** Get the `BoundingBox` for the `NoteHead`. */
  getBoundingBox(): BoundingBox {
    const spacing = this.checkStave().getSpacingBetweenLines();
    const halfSpacing = spacing / 2;
    const minY = this.y - halfSpacing;

    return new BoundingBox(this.getAbsoluteX(), minY, this.width, spacing);
  }

  /** Set notehead to a provided `stave`. */
  setStave(stave: Stave): this {
    const line = this.getLine();

    this.stave = stave;
    if (this.stave) {
      this.setY(this.stave.getYForNote(line));
      this.setContext(this.stave.getContext());
    }
    return this;
  }

  /** Pre-render formatting. */
  preFormat(): this {
    if (this.preFormatted) return this;

    const width = this.getWidth() + this.leftDisplacedHeadPx + this.rightDisplacedHeadPx;

    this.setWidth(width);
    this.preFormatted = true;
    return this;
  }

  /** Draw the notehead. */
  draw(): void {
    const ctx = this.checkContext();
    this.setRendered();

    const headX = this.getAbsoluteX();

    const y = this.y;

    L("Drawing note head '", this.noteType, this.duration, "' at", headX, y);

    this.renderText(ctx, headX, y);
  }
}
