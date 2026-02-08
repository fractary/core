/**
 * Tests for config/schema.ts
 *
 * Tests Zod validation schemas and validateConfig function.
 */

import {
  validateConfig,
  CoreYamlConfigSchema,
  WorkConfigSchema,
  RepoConfigSchema,
  LogsConfigSchema,
  FileConfigSchema,
  SpecConfigSchema,
  DocsConfigSchema,
  CodexConfigSchema,
} from './schema';
import { getDefaultConfig, getMinimalConfig } from './defaults';

describe('validateConfig', () => {
  describe('valid configurations', () => {
    it('validates a full default config', () => {
      const config = getDefaultConfig({ owner: 'test', repo: 'test' });
      const result = validateConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.config).toBeDefined();
    });

    it('validates a minimal config', () => {
      const config = getMinimalConfig({ owner: 'test', repo: 'test' });
      const result = validateConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates config with all platforms', () => {
      const platforms = ['github', 'jira', 'linear'] as const;

      for (const platform of platforms) {
        const config = getDefaultConfig({ workPlatform: platform });
        const result = validateConfig(config);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });

    it('validates config with S3 file handler', () => {
      const config = getDefaultConfig({
        fileHandler: 's3',
        s3Bucket: 'test-bucket',
        awsRegion: 'us-west-2',
      });
      const result = validateConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('invalid configurations', () => {
    it('rejects null config', () => {
      const result = validateConfig(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Configuration is null or undefined');
    });

    it('rejects undefined config', () => {
      const result = validateConfig(undefined);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Configuration is null or undefined');
    });

    it('rejects non-object config', () => {
      const result = validateConfig('not an object');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Configuration must be an object');
    });

    it('rejects config with wrong version', () => {
      const config = { version: '1.0' };
      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('version'))).toBe(true);
    });

    it('rejects config without version', () => {
      const config = {};
      const result = validateConfig(config);

      expect(result.valid).toBe(false);
    });

    it('rejects work config without active_handler', () => {
      const config = {
        version: '2.0',
        work: {
          handlers: { github: {} },
        },
      };
      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('active_handler'))).toBe(true);
    });

    it('rejects work config without handlers', () => {
      const config = {
        version: '2.0',
        work: {
          active_handler: 'github',
        },
      };
      const result = validateConfig(config);

      expect(result.valid).toBe(false);
    });

    it('rejects work config with empty handlers', () => {
      const config = {
        version: '2.0',
        work: {
          active_handler: 'github',
          handlers: {},
        },
      };
      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('handler'))).toBe(true);
    });
  });

  describe('warnings', () => {
    it('warns when no plugin sections are present', () => {
      const config = { version: '2.0' };
      const result = validateConfig(config);

      expect(result.warnings).toContain('No plugin sections found in configuration');
    });

    it('warns when active handler not in handlers', () => {
      const config = {
        version: '2.0',
        work: {
          active_handler: 'jira',
          handlers: {
            github: { owner: 'test', repo: 'test' },
          },
        },
      };
      const result = validateConfig(config);

      expect(result.warnings.some((w) => w.includes('jira'))).toBe(true);
    });

    it('warns when repo active handler not in handlers', () => {
      const config = {
        version: '2.0',
        repo: {
          active_handler: 'gitlab',
          handlers: {
            github: { token: 'test' },
          },
        },
      };
      const result = validateConfig(config);

      expect(result.warnings.some((w) => w.includes('gitlab'))).toBe(true);
    });

    it('returns empty warnings for valid config', () => {
      const config = getDefaultConfig();
      const result = validateConfig(config);

      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('return structure', () => {
    it('returns ValidationResult with all required fields', () => {
      const config = getDefaultConfig();
      const result = validateConfig(config);

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('includes parsed config when valid', () => {
      const config = getDefaultConfig();
      const result = validateConfig(config);

      expect(result.config).toBeDefined();
      expect(result.config?.version).toBe('2.0');
    });

    it('does not include config when invalid', () => {
      const result = validateConfig(null);

      expect(result.config).toBeUndefined();
    });
  });
});

describe('CoreYamlConfigSchema', () => {
  it('parses valid config', () => {
    const config = getDefaultConfig();
    const result = CoreYamlConfigSchema.safeParse(config);

    expect(result.success).toBe(true);
  });

  it('requires version field', () => {
    const result = CoreYamlConfigSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('validates version is 2.0', () => {
    const result = CoreYamlConfigSchema.safeParse({ version: '1.0' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.message.includes('2.0'))).toBe(true);
    }
  });

  it('allows optional plugin sections', () => {
    const result = CoreYamlConfigSchema.safeParse({ version: '2.0' });

    expect(result.success).toBe(true);
  });
});

describe('WorkConfigSchema', () => {
  it('validates valid work config', () => {
    const workConfig = {
      active_handler: 'github',
      handlers: {
        github: { owner: 'test', repo: 'test' },
      },
    };
    const result = WorkConfigSchema.safeParse(workConfig);

    expect(result.success).toBe(true);
  });

  it('requires active_handler', () => {
    const workConfig = {
      handlers: { github: {} },
    };
    const result = WorkConfigSchema.safeParse(workConfig);

    expect(result.success).toBe(false);
  });

  it('requires handlers object', () => {
    const workConfig = {
      active_handler: 'github',
    };
    const result = WorkConfigSchema.safeParse(workConfig);

    expect(result.success).toBe(false);
  });

  it('requires at least one handler', () => {
    const workConfig = {
      active_handler: 'github',
      handlers: {},
    };
    const result = WorkConfigSchema.safeParse(workConfig);

    expect(result.success).toBe(false);
  });

  it('allows optional defaults', () => {
    const workConfig = {
      active_handler: 'github',
      handlers: { github: {} },
      defaults: { auto_assign: true },
    };
    const result = WorkConfigSchema.safeParse(workConfig);

    expect(result.success).toBe(true);
  });
});

describe('RepoConfigSchema', () => {
  it('validates valid repo config', () => {
    const repoConfig = {
      active_handler: 'github',
      handlers: {
        github: { token: '${GITHUB_TOKEN}' },
      },
    };
    const result = RepoConfigSchema.safeParse(repoConfig);

    expect(result.success).toBe(true);
  });

  it('requires active_handler', () => {
    const repoConfig = {
      handlers: { github: {} },
    };
    const result = RepoConfigSchema.safeParse(repoConfig);

    expect(result.success).toBe(false);
  });

  it('validates defaults structure', () => {
    const repoConfig = {
      active_handler: 'github',
      handlers: { github: {} },
      defaults: {
        default_branch: 'main',
        protected_branches: ['main', 'develop'],
        pr: {
          template: 'standard',
          merge: {
            strategy: 'squash',
            delete_branch: true,
          },
        },
      },
    };
    const result = RepoConfigSchema.safeParse(repoConfig);

    expect(result.success).toBe(true);
  });

  it('validates PR merge strategy enum', () => {
    const repoConfig = {
      active_handler: 'github',
      handlers: { github: {} },
      defaults: {
        pr: {
          merge: {
            strategy: 'invalid-strategy',
          },
        },
      },
    };
    const result = RepoConfigSchema.safeParse(repoConfig);

    expect(result.success).toBe(false);
  });
});

describe('LogsConfigSchema', () => {
  it('validates valid logs config', () => {
    const logsConfig = {
      schema_version: '2.0',
    };
    const result = LogsConfigSchema.safeParse(logsConfig);

    expect(result.success).toBe(true);
  });

  it('requires schema_version', () => {
    const logsConfig = {};
    const result = LogsConfigSchema.safeParse(logsConfig);

    expect(result.success).toBe(false);
  });

  it('allows optional fields', () => {
    const logsConfig = {
      schema_version: '2.0',
      custom_templates_path: '.fractary/logs/templates/manifest.yaml',
      storage: {
        file_handlers: [
          { name: 'default', write: 'logs-write', archive: 'logs-archive' },
        ],
      },
      retention: { default: { local_days: 30 } },
      session_logging: { enabled: true },
    };
    const result = LogsConfigSchema.safeParse(logsConfig);

    expect(result.success).toBe(true);
  });
});

describe('FileConfigSchema', () => {
  it('validates valid file config with sources', () => {
    const fileConfig = {
      schema_version: '2.0',
      sources: {
        specs: {
          type: 'local',
          local: { base_path: '.fractary/specs' },
        },
      },
    };
    const result = FileConfigSchema.safeParse(fileConfig);

    expect(result.success).toBe(true);
  });

  it('validates S3 source config', () => {
    const fileConfig = {
      schema_version: '2.0',
      sources: {
        specs: {
          type: 's3',
          bucket: 'my-bucket',
          prefix: 'specs/',
          region: 'us-east-1',
          local: { base_path: '.fractary/specs' },
          push: { compress: true, keep_local: true },
          auth: { profile: 'default' },
        },
      },
    };
    const result = FileConfigSchema.safeParse(fileConfig);

    expect(result.success).toBe(true);
  });

  it('requires schema_version', () => {
    const fileConfig = {
      sources: {},
    };
    const result = FileConfigSchema.safeParse(fileConfig);

    expect(result.success).toBe(false);
  });

  it('requires local.base_path in sources', () => {
    const fileConfig = {
      schema_version: '2.0',
      sources: {
        specs: {
          type: 'local',
          local: {},
        },
      },
    };
    const result = FileConfigSchema.safeParse(fileConfig);

    expect(result.success).toBe(false);
  });
});

describe('SpecConfigSchema', () => {
  it('validates valid spec config', () => {
    const specConfig = {
      schema_version: '1.0',
    };
    const result = SpecConfigSchema.safeParse(specConfig);

    expect(result.success).toBe(true);
  });

  it('requires schema_version', () => {
    const specConfig = {};
    const result = SpecConfigSchema.safeParse(specConfig);

    expect(result.success).toBe(false);
  });

  it('allows optional fields', () => {
    const specConfig = {
      schema_version: '1.0',
      storage: {
        file_handlers: [
          { name: 'default', write: 'specs-write', archive: 'specs-archive' },
        ],
      },
      naming: { issue_specs: { prefix: 'WORK' } },
      archive: { strategy: 'lifecycle' },
    };
    const result = SpecConfigSchema.safeParse(specConfig);

    expect(result.success).toBe(true);
  });
});

describe('DocsConfigSchema', () => {
  it('validates valid docs config', () => {
    const docsConfig = {
      schema_version: '1.1',
    };
    const result = DocsConfigSchema.safeParse(docsConfig);

    expect(result.success).toBe(true);
  });

  it('requires schema_version', () => {
    const docsConfig = {};
    const result = DocsConfigSchema.safeParse(docsConfig);

    expect(result.success).toBe(false);
  });

  it('allows custom_templates_path', () => {
    const docsConfig = {
      schema_version: '1.1',
      custom_templates_path: '.fractary/docs/templates/manifest.yaml',
    };
    const result = DocsConfigSchema.safeParse(docsConfig);

    expect(result.success).toBe(true);
  });
});

describe('CodexConfigSchema', () => {
  it('validates valid codex config', () => {
    const codexConfig = {
      schema_version: '1.0',
      organization: 'myorg',
      project: 'myproject',
    };
    const result = CodexConfigSchema.safeParse(codexConfig);

    expect(result.success).toBe(true);
  });

  it('requires organization', () => {
    const codexConfig = {
      schema_version: '1.0',
      project: 'myproject',
    };
    const result = CodexConfigSchema.safeParse(codexConfig);

    expect(result.success).toBe(false);
  });

  it('requires project', () => {
    const codexConfig = {
      schema_version: '1.0',
      organization: 'myorg',
    };
    const result = CodexConfigSchema.safeParse(codexConfig);

    expect(result.success).toBe(false);
  });

  it('allows optional dependencies', () => {
    const codexConfig = {
      schema_version: '1.0',
      organization: 'myorg',
      project: 'myproject',
      dependencies: { core: '^1.0.0' },
    };
    const result = CodexConfigSchema.safeParse(codexConfig);

    expect(result.success).toBe(true);
  });
});

describe('error messages', () => {
  it('provides path in error messages', () => {
    const config = {
      version: '2.0',
      work: {
        active_handler: '',
        handlers: { github: {} },
      },
    };
    const result = validateConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('work.active_handler'))).toBe(true);
  });

  it('provides descriptive error for version mismatch', () => {
    const config = { version: '3.0' };
    const result = validateConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('2.0'))).toBe(true);
  });

  it('lists multiple errors when present', () => {
    const config = {
      version: '1.0',
      work: {
        handlers: {},
      },
    };
    const result = validateConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
