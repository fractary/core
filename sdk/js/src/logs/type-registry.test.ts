/**
 * Tests for LogTypeRegistry
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { LogTypeRegistry, LogTypeDefinition } from './type-registry';

describe('LogTypeRegistry', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    // Create temp directory for tests
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fractary-log-registry-test-'));
    originalCwd = process.cwd();
  });

  afterEach(() => {
    // Restore original state
    process.chdir(originalCwd);

    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  /**
   * Helper to create a minimal log type directory
   */
  function createLogTypeDirectory(
    basePath: string,
    id: string,
    overrides?: Partial<{
      displayName: string;
      description: string;
      template: string;
      standards: string;
    }>
  ): void {
    const typeDir = path.join(basePath, id);
    fs.mkdirSync(typeDir, { recursive: true });

    const displayName = overrides?.displayName || `${id.charAt(0).toUpperCase()}${id.slice(1)} Log`;
    const description = overrides?.description || `Description for ${id}`;

    // Write type.yaml
    const typeYaml = `
id: ${id}
display_name: "${displayName}"
description: "${description}"
output_path: .fractary/logs/${id}
file_naming:
  pattern: "{date}-{id}.md"
  date_format: "YYYYMMDD"
  slug_source: id
  slug_max_length: 50
frontmatter:
  required_fields:
    - log_type
    - title
    - date
    - status
  optional_fields:
    - tags
  defaults:
    log_type: ${id}
    status: active
structure:
  required_sections:
    - Content
  optional_sections:
    - Notes
status:
  allowed_values:
    - active
    - completed
    - archived
  default: active
retention:
  default_local_days: 30
  default_cloud_days: 90
  auto_archive: true
  cleanup_after_archive: false
`;
    fs.writeFileSync(path.join(typeDir, 'type.yaml'), typeYaml);

    // Write template.md
    const template = overrides?.template || `---
log_type: {{log_type}}
title: {{title}}
date: {{date}}
status: {{status}}
---

# {{title}}

## Content

{{content}}
`;
    fs.writeFileSync(path.join(typeDir, 'template.md'), template);

    // Write standards.md
    const standards = overrides?.standards || `# ${displayName} Standards

Best practices for ${id} logs.
`;
    fs.writeFileSync(path.join(typeDir, 'standards.md'), standards);
  }

  /**
   * Helper to create a manifest file
   */
  function createManifest(basePath: string, types: Array<{ id: string; displayName: string; description: string }>): void {
    const manifest = `
version: "1.0"
base_url: https://example.com/logs
log_types:
${types.map((t) => `  - id: ${t.id}
    display_name: "${t.displayName}"
    description: "${t.description}"
    path: ./${t.id}`).join('\n')}
`;
    fs.writeFileSync(path.join(basePath, 'manifest.yaml'), manifest);
  }

  describe('constructor', () => {
    it('should warn if specified coreTypesPath has no manifest', () => {
      // Test that a non-existent coreTypesPath logs a warning
      // (it doesn't throw because loadCoreTypes catches errors)
      const nonExistentPath = path.join(tempDir, 'non-existent-types');

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const registry = new LogTypeRegistry({ coreTypesPath: nonExistentPath });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('manifest not found')
      );
      expect(registry.getCoreTypes()).toEqual([]);

      consoleSpy.mockRestore();
    });

    it('should not throw when skipCoreTypes is true', () => {
      process.chdir(tempDir);

      const registry = new LogTypeRegistry({ skipCoreTypes: true });

      expect(registry.getAllTypes()).toEqual([]);
    });

    it('should load from explicit coreTypesPath', () => {
      // Create test types directory
      const typesDir = path.join(tempDir, 'types');
      fs.mkdirSync(typesDir, { recursive: true });

      createLogTypeDirectory(typesDir, 'test-type');
      createManifest(typesDir, [
        { id: 'test-type', displayName: 'Test Type', description: 'A test type' },
      ]);

      const registry = new LogTypeRegistry({ coreTypesPath: typesDir });

      expect(registry.hasType('test-type')).toBe(true);
      expect(registry.getAllTypes().length).toBe(1);
    });

    it('should use provided baseDir for custom types', () => {
      const typesDir = path.join(tempDir, 'core-types');
      const customDir = path.join(tempDir, 'custom-types');
      fs.mkdirSync(typesDir, { recursive: true });
      fs.mkdirSync(customDir, { recursive: true });

      // Create core type
      createLogTypeDirectory(typesDir, 'core');
      createManifest(typesDir, [{ id: 'core', displayName: 'Core', description: 'Core type' }]);

      // Create custom type in custom directory
      createLogTypeDirectory(customDir, 'custom');

      const registry = new LogTypeRegistry({
        coreTypesPath: typesDir,
        baseDir: tempDir,
        customTypes: [{ id: 'custom', path: 'custom-types/custom' }],
      });

      expect(registry.hasType('core')).toBe(true);
      expect(registry.hasType('custom')).toBe(true);
    });
  });

  describe('loadCoreTypes', () => {
    it('should load all types from manifest', () => {
      const typesDir = path.join(tempDir, 'types');
      fs.mkdirSync(typesDir, { recursive: true });

      createLogTypeDirectory(typesDir, 'type-a');
      createLogTypeDirectory(typesDir, 'type-b');
      createLogTypeDirectory(typesDir, 'type-c');
      createManifest(typesDir, [
        { id: 'type-a', displayName: 'Type A', description: 'First type' },
        { id: 'type-b', displayName: 'Type B', description: 'Second type' },
        { id: 'type-c', displayName: 'Type C', description: 'Third type' },
      ]);

      const registry = new LogTypeRegistry({ coreTypesPath: typesDir });

      expect(registry.getCoreTypes().length).toBe(3);
      expect(registry.hasType('type-a')).toBe(true);
      expect(registry.hasType('type-b')).toBe(true);
      expect(registry.hasType('type-c')).toBe(true);
    });

    it('should skip types with missing directories', () => {
      const typesDir = path.join(tempDir, 'types');
      fs.mkdirSync(typesDir, { recursive: true });

      createLogTypeDirectory(typesDir, 'existing');
      // Note: 'missing' is in manifest but has no directory
      createManifest(typesDir, [
        { id: 'existing', displayName: 'Existing', description: 'Exists' },
        { id: 'missing', displayName: 'Missing', description: 'Does not exist' },
      ]);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const registry = new LogTypeRegistry({ coreTypesPath: typesDir });

      expect(registry.hasType('existing')).toBe(true);
      expect(registry.hasType('missing')).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getType', () => {
    it('should return type definition by id', () => {
      const typesDir = path.join(tempDir, 'types');
      fs.mkdirSync(typesDir, { recursive: true });

      createLogTypeDirectory(typesDir, 'session', {
        displayName: 'Session Log',
        description: 'Claude Code sessions',
      });
      createManifest(typesDir, [
        { id: 'session', displayName: 'Session Log', description: 'Claude Code sessions' },
      ]);

      const registry = new LogTypeRegistry({ coreTypesPath: typesDir });
      const logType = registry.getType('session');

      expect(logType).not.toBeNull();
      expect(logType?.id).toBe('session');
      expect(logType?.displayName).toBe('Session Log');
      expect(logType?.description).toBe('Claude Code sessions');
    });

    it('should return null for unknown type', () => {
      const typesDir = path.join(tempDir, 'types');
      fs.mkdirSync(typesDir, { recursive: true });

      createLogTypeDirectory(typesDir, 'known');
      createManifest(typesDir, [{ id: 'known', displayName: 'Known', description: 'Known type' }]);

      const registry = new LogTypeRegistry({ coreTypesPath: typesDir });

      expect(registry.getType('unknown')).toBeNull();
    });

    it('should prefer custom type over core type with same id', () => {
      const typesDir = path.join(tempDir, 'core-types');
      const customDir = path.join(tempDir, 'custom-types');
      fs.mkdirSync(typesDir, { recursive: true });
      fs.mkdirSync(customDir, { recursive: true });

      // Create core type
      createLogTypeDirectory(typesDir, 'override', {
        displayName: 'Core Override',
        description: 'Core version',
      });
      createManifest(typesDir, [
        { id: 'override', displayName: 'Core Override', description: 'Core version' },
      ]);

      // Create custom type with same id
      createLogTypeDirectory(customDir, 'override', {
        displayName: 'Custom Override',
        description: 'Custom version',
      });

      const registry = new LogTypeRegistry({
        coreTypesPath: typesDir,
        baseDir: tempDir,
        customTypes: [{ id: 'override', path: 'custom-types/override' }],
      });

      const logType = registry.getType('override');
      expect(logType?.displayName).toBe('Custom Override');
      expect(logType?.description).toBe('Custom version');
    });
  });

  describe('hasType', () => {
    it('should return true for existing core type', () => {
      const typesDir = path.join(tempDir, 'types');
      fs.mkdirSync(typesDir, { recursive: true });

      createLogTypeDirectory(typesDir, 'session');
      createManifest(typesDir, [
        { id: 'session', displayName: 'Session', description: 'Session type' },
      ]);

      const registry = new LogTypeRegistry({ coreTypesPath: typesDir });

      expect(registry.hasType('session')).toBe(true);
    });

    it('should return true for existing custom type', () => {
      const typesDir = path.join(tempDir, 'core-types');
      const customDir = path.join(tempDir, 'custom-types');
      fs.mkdirSync(typesDir, { recursive: true });
      fs.mkdirSync(customDir, { recursive: true });

      createLogTypeDirectory(typesDir, 'core');
      createManifest(typesDir, [{ id: 'core', displayName: 'Core', description: 'Core type' }]);

      createLogTypeDirectory(customDir, 'custom');

      const registry = new LogTypeRegistry({
        coreTypesPath: typesDir,
        baseDir: tempDir,
        customTypes: [{ id: 'custom', path: 'custom-types/custom' }],
      });

      expect(registry.hasType('custom')).toBe(true);
    });

    it('should return false for non-existent type', () => {
      const registry = new LogTypeRegistry({ skipCoreTypes: true });

      expect(registry.hasType('nonexistent')).toBe(false);
    });
  });

  describe('getAllTypes', () => {
    it('should return combined core and custom types sorted by id', () => {
      const typesDir = path.join(tempDir, 'core-types');
      const customDir = path.join(tempDir, 'custom-types');
      fs.mkdirSync(typesDir, { recursive: true });
      fs.mkdirSync(customDir, { recursive: true });

      createLogTypeDirectory(typesDir, 'beta');
      createLogTypeDirectory(typesDir, 'alpha');
      createManifest(typesDir, [
        { id: 'beta', displayName: 'Beta', description: 'Beta type' },
        { id: 'alpha', displayName: 'Alpha', description: 'Alpha type' },
      ]);

      createLogTypeDirectory(customDir, 'gamma');

      const registry = new LogTypeRegistry({
        coreTypesPath: typesDir,
        baseDir: tempDir,
        customTypes: [{ id: 'gamma', path: 'custom-types/gamma' }],
      });

      const types = registry.getAllTypes();

      expect(types.length).toBe(3);
      expect(types[0].id).toBe('alpha');
      expect(types[1].id).toBe('beta');
      expect(types[2].id).toBe('gamma');
    });

    it('should override core type with custom type of same id', () => {
      const typesDir = path.join(tempDir, 'core-types');
      const customDir = path.join(tempDir, 'custom-types');
      fs.mkdirSync(typesDir, { recursive: true });
      fs.mkdirSync(customDir, { recursive: true });

      createLogTypeDirectory(typesDir, 'shared', { description: 'Core description' });
      createManifest(typesDir, [
        { id: 'shared', displayName: 'Shared', description: 'Core description' },
      ]);

      createLogTypeDirectory(customDir, 'shared', { description: 'Custom description' });

      const registry = new LogTypeRegistry({
        coreTypesPath: typesDir,
        baseDir: tempDir,
        customTypes: [{ id: 'shared', path: 'custom-types/shared' }],
      });

      const types = registry.getAllTypes();

      expect(types.length).toBe(1);
      expect(types[0].description).toBe('Custom description');
    });
  });

  describe('getCoreTypes', () => {
    it('should return only core types sorted by id', () => {
      const typesDir = path.join(tempDir, 'core-types');
      const customDir = path.join(tempDir, 'custom-types');
      fs.mkdirSync(typesDir, { recursive: true });
      fs.mkdirSync(customDir, { recursive: true });

      createLogTypeDirectory(typesDir, 'core-b');
      createLogTypeDirectory(typesDir, 'core-a');
      createManifest(typesDir, [
        { id: 'core-b', displayName: 'Core B', description: 'Core B' },
        { id: 'core-a', displayName: 'Core A', description: 'Core A' },
      ]);

      createLogTypeDirectory(customDir, 'custom');

      const registry = new LogTypeRegistry({
        coreTypesPath: typesDir,
        baseDir: tempDir,
        customTypes: [{ id: 'custom', path: 'custom-types/custom' }],
      });

      const coreTypes = registry.getCoreTypes();

      expect(coreTypes.length).toBe(2);
      expect(coreTypes[0].id).toBe('core-a');
      expect(coreTypes[1].id).toBe('core-b');
    });
  });

  describe('getCustomTypes', () => {
    it('should return only custom types sorted by id', () => {
      const typesDir = path.join(tempDir, 'core-types');
      const customDir = path.join(tempDir, 'custom-types');
      fs.mkdirSync(typesDir, { recursive: true });
      fs.mkdirSync(customDir, { recursive: true });

      createLogTypeDirectory(typesDir, 'core');
      createManifest(typesDir, [{ id: 'core', displayName: 'Core', description: 'Core' }]);

      createLogTypeDirectory(customDir, 'custom-b');
      createLogTypeDirectory(customDir, 'custom-a');

      const registry = new LogTypeRegistry({
        coreTypesPath: typesDir,
        baseDir: tempDir,
        customTypes: [
          { id: 'custom-b', path: 'custom-types/custom-b' },
          { id: 'custom-a', path: 'custom-types/custom-a' },
        ],
      });

      const customTypes = registry.getCustomTypes();

      expect(customTypes.length).toBe(2);
      expect(customTypes[0].id).toBe('custom-a');
      expect(customTypes[1].id).toBe('custom-b');
    });
  });

  describe('getTypeIds', () => {
    it('should return unique sorted type ids', () => {
      const typesDir = path.join(tempDir, 'core-types');
      const customDir = path.join(tempDir, 'custom-types');
      fs.mkdirSync(typesDir, { recursive: true });
      fs.mkdirSync(customDir, { recursive: true });

      createLogTypeDirectory(typesDir, 'gamma');
      createLogTypeDirectory(typesDir, 'alpha');
      createManifest(typesDir, [
        { id: 'gamma', displayName: 'Gamma', description: 'Gamma' },
        { id: 'alpha', displayName: 'Alpha', description: 'Alpha' },
      ]);

      createLogTypeDirectory(customDir, 'beta');
      createLogTypeDirectory(customDir, 'alpha'); // Duplicate id

      const registry = new LogTypeRegistry({
        coreTypesPath: typesDir,
        baseDir: tempDir,
        customTypes: [
          { id: 'beta', path: 'custom-types/beta' },
          { id: 'alpha', path: 'custom-types/alpha' },
        ],
      });

      const ids = registry.getTypeIds();

      expect(ids).toEqual(['alpha', 'beta', 'gamma']);
    });
  });

  describe('registerType', () => {
    it('should register a custom type programmatically', () => {
      const registry = new LogTypeRegistry({ skipCoreTypes: true });

      const logType: LogTypeDefinition = {
        id: 'programmatic',
        displayName: 'Programmatic Log',
        description: 'Added via registerType',
        template: '# {{title}}',
        outputPath: '.fractary/logs/programmatic',
        fileNaming: {
          pattern: '{date}-{id}.md',
          dateFormat: 'YYYYMMDD',
        },
        frontmatter: {
          requiredFields: ['log_type', 'title'],
        },
      };

      registry.registerType(logType);

      expect(registry.hasType('programmatic')).toBe(true);
      expect(registry.getType('programmatic')?.displayName).toBe('Programmatic Log');
    });

    it('should override existing type with same id', () => {
      const registry = new LogTypeRegistry({ skipCoreTypes: true });

      const original: LogTypeDefinition = {
        id: 'test',
        displayName: 'Original',
        description: 'Original description',
        template: '',
        outputPath: '',
        fileNaming: { pattern: '' },
        frontmatter: { requiredFields: [] },
      };

      const updated: LogTypeDefinition = {
        id: 'test',
        displayName: 'Updated',
        description: 'Updated description',
        template: '',
        outputPath: '',
        fileNaming: { pattern: '' },
        frontmatter: { requiredFields: [] },
      };

      registry.registerType(original);
      registry.registerType(updated);

      expect(registry.getType('test')?.displayName).toBe('Updated');
    });
  });

  describe('unregisterType', () => {
    it('should remove a custom type', () => {
      const registry = new LogTypeRegistry({ skipCoreTypes: true });

      const logType: LogTypeDefinition = {
        id: 'removable',
        displayName: 'Removable',
        description: '',
        template: '',
        outputPath: '',
        fileNaming: { pattern: '' },
        frontmatter: { requiredFields: [] },
      };

      registry.registerType(logType);
      expect(registry.hasType('removable')).toBe(true);

      const result = registry.unregisterType('removable');

      expect(result).toBe(true);
      expect(registry.hasType('removable')).toBe(false);
    });

    it('should return false for non-existent type', () => {
      const registry = new LogTypeRegistry({ skipCoreTypes: true });

      const result = registry.unregisterType('nonexistent');

      expect(result).toBe(false);
    });

    it('should not affect core types', () => {
      const typesDir = path.join(tempDir, 'types');
      fs.mkdirSync(typesDir, { recursive: true });

      createLogTypeDirectory(typesDir, 'core-type');
      createManifest(typesDir, [
        { id: 'core-type', displayName: 'Core Type', description: 'A core type' },
      ]);

      const registry = new LogTypeRegistry({ coreTypesPath: typesDir });

      expect(registry.hasType('core-type')).toBe(true);

      // unregisterType only affects custom types
      const result = registry.unregisterType('core-type');

      expect(result).toBe(false);
      expect(registry.hasType('core-type')).toBe(true); // Still exists in core
    });
  });

  describe('loadCustomTypesFromManifest', () => {
    it('should load custom types from manifest file', () => {
      const typesDir = path.join(tempDir, 'core-types');
      const customDir = path.join(tempDir, 'custom-types');
      fs.mkdirSync(typesDir, { recursive: true });
      fs.mkdirSync(customDir, { recursive: true });

      // Create empty core types
      createManifest(typesDir, []);

      // Create custom manifest with types
      createLogTypeDirectory(customDir, 'custom-a');
      createLogTypeDirectory(customDir, 'custom-b');
      createManifest(customDir, [
        { id: 'custom-a', displayName: 'Custom A', description: 'First custom' },
        { id: 'custom-b', displayName: 'Custom B', description: 'Second custom' },
      ]);

      const registry = new LogTypeRegistry({
        coreTypesPath: typesDir,
        baseDir: tempDir,
        customManifestPath: 'custom-types/manifest.yaml',
      });

      expect(registry.hasType('custom-a')).toBe(true);
      expect(registry.hasType('custom-b')).toBe(true);
      expect(registry.getCustomTypes().length).toBe(2);
    });

    it('should not error when custom manifest does not exist', () => {
      const typesDir = path.join(tempDir, 'types');
      fs.mkdirSync(typesDir, { recursive: true });

      createManifest(typesDir, []);

      // Should not throw even if custom manifest doesn't exist
      expect(() => {
        new LogTypeRegistry({
          coreTypesPath: typesDir,
          baseDir: tempDir,
          customManifestPath: 'nonexistent/manifest.yaml',
        });
      }).not.toThrow();
    });
  });

  describe('type definition structure', () => {
    it('should load all expected fields from type.yaml', () => {
      const typesDir = path.join(tempDir, 'types');
      fs.mkdirSync(typesDir, { recursive: true });

      createLogTypeDirectory(typesDir, 'full-type');
      createManifest(typesDir, [
        { id: 'full-type', displayName: 'Full Type', description: 'Full type definition' },
      ]);

      const registry = new LogTypeRegistry({ coreTypesPath: typesDir });
      const logType = registry.getType('full-type');

      expect(logType).not.toBeNull();
      expect(logType?.fileNaming).toBeDefined();
      expect(logType?.fileNaming.pattern).toBeDefined();
      expect(logType?.frontmatter).toBeDefined();
      expect(logType?.frontmatter.requiredFields).toBeDefined();
      expect(logType?.structure).toBeDefined();
      expect(logType?.status).toBeDefined();
      expect(logType?.retention).toBeDefined();
    });

    it('should include template content', () => {
      const typesDir = path.join(tempDir, 'types');
      fs.mkdirSync(typesDir, { recursive: true });

      const customTemplate = '# Custom Template\n\n{{content}}';
      createLogTypeDirectory(typesDir, 'with-template', { template: customTemplate });
      createManifest(typesDir, [
        { id: 'with-template', displayName: 'With Template', description: 'Has template' },
      ]);

      const registry = new LogTypeRegistry({ coreTypesPath: typesDir });
      const logType = registry.getType('with-template');

      expect(logType?.template).toBe(customTemplate);
    });

    it('should include standards content', () => {
      const typesDir = path.join(tempDir, 'types');
      fs.mkdirSync(typesDir, { recursive: true });

      const customStandards = '# Standards\n\nFollow these rules.';
      createLogTypeDirectory(typesDir, 'with-standards', { standards: customStandards });
      createManifest(typesDir, [
        { id: 'with-standards', displayName: 'With Standards', description: 'Has standards' },
      ]);

      const registry = new LogTypeRegistry({ coreTypesPath: typesDir });
      const logType = registry.getType('with-standards');

      expect(logType?.standards).toBe(customStandards);
    });
  });

  describe('static methods', () => {
    it('should return core manifest URL', () => {
      const url = LogTypeRegistry.getCoreManifestUrl();

      expect(url).toContain('githubusercontent.com/fractary/core');
      expect(url).toContain('manifest.yaml');
    });

    it('should return core type URL for given id', () => {
      const url = LogTypeRegistry.getCoreTypeUrl('session');

      expect(url).toContain('githubusercontent.com/fractary/core');
      expect(url).toContain('/session');
    });
  });

  describe('edge cases', () => {
    it('should handle empty manifest', () => {
      const typesDir = path.join(tempDir, 'types');
      fs.mkdirSync(typesDir, { recursive: true });

      createManifest(typesDir, []);

      const registry = new LogTypeRegistry({ coreTypesPath: typesDir });

      expect(registry.getAllTypes()).toEqual([]);
    });

    it('should handle missing template and standards files', () => {
      const typesDir = path.join(tempDir, 'types');
      const typeDir = path.join(typesDir, 'minimal');
      fs.mkdirSync(typeDir, { recursive: true });

      // Only create type.yaml, no template.md or standards.md
      const typeYaml = `
id: minimal
display_name: "Minimal"
description: "Minimal type"
output_path: .fractary/logs/minimal
file_naming:
  pattern: "{date}.md"
frontmatter:
  required_fields:
    - log_type
`;
      fs.writeFileSync(path.join(typeDir, 'type.yaml'), typeYaml);
      createManifest(typesDir, [
        { id: 'minimal', displayName: 'Minimal', description: 'Minimal' },
      ]);

      const registry = new LogTypeRegistry({ coreTypesPath: typesDir });
      const logType = registry.getType('minimal');

      expect(logType).not.toBeNull();
      expect(logType?.template).toBe('');
      expect(logType?.standards).toBe('');
    });

    it('should warn and correct mismatched type id', () => {
      const typesDir = path.join(tempDir, 'types');
      const typeDir = path.join(typesDir, 'expected-id');
      fs.mkdirSync(typeDir, { recursive: true });

      // Type YAML has different id than directory name
      const typeYaml = `
id: different-id
display_name: "Mismatched"
description: "Id in yaml differs from manifest"
output_path: .fractary/logs/mismatched
file_naming:
  pattern: "{date}.md"
frontmatter:
  required_fields:
    - log_type
`;
      fs.writeFileSync(path.join(typeDir, 'type.yaml'), typeYaml);
      fs.writeFileSync(path.join(typeDir, 'template.md'), '');
      fs.writeFileSync(path.join(typeDir, 'standards.md'), '');

      createManifest(typesDir, [
        { id: 'expected-id', displayName: 'Expected', description: 'Expected id' },
      ]);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const registry = new LogTypeRegistry({ coreTypesPath: typesDir });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('ID mismatch'));
      expect(registry.hasType('expected-id')).toBe(true);

      consoleSpy.mockRestore();
    });
  });
});
