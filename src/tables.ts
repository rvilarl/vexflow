// Copyright (c) 2023-present VexFlow contributors: https://github.com/vexflow/vexflow/graphs/contributors

import { ArticulationStruct } from './articulation';
import { Fraction } from './fraction';
import type { GlyphProps } from './note';
import { KeyProps } from './note';
import { RuntimeError } from './util';

const RESOLUTION = 16384;

function sc(...codes: number[]): string {
  return String.fromCharCode(...codes);
}

export const CommonMetrics = {
  fontFamily: 'Bravura',
  fontSize: 30,
  fontWeight: 'normal',
  fontStyle: 'normal',
  stave: {
    padding: 12,
    endPaddingMax: 10,
    endPaddingMin: 5,
    unalignedNotePadding: 10,
  },

  Accidental: {
    cautionary: {
      fontSize: 28,
    },
    rightPadding: 1,
    leftPadding: 2,
    spacing: 3,
  },

  Annotation: {
    fontSize: 10,
  },

  Bend: {
    fontSize: 10,
  },

  ChordSymbol: {
    fontSize: 12,
    superscriptOffset: -0.4,
    subscriptOffset: 0.3,
    spacing: 0.05,
    superSubRatio: 0.66,
  },

  FretHandFinger: {
    fontSize: 9,
    fontWeight: 'bold',
  },

  PedalMarking: {
    fontSize: 12,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },

  Repetition: {
    fontSize: 12,
    fontWeight: 'bold',
    symbolText: {
      offsetX: 12,
      offsetY: 25,
      spacing: 5,
    },
    coda: {
      offsetY: 25,
    },
    segno: {
      offsetY: 10,
    },
  },

  Stave: {
    fontSize: 8,
  },

  StaveConnector: {
    fontSize: 16,
  },

  StaveTempo: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  StaveText: {
    fontSize: 16,
  },

  StaveSection: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  StringNumber: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  Strokes: {
    text: {
      fontSize: 10,
      fontStyle: 'italic',
    },
  },

  TabNote: {
    fontSize: 9,
  },

  TabSlide: {
    fontSize: 10,
    fontStyle: 'italic',
  },

  TextBracket: {
    fontSize: 15,
    fontStyle: 'italic',
  },

  TextNote: {
    fontSize: 12,
  },

  Volta: {
    fontSize: 9,
    fontWeight: 'bold',
  },

  tremolo: {
    default: {
      spacing: 7,
      offsetYStemUp: -8,
      offsetYStemDown: 8,
      offsetXStemUp: 11,
      offsetXStemDown: 1,
    },
    grace: {
      spacing: (7 * 3) / 5,
      offsetYStemUp: -(8 * 3) / 5,
      offsetYStemDown: (8 * 3) / 5,
      offsetXStemUp: 7,
      offsetXStemDown: 1,
    },
  },

  noteHead: {
    minPadding: 2,
  },

  stringNumber: {
    verticalPadding: 8,
    stemPadding: 2,
    leftPadding: 5,
    rightPadding: 6,
  },
};

/**
 * Map duration numbers to 'ticks', the unit of duration used throughout VexFlow.
 * For example, a quarter note is 4, so it maps to RESOLUTION / 4 = 4096 ticks.
 */
const durations: Record<string, number> = {
  '1/2': RESOLUTION * 2,
  1: RESOLUTION / 1,
  2: RESOLUTION / 2,
  4: RESOLUTION / 4,
  8: RESOLUTION / 8,
  16: RESOLUTION / 16,
  32: RESOLUTION / 32,
  64: RESOLUTION / 64,
  128: RESOLUTION / 128,
  256: RESOLUTION / 256,
};

const durationAliases: Record<string, string> = {
  w: '1',
  h: '2',
  q: '4',

  // This is the default duration used to render bars (BarNote). Bars no longer
  // consume ticks, so this should be a no-op.
  // TODO(0xfe): This needs to be cleaned up.
  b: '256',
};

