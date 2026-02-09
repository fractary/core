/**
 * Document operations for documentation management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getDocsManager, getDocTypeRegistry, getFileManagerForSource } from '../../sdk/factory';
import { handleError } from '../../utils/errors';

export function createDocCreateCommand(): Command {
  return new Command('doc-create')
    .description('Create a new document')
    .argument('<id>', 'Document ID')
    .requiredOption('--title <title>', 'Document title')
    .requiredOption('--content <text>', 'Document content')
    .option('--format <format>', 'Document format (markdown, html, pdf, text)', 'markdown')
    .option('--doc-type <type>', 'Document type (adr, api, architecture, etc.)')
    .option('--tags <tags>', 'Comma-separated tags')
    .option('--category <category>', 'Document category')
    .option('--description <desc>', 'Document description')
    .option('--status <status>', 'Document status')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const docsManager = await getDocsManager();

        const metadata: any = {
          title: options.title,
          description: options.description,
          category: options.category,
          tags: options.tags?.split(',').map((t: string) => t.trim()),
        };

        // Add doc type if specified
        if (options.docType) {
          metadata.docType = options.docType;

          // Get doc type defaults from registry
          const registry = await getDocTypeRegistry();
          const docType = registry.getType(options.docType);
          if (docType) {
            // Apply default status if not specified
            if (!options.status && docType.status?.default) {
              metadata.status = docType.status.default;
            }
            // Apply frontmatter defaults
            if (docType.frontmatter.defaults) {
              for (const [key, value] of Object.entries(docType.frontmatter.defaults)) {
                if (metadata[key] === undefined) {
                  metadata[key] = value;
                }
              }
            }
          }
        }

        // Apply explicit status if specified
        if (options.status) {
          metadata.status = options.status;
        }

        const doc = await docsManager.createDoc(id, options.content, metadata, options.format);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: doc }, null, 2));
        } else {
          console.log(chalk.green(`✓ Created document: ${doc.id}`));
          console.log(chalk.gray(`  Title: ${doc.metadata.title}`));
          console.log(chalk.gray(`  Format: ${doc.format}`));
          if (doc.metadata.docType) {
            console.log(chalk.gray(`  Type: ${doc.metadata.docType}`));
          }
          console.log(chalk.gray(`  Path: ${doc.path}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createDocGetCommand(): Command {
  return new Command('doc-get')
    .description('Get a document')
    .argument('<id>', 'Document ID')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const docsManager = await getDocsManager();
        const doc = await docsManager.getDoc(id);

        if (!doc) {
          if (options.json) {
            console.error(
              JSON.stringify(
                {
                  status: 'error',
                  error: { code: 'DOC_NOT_FOUND', message: `Document not found: ${id}` },
                },
                null,
                2
              )
            );
          } else {
            console.error(chalk.red(`Document not found: ${id}`));
          }
          process.exit(3);
        }

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: doc }, null, 2));
        } else {
          console.log(chalk.bold(doc.metadata.title));
          console.log(chalk.gray(`ID: ${doc.id}`));
          console.log(chalk.gray(`Format: ${doc.format}`));
          if (doc.metadata.category) {
            console.log(chalk.gray(`Category: ${doc.metadata.category}`));
          }
          if (doc.metadata.tags && doc.metadata.tags.length > 0) {
            console.log(chalk.gray(`Tags: ${doc.metadata.tags.join(', ')}`));
          }
          console.log('\n' + doc.content);
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createDocListCommand(): Command {
  return new Command('doc-list')
    .description('List documents')
    .option('--category <category>', 'Filter by category')
    .option('--tags <tags>', 'Filter by tags (comma-separated)')
    .option('--format <format>', 'Filter by format')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const docsManager = await getDocsManager();
        let docs = await docsManager.listDocs();

        // Apply filters
        if (options.category) {
          docs = docs.filter((doc: any) => doc.metadata.category === options.category);
        }

        if (options.tags) {
          const filterTags = options.tags.split(',').map((t: string) => t.trim());
          docs = docs.filter((doc: any) =>
            filterTags.some((tag: string) => doc.metadata.tags?.includes(tag))
          );
        }

        if (options.format) {
          docs = docs.filter((doc: any) => doc.format === options.format);
        }

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: docs }, null, 2));
        } else {
          if (docs.length === 0) {
            console.log(chalk.yellow('No documents found'));
          } else {
            docs.forEach((doc: any) => {
              console.log(`${doc.id}: ${doc.metadata.title} [${doc.format}]`);
              if (doc.metadata.category) {
                console.log(chalk.gray(`  Category: ${doc.metadata.category}`));
              }
            });
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createDocUpdateCommand(): Command {
  return new Command('doc-update')
    .description('Update a document')
    .argument('<id>', 'Document ID')
    .requiredOption('--content <text>', 'New content')
    .option('--title <title>', 'New title')
    .option('--tags <tags>', 'New tags (comma-separated)')
    .option('--category <category>', 'New category')
    .option('--description <desc>', 'New description')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const docsManager = await getDocsManager();

        const metadata: any = {};
        if (options.title) metadata.title = options.title;
        if (options.description) metadata.description = options.description;
        if (options.category) metadata.category = options.category;
        if (options.tags) metadata.tags = options.tags.split(',').map((t: string) => t.trim());

        const doc = await docsManager.updateDoc(id, options.content, metadata);

        if (!doc) {
          if (options.json) {
            console.error(
              JSON.stringify(
                {
                  status: 'error',
                  error: { code: 'DOC_NOT_FOUND', message: `Document not found: ${id}` },
                },
                null,
                2
              )
            );
          } else {
            console.error(chalk.red(`Document not found: ${id}`));
          }
          process.exit(3);
        }

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: doc }, null, 2));
        } else {
          console.log(chalk.green(`✓ Updated document: ${doc.id}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createDocDeleteCommand(): Command {
  return new Command('doc-delete')
    .description('Delete a document')
    .argument('<id>', 'Document ID')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const docsManager = await getDocsManager();
        const deleted = await docsManager.deleteDoc(id);

        if (!deleted) {
          if (options.json) {
            console.error(
              JSON.stringify(
                {
                  status: 'error',
                  error: { code: 'DOC_NOT_FOUND', message: `Document not found: ${id}` },
                },
                null,
                2
              )
            );
          } else {
            console.error(chalk.red(`Document not found: ${id}`));
          }
          process.exit(3);
        }

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: { id } }, null, 2));
        } else {
          console.log(chalk.green(`✓ Deleted document: ${id}`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createDocSearchCommand(): Command {
  return new Command('doc-search')
    .description('Search documents')
    .option('--text <query>', 'Search text in content and title')
    .option('--tags <tags>', 'Filter by tags (comma-separated)')
    .option('--author <author>', 'Filter by author')
    .option('--category <category>', 'Filter by category')
    .option('--doc-type <type>', 'Filter by document type')
    .option('--limit <n>', 'Limit results', '10')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const docsManager = await getDocsManager();

        const query: any = {
          text: options.text,
          tags: options.tags?.split(',').map((t: string) => t.trim()),
          author: options.author,
          docType: options.docType,
          limit: options.limit ? parseInt(options.limit, 10) : undefined,
        };

        let docs = await docsManager.searchDocs(query);

        // Additional category filter if provided
        if (options.category) {
          docs = docs.filter((doc: any) => doc.metadata.category === options.category);
        }

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: docs }, null, 2));
        } else {
          if (docs.length === 0) {
            console.log(chalk.yellow('No documents found'));
          } else {
            docs.forEach((doc: any) => {
              const typeLabel = doc.metadata.docType ? ` [${doc.metadata.docType}]` : '';
              console.log(`${doc.id}: ${doc.metadata.title}${typeLabel} [${doc.format}]`);
              if (doc.metadata.description) {
                console.log(chalk.gray(`  ${doc.metadata.description}`));
              }
            });
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createDocArchiveCommand(): Command {
  return new Command('doc-archive')
    .description('Archive a document using its type\'s configured archive source')
    .argument('<id>', 'Document ID')
    .option('--source <name>', 'Override archive source (default: from type config)')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const docsManager = await getDocsManager();
        const doc = await docsManager.getDoc(id);

        if (!doc) {
          if (options.json) {
            console.error(JSON.stringify({ status: 'error', error: { code: 'DOC_NOT_FOUND', message: `Document not found: ${id}` } }, null, 2));
          } else {
            console.error(chalk.red(`Document not found: ${id}`));
          }
          process.exit(3);
        }

        // Load type config for archive settings
        const registry = await getDocTypeRegistry();
        const docType = doc.metadata.docType ? registry.getType(doc.metadata.docType as string) : null;
        const archiveConfig = docType?.archive;

        if (!archiveConfig?.enabled && !options.source) {
          const msg = `Document type '${doc.metadata.docType || 'unknown'}' does not have archival enabled. Use --source to specify an archive source.`;
          if (options.json) {
            console.error(JSON.stringify({ status: 'error', error: { code: 'ARCHIVE_NOT_ENABLED', message: msg } }, null, 2));
          } else {
            console.error(chalk.red(msg));
          }
          process.exit(1);
        }

        const sourceName = options.source || archiveConfig!.source;
        const verifyChecksum = archiveConfig?.verifyChecksum ?? true;
        const deleteOriginal = archiveConfig?.deleteOriginal ?? false;

        // Resolve logical source name (e.g. "archive") through docs.storage.file_handlers mapping
        let resolvedSource = sourceName;
        try {
          const { loadDocsConfig } = await import('@fractary/core/common/config');
          const docsConfig = loadDocsConfig();
          const handlerEntry = docsConfig?.storage?.file_handlers?.find(
            (h: any) => h.name === 'default'
          ) || docsConfig?.storage?.file_handlers?.[0];
          if (handlerEntry?.[sourceName]) {
            resolvedSource = handlerEntry[sourceName];
          }
        } catch {
          // Fall back to using sourceName directly if docs config unavailable
        }

        // Get file manager for the archive source
        const fileManager = await getFileManagerForSource(resolvedSource);

        // Read source content
        const content = doc.content;
        const archivePath = `archive/${doc.metadata.docType || 'docs'}/${new Date().getFullYear()}/${id}.md`;

        // Compute checksum
        const crypto = await import('crypto');
        const checksum = crypto.createHash('sha256').update(content).digest('hex');

        // Write to archive
        await fileManager.write(archivePath, content);

        // Verify if configured
        if (verifyChecksum) {
          const archived = await fileManager.read(archivePath);
          if (!archived) {
            throw new Error('Archive verification failed: file not readable after write');
          }
          const archivedChecksum = crypto.createHash('sha256').update(archived).digest('hex');
          if (checksum !== archivedChecksum) {
            throw new Error(`Archive checksum mismatch: expected ${checksum}, got ${archivedChecksum}`);
          }
        }

        // Delete original if configured
        if (deleteOriginal) {
          await docsManager.deleteDoc(id);
        }

        const result = {
          success: true,
          sourcePath: doc.path || id,
          archivePath,
          checksum,
          originalDeleted: deleteOriginal,
        };

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: result }, null, 2));
        } else {
          console.log(chalk.green(`✓ Archived document: ${id}`));
          console.log(chalk.gray(`  Archive path: ${archivePath}`));
          console.log(chalk.gray(`  Checksum: ${checksum}`));
          console.log(chalk.gray(`  Source: ${resolvedSource}`));
          if (deleteOriginal) {
            console.log(chalk.gray(`  Original deleted: yes`));
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createDocRefineScanCommand(): Command {
  return new Command('doc-refine-scan')
    .description('Scan a document for gaps and generate refinement questions')
    .argument('<id>', 'Document ID')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const docsManager = await getDocsManager();
        const doc = await docsManager.getDoc(id);

        if (!doc) {
          if (options.json) {
            console.error(JSON.stringify({ status: 'error', error: { code: 'DOC_NOT_FOUND', message: `Document not found: ${id}` } }, null, 2));
          } else {
            console.error(chalk.red(`Document not found: ${id}`));
          }
          process.exit(3);
        }

        // Load type for structure info
        const registry = await getDocTypeRegistry();
        const docType = doc.metadata.docType ? registry.getType(doc.metadata.docType as string) : null;

        const questions: Array<{ id: string; question: string; category: string; priority: string; section?: string }> = [];
        const categories = new Set<string>();
        let qIndex = 0;

        // Check for missing required sections
        if (docType?.structure?.requiredSections) {
          for (const section of docType.structure.requiredSections) {
            const sectionRegex = new RegExp(`^##\\s+${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm');
            if (!sectionRegex.test(doc.content)) {
              qIndex++;
              categories.add('missing_section');
              questions.push({
                id: `Q${qIndex}`,
                question: `Required section "${section}" is missing. What content should it contain?`,
                category: 'missing_section',
                priority: 'high',
                section,
              });
            }
          }
        }

        // Check for placeholder/vague content
        const vagueMarkers = ['TBD', 'TODO', 'FIXME', 'as needed', 'to be determined', '<!-- '];
        const lines = doc.content.split('\n');
        let currentSection = '';
        for (const line of lines) {
          if (line.startsWith('## ')) {
            currentSection = line.replace('## ', '').trim();
          }
          for (const marker of vagueMarkers) {
            if (line.includes(marker)) {
              qIndex++;
              categories.add('vague_content');
              questions.push({
                id: `Q${qIndex}`,
                question: `Section "${currentSection}" contains placeholder text ("${marker}"). What specific content should replace it?`,
                category: 'vague_content',
                priority: 'medium',
                section: currentSection,
              });
              break;
            }
          }
        }

        // Check for empty sections
        const sectionRegex = /^## (.+)$/gm;
        let match;
        const sectionPositions: Array<{ name: string; start: number }> = [];
        while ((match = sectionRegex.exec(doc.content)) !== null) {
          sectionPositions.push({ name: match[1].trim(), start: match.index + match[0].length });
        }
        for (let i = 0; i < sectionPositions.length; i++) {
          const start = sectionPositions[i].start;
          const end = i + 1 < sectionPositions.length ? sectionPositions[i + 1].start - sectionPositions[i + 1].name.length - 3 : doc.content.length;
          const sectionContent = doc.content.slice(start, end).trim();
          if (sectionContent.length < 10) {
            qIndex++;
            categories.add('empty_section');
            questions.push({
              id: `Q${qIndex}`,
              question: `Section "${sectionPositions[i].name}" appears to be empty or very brief. What details should be added?`,
              category: 'empty_section',
              priority: 'high',
              section: sectionPositions[i].name,
            });
          }
        }

        // Check for unchecked acceptance criteria
        const uncheckedCount = (doc.content.match(/- \[ \]/g) || []).length;
        const checkedCount = (doc.content.match(/- \[x\]/gi) || []).length;
        if (uncheckedCount > 0 && checkedCount === 0) {
          qIndex++;
          categories.add('acceptance_criteria');
          questions.push({
            id: `Q${qIndex}`,
            question: `All ${uncheckedCount} acceptance criteria are unchecked. Have any been completed?`,
            category: 'acceptance_criteria',
            priority: 'low',
          });
        }

        const result = {
          questionsGenerated: questions.length,
          categories: Array.from(categories),
          questions,
        };

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: result }, null, 2));
        } else {
          if (questions.length === 0) {
            console.log(chalk.green('No gaps found - document looks complete'));
          } else {
            console.log(chalk.yellow(`Found ${questions.length} potential gap(s):\n`));
            for (const q of questions) {
              const priorityColor = q.priority === 'high' ? chalk.red : q.priority === 'medium' ? chalk.yellow : chalk.gray;
              console.log(`  ${q.id} [${priorityColor(q.priority)}] ${q.question}`);
            }
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

export function createDocValidateFulfillmentCommand(): Command {
  return new Command('doc-validate-fulfillment')
    .description('Validate whether implementation fulfills the document\'s requirements')
    .argument('<id>', 'Document ID')
    .option('--json', 'Output as JSON')
    .action(async (id: string, options) => {
      try {
        const docsManager = await getDocsManager();
        const doc = await docsManager.getDoc(id);

        if (!doc) {
          if (options.json) {
            console.error(JSON.stringify({ status: 'error', error: { code: 'DOC_NOT_FOUND', message: `Document not found: ${id}` } }, null, 2));
          } else {
            console.error(chalk.red(`Document not found: ${id}`));
          }
          process.exit(3);
        }

        // Load type for fulfillment config
        const registry = await getDocTypeRegistry();
        const docType = doc.metadata.docType ? registry.getType(doc.metadata.docType as string) : null;
        const fulfillmentConfig = docType?.fulfillment;

        if (!fulfillmentConfig?.enabled) {
          const msg = `Document type '${doc.metadata.docType || 'unknown'}' does not have fulfillment validation enabled.`;
          if (options.json) {
            console.error(JSON.stringify({ status: 'error', error: { code: 'FULFILLMENT_NOT_ENABLED', message: msg } }, null, 2));
          } else {
            console.error(chalk.red(msg));
          }
          process.exit(1);
        }

        const checks: Record<string, { status: string; detail: string }> = {};
        let totalChecks = 0;
        let passedChecks = 0;

        // Check acceptance criteria
        if (fulfillmentConfig.checkAcceptanceCriteria) {
          totalChecks++;
          const unchecked = (doc.content.match(/- \[ \]/g) || []).length;
          const checked = (doc.content.match(/- \[x\]/gi) || []).length;
          const total = unchecked + checked;

          if (total === 0) {
            checks['acceptance_criteria'] = { status: 'warn', detail: 'No acceptance criteria checkboxes found' };
          } else if (unchecked === 0) {
            checks['acceptance_criteria'] = { status: 'pass', detail: `All ${total} criteria met` };
            passedChecks++;
          } else {
            checks['acceptance_criteria'] = { status: 'fail', detail: `${checked}/${total} criteria met (${unchecked} remaining)` };
          }
        }

        // Check files modified (presence of Files to Modify section with content)
        if (fulfillmentConfig.checkFilesModified) {
          totalChecks++;
          const filesSection = /## Files to Modify\s*\n([\s\S]*?)(?=\n## |\n$)/i.exec(doc.content);
          if (filesSection && filesSection[1].trim().length > 10) {
            checks['files_modified'] = { status: 'pass', detail: 'Files to Modify section has content' };
            passedChecks++;
          } else {
            checks['files_modified'] = { status: 'warn', detail: 'Files to Modify section is missing or empty' };
          }
        }

        // Check tests added (presence of testing section with content)
        if (fulfillmentConfig.checkTestsAdded) {
          totalChecks++;
          const testSection = /## (?:Testing|Testing Strategy|Tests)\s*\n([\s\S]*?)(?=\n## |\n$)/i.exec(doc.content);
          if (testSection && testSection[1].trim().length > 10) {
            checks['tests_added'] = { status: 'pass', detail: 'Testing section has content' };
            passedChecks++;
          } else {
            checks['tests_added'] = { status: 'warn', detail: 'Testing section is missing or empty' };
          }
        }

        // Check docs updated
        if (fulfillmentConfig.checkDocsUpdated) {
          totalChecks++;
          const updatedAt = doc.metadata.updatedAt;
          if (updatedAt) {
            checks['docs_updated'] = { status: 'pass', detail: `Document last updated: ${updatedAt}` };
            passedChecks++;
          } else {
            checks['docs_updated'] = { status: 'warn', detail: 'No updatedAt timestamp found' };
          }
        }

        const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
        const status = score >= 100 ? 'pass' : score >= 50 ? 'partial' : 'fail';

        const result = { status, score, checks };

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: result }, null, 2));
        } else {
          const statusColor = status === 'pass' ? chalk.green : status === 'partial' ? chalk.yellow : chalk.red;
          console.log(statusColor(`Fulfillment: ${status.toUpperCase()} (${score}%)\n`));
          for (const [name, check] of Object.entries(checks)) {
            const checkColor = check.status === 'pass' ? chalk.green : check.status === 'warn' ? chalk.yellow : chalk.red;
            const icon = check.status === 'pass' ? '✓' : check.status === 'warn' ? '!' : '✗';
            console.log(`  ${checkColor(icon)} ${name}: ${check.detail}`);
          }
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}
