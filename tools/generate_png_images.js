// Run the full VexFlow test suite, grab the generated images, and
// dump them into a local directory as PNG files.
//
// This meant to be used with the visual regression test system in
// `tools/visual_regression.sh`.

const { JSDOM } = require('jsdom');
const fs = require('fs');
const { RuntimeError } = require('util');

const dom = new JSDOM(`<!DOCTYPE html><body><div id="vexflow_testoutput"></div></body>`);
global.window = dom.window;
global.document = dom.window.document;

const [scriptDir, imageDir] = process.argv.slice(2, 4);

// Optional: 3rd argument specifies which font stacks to test. Defaults to all.
// For example:
//   node generate_png_images.js SCRIPT_DIR IMAGE_OUTPUT_DIR --fonts=petaluma
//   node generate_png_images.js SCRIPT_DIR IMAGE_OUTPUT_DIR --fonts=bravura,gonville
const ALL_FONTS = ['Bravura', 'Gonville', 'Petaluma'];
let fontStacksToTest = ALL_FONTS;
if (process.argv.length >= 5) {
  const fontsOption = process.argv[4].toLowerCase();
  if (fontsOption.startsWith('--fonts=')) {
    const fontsList = fontsOption.split('=')[1].split(',');
    fontStacksToTest = fontsList.map((fontName) => fontName.charAt(0).toUpperCase() + fontName.slice(1));
  }
}

if (scriptDir.includes('reference') || scriptDir.includes('releases')) {
  // THE OLD WAY loads two JS files.
  // TODO: Remove line 32 "scriptDir.includes('reference') ||"
  //       after PR #1074 has been merged, becoming the new 'reference/'.
  // TODO: Remove this entire block lines 32-40, after the new version has been moved to 'releases/'
  global.Vex = require(`${scriptDir}/vexflow-debug.js`);
  require(`${scriptDir}/vexflow-tests.js`);
  global.Vex.Flow.shims = { fs, process };
} else {
  // THE NEW WAY loads a single JS file.
  // See: https://github.com/0xfe/vexflow/pull/1074
  // Load from the build/ folder.
  // TODO: Delete lines 32-40 above after PR #1074 has been merged and released!
  global.Vex = require(`${scriptDir}/vexflow-tests.js`);
  global.Vex.Flow.Test.shims = { fs, process };
}

// Tell VexFlow that we're outside the browser. Just run the Node tests.
const VFT = Vex.Flow.Test;
VFT.RUN_CANVAS_TESTS = false;
VFT.RUN_SVG_TESTS = false;
VFT.RUN_NODE_TESTS = true;
VFT.NODE_IMAGEDIR = imageDir;
VFT.NODE_FONT_STACKS = fontStacksToTest;

// Create the image directory if it doesn't exist.
fs.mkdirSync(VFT.NODE_IMAGEDIR, { recursive: true });

// Run all tests.
VFT.run();
