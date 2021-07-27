// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests } from './vexflow_test_helpers';
import { QUnit } from './declarations';
import { Registry } from 'registry';

/**
 * GlyphNote Tests
 */
const GlyphNoteTests = (function () {
  const run = VexFlowTests.runTests;

  var GlyphNote = {
    Start: function () {
      QUnit.module('GlyphNote');
      run('GlyphNote with ChordSymbols', GlyphNote.chordChanges, { debug: false, noPadding: false });
      run('GlyphNote Positioning', GlyphNote.basic, { debug: false, noPadding: false });
      run('GlyphNote No Stave Padding', GlyphNote.basic, { debug: true, noPadding: true });
      run('GlyphNote RepeatNote', GlyphNote.repeatNote, { debug: false, noPadding: true });
    },
    chordChanges: function (options) {
      Registry.enableDefaultRegistry(new VF.Registry());

      const vf = VF.Test.makeFactory(options, 300, 200);
      const system = vf.System({
        x: 50,
        width: 250,
        debugFormatter: options.params.debug,
        noPadding: options.params.noPadding,
        options: { alpha: options.params.alpha },
      });

      const score = vf.EasyScore();

      const notes = [
        vf.GlyphNote(new VF.Glyph('repeatBarSlash', 40), { duration: 'q' }),
        vf.GlyphNote(new VF.Glyph('repeatBarSlash', 40), { duration: 'q' }),
        vf.GlyphNote(new VF.Glyph('repeatBarSlash', 40), { duration: 'q' }),
        vf.GlyphNote(new VF.Glyph('repeatBarSlash', 40), { duration: 'q' }),
      ];
      const chord1 = vf
        .ChordSymbol({ reportWidth: false })
        .addText('F7')
        .setHorizontal('left')
        .addGlyphOrText('(#11b9)', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT });
      const chord2 = vf
        .ChordSymbol()
        .addText('F7')
        .setHorizontal('left')
        .addGlyphOrText('#11', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUPERSCRIPT })
        .addGlyphOrText('b9', { symbolModifier: VF.ChordSymbol.symbolModifiers.SUBSCRIPT });

      notes[0].addModifier(chord1, 0);
      notes[2].addModifier(chord2, 0);
      const voice = score.voice(notes);
      system.addStave({ voices: [voice], debugNoteMetrics: options.params.debug });
      system.addConnector().setType(VF.StaveConnector.type.BRACKET);
      vf.draw();
      VF.Registry.disableDefaultRegistry();
      ok(true);
    },
    basic: function (options) {
      VF.Registry.enableDefaultRegistry(new VF.Registry());

      const vf = VF.Test.makeFactory(options, 300, 400);
      const system = vf.System({
        x: 50,
        width: 250,
        debugFormatter: options.params.debug,
        noPadding: options.params.noPadding,
        options: { alpha: options.params.alpha },
      });

      const score = vf.EasyScore();

      const newVoice = function (notes) {
        return score.voice(notes, { time: '1/4' });
      };

      const newStave = function (voice) {
        return system.addStave({ voices: [voice], debugNoteMetrics: options.params.debug });
      };

      const voices = [
        [vf.GlyphNote(new VF.Glyph('repeat1Bar', 40), { duration: 'q' }, { line: 4 })],
        [vf.GlyphNote(new VF.Glyph('repeat2Bars', 40), { duration: 'q', align_center: true })],
        [
          vf.GlyphNote(new VF.Glyph('repeatBarSlash', 40), { duration: '16' }),
          vf.GlyphNote(new VF.Glyph('repeatBarSlash', 40), { duration: '16' }),
          vf.GlyphNote(new VF.Glyph('repeat4Bars', 40), { duration: '16' }),
          vf.GlyphNote(new VF.Glyph('repeatBarSlash', 40), { duration: '16' }),
        ],
      ];

      voices.map(newVoice).forEach(newStave);
      system.addConnector().setType(VF.StaveConnector.type.BRACKET);

      vf.draw();

      VF.Registry.disableDefaultRegistry();
      ok(true);
    },

    repeatNote: function (options) {
      VF.Registry.enableDefaultRegistry(new VF.Registry());

      const vf = VF.Test.makeFactory(options, 300, 500);
      const system = vf.System({
        x: 50,
        width: 250,
        debugFormatter: options.params.debug,
        noPadding: options.params.noPadding,
        options: { alpha: options.params.alpha },
      });

      const score = vf.EasyScore();

      const newVoice = function (notes) {
        return score.voice(notes, { time: '1/4' });
      };

      const newStave = function (voice) {
        return system.addStave({ voices: [voice], debugNoteMetrics: options.params.debug });
      };

      const voices = [
        [vf.RepeatNote('1')],
        [vf.RepeatNote('2')],
        [vf.RepeatNote('4')],
        [
          vf.RepeatNote('slash', { duration: '16' }),
          vf.RepeatNote('slash', { duration: '16' }),
          vf.RepeatNote('slash', { duration: '16' }),
          vf.RepeatNote('slash', { duration: '16' }),
        ],
      ];

      voices.map(newVoice).forEach(newStave);
      system.addConnector().setType(VF.StaveConnector.type.BRACKET);

      vf.draw();

      VF.Registry.disableDefaultRegistry();
      ok(true);
    },
  };

  return GlyphNote;
})();

export { GlyphNoteTests };