const keySignatures: Record<string, { acc?: string; num: number }> = {
  C: { num: 0 },
  Am: { num: 0 },
  F: { acc: 'b', num: 1 },
  Dm: { acc: 'b', num: 1 },
  Bb: { acc: 'b', num: 2 },
  Gm: { acc: 'b', num: 2 },
  Eb: { acc: 'b', num: 3 },
  Cm: { acc: 'b', num: 3 },
  Ab: { acc: 'b', num: 4 },
  Fm: { acc: 'b', num: 4 },
  Db: { acc: 'b', num: 5 },
  Bbm: { acc: 'b', num: 5 },
  Gb: { acc: 'b', num: 6 },
  Ebm: { acc: 'b', num: 6 },
  Cb: { acc: 'b', num: 7 },
  Abm: { acc: 'b', num: 7 },
  G: { acc: '#', num: 1 },
  Em: { acc: '#', num: 1 },
  D: { acc: '#', num: 2 },
  Bm: { acc: '#', num: 2 },
  A: { acc: '#', num: 3 },
  'F#m': { acc: '#', num: 3 },
  E: { acc: '#', num: 4 },
  'C#m': { acc: '#', num: 4 },
  B: { acc: '#', num: 5 },
  'G#m': { acc: '#', num: 5 },
  'F#': { acc: '#', num: 6 },
  'D#m': { acc: '#', num: 6 },
  'C#': { acc: '#', num: 7 },
  'A#m': { acc: '#', num: 7 },
};

const clefs: Record<string, { lineShift: number }> = {
  treble: { lineShift: 0 },
  bass: { lineShift: 6 },
  tenor: { lineShift: 4 },
  alto: { lineShift: 3 },
  soprano: { lineShift: 1 },
  percussion: { lineShift: 0 },
  'mezzo-soprano': { lineShift: 2 },
  'baritone-c': { lineShift: 5 },
  'baritone-f': { lineShift: 5 },
  subbass: { lineShift: 7 },
  french: { lineShift: -1 },
};

const notesInfo: Record<
  string,
  {
    index: number;
    intVal?: number;
    acc?: number;
  }
> = {
  C: { index: 0, intVal: 0 },
  CN: { index: 0, intVal: 0, acc: 0xe261 /*accidentalNatural*/ },
  'C#': { index: 0, intVal: 1, acc: 0xe262 /*accidentalSharp*/ },
  'C##': { index: 0, intVal: 2, acc: 0xe263 /*accidentalDoubleSharp*/ },
  CB: { index: 0, intVal: 11, acc: 0xe260 /*accidentalFlat*/ },
  CBB: { index: 0, intVal: 10, acc: 0xe264 /*accidentalDoubleFlat*/ },
  D: { index: 1, intVal: 2 },
  DN: { index: 1, intVal: 2, acc: 0xe261 /*accidentalNatural*/ },
  'D#': { index: 1, intVal: 3, acc: 0xe262 /*accidentalSharp*/ },
  'D##': { index: 1, intVal: 4, acc: 0xe263 /*accidentalDoubleSharp*/ },
  DB: { index: 1, intVal: 1, acc: 0xe260 /*accidentalFlat*/ },
  DBB: { index: 1, intVal: 0, acc: 0xe264 /*accidentalDoubleFlat*/ },
  E: { index: 2, intVal: 4 },
  EN: { index: 2, intVal: 4, acc: 0xe261 /*accidentalNatural*/ },
  'E#': { index: 2, intVal: 5, acc: 0xe262 /*accidentalSharp*/ },
  'E##': { index: 2, intVal: 6, acc: 0xe263 /*accidentalDoubleSharp*/ },
  EB: { index: 2, intVal: 3, acc: 0xe260 /*accidentalFlat*/ },
  EBB: { index: 2, intVal: 2, acc: 0xe264 /*accidentalDoubleFlat*/ },
  F: { index: 3, intVal: 5 },
  FN: { index: 3, intVal: 5, acc: 0xe261 /*accidentalNatural*/ },
  'F#': { index: 3, intVal: 6, acc: 0xe262 /*accidentalSharp*/ },
  'F##': { index: 3, intVal: 7, acc: 0xe263 /*accidentalDoubleSharp*/ },
  FB: { index: 3, intVal: 4, acc: 0xe260 /*accidentalFlat*/ },
  FBB: { index: 3, intVal: 3, acc: 0xe264 /*accidentalDoubleFlat*/ },
  G: { index: 4, intVal: 7 },
  GN: { index: 4, intVal: 7, acc: 0xe261 /*accidentalNatural*/ },
  'G#': { index: 4, intVal: 8, acc: 0xe262 /*accidentalSharp*/ },
  'G##': { index: 4, intVal: 9, acc: 0xe263 /*accidentalDoubleSharp*/ },
  GB: { index: 4, intVal: 6, acc: 0xe260 /*accidentalFlat*/ },
  GBB: { index: 4, intVal: 5, acc: 0xe264 /*accidentalDoubleFlat*/ },
  A: { index: 5, intVal: 9 },
  AN: { index: 5, intVal: 9, acc: 0xe261 /*accidentalNatural*/ },
  'A#': { index: 5, intVal: 10, acc: 0xe262 /*accidentalSharp*/ },
  'A##': { index: 5, intVal: 11, acc: 0xe263 /*accidentalDoubleSharp*/ },
  AB: { index: 5, intVal: 8, acc: 0xe260 /*accidentalFlat*/ },
  ABB: { index: 5, intVal: 7, acc: 0xe264 /*accidentalDoubleFlat*/ },
  B: { index: 6, intVal: 11 },
  BN: { index: 6, intVal: 11, acc: 0xe261 /*accidentalNatural*/ },
  'B#': { index: 6, intVal: 12, acc: 0xe262 /*accidentalSharp*/ },
  'B##': { index: 6, intVal: 13, acc: 0xe263 /*accidentalDoubleSharp*/ },
  BB: { index: 6, intVal: 10, acc: 0xe260 /*accidentalFlat*/ },
  BBB: { index: 6, intVal: 9, acc: 0xe264 /*accidentalDoubleFlat*/ },
  R: { index: 6 }, // Rest
  X: { index: 6 },
};

