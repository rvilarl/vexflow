// Copyright (c) 2023-present VexFlow contributors: https://github.com/vexflow/vexflow/graphs/contributors
// MIT License
//
// TabSlide Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Flow } from '../src/flow';
import { Formatter } from '../src/formatter';
import { RenderContext } from '../src/rendercontext';
import { ContextBuilder } from '../src/renderer';
import { TieNotes } from '../src/stavetie';
import { TabNote, TabNoteStruct } from '../src/tabnote';
import { TabSlide } from '../src/tabslide';
import { TabStave } from '../src/tabstave';
import { Voice } from '../src/voice';

const TabSlideTests = {
  Start(): void {
    QUnit.module('TabSlide');
    const run = VexFlowTests.runTests;
    run('Simple TabSlide', simple);
    run('Slide Up', slideUp);
    run('Slide Down', slideDown);
  },
};

function tieNotes(notes: TabNote[], indices: number[], stave: TabStave, ctx: RenderContext): void {
  const voice = new Voice(Flow.TIME4_4);
  voice.addTickables(notes);

  new Formatter().joinVoices([voice]).format([voice], 100);
  voice.draw(ctx, stave);

  const tie = new TabSlide(
    {
      firstNote: notes[0],
      lastNote: notes[1],
      firstIndices: indices,
      lastIndices: indices,
    },
    TabSlide.SLIDE_UP
  );

  tie.setContext(ctx);
  tie.draw();
}

function setupContext(options: TestOptions, width?: number): { context: RenderContext; stave: TabStave } {
  // eslint-disable-next-line
  const context = options.contextBuilder!(options.elementId, 350, 140);
  context.scale(0.9, 0.9);

  context.font = '10pt Arial';
  const stave = new TabStave(10, 10, width || 350).addTabGlyph().setContext(context).draw();

  return { context, stave };
}

// Helper function to create TabNote objects.
const tabNote = (noteStruct: TabNoteStruct) => new TabNote(noteStruct);

/**
 * Test Case
 */
function simple(options: TestOptions, contextBuilder: ContextBuilder): void {
  options.contextBuilder = contextBuilder;
  const { stave, context } = setupContext(options);

  tieNotes(
    [
      tabNote({ positions: [{ str: 4, fret: 4 }], duration: 'h' }),
      tabNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' }),
    ],
    [0],
    stave,
    context
  );
  options.assert.ok(true, 'Simple Test');
}

/**
 * The slideUp and slideDown tests pass in a builder function: TabSlide.createSlideUp | TabSlide.createSlideDown.
 */
function multiTest(options: TestOptions, buildTabSlide: (notes: TieNotes) => TabSlide): void {
  const { context, stave } = setupContext(options, 440);

  const notes = [
    tabNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
    tabNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
    tabNote({
      positions: [
        { str: 4, fret: 4 },
        { str: 5, fret: 4 },
      ],
      duration: '8',
    }),
    tabNote({
      positions: [
        { str: 4, fret: 6 },
        { str: 5, fret: 6 },
      ],
      duration: '8',
    }),
    tabNote({ positions: [{ str: 2, fret: 14 }], duration: '8' }),
    tabNote({ positions: [{ str: 2, fret: 16 }], duration: '8' }),
    tabNote({
      positions: [
        { str: 2, fret: 14 },
        { str: 3, fret: 14 },
      ],
      duration: '8',
    }),
    tabNote({
      positions: [
        { str: 2, fret: 16 },
        { str: 3, fret: 16 },
      ],
      duration: '8',
    }),
  ];

  const voice = new Voice(Flow.TIME4_4).addTickables(notes);
  new Formatter().joinVoices([voice]).format([voice], 300);
  voice.draw(context, stave);

  buildTabSlide({
    firstNote: notes[0],
    lastNote: notes[1],
    firstIndices: [0],
    lastIndices: [0],
  })
    .setContext(context)
    .draw();

  options.assert.ok(true, 'Single note');

  buildTabSlide({
    firstNote: notes[2],
    lastNote: notes[3],
    firstIndices: [0, 1],
    lastIndices: [0, 1],
  })
    .setContext(context)
    .draw();

  options.assert.ok(true, 'Chord');

  buildTabSlide({
    firstNote: notes[4],
    lastNote: notes[5],
    firstIndices: [0],
    lastIndices: [0],
  })
    .setContext(context)
    .draw();

  options.assert.ok(true, 'Single note high-fret');

  buildTabSlide({
    firstNote: notes[6],
    lastNote: notes[7],
    firstIndices: [0, 1],
    lastIndices: [0, 1],
  })
    .setContext(context)
    .draw();

  options.assert.ok(true, 'Chord high-fret');
}

function slideUp(options: TestOptions, contextBuilder: ContextBuilder): void {
  options.contextBuilder = contextBuilder;
  multiTest(options, TabSlide.createSlideUp);
}

function slideDown(options: TestOptions, contextBuilder: ContextBuilder): void {
  options.contextBuilder = contextBuilder;
  multiTest(options, TabSlide.createSlideDown);
}

VexFlowTests.register(TabSlideTests);
export { TabSlideTests };
