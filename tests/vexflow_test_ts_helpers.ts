/**
 * VexFlow Test Support Library
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

/* eslint max-classes-per-file: "off" */
// import { IStaveOptions } from '../src/types/stave';
import { Factory } from '../src/factory';
import { Renderer } from '../src/renderer';
import { Note } from '../src/note';
import { Flow } from '../src/tables';

declare let QUnit: any;
declare function $(...args: any): any;

const VF: any = Flow;

const Test = {
  ID: 0,
  testRootSelector: '#vexflow_testoutput',
  // Test Options.
  RUN_CANVAS_TESTS: true,
  RUN_SVG_TESTS: true,
  RUN_RAPHAEL_TESTS: false,
  RUN_NODE_TESTS: false,

  // Where images are stored for NodeJS tests.
  NODE_IMAGEDIR: 'images',

  // Default font properties for tests.
  Font: { size: 10 },
  fs: {},

  // Returns a unique ID for a test.
  genID(prefix: any) {
    const id = prefix + Test.ID;
    Test.ID += 1;
    return id;
  },

  genTitle(type: any, assert: any, name: any) {
    return `${assert.test.module.name} (${type}): ${name}`;
  },

  // Run `func` inside a QUnit test for each of the enabled
  // rendering backends.
  runTests(name: any, func: any, params?: any) {
    if (Test.RUN_CANVAS_TESTS) {
      Test.runCanvasTest(name, func, params);
    }
    if (Test.RUN_SVG_TESTS) {
      Test.runSVGTest(name, func, params);
    }
    if (Test.RUN_RAPHAEL_TESTS) {
      Test.runRaphaelTest(name, func, params);
    }
    if (Test.RUN_NODE_TESTS) {
      Test.runNodeTest(name, func, params);
    }
  },

  // Run `func` inside a QUnit test for each of the enabled
  // rendering backends. These are for interactivity tests, and
  // currently only work with the SVG backend.
  runUITests(name: any, func: any, params: any) {
    if (Test.RUN_SVG_TESTS) {
      Test.runSVGTest(name, func, params);
    }
  },

  createTestCanvas(testId: any, testName: any) {
    const testContainer = $('<div></div>').addClass('testcanvas');

    testContainer.append($('<div></div>').addClass('name').text(testName));

    testContainer.append(
      $('<canvas></canvas>').addClass('vex-tabdiv').attr('id', testId).addClass('name').text(testName)
    );

    $(Test.testRootSelector).append(testContainer);
  },

  createTestSVG(testId: any, testName: any) {
    const testContainer = $('<div></div>').addClass('testcanvas');

    testContainer.append($('<div></div>').addClass('name').text(testName));

    testContainer.append($('<div></div>').addClass('vex-tabdiv').attr('id', testId));

    $(Test.testRootSelector).append(testContainer);
  },

  resizeCanvas(elementId: any, width: any, height: any) {
    $(`#${elementId}`).width(width);
    $(`#${elementId}`).attr('width', width);
    $(`#${elementId}`).attr('height', height);
  },

  makeFactory(options: any, width?: number, height?: number) {
    return new Factory({
      renderer: {
        elementId: options.elementId,
        backend: options.backend,
        width: width || 450,
        height: height || 140,
      },
    });
  },

  runCanvasTest(name: any, func: any, params: any) {
    QUnit.test(name, (assert: any) => {
      const elementId = Test.genID('canvas_');
      const title = Test.genTitle('Canvas', assert, name);

      Test.createTestCanvas(elementId, title);

      const testOptions = {
        backend: Renderer.Backends.CANVAS,
        elementId,
        params,
        assert,
      };

      func(testOptions, Renderer.getCanvasContext);
    });
  },

  runRaphaelTest(name: any, func: any, params: any) {
    QUnit.test(name, (assert: any) => {
      const elementId = Test.genID('raphael_');
      const title = Test.genTitle('Raphael', assert, name);

      Test.createTestSVG(elementId, title);

      const testOptions = {
        elementId,
        backend: VF.Renderer.Backends.RAPHAEL,
        params,
        assert,
      };

      func(testOptions, VF.Renderer.getRaphaelContext);
    });
  },

  runSVGTest(name: any, func: any, params?: any) {
    if (!Test.RUN_SVG_TESTS) return;

    const fontStacks: any = {
      Bravura: [VF.Fonts.Bravura, VF.Fonts.Gonville, VF.Fonts.Custom],
      Gonville: [VF.Fonts.Gonville, VF.Fonts.Bravura, VF.Fonts.Custom],
      Petaluma: [VF.Fonts.Petaluma, VF.Fonts.Gonville, VF.Fonts.Custom],
    };

    const testFunc = (fontName: string) => (assert: any) => {
      const defaultFontStack = VF.DEFAULT_FONT_STACK;
      VF.DEFAULT_FONT_STACK = fontStacks[fontName];
      const elementId = Test.genID(`svg_${fontName}`);
      const title = Test.genTitle(`SVG ${fontName}`, assert, name);

      Test.createTestSVG(elementId, title);

      const testOptions = {
        elementId,
        backend: VF.Renderer.Backends.SVG,
        params,
        assert,
      };

      func(testOptions, VF.Renderer.getSVGContext);
      VF.DEFAULT_FONT_STACK = defaultFontStack;
    };

    QUnit.test(name, testFunc('Bravura'));
    QUnit.test(name, testFunc('Gonville'));
    QUnit.test(name, testFunc('Petaluma'));
  },

  runNodeTest(name: any, func: any, params: any) {
    // Allows `name` to be used inside file names.
    // function sanitizeName(name: any) {
    //  return name.replace(/[^a-zA-Z0-9]/g, '_');
    // }

    QUnit.test(name, (assert: any) => {
      const elementId = Test.genID('nodecanvas_');
      const canvas = document.createElement('canvas');
      canvas.setAttribute('id', elementId);
      document.body.appendChild(canvas);

      const testOptions = {
        elementId,
        backend: VF.Renderer.Backends.CANVAS,
        params,
        assert,
      };

      func(testOptions, VF.Renderer.getCanvasContext);

      if (VF.Renderer.lastContext !== null) {
        // var moduleName = sanitizeName(QUnit.current_module);
        // var testName = sanitizeName(QUnit.current_test);
        // const fileName = `${Test.NODE_IMAGEDIR}/${moduleName}.${testName}.png`;
        // const imageData = canvas.toDataURL().split(';base64,').pop();
        // const image = Buffer.from(imageData, 'base64');
        // Test.fs.writeFileSync(fileName, image, { encoding: 'base64' });
      }
    });
  },

  plotNoteWidth: Note.plotMetrics,
  plotLegendForNoteWidth(ctx: any, x: any, y: any) {
    ctx.save();
    ctx.setFont('Arial', 8, '');

    const spacing = 12;
    let lastY = y;

    function legend(color: any, text: any) {
      ctx.beginPath();
      ctx.setStrokeStyle(color);
      ctx.setFillStyle(color);
      ctx.setLineWidth(10);
      ctx.moveTo(x, lastY - 4);
      ctx.lineTo(x + 10, lastY - 4);
      ctx.stroke();

      ctx.setFillStyle('black');
      ctx.fillText(text, x + 15, lastY);
      lastY += spacing;
    }

    legend('green', 'Note + Flag');
    legend('red', 'Modifiers');
    legend('#999', 'Displaced Head');
    legend('#DDD', 'Formatter Shift');

    ctx.restore();
  },
};

export default Test;
