// Copyright (c) 2023-present VexFlow contributors: https://github.com/vexflow/vexflow/graphs/contributors
// @author Larry Kuhns
//
// This file implements the `Stroke` class which renders chord strokes
// that can be arpeggiated, brushed, rasquedo, etc.

import { Element } from './element';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { Note } from './note';
import { Tables } from './tables';
import { Category, isNote, isStaveNote, isTabNote } from './typeguard';
import { RuntimeError } from './util';

export class Stroke extends Modifier {
  static get CATEGORY(): string {
    return Category.Stroke;
  }

  static readonly Type = {
    BRUSH_DOWN: 1,
    BRUSH_UP: 2,
    ROLL_DOWN: 3, // Arpeggiated chord
    ROLL_UP: 4, // Arpeggiated chord
    RASQUEDO_DOWN: 5,
    RASQUEDO_UP: 6,
    ARPEGGIO_DIRECTIONLESS: 7, // Arpeggiated chord without upwards or downwards arrow
  };

  // Arrange strokes inside `ModifierContext`
  static format(strokes: Stroke[], state: ModifierContextState): boolean {
    const leftShift = state.leftShift;
    const strokeSpacing = 0;

    if (!strokes || strokes.length === 0) return false;

    const strokeList = strokes.map((stroke) => {
      const note = stroke.getNote();
      const index = stroke.checkIndex();
      if (isStaveNote(note)) {
        // Only StaveNote objects have getKeyProps().
        const { line } = note.getKeyProps()[index];
        const shift = note.getLeftDisplacedHeadPx();
        return { line, shift, stroke };
      } else if (isTabNote(note)) {
        // Only TabNote objects have getPositions().
        const { str: string } = note.getPositions()[index];
        return { line: string, shift: 0, stroke };
      } else {
        throw new RuntimeError('Internal', 'Unexpected instance.');
      }
    });

    const strokeShift = leftShift;

    // There can only be one stroke .. if more than one, they overlay each other
    const xShift = strokeList.reduce((xShift, { stroke, shift }) => {
      stroke.setXShift(strokeShift + shift);
      return Math.max(stroke.getWidth() + strokeSpacing, xShift);
    }, 0);

    state.leftShift += xShift;

    return true;
  }

  protected options: { allVoices: boolean };
  protected allVoices: boolean;
  protected type: number;
  protected noteEnd?: Note;
  public renderOptions: {
    fontScale: number;
  };

  constructor(type: number, options?: { allVoices: boolean }) {
    super();

    this.options = { allVoices: true, ...options };

    // multi voice - span stroke across all voices if true
    this.allVoices = this.options.allVoices;

    // multi voice - end note of stroke, set in draw()
    this.type = type;
    this.position = Modifier.Position.LEFT;

    this.renderOptions = {
      fontScale: Tables.lookupMetric('fontSize'),
    };

    this.setXShift(0);
    this.setWidth(10);
  }

  getPosition(): number {
    return this.position;
  }

  addEndNote(note: Note): this {
    this.noteEnd = note;
    return this;
  }

  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote();
    this.setRendered();

    const start = note.getModifierStartXY(this.position, this.index);
    let yPositions = note.getYs();
    let topY = start.y;
    let botY = start.y;
    const x = start.x - 5;
    const lineSpace = note.checkStave().getSpacingBetweenLines();

    const notes = this.checkModifierContext().getMembers(note.getCategory());
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      if (isNote(note)) {
        // Only Note objects have getYs().
        // note is an instance of either StaveNote or TabNote.
        yPositions = note.getYs();
        for (let n = 0; n < yPositions.length; n++) {
          if (this.note === notes[i] || this.allVoices) {
            topY = Math.min(topY, yPositions[n]);
            botY = Math.max(botY, yPositions[n]);
          }
        }
      }
    }

    let arrow = 0;
    let arrowY = 0;
    let textY = 0;

    switch (this.type) {
      case Stroke.Type.BRUSH_DOWN:
        arrow = 0xeb78 /*arrowheadBlackUp*/;
        arrowY = topY - lineSpace / 2 + 10;
        botY += lineSpace / 2;
        break;
      case Stroke.Type.BRUSH_UP:
        arrow = 0xeb7c /*arrowheadBlackDown*/;
        arrowY = botY + lineSpace / 2;
        topY -= lineSpace / 2;
        break;
      case Stroke.Type.ROLL_DOWN:
      case Stroke.Type.RASQUEDO_DOWN:
        arrow = 0xeb78 /*arrowheadBlackUp*/;
        textY = botY + 2 * lineSpace;
        break;
      case Stroke.Type.ROLL_UP:
      case Stroke.Type.RASQUEDO_UP:
        arrow = 0xeb7c /*arrowheadBlackDown*/;
        textY = topY - lineSpace;
        break;
      case Stroke.Type.ARPEGGIO_DIRECTIONLESS:
        topY -= lineSpace / 2;
        botY += lineSpace / 2;
        break;
      default:
        throw new RuntimeError('InvalidType', `The stroke type ${this.type} does not exist`);
    }

    // Draw the stroke
    if (this.type === Stroke.Type.BRUSH_DOWN || this.type === Stroke.Type.BRUSH_UP) {
      ctx.fillRect(x + this.xShift, topY, 1, botY - topY);
      // Draw the arrow head
      const el = new Element();
      el.setText(String.fromCharCode(arrow));
      el.measureText();
      el.renderText(
        ctx,
        // Center the arrow head substracting its width / 2
        x + this.xShift - el.getWidth() / 2,
        arrowY
      );
    } else {
      const lineGlyph =
        arrow == 0xeb7c /*arrowheadBlackDown*/ ? 0xeaa9 /*wiggleArpeggiatoUp*/ : 0xeaaa; /*wiggleArpeggiatoDown*/
      const arrowGlyph =
        arrow == 0xeb7c /*arrowheadBlackDown*/
          ? 0xeaad /*wiggleArpeggiatoUpArrow*/
          : 0xeaae; /*wiggleArpeggiatoDownArrow*/
      ctx.openRotation(90, x + this.xShift, topY);
      let txt = '';
      if (arrow == 0xeb78 /*arrowheadBlackUp*/) {
        txt += String.fromCharCode(arrowGlyph);
      }
      const el = new Element();
      // 2 pixels overlap of arpeggiato glyphs
      for (; el.getWidth() < botY - topY; ) {
        txt += String.fromCharCode(lineGlyph);
        if (arrow == 0xeb7c /*arrowheadBlackDown*/) {
          el.setText(txt + String.fromCharCode(arrowGlyph));
        } else {
          el.setText(txt);
        }
        el.measureText();
      }
      el.renderText(
        ctx,
        // overlap the arrow half line space
        x + this.xShift - lineSpace / 2,
        topY
      );
      ctx.closeRotation();
    }

    // Draw the rasquedo "R"
    if (this.type === Stroke.Type.RASQUEDO_DOWN || this.type === Stroke.Type.RASQUEDO_UP) {
      const el = new Element('Strokes.text');
      el.setText('R');
      el.renderText(ctx, x + this.xShift, textY);
    }
  }
}
