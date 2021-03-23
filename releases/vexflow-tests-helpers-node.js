(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["VF"] = factory();
	else
		root["VF"] = factory();
})(global, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./tests/vexflow_test_helpers.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./tests/vexflow_test_helpers.js":
/*!***************************************!*\
  !*** ./tests/vexflow_test_helpers.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * VexFlow Test Support Library
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

/* eslint-disable global-require */

/* eslint max-classes-per-file: "off" */

// Mock out the QUnit stuff for generating svg images,
// since we don't really care about the assertions.
if (!window.QUnit) {
  window.QUnit = {};
  QUnit = window.QUnit;

  QUnit.assertions = {
    ok: () => true,
    equal: () => true,
    deepEqual: () => true,
    expect: () => true,
    throws: () => true,
    notOk: () => true,
    notEqual: () => true,
    notDeepEqual: () => true,
    strictEqual: () => true,
    notStrictEqual: () => true,
  };

  QUnit.module = (name) => {
    QUnit.current_module = name;
  };

  /* eslint-disable */
  QUnit.test = (name, func) => {
    QUnit.current_test = name;
    process.stdout.write(' \u001B[0G' + QUnit.current_module + ' :: ' + name + '\u001B[0K');
    func(QUnit.assertions);
  };

  test = QUnit.test;
  ok = QUnit.assertions.ok;
  equal = QUnit.assertions.equal;
  deepEqual = QUnit.assertions.deepEqual;
  expect = QUnit.assertions.expect;
  throws = QUnit.assertions.throws;
  notOk = QUnit.assertions.notOk;
  notEqual = QUnit.assertions.notEqual;
  notDeepEqual = QUnit.assertions.notDeepEqual;
  strictEqual = QUnit.assertions.strictEqual;
  notStrictEqual = QUnit.assertions.notStrictEqual;
}

global['VF'] = Vex.Flow;
VF.Test = (function () {
  var Test = {
    // Test Options.
    RUN_CANVAS_TESTS: true,
    RUN_SVG_TESTS: true,
    RUN_RAPHAEL_TESTS: false,
    RUN_NODE_TESTS: false,

    // Where images are stored for NodeJS tests.
    NODE_IMAGEDIR: 'images',

    // Default font properties for tests.
    Font: { size: 10 },

    // Returns a unique ID for a test.
    genID: function (prefix) {
      return prefix + VF.Test.genID.ID++;
    },

    genTitle: function (type, assert, name) {
      return assert.test.module.name + ' (' + type + '): ' + name;
    },

    // Run `func` inside a QUnit test for each of the enabled
    // rendering backends.
    runTests: function (name, func, params) {
      if (VF.Test.RUN_CANVAS_TESTS) {
        VF.Test.runCanvasTest(name, func, params);
      }
      if (VF.Test.RUN_SVG_TESTS) {
        VF.Test.runSVGTest(name, func, params);
      }
      if (VF.Test.RUN_RAPHAEL_TESTS) {
        VF.Test.runRaphaelTest(name, func, params);
      }
      if (VF.Test.RUN_NODE_TESTS) {
        VF.Test.runNodeTest(name, func, params);
      }
    },

    // Run `func` inside a QUnit test for each of the enabled
    // rendering backends. These are for interactivity tests, and
    // currently only work with the SVG backend.
    runUITests: function (name, func, params) {
      if (VF.Test.RUN_SVG_TESTS) {
        VF.Test.runSVGTest(name, func, params);
      }
    },

    createTestCanvas: function (testId, testName) {
      var testContainer = $('<div></div>').addClass('testcanvas');

      testContainer.append($('<div></div>').addClass('name').text(testName));

      testContainer.append(
        $('<canvas></canvas>').addClass('vex-tabdiv').attr('id', testId).addClass('name').text(name)
      );

      $(VF.Test.testRootSelector).append(testContainer);
    },

    createTestSVG: function (testId, testName) {
      var testContainer = $('<div></div>').addClass('testcanvas');

      testContainer.append($('<div></div>').addClass('name').text(testName));

      testContainer.append($('<div></div>').addClass('vex-tabdiv').attr('id', testId));

      $(VF.Test.testRootSelector).append(testContainer);
    },

    resizeCanvas: function (elementId, width, height) {
      $('#' + elementId).width(width);
      $('#' + elementId).attr('width', width);
      $('#' + elementId).attr('height', height);
    },

    makeFactory: function (options, width, height) {
      return new VF.Factory({
        renderer: {
          elementId: options.elementId,
          backend: options.backend,
          width: width || 450,
          height: height || 140,
        },
      });
    },

    runCanvasTest: function (name, func, params) {
      QUnit.test(name, function (assert) {
        var elementId = VF.Test.genID('canvas_');
        var title = VF.Test.genTitle('Canvas', assert, name);

        VF.Test.createTestCanvas(elementId, title);

        var testOptions = {
          backend: VF.Renderer.Backends.CANVAS,
          elementId: elementId,
          params: params,
          assert: assert,
        };

        func(testOptions, VF.Renderer.getCanvasContext);
      });
    },

    runRaphaelTest: function (name, func, params) {
      QUnit.test(name, function (assert) {
        var elementId = VF.Test.genID('raphael_');
        var title = VF.Test.genTitle('Raphael', assert, name);

        VF.Test.createTestSVG(elementId, title);

        var testOptions = {
          elementId: elementId,
          backend: VF.Renderer.Backends.RAPHAEL,
          params: params,
          assert: assert,
        };

        func(testOptions, VF.Renderer.getRaphaelContext);
      });
    },

    runSVGTest: function (name, func, params) {
      if (!VF.Test.RUN_SVG_TESTS) return;

      const fontStacks = {
        Bravura: [VF.Fonts.Bravura, VF.Fonts.Gonville, VF.Fonts.Custom],
        Gonville: [VF.Fonts.Gonville, VF.Fonts.Bravura, VF.Fonts.Custom],
        Petaluma: [VF.Fonts.Petaluma, VF.Fonts.Gonville, VF.Fonts.Custom],
      };

      const testFunc = (fontName) => (assert) => {
        const defaultFontStack = VF.DEFAULT_FONT_STACK;
        VF.DEFAULT_FONT_STACK = fontStacks[fontName];
        var elementId = VF.Test.genID('svg_' + fontName);
        var title = VF.Test.genTitle('SVG ' + fontName, assert, name);

        VF.Test.createTestSVG(elementId, title);

        var testOptions = {
          elementId: elementId,
          backend: VF.Renderer.Backends.SVG,
          params: params,
          assert: assert,
        };

        func(testOptions, VF.Renderer.getSVGContext);
        VF.DEFAULT_FONT_STACK = defaultFontStack;
      };

      QUnit.test(name, testFunc('Bravura'));
      QUnit.test(name, testFunc('Gonville'));
      QUnit.test(name, testFunc('Petaluma'));
    },

    runNodeTest: function (name, func, params) {
      var fs = VF._fs;

      // Allows `name` to be used inside file names.
      function sanitizeName(name) {
        return name.replace(/[^a-zA-Z0-9]/g, '_');
      }

      QUnit.test(name, function (assert) {
        var elementId = VF.Test.genID('nodecanvas_');
        var canvas = document.createElement('canvas');
        canvas.setAttribute('id', elementId);
        document.body.appendChild(canvas);

        var testOptions = {
          elementId: elementId,
          backend: VF.Renderer.Backends.CANVAS,
          params: params,
          assert: assert,
        };

        func(testOptions, VF.Renderer.getCanvasContext);

        if (VF.Renderer.lastContext !== null) {
          var moduleName = sanitizeName(QUnit.current_module);
          var testName = sanitizeName(QUnit.current_test);
          var fileName = `${VF.Test.NODE_IMAGEDIR}/${moduleName}.${testName}.png`;

          var imageData = canvas.toDataURL().split(';base64,').pop();
          var image = Buffer.from(imageData, 'base64');

          fs.writeFileSync(fileName, image, { encoding: 'base64' });
        }
      });
    },

    plotNoteWidth: VF.Note.plotMetrics,
    plotLegendForNoteWidth: function (ctx, x, y) {
      ctx.save();
      ctx.setFont('Arial', 8, '');

      var spacing = 12;
      var lastY = y;

      function legend(color, text) {
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

    almostEqual: function (value, expectedValue, errorMargin) {
      return equal(Math.abs(value - expectedValue) < errorMargin, true);
    },
  };

  Test.genID.ID = 0;
  Test.testRootSelector = '#vexflow_testoutput';

  return Test;
})();


/***/ })

/******/ })["default"];
});