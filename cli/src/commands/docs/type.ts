/**
 * Type operations for documentation management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getDocTypeRegistry } from '../../sdk/factory';
import { handleError } from '../../utils/errors';

export function createTypeListCommand(): Command {
  return new Command('type-list')
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

export function createTypeInfoCommand(): Command {
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
