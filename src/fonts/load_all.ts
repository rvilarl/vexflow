// Copyright (c) 2023-present VexFlow contributors: https://github.com/vexflow/vexflow/graphs/contributors
// MIT License
//
// vexflow.js statically bundles & preloads all of our music engraving fonts.

import { loadBravura } from './load_bravura';
import { loadCustom } from './load_custom';
import { loadGonville } from './load_gonville';
import { loadLeland } from './load_leland';
import { loadPetaluma } from './load_petaluma';
// ADD_MUSIC_FONT
// import { loadXXX } from './loadXxx';

// Populate our font "database" with all our music fonts.
export function loadAllMusicFonts(): void {
  loadBravura();
  loadGonville();
  loadPetaluma();
  loadCustom();
  loadLeland();
  // ADD_MUSIC_FONT
  // loadXXX();
}
