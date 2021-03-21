/**
 * VexFlow - Music API Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */
import { KeyManager } from '../src/keymanager';
import { Music } from '../src/music';

declare let QUnit: any;
declare function ok(...args: any): any;
declare function test(...args: any): any;
declare function expect(...args: any): any;
declare function equal(...args: any): any;

class MusicTests {
  static Start(): void {
    QUnit.module('Music');
    test('Valid Keys', this.validKeys);
    test('Note Values', this.noteValue);
    test('Interval Values', this.intervalValue);
    test('Relative Notes', this.relativeNotes);
    test('Relative Note Names', this.relativeNoteNames);
    test('Canonical Notes', this.canonicalNotes);
    test('Canonical Intervals', this.canonicalNotes);
    test('Scale Tones', this.scaleTones);
    test('Scale Intervals', this.scaleIntervals);
  }

  static validNotes(): void {
    expect(10);

    let parts = Music.getNoteParts('c');
    equal(parts.root, 'c');
    equal(parts.accidental, null);

    parts = Music.getNoteParts('C');
    equal(parts.root, 'c');
    equal(parts.accidental, null);

    parts = Music.getNoteParts('c#');
    equal(parts.root, 'c');
    equal(parts.accidental, '#');

    parts = Music.getNoteParts('c##');
    equal(parts.root, 'c');
    equal(parts.accidental, '##');

    try {
      Music.getNoteParts('r');
    } catch (e) {
      equal(e.code, 'BadArguments', 'Invalid note: r');
    }

    try {
      Music.getNoteParts('');
    } catch (e) {
      equal(e.code, 'BadArguments', "Invalid note: ''");
    }
  }

  static validKeys(): void {
    expect(18);

    let parts = Music.getKeyParts('c');
    equal(parts.root, 'c');
    equal(parts.accidental, null);
    equal(parts.type, 'M');

    parts = Music.getKeyParts('d#');
    equal(parts.root, 'd');
    equal(parts.accidental, '#');
    equal(parts.type, 'M');

    parts = Music.getKeyParts('fbm');
    equal(parts.root, 'f');
    equal(parts.accidental, 'b');
    equal(parts.type, 'm');

    parts = Music.getKeyParts('c#mel');
    equal(parts.root, 'c');
    equal(parts.accidental, '#');
    equal(parts.type, 'mel');

    parts = Music.getKeyParts('g#harm');
    equal(parts.root, 'g');
    equal(parts.accidental, '#');
    equal(parts.type, 'harm');

    try {
      Music.getKeyParts('r');
    } catch (e) {
      equal(e.code, 'BadArguments', 'Invalid key: r');
    }

    try {
      Music.getKeyParts('');
    } catch (e) {
      equal(e.code, 'BadArguments', "Invalid key: ''");
    }

    try {
      Music.getKeyParts('#m');
    } catch (e) {
      equal(e.code, 'BadArguments', 'Invalid key: #m');
    }
  }

  static noteValue(): void {
    expect(3);

    let note = Music.getNoteValue('c');
    equal(note, 0);

    try {
      Music.getNoteValue('r');
    } catch (e) {
      ok(true, 'Invalid note');
    }

    note = Music.getNoteValue('f#');
    equal(note, 6);
  }

  static intervalValue(): void {
    expect(2);

    const value = Music.getIntervalValue('b2');
    equal(value, 1);

    try {
      Music.getIntervalValue('7');
    } catch (e) {
      ok(true, 'Invalid note');
    }
  }

  static relativeNotes(): void {
    expect(8);

    let value = Music.getRelativeNoteValue(Music.getNoteValue('c'), Music.getIntervalValue('b5'));
    equal(value, 6);

    try {
      Music.getRelativeNoteValue(Music.getNoteValue('bc'), Music.getIntervalValue('b2'));
    } catch (e) {
      ok(true, 'Invalid note');
    }

    try {
      Music.getRelativeNoteValue(Music.getNoteValue('b'), Music.getIntervalValue('p3'));
    } catch (e) {
      ok(true, 'Invalid interval');
    }

    // Direction
    value = Music.getRelativeNoteValue(Music.getNoteValue('d'), Music.getIntervalValue('2'), -1);
    equal(value, 0);

    try {
      Music.getRelativeNoteValue(Music.getNoteValue('b'), Music.getIntervalValue('p4'), 0);
    } catch (e) {
      ok(true, 'Invalid direction');
    }

    // Rollover
    value = Music.getRelativeNoteValue(Music.getNoteValue('b'), Music.getIntervalValue('b5'));
    equal(value, 5);

    // Reverse rollover
    value = Music.getRelativeNoteValue(Music.getNoteValue('c'), Music.getIntervalValue('b2'), -1);
    equal(value, 11);

    // Practical tests
    value = Music.getRelativeNoteValue(Music.getNoteValue('g'), Music.getIntervalValue('p5'));
    equal(value, 2);
  }

