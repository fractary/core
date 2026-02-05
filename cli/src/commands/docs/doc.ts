/**
 * Document operations for documentation management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getDocsManager, getDocTypeRegistry } from '../../sdk/factory';
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