const validNoteTypes: Record<string, { name: string }> = {
  n: { name: 'note' },
  r: { name: 'rest' },
  h: { name: 'harmonic' },
  m: { name: 'muted' },
  s: { name: 'slash' },
  g: { name: 'ghost' },
  d: { name: 'diamond' },
  x: { name: 'x' },
  ci: { name: 'circled' },
  cx: { name: 'circle x' },
  sf: { name: 'slashed' },
  sb: { name: 'slashed backward' },
  sq: { name: 'square' },
  tu: { name: 'triangle up' },
  td: { name: 'triangle down' },
};

const accidentals: Record<string, number> = {
  '#': 0xe262 /*accidentalSharp*/,
  '##': 0xe263 /*accidentalDoubleSharp*/,
  b: 0xe260 /*accidentalFlat*/,
  bb: 0xe264 /*accidentalDoubleFlat*/,
  n: 0xe261 /*accidentalNatural*/,
  '{': 0xe26a /*accidentalParensLeft*/,
  '}': 0xe26b /*accidentalParensRight*/,
  db: 0xe281 /*accidentalThreeQuarterTonesFlatZimmermann*/,
  d: 0xe280 /*accidentalQuarterToneFlatStein*/,
  '++': 0xe283 /*accidentalThreeQuarterTonesSharpStein*/,
  '+': 0xe282 /*accidentalQuarterToneSharpStein*/,
  '+-': 0xe446 /*accidentalKucukMucennebSharp*/,
  bs: 0xe442 /*accidentalBakiyeFlat*/,
  bss: 0xe440 /*accidentalBuyukMucennebFlat*/,
  o: 0xe461 /*accidentalSori*/,
  k: 0xe460 /*accidentalKoron*/,
  bbs: 0xe447 /*accidentalBuyukMucennebSharp*/,
  '++-': 0xe447 /*accidentalBuyukMucennebSharp*/,
  ashs: 0xe447 /*accidentalBuyukMucennebSharp*/,
  afhf: 0xe447 /*accidentalBuyukMucennebSharp*/,
};

// Helps determine the layout of accidentals.
const accidentalColumns: Record<number, { [name: string]: number[] }> = {
  1: {
    a: [1],
    b: [1],
  },
  2: {
    a: [1, 2],
  },
  3: {
    a: [1, 3, 2],
    b: [1, 2, 1],
    secondOnBottom: [1, 2, 3],
  },
  4: {
    a: [1, 3, 4, 2],
    b: [1, 2, 3, 1],
    spacedOutTetrachord: [1, 2, 1, 2],
  },
  5: {
    a: [1, 3, 5, 4, 2],
    b: [1, 2, 4, 3, 1],
    spacedOutPentachord: [1, 2, 3, 2, 1],
    verySpacedOutPentachord: [1, 2, 1, 2, 1],
  },
  6: {
    a: [1, 3, 5, 6, 4, 2],
    b: [1, 2, 4, 5, 3, 1],
    spacedOutHexachord: [1, 3, 2, 1, 3, 2],
    verySpacedOutHexachord: [1, 2, 1, 2, 1, 2],
  },
};

