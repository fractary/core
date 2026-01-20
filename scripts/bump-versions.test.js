#!/usr/bin/env node

/**
 * Tests for bump-versions.js
 *
 * Usage: node scripts/bump-versions.test.js
 */

const {
  bumpPatch,
  getMajorMinor,
  checkSourceChanged,
  SOURCE_DIRS,
  NPM_VERSION_FILES,
  PLUGIN_VERSION_FILES,
} = require('./bump-versions.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL: ${name}`);
    console.log(`        ${e.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, msg = '') {
  if (actual !== expected) {
    throw new Error(`Expected "${expected}" but got "${actual}"${msg ? ': ' + msg : ''}`);
  }
}

function assertTrue(value, msg = '') {
  if (!value) {
    throw new Error(`Expected truthy value but got ${value}${msg ? ': ' + msg : ''}`);
  }
}

function assertFalse(value, msg = '') {
  if (value) {
    throw new Error(`Expected falsy value but got ${value}${msg ? ': ' + msg : ''}`);
  }
}

console.log('\nTesting bump-versions.js\n');

// Test bumpPatch
console.log('bumpPatch():');
test('increments patch version', () => {
  assertEqual(bumpPatch('1.0.0'), '1.0.1');
});
test('handles multi-digit versions', () => {
  assertEqual(bumpPatch('0.4.9'), '0.4.10');
});
test('handles large patch numbers', () => {
  assertEqual(bumpPatch('3.1.99'), '3.1.100');
});

// Test getMajorMinor
console.log('\ngetMajorMinor():');
test('extracts major.minor', () => {
  assertEqual(getMajorMinor('1.2.3'), '1.2');
});
test('handles version with prerelease', () => {
  assertEqual(getMajorMinor('0.4.0-beta'), '0.4');
});

// Test checkSourceChanged
console.log('\ncheckSourceChanged():');
test('detects SDK source changes', () => {
  const files = ['sdk/js/src/work/index.ts', 'README.md'];
  assertTrue(checkSourceChanged(files, 'sdk'));
});
test('detects CLI source changes', () => {
  const files = ['cli/src/commands/work.ts'];
  assertTrue(checkSourceChanged(files, 'cli'));
});
test('detects MCP source changes', () => {
  const files = ['mcp/server/src/server.ts'];
  assertTrue(checkSourceChanged(files, 'mcp'));
});
test('detects plugin-core source changes', () => {
  const files = ['plugins/core/agents/configurator.md'];
  assertTrue(checkSourceChanged(files, 'plugin-core'));
});
test('detects plugin-file source changes', () => {
  const files = ['plugins/file/commands/download.md'];
  assertTrue(checkSourceChanged(files, 'plugin-file'));
});
test('ignores non-source files', () => {
  const files = ['README.md', 'docs/guide.md'];
  assertFalse(checkSourceChanged(files, 'sdk'));
  assertFalse(checkSourceChanged(files, 'cli'));
});
test('ignores test files outside src', () => {
  const files = ['sdk/js/__tests__/work.test.ts'];
  assertFalse(checkSourceChanged(files, 'sdk'));
});

// Test configuration completeness
console.log('\nConfiguration completeness:');
test('all NPM packages have source dirs', () => {
  for (const pkg of Object.keys(NPM_VERSION_FILES)) {
    assertTrue(SOURCE_DIRS[pkg], `Missing SOURCE_DIRS for ${pkg}`);
  }
});
test('all plugins have source dirs', () => {
  for (const plugin of Object.keys(PLUGIN_VERSION_FILES)) {
    assertTrue(SOURCE_DIRS[plugin], `Missing SOURCE_DIRS for ${plugin}`);
  }
});
test('has all 3 NPM packages', () => {
  assertEqual(Object.keys(NPM_VERSION_FILES).length, 3);
  assertTrue(NPM_VERSION_FILES.sdk);
  assertTrue(NPM_VERSION_FILES.cli);
  assertTrue(NPM_VERSION_FILES.mcp);
});
test('has all 8 plugins', () => {
  assertEqual(Object.keys(PLUGIN_VERSION_FILES).length, 8);
  assertTrue(PLUGIN_VERSION_FILES['plugin-core']);
  assertTrue(PLUGIN_VERSION_FILES['plugin-file']);
  assertTrue(PLUGIN_VERSION_FILES['plugin-work']);
  assertTrue(PLUGIN_VERSION_FILES['plugin-spec']);
  assertTrue(PLUGIN_VERSION_FILES['plugin-logs']);
  assertTrue(PLUGIN_VERSION_FILES['plugin-repo']);
  assertTrue(PLUGIN_VERSION_FILES['plugin-docs']);
  assertTrue(PLUGIN_VERSION_FILES['plugin-status']);
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50));

process.exit(failed > 0 ? 1 : 0);
