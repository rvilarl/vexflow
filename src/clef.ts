// Copyright (c) 2023-present VexFlow contributors: https://github.com/vexflow/vexflow/graphs/contributors
// MIT License
// Co-author: Benjamin W. Bohl
// MIT License

import { Stave } from './stave';
import { StaveModifier, StaveModifierPosition } from './stavemodifier';
import { Tables } from './tables';
import { Category } from './typeguard';
import { log } from './util';

// eslint-disable-next-line
function L(...args: any[]) {
  if (Clef.DEBUG) log('Vex.Flow.Clef', args);
}

/**
 * Clef implements various types of clefs that can be rendered on a stave.
 *
 * See `tests/clefTests.ts` for usage examples.
 */
export class Clef extends StaveModifier {
  /** To enable logging for this class, set `Vex.Flow.Clef.DEBUG` to `true`. */
  static DEBUG: boolean = false;

  static get CATEGORY(): string {
    return Category.Clef;
  }

  /**
   * The attribute `clef` must be a key from
   * `Clef.types`
   */
  code = Clef.types['treble'].code;
  line = Clef.types['treble'].line;
  protected size = 'default';
  protected type = 'treble';
  /**
   * Every clef name is associated with a glyph code from the font file
   * and a default stave line number.
   */
  static get types(): Record<string, { code: string; line: number }> {
    return {
      treble: {
        code: 'E050' /*gClef*/,
        line: 3,
      },
      bass: {
        code: 'E062' /*fClef*/,
        line: 1,
      },
      alto: {
        code: 'E05C' /*cClef*/,
        line: 2,
      },
      tenor: {
        code: 'E05C' /*cClef*/,
        line: 1,
      },
      percussion: {
        code: 'E069' /*unpitchedPercussionClef1*/,
        line: 2,
      },
      soprano: {
        code: 'E05C' /*cClef*/,
        line: 4,
      },
      'mezzo-soprano': {
        code: 'E05C' /*cClef*/,
        line: 3,
      },
      'baritone-c': {
        code: 'E05C' /*cClef*/,
        line: 0,
      },
      'baritone-f': {
        code: 'E062' /*fClef*/,
        line: 2,
      },
      subbass: {
        code: 'E062' /*fClef*/,
        line: 0,
      },
      french: {
        code: 'E050' /*gClef*/,
        line: 4,
      },
      tab: {
        code: 'E06D' /*6stringTabClef*/,
        line: 2.5,
      },
    };
  }

  /** Create a new clef. */
  constructor(type: string, size?: string, annotation?: string) {
    super();

    this.setPosition(StaveModifierPosition.BEGIN);
    this.setType(type, size, annotation);
    L('Creating clef:', type);
  }

  /** Set clef type, size and annotation. */
  setType(type: string, size: string = 'default', annotation?: string): this {
    this.type = type;
    this.code = Clef.types[type].code;
    this.line = Clef.types[type].line;
    if (size === undefined) {
      this.size = 'default';
    } else {
      this.size = size;
    }

    // If an annotation, such as 8va, is specified, add it to the Clef object.
    if (annotation == '8va') {
      if (this.code == 'E050' /*gClef*/) this.code = 'E053' /*gClef8va*/;
      if (this.code == 'E062' /*fClef*/) this.code = 'E065' /*fClef8va*/;
    }
    if (annotation == '8vb') {
      if (this.code == 'E050' /*gClef*/) this.code = 'E052' /*gClef8vb*/;
      if (this.code == 'E062' /*fClef*/) this.code = 'E064' /*fClef8vb*/;
    }
    this.text = String.fromCharCode(parseInt(this.code, 16));
    this.textFont.size = Math.floor(Clef.getPoint(this.size));
    this.measureText();
    this.width = this.textMetrics.width;

    return this;
  }

  /** Get point for clefs. */
  static getPoint(size?: string): number {
    // for sizes other than 'default', clef is 2/3 of the default value
    return size == 'default' ? Tables.lookupMetric('fontSize') : (Tables.lookupMetric('fontSize') / 3) * 2;
  }

  /** Set associated stave. */
  setStave(stave: Stave): this {
    this.stave = stave;
    return this;
  }

  /** Render clef. */
  draw(): void {
    const stave = this.checkStave();
    const ctx = stave.checkContext();
    this.setRendered();

    this.applyStyle(ctx);
    ctx.openGroup('clef', this.getAttribute('id'));

    this.renderText(ctx, this.x, stave.getYForLine(this.line));
    ctx.closeGroup();
    this.restoreStyle(ctx);
  }
}