const articulations: Record<string, ArticulationStruct> = {
  'a.': { code: 0xe1e7 /*augmentationDot*/, betweenLines: true }, // Staccato
  av: {
    aboveCode: 0xe4a6 /*articStaccatissimoAbove*/,
    belowCode: 0xe4a7 /*articStaccatissimoBelow*/,
    betweenLines: true,
  }, // Staccatissimo
  'a>': {
    aboveCode: 0xe4a0 /*articAccentAbove*/,
    belowCode: 0xe4a1 /*articAccentBelow*/,
    betweenLines: true,
  }, // Accent
  'a-': {
    aboveCode: 0xe4a4 /*articTenutoAbove*/,
    belowCode: 0xe4a5 /*articTenutoBelow*/,
    betweenLines: true,
  }, // Tenuto
  'a^': {
    aboveCode: 0xe4ac /*articMarcatoAbove*/,
    belowCode: 0xe4ad /*articMarcatoBelow*/,
    betweenLines: false,
  }, // Marcato
  'a+': { code: 0xe633 /*pluckedLeftHandPizzicato*/, betweenLines: false }, // Left hand pizzicato
  ao: {
    aboveCode: 0xe631 /*pluckedSnapPizzicatoAbove*/,
    belowCode: 0xe630 /*pluckedSnapPizzicatoBelow*/,
    betweenLines: false,
  }, // Snap pizzicato
  ah: { code: 0xe614 /*stringsHarmonic*/, betweenLines: false }, // Natural harmonic or open note
  'a@': { aboveCode: 0xe4c0 /*fermataAbove*/, belowCode: 0xe4c1 /*fermataBelow*/, betweenLines: false }, // Fermata
  'a@a': { code: 0xe4c0 /*fermataAbove*/, betweenLines: false }, // Fermata above staff
  'a@u': { code: 0xe4c1 /*fermataBelow*/, betweenLines: false }, // Fermata below staff
  'a@s': { aboveCode: 0xe4c4 /*fermataShortAbove*/, belowCode: 0xe4c5 /*fermataShortBelow*/, betweenLines: false }, // Fermata short
  'a@as': { code: 0xe4c4 /*fermataShortAbove*/, betweenLines: false }, // Fermata short above staff
  'a@us': { code: 0xe4c5 /*fermataShortBelow*/, betweenLines: false }, // Fermata short below staff
  'a@l': { aboveCode: 0xe4c6 /*fermataLongAbove*/, belowCode: 0xe4c7 /*fermataLongBelow*/, betweenLines: false }, // Fermata long
  'a@al': { code: 0xe4c6 /*fermataLongAbove*/, betweenLines: false }, // Fermata long above staff
  'a@ul': { code: 0xe4c7 /*fermataLongBelow*/, betweenLines: false }, // Fermata long below staff
  'a@vl': {
    aboveCode: 0xe4c8 /*fermataVeryLongAbove*/,
    belowCode: 0xe4c9 /*fermataVeryLongBelow*/,
    betweenLines: false,
  }, // Fermata very long
  'a@avl': { code: 0xe4c8 /*fermataVeryLongAbove*/, betweenLines: false }, // Fermata very long above staff
  'a@uvl': { code: 0xe4c9 /*fermataVeryLongBelow*/, betweenLines: false }, // Fermata very long below staff
  'a|': { code: 0xe612 /*stringsUpBow*/, betweenLines: false }, // Bow up - up stroke
  am: { code: 0xe610 /*stringsDownBow*/, betweenLines: false }, // Bow down - down stroke
  'a,': { code: 0xe805 /*pictChokeCymbal*/, betweenLines: false }, // Choked
};

const ornaments: Record<string, number> = {
  mordent: 0xe56c /*ornamentShortTrill*/,
  mordentInverted: 0xe56d /*ornamentMordent*/,
  turn: 0xe567 /*ornamentTurn*/,
  turnInverted: 0xe569 /*ornamentTurnSlash*/,
  tr: 0xe566 /*ornamentTrill*/,
  upprall: 0xe5b5 /*ornamentPrecompSlideTrillDAnglebert*/,
  downprall: 0xe5c3 /*ornamentPrecompDoubleCadenceUpperPrefix*/,
  prallup: 0xe5bb /*ornamentPrecompTrillSuffixDandrieu*/,
  pralldown: 0xe5c8 /*ornamentPrecompTrillLowerSuffix*/,
  upmordent: 0xe5b8 /*ornamentPrecompSlideTrillBach*/,
  downmordent: 0xe5c4 /*ornamentPrecompDoubleCadenceUpperPrefixTurn*/,
  lineprall: 0xe5b2 /*ornamentPrecompAppoggTrill*/,
  prallprall: 0xe56e /*ornamentTremblement*/,
  scoop: 0xe5d0 /*brassScoop*/,
  doit: 0xe5d5 /*brassDoitMedium*/,
  fall: 0xe5d7 /*brassFallLipShort*/,
  doitLong: 0xe5d2 /*brassLiftMedium*/,
  fallLong: 0xe5de /*brassFallRoughMedium*/,
  bend: 0xe5e3 /*brassBend*/,
  plungerClosed: 0xe5e5 /*brassMuteClosed*/,
  plungerOpen: 0xe5e7 /*brassMuteOpen*/,
  flip: 0xe5e1 /*brassFlip*/,
  jazzTurn: 0xe5e4 /*brassJazzTurn*/,
  smear: 0xe5e2 /*brassSmear*/,
};

