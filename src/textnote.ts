// Copyright (c) 2023-present VexFlow contributors: https://github.com/vexflow/vexflow/graphs/contributors
// MIT License

import { FontInfo } from './font';
import { Note, NoteStruct } from './note';
import { Tables } from './tables';
import { Category } from './typeguard';

export enum TextJustification {
  LEFT = 1,
  CENTER = 2,
  RIGHT = 3,
}

export interface TextNoteStruct extends NoteStruct {
  text?: string;
  glyph?: string;
  ignoreTicks?: boolean;
  smooth?: boolean;
  font?: FontInfo;
  subscript?: string;
  superscript?: string;
}

/**
 * `TextNote` is a notation element that is positioned in time. Generally
 * meant for objects that sit above/below the staff and inline with each other.
 * `TextNote` has to be assigned to a `Stave` before rendering by means of `setStave`.
 * Examples of this would be such as dynamics, lyrics, chord changes, etc.
 */
export class TextNote extends Note {
  static get CATEGORY(): string {
    return Category.TextNote;
  }

  static readonly Justification = TextJustification;

  /** Glyph data. */
  static get GLYPHS(): Record<string, string> {
    return {
      segno: 'E047' /*segno*/,
      tr: 'E566' /*ornamentTrill*/,
      mordent: 'E56D' /*ornamentMordent*/,
      mordentUpper: 'E56C' /*ornamentShortTrill*/,
      mordentLower: 'E56D' /*ornamentMordent*/,
      f: 'E522' /*dynamicForte*/,
      p: 'E520' /*dynamicPiano*/,
      m: 'E521' /*dynamicMezzo*/,
      s: 'E524' /*dynamicSforzando*/,
      z: 'E525' /*dynamicZ*/,
      coda: 'E048' /*coda*/,
      pedalOpen: 'E650' /*keyboardPedalPed*/,
      pedalClose: 'E655' /*keyboardPedalUp*/,
      caesuraStraight: 'E4D1' /*caesura*/,
      caesuraCurved: 'E4D4' /*caesuraCurved*/,
      breath: 'E4CE' /*breathMarkComma*/,
      tick: 'E4CF' /*breathMarkTick*/,
      turn: 'E567' /*ornamentTurn*/,
      turnInverted: 'E569' /*ornamentTurnSlash*/,
    };
  }

  protected text: string;
  protected superscript?: string;
  protected subscript?: string;
  protected smooth: boolean;
  protected justification: TextJustification;
  protected line: number;

  constructor(noteStruct: TextNoteStruct) {
    super(noteStruct);

    this.text = noteStruct.text || '';
    if (noteStruct.glyph) {
      this.text += String.fromCharCode(parseInt(TextNote.GLYPHS[noteStruct.glyph] || noteStruct.glyph, 16));
      this.textFont.size = Tables.lookupMetric('fontSize');
    }
    this.superscript = noteStruct.superscript;
    this.subscript = noteStruct.subscript;
    if (noteStruct.font) this.setFont(noteStruct.font);
    this.measureText();
    this.line = noteStruct.line || 0;
    this.smooth = noteStruct.smooth || false;
    this.ignoreTicks = noteStruct.ignoreTicks || false;
    this.justification = TextJustification.LEFT;
  }

  /** Set the horizontal justification of the TextNote. */
  setJustification(just: TextJustification): this {
    this.justification = just;
    return this;
  }

  /** Set the Stave line on which the note should be placed. */
  setLine(line: number): this {
    this.line = line;
    return this;
  }

  /** Return the Stave line on which the TextNote is placed. */
  getLine(): number {
    return this.line;
  }

  /** Return the unformatted text of this TextNote. */
  getText(): string {
    return this.text;
  }

  /** Pre-render formatting. */
  preFormat(): void {
    if (this.preFormatted) return;
    const tickContext = this.checkTickContext(`Can't preformat without a TickContext.`);

    if (this.justification === TextJustification.CENTER) {
      this.leftDisplacedHeadPx = this.width / 2;
    } else if (this.justification === TextJustification.RIGHT) {
      this.leftDisplacedHeadPx = this.width;
    }

    // We reposition to the center of the note head
    this.rightDisplacedHeadPx = tickContext.getMetrics().glyphPx / 2;
    this.preFormatted = true;
  }

  /**
   * Renders the TextNote.
   * `TextNote` has to be assigned to a `Stave` before rendering by means of `setStave`.
   */
  draw(): void {
    const ctx = this.checkContext();
    const stave = this.checkStave();
    const tickContext = this.checkTickContext(`Can't draw without a TickContext.`);

    this.setRendered();

    // Reposition to center of note head
    let x = this.getAbsoluteX() + tickContext.getMetrics().glyphPx / 2;

    // Align based on tick-context width.
    const width = this.getWidth();

    if (this.justification === TextJustification.CENTER) {
      x -= width / 2;
    } else if (this.justification === TextJustification.RIGHT) {
      x -= width;
    }

    let y;
    y = stave.getYForLine(this.line + -3);
    this.applyStyle(ctx);
    ctx.setFont(this.textFont);
    ctx.fillText(this.text, x, y);

    const height = this.getHeight();

    // We called this.setFont(...) in the constructor, so we know this.textFont is available.
    // eslint-disable-next-line
      const { family, size, weight, style } = this.textFont!;
    // Scale the font size by 1/1.3.
    const smallerFontSize = Tables.lookupMetric(`${this.getCategory()}.fontSize`) * 0.769231;

    if (this.superscript) {
      ctx.setFont(family, smallerFontSize, weight, style);
      ctx.fillText(this.superscript, x + this.width + 2, y - height / 2.2);
    }

    if (this.subscript) {
      ctx.setFont(family, smallerFontSize, weight, style);
      ctx.fillText(this.subscript, x + this.width + 2, y + height / 2.2 - 1);
    }

    this.restoreStyle(ctx);
  }
}
