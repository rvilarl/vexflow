(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["runner"] = factory();
	else
		root["runner"] = factory();
})(window, function() {
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./tests/run.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./tests/run.js":
/*!**********************!*\
  !*** ./tests/run.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

VF.Test.run = function () {
  VF.Test.Accidental.Start();
  VF.Test.StaveNote.Start();
  VF.Test.Voice.Start();
  VF.Test.NoteHead.Start();
  VF.Test.TabNote.Start();
  VF.Test.TickContext.Start();
  VF.Test.ModifierContext.Start();
  VF.Test.Dot.Start();
  VF.Test.Bend.Start();
  VF.Test.Formatter.Start();
  VF.Test.Fraction.Start();
  VF.Test.Clef.Start();
  VF.Test.KeySignature.Start();
  VF.Test.TimeSignature.Start();
  VF.Test.StaveTie.Start();
  VF.Test.TabTie.Start();
  VF.Test.Stave.Start();
  VF.Test.TabStave.Start();
  VF.Test.TabSlide.Start();
  VF.Test.Beam.Start();
  VF.Test.Barline.Start();
  VF.Test.AutoBeamFormatting.Start();
  VF.Test.GraceNote.Start();
  VF.Test.GraceTabNote.Start();
  VF.Test.Vibrato.Start();
  VF.Test.VibratoBracket.Start();
  VF.Test.Annotation.Start();
  VF.Test.ChordSymbol.Start();
  VF.Test.Tuning.Start();
  VF.Test.Music.Start();
  VF.Test.KeyManager.Start();
  VF.Test.Articulation.Start();
  VF.Test.StaveConnector.Start();
  VF.Test.MultiMeasureRest.Start();
  VF.Test.Percussion.Start();
  VF.Test.NoteSubGroup.Start();
  VF.Test.ClefKeySignature.Start();
  VF.Test.StaveHairpin.Start();
  VF.Test.Rhythm.Start();
  VF.Test.Tuplet.Start();
  VF.Test.BoundingBox.Start();
  VF.Test.Strokes.Start();
  VF.Test.StringNumber.Start();
  VF.Test.Rests.Start();
  VF.Test.ThreeVoices.Start();
  VF.Test.Curve.Start();
  VF.Test.TextNote.Start();
  VF.Test.StaveLine.Start();
  VF.Test.Ornament.Start();
  VF.Test.PedalMarking.Start();
  VF.Test.TextBracket.Start();
  VF.Test.StaveModifier.Start();
  VF.Test.GhostNote.Start();
  VF.Test.Style.Start();
  VF.Test.Factory.Start();
  VF.Test.Parser.Start();
  VF.Test.EasyScore.Start();
  VF.Test.Registry.Start();
  VF.Test.BachDemo.Start();
  VF.Test.GlyphNote.Start();
};

module.exports = VF.Test;


/***/ })

/******/ })["default"];
});