export class Tables {
  static UNISON = true;
  static SOFTMAX_FACTOR = 10;
  static STEM_WIDTH = 1.5;
  static STEM_HEIGHT = 35;
  static STAVE_LINE_THICKNESS = 1;
  static RENDER_PRECISION_PLACES = 3;
  static RESOLUTION = RESOLUTION;

  // 1/2, 1, 2, 4, 8, 16, 32, 64, 128
  // NOTE: There is no 256 here! However, there are other mentions of 256 in this file.
  // For example, in durations has a 256 key, and sanitizeDuration() can return 256.
  // The sanitizeDuration() bit may need to be removed by 0xfe.
  static durationCodes: Record<string, Partial<GlyphProps>> = {
    '1/2': {
      stem: false,
    },

    1: {
      stem: false,
    },

    2: {
      stem: true,
    },

    4: {
      stem: true,
    },

    8: {
      stem: true,
      beamCount: 1,
      stemBeamExtension: 0,
      codeFlagUp: 0xe240 /*flag8thUp*/,
    },

    16: {
      beamCount: 2,
      stemBeamExtension: 0,
      stem: true,
      codeFlagUp: 0xe242 /*flag16thUp*/,
    },

    32: {
      beamCount: 3,
      stemBeamExtension: 7.5,
      stem: true,
      codeFlagUp: 0xe244 /*flag32ndUp*/,
    },

    64: {
      beamCount: 4,
      stemBeamExtension: 15,
      stem: true,
      codeFlagUp: 0xe246 /*flag64thUp*/,
    },

    128: {
      beamCount: 5,
      stemBeamExtension: 22.5,
      stem: true,
      codeFlagUp: 0xe248 /*flag128thUp*/,
    },
  };

  /**
   * Customize this by calling Flow.setMusicFont(...fontNames);
   */
  static TEXT_FONT_SCALE = 10;

  static STAVE_LINE_DISTANCE = 10;

  // HACK:
  // Since text origins are positioned at the baseline, we must
  // compensate for the ascender of the text. Of course, 1 staff space is
  // a very poor approximation.
  //
  // This will be deprecated in the future. This is a temporary solution until
  // we have more robust text metrics.
  static TEXT_HEIGHT_OFFSET_HACK = 1;

  static clefProperties(clef: string): { lineShift: number } {
    if (!clef || !(clef in clefs)) throw new RuntimeError('BadArgument', 'Invalid clef: ' + clef);
    return clefs[clef];
  }

