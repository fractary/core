/**
 * Docs subcommand - Documentation management
 *
 * Provides documentation operations via @fractary/core DocsManager.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getDocsManager, getDocTypeRegistry } from '../../sdk/factory';
import { handleError } from '../../utils/errors';

/**
 * Create the docs command tree
 */
export function createDocsCommand(): Command {
  const docs = new Command('docs').description('Documentation management');

  docs.addCommand(createDocsCreateCommand());
  docs.addCommand(createDocsGetCommand());
  docs.addCommand(createDocsListCommand());
  docs.addCommand(createDocsUpdateCommand());
  docs.addCommand(createDocsDeleteCommand());
  docs.addCommand(createDocsSearchCommand());
  docs.addCommand(createDocsTypesCommand());
  docs.addCommand(createDocsTypeInfoCommand());

  return docs;
}

function createDocsCreateCommand(): Command {
  return new Command('create')
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

function createDocsGetCommand(): Command {
  return new Command('get')
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

function createDocsListCommand(): Command {
  return new Command('list')
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

function createDocsUpdateCommand(): Command {
  return new Command('update')
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

function createDocsDeleteCommand(): Command {
  return new Command('delete')
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

function createDocsSearchCommand(): Command {
  return new Command('search')
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

function createDocsTypesCommand(): Command {
  return new Command('types')
    .description('List available document types')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const registry = await getDocTypeRegistry();
        const types = registry.getAllTypes();

        if (options.json) {
          const data = types.map((t) => ({
            id: t.id,
            displayName: t.displayName,
            description: t.description,
            outputPath: t.outputPath,
            status: t.status?.allowedValues,
          }));
          console.log(JSON.stringify({ status: 'success', data }, null, 2));
        } else {
          console.log(chalk.bold('Available Document Types:\n'));
          types.forEach((docType) => {
            console.log(chalk.cyan(`  ${docType.id}`));
            console.log(chalk.white(`    ${docType.displayName}`));
            console.log(chalk.gray(`    ${docType.description}`));
            console.log(chalk.gray(`    Output: ${docType.outputPath}`));
            console.log();
          });
          console.log(chalk.gray(`Total: ${types.length} types`));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}

function createDocsTypeInfoCommand(): Command {
  return new Command('type-info')
    .description('Get detailed information about a document type')
    .argument('<type>', 'Document type ID (e.g., adr, api, architecture)')
    .option('--json', 'Output as JSON')
    .option('--template', 'Show the document template')
    .option('--standards', 'Show the documentation standards')
    .action(async (typeId: string, options) => {
      try {
        const registry = await getDocTypeRegistry();
        const docType = registry.getType(typeId);

        if (!docType) {
          if (options.json) {
            console.error(
              JSON.stringify(
                {
                  status: 'error',
                  error: { code: 'TYPE_NOT_FOUND', message: `Document type not found: ${typeId}` },
                },
                null,
                2
              )
            );
          } else {
            console.error(chalk.red(`Document type not found: ${typeId}`));
            console.log(chalk.gray('\nAvailable types:'));
            const types = registry.getAllTypes();
            types.forEach((t) => console.log(chalk.gray(`  - ${t.id}`)));
          }
          process.exit(3);
        }

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: docType }, null, 2));
        } else if (options.template) {
          console.log(docType.template);
        } else if (options.standards) {
          console.log(docType.standards || chalk.yellow('No standards defined for this type'));
        } else {
          console.log(chalk.bold(`${docType.displayName} (${docType.id})\n`));
          console.log(chalk.gray(docType.description));
          console.log();

          console.log(chalk.cyan('File Naming:'));
          console.log(chalk.gray(`  Pattern: ${docType.fileNaming.pattern}`));
          if (docType.fileNaming.autoNumber) {
            console.log(chalk.gray(`  Auto-number: ${docType.fileNaming.numberFormat || 'yes'}`));
          }
          console.log();

          console.log(chalk.cyan('Output Path:'));
          console.log(chalk.gray(`  ${docType.outputPath}`));
          console.log();

          console.log(chalk.cyan('Frontmatter Fields:'));
          console.log(chalk.gray(`  Required: ${docType.frontmatter.requiredFields.join(', ')}`));
          if (docType.frontmatter.optionalFields?.length) {
            console.log(chalk.gray(`  Optional: ${docType.frontmatter.optionalFields.join(', ')}`));
          }
          console.log();

          if (docType.structure?.requiredSections?.length) {
            console.log(chalk.cyan('Required Sections:'));
            docType.structure.requiredSections.forEach((s) =>
              console.log(chalk.gray(`  - ${s}`))
            );
            console.log();
          }

          if (docType.status) {
            console.log(chalk.cyan('Status Values:'));
            console.log(
              chalk.gray(
                `  ${docType.status.allowedValues.join(', ')} (default: ${docType.status.default})`
              )
            );
            console.log();
          }

          console.log(chalk.gray('Use --template to see the document template'));
          console.log(chalk.gray('Use --standards to see the documentation standards'));
        }
      } catch (error) {
        handleError(error, options);
      }
    });
}