  static relativeNoteNames(): void {
    expect(9);

    equal(Music.getRelativeNoteName('c', Music.getNoteValue('c')), 'c');
    equal(Music.getRelativeNoteName('c', Music.getNoteValue('db')), 'c#');
    equal(Music.getRelativeNoteName('c#', Music.getNoteValue('db')), 'c#');
    equal(Music.getRelativeNoteName('e', Music.getNoteValue('f#')), 'e##');
    equal(Music.getRelativeNoteName('e', Music.getNoteValue('d#')), 'eb');
    equal(Music.getRelativeNoteName('e', Music.getNoteValue('fb')), 'e');

    try {
      Music.getRelativeNoteName('e', Music.getNoteValue('g#'));
    } catch (e) {
      ok(true, 'Too far');
    }

    equal(Music.getRelativeNoteName('b', Music.getNoteValue('c#')), 'b##');
    equal(Music.getRelativeNoteName('c', Music.getNoteValue('b')), 'cb');
  }

  static canonicalNotes(): void {
    expect(3);

    equal(Music.getCanonicalNoteName(0), 'c');
    equal(Music.getCanonicalNoteName(2), 'd');

    try {
      Music.getCanonicalNoteName(-1);
    } catch (e) {
      ok(true, 'Invalid note value');
    }
  }

  static canonicalIntervals(): void {
    expect(3);

    equal(Music.getCanonicalIntervalName(0), 'unison');
    equal(Music.getCanonicalIntervalName(2), 'M2');

    try {
      Music.getCanonicalIntervalName(-1);
    } catch (e) {
      ok(true, 'Invalid interval value');
    }
  }

  static scaleTones(): void {
    expect(24);

    // C Major
    const manager = new KeyManager('CM');

    const cMajor = Music.getScaleTones(Music.getNoteValue('c'), Music.scales.major);
    let values = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

    equal(cMajor.length, 7);

    for (let cm = 0; cm < cMajor.length; cm += 1) {
      equal(Music.getCanonicalNoteName(cMajor[cm]), values[cm]);
    }

    // Dorian
    const cDorian = Music.getScaleTones(Music.getNoteValue('c'), Music.scales.dorian);
    values = ['c', 'd', 'eb', 'f', 'g', 'a', 'bb'];

    let note = null;
    equal(cDorian.length, 7);
    for (let cd = 0; cd < cDorian.length; cd += 1) {
      note = Music.getCanonicalNoteName(cDorian[cd]);
      equal(manager.selectNote(note).note, values[cd]);
    }

    // Mixolydian
    const cMixolydian = Music.getScaleTones(Music.getNoteValue('c'), Music.scales.mixolydian);
    values = ['c', 'd', 'e', 'f', 'g', 'a', 'bb'];

    equal(cMixolydian.length, 7);

    for (let i = 0; i < cMixolydian.length; i += 1) {
      note = Music.getCanonicalNoteName(cMixolydian[i]);
      equal(manager.selectNote(note).note, values[i]);
    }
  }

  static scaleIntervals(): void {
    expect(6);

    equal(
      Music.getCanonicalIntervalName(Music.getIntervalBetween(Music.getNoteValue('c'), Music.getNoteValue('d'))),
      'M2'
    );
    equal(
      Music.getCanonicalIntervalName(Music.getIntervalBetween(Music.getNoteValue('g'), Music.getNoteValue('c'))),
      'p4'
    );
    equal(
      Music.getCanonicalIntervalName(Music.getIntervalBetween(Music.getNoteValue('c'), Music.getNoteValue('c'))),
      'unison'
    );
    equal(
      Music.getCanonicalIntervalName(Music.getIntervalBetween(Music.getNoteValue('f'), Music.getNoteValue('cb'))),
      'dim5'
    );

    // Forwards and backwards
    equal(
      Music.getCanonicalIntervalName(Music.getIntervalBetween(Music.getNoteValue('d'), Music.getNoteValue('c'), 1)),
      'b7'
    );
    equal(
      Music.getCanonicalIntervalName(Music.getIntervalBetween(Music.getNoteValue('d'), Music.getNoteValue('c'), -1)),
      'M2'
    );
  }
}

export default MusicTests;