  /**
   * Use the provided key to look up a value in this font's metrics file (e.g., bravuraMetrics.ts, petalumaMetrics.ts).
   * @param key is a string separated by periods (e.g., stave.endPaddingMax, clef.lineCount.'5'.shiftY).
   * @param defaultValue is returned if the lookup fails.
   * @returns the retrieved value (or `defaultValue` if the lookup fails).
   */
  // eslint-disable-next-line
  static lookupMetric(key: string, defaultValue?: Record<string, any> | number): any {
    const keyParts = key.split('.');

    let currObj;

    while (!currObj && keyParts.length) {
      // Start with the top level font metrics object, and keep looking deeper into the object (via each part of the period-delimited key).
      currObj = CommonMetrics;
      for (let i = 0; i < keyParts.length; i++) {
        const keyPart = keyParts[i];
        const value = currObj[keyPart] as any;
        if (value === undefined) {
          // If the key lookup fails, we fall back to undefined.
          currObj = undefined;
          break;
        }
        // The most recent lookup succeeded, so we drill deeper into the object.
        currObj = value;
      }
      if (keyParts.length > 1) {
        keyParts[keyParts.length - 2] = keyParts[keyParts.length - 1];
      }
      keyParts.pop();
    }

    // Return the retrieved or default value
    return currObj ? currObj : defaultValue;
  }
  /**
   * @param keyOctaveGlyph a string in the format "key/octave" (e.g., "c/5") or "key/octave/custom-note-head-code" (e.g., "g/5/t3").
   * @param clef
   * @param params a struct with one option, `octaveShift` for clef ottavation (0 = default; 1 = 8va; -1 = 8vb, etc.).
   * @returns properties for the specified note.
   */
  static keyProperties(
    keyOctaveGlyph: string,
    clef: string = 'treble',
    type: string = 'N',
    params?: { octaveShift?: number }
  ): KeyProps {
    let options = { octaveShift: 0, duration: '4' };
    if (typeof params === 'object') {
      options = { ...options, ...params };
    }
    const duration = Tables.sanitizeDuration(options.duration);

    const pieces = keyOctaveGlyph.split('/');
    if (pieces.length < 2) {
      throw new RuntimeError(
        'BadArguments',
        `First argument must be note/octave or note/octave/glyph-code: ${keyOctaveGlyph}`
      );
    }

    const key = pieces[0].toUpperCase();
    type = type.toUpperCase();
    const value = notesInfo[key];
    if (!value) throw new RuntimeError('BadArguments', 'Invalid key name: ' + key);
    let octave = parseInt(pieces[1], 10);

    // OctaveShift is the shift to compensate for clef 8va/8vb.
    octave += -1 * options.octaveShift;

    const baseIndex = octave * 7 - 4 * 7;
    let line = (baseIndex + value.index) / 2;
    line += Tables.clefProperties(clef).lineShift;

    // Integer value for note arithmetic.
    const intValue = typeof value.intVal !== 'undefined' ? octave * 12 + value.intVal : undefined;

    // If the user specified a glyph, overwrite the glyph code.
    let code = 0;
    let glyphName = 'N';
    if (pieces.length > 2 && pieces[2]) {
      glyphName = pieces[2].toUpperCase();
    } else if (type != 'N') {
      glyphName = type;
    } else glyphName = key;
    code = this.codeNoteHead(glyphName, duration);

    return {
      key,
      octave,
      line,
      intValue,
      acc: value.acc,
      code,
      displaced: false,
    };
  }

  static integerToNote(integer?: number): string {
    if (typeof integer === 'undefined' || integer < 0 || integer > 11) {
      throw new RuntimeError('BadArguments', `integerToNote() requires an integer in the range [0, 11]: ${integer}`);
    }

    const table: Record<number, string> = {
      0: 'C',
      1: 'C#',
      2: 'D',
      3: 'D#',
      4: 'E',
      5: 'F',
      6: 'F#',
      7: 'G',
      8: 'G#',
      9: 'A',
      10: 'A#',
      11: 'B',
    };

    const noteValue = table[integer];
    if (!noteValue) {
      throw new RuntimeError('BadArguments', `Unknown note value for integer: ${integer}`);
    }

    return noteValue;
  }

  static articulationCodes(artic: string): ArticulationStruct {
    return articulations[artic];
  }

  static accidentalMap = accidentals;

  static accidentalCodes(acc: string): string {
    return accidentals[acc] != undefined
      ? String.fromCharCode(accidentals[acc])
      : String.fromCharCode(parseInt(acc, 16));
  }

  static accidentalColumnsTable = accidentalColumns;

  static ornamentCodes(acc: string): number {
    return ornaments[acc];
  }

  static keySignature(spec: string): { type: string; line: number }[] {
    const keySpec = keySignatures[spec];

    if (!keySpec) {
      throw new RuntimeError('BadKeySignature', `Bad key signature spec: '${spec}'`);
    }

    if (!keySpec.acc) {
      return [];
    }

    const accidentalList: Record<string, number[]> = {
      b: [2, 0.5, 2.5, 1, 3, 1.5, 3.5],
      '#': [0, 1.5, -0.5, 1, 2.5, 0.5, 2],
    };

    const notes = accidentalList[keySpec.acc];

    const accList = [];
    for (let i = 0; i < keySpec.num; ++i) {
      const line = notes[i];
      accList.push({ type: keySpec.acc, line });
    }

    return accList;
  }

  static getKeySignatures(): Record<string, { acc?: string; num: number }> {
    return keySignatures;
  }

  static hasKeySignature(spec: string): boolean {
    return spec in keySignatures;
  }

