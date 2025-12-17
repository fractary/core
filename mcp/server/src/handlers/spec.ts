import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { SpecManager } from '@fractary/core/spec';
import { Config } from '../config.js';
import { successResult, errorResult } from './helpers.js';

/**
 * Handler for fractary_spec_create
 */
export async function handleSpecCreate(
  params: {
    title: string;
    template?: string;
    work_id?: string;
    context?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new SpecManager(config.spec);
    const spec = manager.createSpec(params.title, {
      template: params.template as 'basic' | 'feature' | 'bug' | 'infrastructure' | 'api',
      workId: params.work_id,
      context: params.context,
    });
    return successResult(spec);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error creating spec: ${message}`);
  }
}

/**
 * Handler for fractary_spec_validate
 */
export async function handleSpecValidate(
  params: { spec_id: string },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new SpecManager(config.spec);
    const result = manager.validateSpec(params.spec_id);
    return successResult(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error validating spec: ${message}`);
  }
}

/**
 * Handler for fractary_spec_refine
 */
export async function handleSpecRefine(
  params: {
    spec_id: string;
    feedback?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new SpecManager(config.spec);

    // Generate refinement questions
    const questions = manager.generateRefinementQuestions(params.spec_id);

    // If feedback provided, apply refinements
    if (params.feedback) {
      // Parse feedback as answers (simple key-value format)
      const answers: Record<string, string> = {};
      params.feedback.split('\n').forEach(line => {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key && value) {
          answers[key] = value;
        }
      });

      const result = manager.refineSpec(params.spec_id, answers);
      return successResult(result);
    }

    // Otherwise return questions for user to answer
    return successResult({ questions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error refining spec: ${message}`);
  }
}

/**
 * Handler for fractary_spec_list
 */
export async function handleSpecList(
  params: {
    work_id?: string;
    status?: string;
    template?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new SpecManager(config.spec);
    const specs = manager.listSpecs({
      workId: params.work_id,
      status: params.status,
      template: params.template as 'basic' | 'feature' | 'bug' | 'infrastructure' | 'api' | undefined,
    });
    return successResult(specs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error listing specs: ${message}`);
  }
}

/**
 * Handler for fractary_spec_read
 */
export async function handleSpecRead(
  params: { spec_id: string },
  config: Config
): Promise<CallToolResult> {
  try {
    const manager = new SpecManager(config.spec);
    const spec = manager.getSpec(params.spec_id);

    if (!spec) {
      return errorResult(`Spec not found: ${params.spec_id}`);
    }

    return successResult(spec);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error reading spec: ${message}`);
  }
}
