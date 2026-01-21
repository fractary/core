#!/usr/bin/env node

/**
 * Automatic Version Bump Script for Fractary Core
 *
 * This script detects which components have staged changes and automatically:
 * 1. Bumps their versions (patch increment)
 * 2. Updates dependency references (CLI/MCP -> SDK)
 *
 * Usage:
 *   node scripts/bump-versions.js           # Bump versions based on changes from main
 *   node scripts/bump-versions.js --staged  # Bump versions based on staged files (pre-commit)
 *   node scripts/bump-versions.js --check-only  # Check without modifying files
 *   node scripts/bump-versions.js --verbose # Show detailed output
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// =============================================================================
// CONFIGURATION - Customize for your project
// =============================================================================

// Version file locations for npm packages
const NPM_VERSION_FILES = {
  sdk: 'sdk/js/package.json',
  cli: 'cli/package.json',
  mcp: 'mcp/server/package.json',
};

// Version file locations for plugins
const PLUGIN_VERSION_FILES = {
  'plugin-core': 'plugins/core/.claude-plugin/plugin.json',
  'plugin-file': 'plugins/file/.claude-plugin/plugin.json',
  'plugin-work': 'plugins/work/.claude-plugin/plugin.json',
  'plugin-spec': 'plugins/spec/.claude-plugin/plugin.json',
  'plugin-logs': 'plugins/logs/.claude-plugin/plugin.json',
  'plugin-repo': 'plugins/repo/.claude-plugin/plugin.json',
  'plugin-docs': 'plugins/docs/.claude-plugin/plugin.json',
  'plugin-status': 'plugins/status/.claude-plugin/plugin.json',
};

// Source directories that trigger version bumps
const SOURCE_DIRS = {
  // NPM packages
  sdk: ['sdk/js/src/'],
  cli: ['cli/src/'],
  mcp: ['mcp/server/src/'],
  // Plugins (agents, commands, skills, config files)
  'plugin-core': ['plugins/core/agents/', 'plugins/core/commands/', 'plugins/core/skills/', 'plugins/core/config/'],
  'plugin-file': ['plugins/file/agents/', 'plugins/file/commands/', 'plugins/file/skills/', 'plugins/file/config/'],
  'plugin-work': ['plugins/work/agents/', 'plugins/work/commands/', 'plugins/work/skills/', 'plugins/work/config/'],
  'plugin-spec': ['plugins/spec/agents/', 'plugins/spec/commands/', 'plugins/spec/skills/', 'plugins/spec/config/'],
  'plugin-logs': ['plugins/logs/agents/', 'plugins/logs/commands/', 'plugins/logs/skills/', 'plugins/logs/config/'],
  'plugin-repo': ['plugins/repo/agents/', 'plugins/repo/commands/', 'plugins/repo/skills/', 'plugins/repo/config/'],
  'plugin-docs': ['plugins/docs/agents/', 'plugins/docs/commands/', 'plugins/docs/skills/', 'plugins/docs/config/'],
  'plugin-status': ['plugins/status/agents/', 'plugins/status/commands/', 'plugins/status/skills/', 'plugins/status/config/'],
};

// Dependencies to update when SDK version changes
const SDK_DEPENDENTS = ['cli', 'mcp'];

// SDK package name as it appears in dependencies
const SDK_PACKAGE_NAME = '@fractary/core';

// =============================================================================
// COMMAND LINE ARGUMENTS
// =============================================================================

const checkOnly = process.argv.includes('--check-only');
const stagedOnly = process.argv.includes('--staged');
const verbose = process.argv.includes('--verbose');

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function log(msg) {
  if (verbose || !checkOnly) console.log(msg);
}

function verboseLog(msg) {
  if (verbose) console.log(`  [verbose] ${msg}`);
}

function getChangedFiles() {
  if (stagedOnly) {
    try {
      const result = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
      return result.trim().split('\n').filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  // Try to get changes from main branch
  try {
    const result = execSync('git diff --name-only origin/main...HEAD', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return result.trim().split('\n').filter(Boolean);
  } catch (e) {
    // Fallback: try diff from last commit
    try {
      const result = execSync('git diff --name-only HEAD~1', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      return result.trim().split('\n').filter(Boolean);
    } catch (e2) {
      // Final fallback: try staged files
      try {
        return execSync('git diff --cached --name-only', { encoding: 'utf-8' })
          .trim().split('\n').filter(Boolean);
      } catch (e3) {
        return [];
      }
    }
  }
}

function readJson(filePath) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  } catch (e) {
    throw new Error(`Failed to parse JSON in ${filePath}: ${e.message}`);
  }
}

function writeJson(filePath, data) {
  const fullPath = path.resolve(filePath);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n');
}

function bumpPatch(version) {
  const parts = version.split('.');
  if (parts.length < 3) {
    throw new Error(`Invalid version format: ${version}`);
  }
  parts[2] = String(parseInt(parts[2], 10) + 1);
  return parts.join('.');
}

function getMajorMinor(version) {
  return version.split('.').slice(0, 2).join('.');
}

function checkSourceChanged(changedFiles, component) {
  const dirs = SOURCE_DIRS[component];
  if (!dirs) return false;
  return changedFiles.some(file => dirs.some(dir => file.startsWith(dir)));
}

function checkVersionBumped(changedFiles, component) {
  const versionFile = NPM_VERSION_FILES[component] || PLUGIN_VERSION_FILES[component];
  if (!versionFile) return false;
  return changedFiles.includes(versionFile);
}

function getVersionFile(component) {
  return NPM_VERSION_FILES[component] || PLUGIN_VERSION_FILES[component];
}

function getVersion(component) {
  const versionFile = getVersionFile(component);
  if (!versionFile) return null;
  try {
    const data = readJson(versionFile);
    return data.version;
  } catch (e) {
    return null;
  }
}

// =============================================================================
// MAIN LOGIC
// =============================================================================

function main() {
  const changedFiles = getChangedFiles();

  if (changedFiles.length === 0) {
    log('No changed files detected');
    process.exit(0);
  }

  verboseLog(`Changed files (${changedFiles.length}): ${changedFiles.join(', ')}`);

  const updates = [];
  const errors = [];
  const skipped = [];
  let sdkBumped = false;
  let newSdkVersion = null;

  // Check NPM packages first (process SDK first to get new version)
  const npmComponents = Object.entries(NPM_VERSION_FILES);
  // Sort to ensure 'sdk' is processed first
  npmComponents.sort(([a], [b]) => (a === 'sdk' ? -1 : b === 'sdk' ? 1 : 0));

  for (const [component, versionFile] of npmComponents) {
    const sourceChanged = checkSourceChanged(changedFiles, component);
    const versionBumped = checkVersionBumped(changedFiles, component);

    verboseLog(`${component}: sourceChanged=${sourceChanged}, versionBumped=${versionBumped}`);

    if (sourceChanged && !versionBumped) {
      const pkg = readJson(versionFile);
      const oldVersion = pkg.version;
      const newVersion = bumpPatch(oldVersion);

      if (checkOnly) {
        errors.push(`${component.toUpperCase()}: source changed but version not bumped (${oldVersion})`);
      } else {
        pkg.version = newVersion;
        writeJson(versionFile, pkg);
        updates.push(`${component.toUpperCase()}: ${oldVersion} -> ${newVersion}`);

        if (component === 'sdk') {
          sdkBumped = true;
          newSdkVersion = newVersion;
        }
      }
    } else if (sourceChanged && versionBumped) {
      // Version was already bumped manually, check if it's SDK
      if (component === 'sdk') {
        const pkg = readJson(versionFile);
        newSdkVersion = pkg.version;
        sdkBumped = true;
      }
    }
  }

  // Check plugins
  for (const [component, versionFile] of Object.entries(PLUGIN_VERSION_FILES)) {
    const sourceChanged = checkSourceChanged(changedFiles, component);
    const versionBumped = checkVersionBumped(changedFiles, component);

    verboseLog(`${component}: sourceChanged=${sourceChanged}, versionBumped=${versionBumped}`);

    if (sourceChanged && !versionBumped) {
      try {
        const pluginData = readJson(versionFile);
        const oldVersion = pluginData.version;
        const newVersion = bumpPatch(oldVersion);

        if (checkOnly) {
          errors.push(`${component}: source changed but version not bumped (${oldVersion})`);
        } else {
          pluginData.version = newVersion;
          writeJson(versionFile, pluginData);
          updates.push(`${component}: ${oldVersion} -> ${newVersion}`);
        }
      } catch (e) {
        // Collect skipped components for reporting
        skipped.push(`${component}: ${e.message}`);
      }
    }
  }

  // Update SDK dependencies in CLI and MCP if SDK was bumped
  // Re-read package.json to avoid race condition with version bumps
  if (sdkBumped && newSdkVersion && !checkOnly) {
    for (const dependent of SDK_DEPENDENTS) {
      const versionFile = NPM_VERSION_FILES[dependent];
      if (!versionFile) continue;

      try {
        // Re-read to get latest state (may have been modified by version bump above)
        const pkg = readJson(versionFile);
        const currentDep = pkg.dependencies?.[SDK_PACKAGE_NAME];

        if (currentDep) {
          // Preserve the version prefix (^, ~, etc.)
          const prefix = currentDep.match(/^[^\d]*/)?.[0] || '^';
          const newDep = `${prefix}${newSdkVersion}`;

          if (currentDep !== newDep) {
            pkg.dependencies[SDK_PACKAGE_NAME] = newDep;
            writeJson(versionFile, pkg);
            updates.push(`${dependent.toUpperCase()}: ${SDK_PACKAGE_NAME} dependency ${currentDep} -> ${newDep}`);
          }
        }
      } catch (e) {
        skipped.push(`${dependent} dependency update: ${e.message}`);
      }
    }
  }

  // Output results
  if (checkOnly) {
    if (errors.length > 0) {
      console.log('Version issues found:');
      errors.forEach(e => console.log(`  - ${e}`));
      console.log('\nRun: node scripts/bump-versions.js');
      process.exit(1);
    } else {
      console.log('All versions are properly aligned');
      process.exit(0);
    }
  } else {
    if (updates.length > 0) {
      console.log('Updated versions:');
      updates.forEach(u => console.log(`  ${u}`));
    } else {
      log('No version updates needed');
    }

    // Always report skipped components (not just in verbose mode)
    if (skipped.length > 0) {
      console.log('Warning - skipped components:');
      skipped.forEach(s => console.log(`  - ${s}`));
    }
  }
}

// =============================================================================
// EXPORTS FOR TESTING
// =============================================================================

module.exports = {
  bumpPatch,
  getMajorMinor,
  checkSourceChanged,
  checkVersionBumped,
  getVersionFile,
  readJson,
  SOURCE_DIRS,
  NPM_VERSION_FILES,
  PLUGIN_VERSION_FILES,
};

// =============================================================================
// RUN
// =============================================================================

// Only run if this is the main module
if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}
