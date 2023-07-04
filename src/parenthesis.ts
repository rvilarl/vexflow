// Copyright (c) 2023-present VexFlow contributors: https://github.com/vexflow/vexflow/graphs/contributors
// @author Rodrigo Vilar
// MIT License

import { Modifier, ModifierPosition } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { Note } from './note';
import { Category, isGraceNote } from './typeguard';

/** Parenthesis implements parenthesis modifiers for notes. */
export class Parenthesis extends Modifier {
  static get CATEGORY(): string {
    return Category.Parenthesis;
  }

  /** Add parentheses to the notes. */
  static buildAndAttach(notes: Note[]): void {
    for (const note of notes) {
      for (let i = 0; i < note.keys.length; i++) {
        note.addModifier(new Parenthesis(ModifierPosition.LEFT), i);
        note.addModifier(new Parenthesis(ModifierPosition.RIGHT), i);
      }
    }
  }

  /** Arrange parentheses inside a ModifierContext. */
  static format(parentheses: Parenthesis[], state: ModifierContextState): boolean {
    if (!parentheses || parentheses.length === 0) return false;

    let xWidthL = 0;
    let xWidthR = 0;

    for (let i = 0; i < parentheses.length; ++i) {
      const parenthesis = parentheses[i];
      const note = parenthesis.getNote();
      const pos = parenthesis.getPosition();
      const index = parenthesis.checkIndex();

      let shift = 0;

      if (pos === ModifierPosition.RIGHT) {
        shift = note.getRightParenthesisPx(index);
        xWidthR = xWidthR > shift + parenthesis.width ? xWidthR : shift + parenthesis.width;
      }
      if (pos === ModifierPosition.LEFT) {
        shift = note.getLeftParenthesisPx(index);
        xWidthL = xWidthL > shift + parenthesis.width ? xWidthL : shift + parenthesis.width;
      }
      parenthesis.setXShift(shift);
    }
    state.leftShift += xWidthL;
    state.rightShift += xWidthR;

    return true;
  }

  /**
   * Constructor
   *
   * @param position Modifier.Position.LEFT (default) or Modifier.Position.RIGHT
   */
  constructor(position: ModifierPosition) {
    super();

    this.position = position ?? Modifier.Position.LEFT;
    if (this.position == Modifier.Position.RIGHT) {
      this.text = String.fromCodePoint(parseInt('E0F6', 16)); /*noteheadParenthesisRight*/
    } else if (this.position == Modifier.Position.LEFT) {
      this.text = String.fromCodePoint(parseInt('E0F5', 16)); /*noteheadParenthesisLeft*/
    }

    this.textFont.size = Note.getPoint('default');
    this.measureText();
  }

  /** Set the associated note. */
  setNote(note: Note): this {
    this.note = note;
    if (isGraceNote(note)) {
      this.textFont.size = Note.getPoint('gracenote');
    } else {
      this.textFont.size = Note.getPoint('default');
    }
    this.measureText();
    return this;
  }

  /** Render the parenthesis. */
  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote();
    this.setRendered();

    const start = note.getModifierStartXY(this.position, this.index, { forceFlagRight: true });
    let x = start.x + this.xShift;
    const y = start.y + this.yShift;
    if (this.position == Modifier.Position.LEFT) {
      x -= 3;
    }
    this.renderText(ctx, x, y);
  }
}
