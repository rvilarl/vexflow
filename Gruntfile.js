/* global module, __dirname, process, require */
const path = require('path');
const glob = require("glob");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = (grunt) => {
  const BANNER = [
    '/**!',
    ' * VexFlow <%= pkg.version %> built on <%= grunt.template.today("yyyy-mm-dd") %>.',
    ' * Copyright (c) 2010 Mohit Muthanna Cheppudira <mohit@muthanna.com>',
    ' *',
    ' * http://www.vexflow.com  http://github.com/0xfe/vexflow',
    ' */',
  ].join('\n');
  const BASE_DIR = __dirname;
  const BUILD_DIR = path.join(BASE_DIR, 'build');
  const RELEASE_DIR = path.join(BASE_DIR, 'releases');
  const MODULE_ENTRY = path.join(BASE_DIR, 'src/index.js');
  const TARGET_RAW = 'vexflow-debug.js';
  const TARGET_MIN = 'vexflow-min.js';

  // Used for eslint and docco
  const SOURCES = ['./src/*.ts', './src/*.js', '!./src/header.js'];

  // Take all test files in 'tests/' and build TARGET_TESTS
  const TARGET_TESTS = 'vexflow-tests.js';
  const TEST_SOURCES = ['./tests/vexflow_test_helpers.js', './tests/mocks.js', './tests/*_tests.js', './tests/*_tests.ts', './tests/index.ts'];

  function webpackConfig(target, moduleEntry, mode, libraryName, compilationTarget) {
    return {
      mode: mode,
      entry: moduleEntry,
      target: compilationTarget,
      output: {
        path: BUILD_DIR,
        filename: target,
        library: libraryName,
        libraryTarget: 'umd',
        libraryExport: 'default',
      },
      resolve: {
        extensions: ['.ts', '.js', '.json'],
        plugins: [
          new TsconfigPathsPlugin({/* options: see below */ })
        ]
      },
      devtool: process.env.VEX_GENMAP || mode === 'production' ? 'source-map' : false,
      module: {
        rules: [
          {
            test: /(\.ts?$|\.js?$)/,
            exclude: /node_modules/,
            loader: 'ts-loader',
          },
        ],
      },
    };
  }
//TEST_SOURCES.flatMap(file => glob.sync(file))
  const webpackProd = webpackConfig(TARGET_MIN, MODULE_ENTRY, 'production', 'Vex');
  const webpackDev = webpackConfig(TARGET_RAW, MODULE_ENTRY, 'development', 'Vex');
  const webpackVFNode = webpackConfig(
    'vexflow-tests-[name].js',
    { 'helpers-node': './tests/vexflow_test_helpers.js' },
    'development',
    'VF',
    'node'
  );
  const webpackTest = webpackConfig(
    'vexflow-tests-[name].js',
    {
      'helpers': './tests/vexflow_test_helpers.js',
      'all': TEST_SOURCES.flatMap(file => glob.sync(file)),
      'runner': './tests/run.js'
    },
    'development',
    '[name]'
  );

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        banner: BANNER,
        sourceMap: true,
      },
      tests: {
        src: TEST_SOURCES,
        dest: TARGET_TESTS,
      },
    },
    webpack: {
      build: webpackProd,
      buildDev: webpackDev,
      buildTest: webpackTest,
      buildNode: webpackVFNode,
      watch: {
        ...webpackDev,
        watch: true,
        keepalive: true,
        failOnError: false,
      },
    },
    eslint: {
      target: SOURCES.concat('./tests'),
      options: { fix: true },
    },
    qunit: {
      files: ['tests/flow.html'],
    },
    watch: {
      tests: {
        files: ['tests/*', 'src/*'],
        tasks: ['concat:tests'],
        options: {
          interrupt: true,
        },
      },
    },
    copy: {
      release: {
        files: [
          {
            expand: true,
            dest: RELEASE_DIR,
            cwd: BUILD_DIR,
            src: ['*.js', 'docs/**', '*.map'],
          },
        ],
      },
    },
    docco: {
      src: SOURCES,
      options: {
        layout: 'linear',
        output: 'build/docs',
      },
    },
    gitcommit: {
      releases: {
        options: {
          message: 'Committing release binaries for new version: <%= pkg.version %>',
          verbose: true,
        },
        files: [
          {
            src: [`${RELEASE_DIR}/*.js`, `${RELEASE_DIR}/*.map`],
            expand: true,
          },
        ],
      },
    },
    bump: {
      options: {
        files: ['package.json', 'component.json'],
        commitFiles: ['package.json', 'component.json'],
        updateConfigs: ['pkg'],
        createTag: false,
        push: false,
      },
    },
    release: {
      options: {
        bump: false,
        commit: false,
        npm: false, // Run npm publish by hand
      },
    },
    clean: [BUILD_DIR],
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-docco');
  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-webpack');

  // Default task(s).
  grunt.registerTask('default', ['clean', 'eslint', 'webpack:buildDev', 'webpack:buildTest', 'webpack:buildNode', 'docco']);
  grunt.registerTask('test', 'Run qunit tests.', ['clean', 'webpack:buildDev', 'webpack:buildTest', 'webpack:buildNode', 'qunit']);

  // Release current build.
  grunt.registerTask('stage', 'Stage current bundles to releases/.', () => {
    grunt.task.run('default');
    grunt.task.run('qunit');
    grunt.task.run('copy:release');
  });

  grunt.registerTask('alldone', 'Publish VexFlow NPM.', () => {
    grunt.log.ok('NOT YET DONE: Run `npm publish` now to publish NPM.');
  });

  // Increment package version generate releases
  grunt.registerTask('publish', 'Generate releases.', ['bump', 'stage', 'gitcommit:releases', 'release', 'alldone']);
};
