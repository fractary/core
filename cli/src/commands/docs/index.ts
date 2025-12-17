/**
 * Docs subcommand - Documentation management
 *
 * Provides documentation operations via @fractary/core DocsManager.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getDocsManager } from '../../sdk/factory';
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

  return docs;
}

function createDocsCreateCommand(): Command {
  return new Command('create')
    .description('Create a new document')
    .argument('<id>', 'Document ID')
    .requiredOption('--title <title>', 'Document title')
    .requiredOption('--content <text>', 'Document content')
    .option('--format <format>', 'Document format (markdown, html, pdf, text)', 'markdown')
    .option('--tags <tags>', 'Comma-separated tags')
    .option('--category <category>', 'Document category')
    .option('--description <desc>', 'Document description')
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

        const doc = await docsManager.createDoc(id, options.content, metadata, options.format);

        if (options.json) {
          console.log(JSON.stringify({ status: 'success', data: doc }, null, 2));
        } else {
          console.log(chalk.green(`✓ Created document: ${doc.id}`));
          console.log(chalk.gray(`  Title: ${doc.metadata.title}`));
          console.log(chalk.gray(`  Format: ${doc.format}`));
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
    .option('--limit <n>', 'Limit results', '10')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const docsManager = await getDocsManager();

        const query: any = {
          text: options.text,
          tags: options.tags?.split(',').map((t: string) => t.trim()),
          author: options.author,
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
              console.log(`${doc.id}: ${doc.metadata.title} [${doc.format}]`);
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
