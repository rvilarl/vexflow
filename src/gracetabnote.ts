// Copyright (c) 2023-present VexFlow contributors: https://github.com/vexflow/vexflow/graphs/contributors
// @author Balazs Forian-Szabo
//
// ## Description
//
// A basic implementation of grace notes
// to be rendered on a tab stave.
//
// See `tests/gracetabnoteTests.ts` for usage examples.

import { Tables } from './tables';
import { TabNote, TabNoteStruct } from './tabnote';
import { Category } from './typeguard';

export class GraceTabNote extends TabNote {
  static get CATEGORY(): string {
    return Category.GraceTabNote;
  }

  constructor(noteStruct: TabNoteStruct) {
    super(noteStruct, false);

    this.renderOptions = {
      ...this.renderOptions,
      // vertical shift from stave line
      yShift: 0.3,
      // grace glyph scale
      scale: 0.6,
      // grace tablature font
      font: Tables.lookupMetric('fontFamily'),
      glyphFontScale: Tables.lookupMetric('graceTabNote.fontSize'),
    };

    this.updateWidth();
  }
}
