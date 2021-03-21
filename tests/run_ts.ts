import MusicTests from './music_tests';
import Test from './vexflow_test_ts_helpers';

export function run(options?: any): void {
  if (options) {
    Test.RUN_CANVAS_TESTS = options.RUN_CANVAS_TESTS;
    Test.RUN_SVG_TESTS = options.RUN_SVG_TESTS;
    Test.RUN_RAPHAEL_TESTS = options.RUN_RAPHAEL_TESTS;
    Test.RUN_NODE_TESTS = options.RUN_NODE_TESTS;
    Test.NODE_IMAGEDIR = options.NODE_IMAGEDIR;
    Test.fs = options.fs;
  }
  MusicTests.Start();
}

export const Vexflow = {
  Test: {
    run,
  },
};