  static unicode = {
    // ♯ accidental sharp
    sharp: String.fromCharCode(0x266f),
    // ♭ accidental flat
    flat: String.fromCharCode(0x266d),
    // ♮ accidental natural
    natural: String.fromCharCode(0x266e),
    // △ major seventh
    triangle: String.fromCharCode(0x25b3),
    // ø half-diminished
    'o-with-slash': String.fromCharCode(0x00f8),
    // ° diminished
    degrees: String.fromCharCode(0x00b0),
    // ○ diminished
    circle: String.fromCharCode(0x25cb),
  };

  /**
   * Convert duration aliases to the number based duration.
   * If the input isn't an alias, simply return the input.
   * @param duration
   * @returns Example: 'q' -> '4', '8' -> '8'
   */
  static sanitizeDuration(duration: string): string {
    const durationNumber: string = durationAliases[duration];
    if (durationNumber !== undefined) {
      duration = durationNumber;
    }
    if (durations[duration] === undefined) {
      throw new RuntimeError('BadArguments', `The provided duration is not valid: ${duration}`);
    }
    return duration;
  }

  /** Convert the `duration` to a fraction. */
  static durationToFraction(duration: string): Fraction {
    return new Fraction().parse(Tables.sanitizeDuration(duration));
  }

  /** Convert the `duration` to a number. */
  static durationToNumber(duration: string): number {
    return Tables.durationToFraction(duration).value();
  }

  /* Convert the `duration` to total ticks. */
  static durationToTicks(duration: string): number {
    duration = Tables.sanitizeDuration(duration);
    const ticks = durations[duration];
    if (ticks === undefined) {
      throw new RuntimeError('InvalidDuration');
    }
    return ticks;
  }

