import { VexFlowTests } from './vexflow_test_helpers.js';
import { Barline } from '../src/stavebarline.js';
import { Tremolo } from '../src/tremolo.js';
const TremoloTests = {
    Start() {
        QUnit.module('Tremolo');
        const run = VexFlowTests.runTests;
        run('Tremolo - Basic', tremoloBasic);
    },
};
function tremoloBasic(options) {
    const f = VexFlowTests.makeFactory(options, 600, 200);
    const score = f.EasyScore();
    const stave1 = f.Stave({ width: 250 }).setEndBarType(Barline.type.DOUBLE);
    const notes1 = score.notes('e4/4, e4, e4, e4', { stem: 'up' });
    notes1[0].addModifier(new Tremolo(3), 0);
    notes1[1].addModifier(new Tremolo(2), 0);
    notes1[2].addModifier(new Tremolo(1), 0);
    const voice1 = score.voice(notes1);
    f.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);
    const stave2 = f
        .Stave({ x: stave1.getWidth() + stave1.getX(), y: stave1.getY(), width: 300 })
        .setEndBarType(Barline.type.DOUBLE);
    const notes2 = score.notes('e5/4, e5, e5, e5', { stem: 'down' });
    notes2[1].addModifier(new Tremolo(1), 0);
    notes2[2].addModifier(new Tremolo(2), 0);
    notes2[3].addModifier(new Tremolo(3), 0);
    const voice2 = score.voice(notes2);
    f.Formatter().joinVoices([voice2]).formatToStave([voice2], stave2);
    f.draw();
    options.assert.ok(true, 'Tremolo - Basic');
}
VexFlowTests.register(TremoloTests);
export { TremoloTests };