  static codeNoteHead(type: string, duration: string): number {
    switch (type) {
      /* Diamond */
      case 'D0':
        return 0xe0d8 /*noteheadDiamondWhole*/;
      case 'D1':
        return 0xe0d9 /*noteheadDiamondHalf*/;
      case 'D2':
        return 0xe0db /*noteheadDiamondBlack*/;
      case 'D3':
        return 0xe0db /*noteheadDiamondBlack*/;

      /* Triangle */
      case 'T0':
        return 0xe0bb /*noteheadTriangleUpWhole*/;
      case 'T1':
        return 0xe0bc /*noteheadTriangleUpHalf*/;
      case 'T2':
        return 0xe0be /*noteheadTriangleUpBlack*/;
      case 'T3':
        return 0xe0be /*noteheadTriangleUpBlack*/;

      /* Cross */
      case 'X0':
        return 0xe0a7 /*noteheadXWhole*/;
      case 'X1':
        return 0xe0a8 /*noteheadXHalf*/;
      case 'X2':
        return 0xe0a9 /*noteheadXBlack*/;
      case 'X3':
        return 0xe0b3 /*noteheadCircleX*/;

      /* Square */
      case 'S1':
        return 0xe0b8 /*noteheadSquareWhite*/;
      case 'S2':
        return 0xe0b9 /*noteheadSquareBlack*/;

      /* Rectangle */
      case 'R1':
        return 0xe0b8 /*noteheadSquareWhite*/; // no smufl code
      case 'R2':
        return 0xe0b8 /*noteheadSquareWhite*/; // no smufl code

      case 'DO':
        return 0xe0be /*noteheadTriangleUpBlack*/;
      case 'RE':
        return 0xe0cb /*noteheadMoonBlack*/;
      case 'MI':
        return 0xe0db /*noteheadDiamondBlack*/;
      case 'FA':
        return 0xe0c0 /*noteheadTriangleLeftBlack*/;
      case 'FAUP':
        return 0xe0c2 /*noteheadTriangleRightBlack*/;
      case 'SO':
        return 0xe0a4 /*noteheadBlack*/;
      case 'LA':
        return 0xe0b9 /*noteheadSquareBlack*/;
      case 'TI':
        return 0xe0cd /*noteheadTriangleRoundDownBlack*/;

      /* Diamond */
      case 'DI':
      case 'H': // Harmonics
        switch (duration) {
          case '1/2':
            return 0xe0d7 /*noteheadDiamondDoubleWhole*/;
          case '1':
            return 0xe0d8 /*noteheadDiamondWhole*/;
          case '2':
            return 0xe0d9 /*noteheadDiamondHalf*/;
          default:
            return 0xe0db /*noteheadDiamondBlack*/;
        }
      case 'X':
      case 'M': // Muted
        switch (duration) {
          case '1/2':
            return 0xe0a6 /*noteheadXDoubleWhole*/;
          case '1':
            return 0xe0a7 /*noteheadXWhole*/;
          case '2':
            return 0xe0a8 /*noteheadXHalf*/;
          default:
            return 0xe0a9 /*noteheadXBlack*/;
        }
      case 'CX':
        switch (duration) {
          case '1/2':
            return 0xe0b0 /*noteheadCircleXDoubleWhole*/;
          case '1':
            return 0xe0b1 /*noteheadCircleXWhole*/;
          case '2':
            return 0xe0b2 /*noteheadCircleXHalf*/;
          default:
            return 0xe0b3 /*noteheadCircleX*/;
        }
      case 'CI':
        switch (duration) {
          case '1/2':
            return 0xe0e7 /*noteheadCircledDoubleWhole*/;
          case '1':
            return 0xe0e6 /*noteheadCircledWhole*/;
          case '2':
            return 0xe0e5 /*noteheadCircledHalf*/;
          default:
            return 0xe0e4 /*noteheadCircledBlack*/;
        }
      case 'SQ':
        switch (duration) {
          case '1/2':
            return 0xe0a1 /*noteheadDoubleWholeSquare*/;
          case '1':
            return 0xe0b8 /*noteheadSquareWhite*/;
          case '2':
            return 0xe0b8 /*noteheadSquareWhite*/;
          default:
            return 0xe0b9 /*noteheadSquareBlack*/;
        }
      case 'TU':
        switch (duration) {
          case '1/2':
            return 0xe0ba /*noteheadTriangleUpDoubleWhole*/;
          case '1':
            return 0xe0bb /*noteheadTriangleUpWhole*/;
          case '2':
            return 0xe0bc /*noteheadTriangleUpHalf*/;
          default:
            return 0xe0be /*noteheadTriangleUpBlack*/;
        }
      case 'TD':
        switch (duration) {
          case '1/2':
            return 0xe0c3 /*noteheadTriangleDownDoubleWhole*/;
          case '1':
            return 0xe0c4 /*noteheadTriangleDownWhole*/;
          case '2':
            return 0xe0c5 /*noteheadTriangleDownHalf*/;
          default:
            return 0xe0c7 /*noteheadTriangleDownBlack*/;
        }
      case 'SF':
        switch (duration) {
          case '1/2':
            return 0xe0d5 /*noteheadSlashedDoubleWhole1*/;
          case '1':
            return 0xe0d3 /*noteheadSlashedWhole1*/;
          case '2':
            return 0xe0d1 /*noteheadSlashedHalf1*/;
          default:
            return 0xe0cf /*noteheadSlashedBlack1*/;
        }
      case 'SB':
        switch (duration) {
          case '1/2':
            return 0xe0d6 /*noteheadSlashedDoubleWhole2*/;
          case '1':
            return 0xe0d4 /*noteheadSlashedWhole2*/;
          case '2':
            return 0xe0d2 /*noteheadSlashedHalf2*/;
          default:
            return 0xe0d0 /*noteheadSlashedBlack2*/;
        }
      case 'R':
        switch (duration) {
          case '1/2':
            return 0xe4e2 /*restDoubleWhole*/;
          case '1':
            return 0xe4e3 /*restWhole*/;
          case '2':
            return 0xe4e4 /*restHalf*/;
          case '4':
            return 0xe4e5 /*restQuarter*/;
          case '8':
            return 0xe4e6 /*rest8th*/;
          case '16':
            return 0xe4e7 /*rest16th*/;
          case '32':
            return 0xe4e8 /*rest32nd*/;
          case '64':
            return 0xe4e9 /*rest64th*/;
          case '128':
            return 0xe4ea /*rest128th*/;
        }
        break;
      case 'S':
        switch (duration) {
          case '1/2':
            return 0xe10a /*noteheadSlashWhiteDoubleWhole*/;
          case '1':
            return 0xe102 /*noteheadSlashWhiteWhole*/;
          case '2':
            return 0xe103 /*noteheadSlashWhiteHalf*/;
          default:
            return 0xe100 /*noteheadSlashVerticalEnds*/;
        }
      default:
        switch (duration) {
          case '1/2':
            return 0xe0a0 /*noteheadDoubleWhole*/;
          case '1':
            return 0xe0a2 /*noteheadWhole*/;
          case '2':
            return 0xe0a3 /*noteheadHalf*/;
          default:
            return 0xe0a4 /*noteheadBlack*/;
        }
    }
    return 0x0000;
  }

  /* The list of valid note types. Used by note.ts during parseNoteStruct(). */
  static validTypes = validNoteTypes;

  // Default time signature.
  static TIME4_4 = {
    numBeats: 4,
    beatValue: 4,
    resolution: RESOLUTION,
  };
}
