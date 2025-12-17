import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { WorkManager } from '@fractary/core/work';
import { Config } from '../config.js';
import {
  successResult,
  errorResult,
  isValidIssueState,
  isValidPrState,
  isValidFaberContext,
  validateWorkConfig
} from './helpers.js';

/**
 * NOTE: All handlers in this file validate config.work before use
 * Pattern: if (!validateWorkConfig(config)) { return errorResult(...) }
 */

/**
 * Handler for fractary_work_issue_fetch
 */
export async function handleWorkIssueFetch(
  params: { issue_number: string },
  config: Config
): Promise<CallToolResult> {
  try {
    if (!validateWorkConfig(config)) {
      return errorResult('Work configuration is missing or incomplete. Please configure work.platform and work.token.');
    }

    const manager = new WorkManager(config.work);
    const issue = await manager.fetchIssue(params.issue_number);
    return successResult(issue);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error fetching issue: ${message}`);
  }
}

/**
 * Handler for fractary_work_issue_create
 */
export async function handleWorkIssueCreate(
  params: {
    title: string;
    body?: string;
    type?: string;
    labels?: string[];
    assignee?: string;
    milestone?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    if (!validateWorkConfig(config)) {
      return errorResult('Work configuration is missing or incomplete. Please configure work.platform and work.token.');
    }

    const manager = new WorkManager(config.work);
    const issue = await manager.createIssue({
      title: params.title,
      body: params.body,
      labels: params.labels,
      assignees: params.assignee ? [params.assignee] : undefined,
    });
    return successResult(issue);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error creating issue: ${message}`);
  }
}

/**
 * Handler for fractary_work_issue_update
 */
export async function handleWorkIssueUpdate(
  params: {
    issue_number: string;
    title?: string;
    body?: string;
    state?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    if (params.state && !isValidPrState(params.state)) {
      return errorResult(`Invalid state: ${params.state}. Must be 'open' or 'closed'`);
    }

    const manager = new WorkManager(config.work);
    const issue = await manager.updateIssue(params.issue_number, {
      title: params.title,
      body: params.body,
      state: isValidPrState(params.state) ? params.state : undefined,
    });
    return successResult(issue);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error updating issue: ${message}`);
  }
}

/**
 * Handler for fractary_work_issue_assign
 */
export async function handleWorkIssueAssign(
  params: {
    issue_number: string;
    assignee: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    if (!validateWorkConfig(config)) {
      return errorResult('Work configuration is missing or incomplete. Please configure work.platform and work.token.');
    }

    const manager = new WorkManager(config.work);
    const issue = await manager.assignIssue(params.issue_number, params.assignee);
    return successResult(issue);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error assigning issue: ${message}`);
  }
}

/**
 * Handler for fractary_work_issue_unassign
 */
export async function handleWorkIssueUnassign(
  params: { issue_number: string },
  config: Config
): Promise<CallToolResult> {
  try {
    if (!validateWorkConfig(config)) {
      return errorResult('Work configuration is missing or incomplete. Please configure work.platform and work.token.');
    }

    const manager = new WorkManager(config.work);
    const issue = await manager.unassignIssue(params.issue_number);
    return successResult(issue);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error unassigning issue: ${message}`);
  }
}

/**
 * Handler for fractary_work_issue_close
 */
export async function handleWorkIssueClose(
  params: {
    issue_number: string;
    comment?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    if (!validateWorkConfig(config)) {
      return errorResult('Work configuration is missing or incomplete. Please configure work.platform and work.token.');
    }

    const manager = new WorkManager(config.work);

    // Add comment if provided
    if (params.comment) {
      await manager.createComment(params.issue_number, params.comment);
    }

    const issue = await manager.closeIssue(params.issue_number);
    return successResult(issue);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error closing issue: ${message}`);
  }
}

/**
 * Handler for fractary_work_issue_reopen
 */
export async function handleWorkIssueReopen(
  params: {
    issue_number: string;
    comment?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    if (!validateWorkConfig(config)) {
      return errorResult('Work configuration is missing or incomplete. Please configure work.platform and work.token.');
    }

    const manager = new WorkManager(config.work);

    // Add comment if provided
    if (params.comment) {
      await manager.createComment(params.issue_number, params.comment);
    }

    const issue = await manager.reopenIssue(params.issue_number);
    return successResult(issue);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error reopening issue: ${message}`);
  }
}

/**
 * Handler for fractary_work_issue_search
 */
export async function handleWorkIssueSearch(
  params: {
    query?: string;
    state?: string;
    labels?: string[];
    assignee?: string;
    milestone?: string;
    since?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    if (params.state && !isValidIssueState(params.state)) {
      return errorResult(`Invalid state: ${params.state}. Must be 'open', 'closed', or 'all'`);
    }

    const manager = new WorkManager(config.work);
    const issues = await manager.searchIssues(params.query || '', {
      state: isValidIssueState(params.state) ? params.state : undefined,
      labels: params.labels,
      assignee: params.assignee,
      milestone: params.milestone,
      since: params.since,
    });
    return successResult(issues);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error searching issues: ${message}`);
  }
}

/**
 * Handler for fractary_work_issue_classify
 */
export async function handleWorkIssueClassify(
  params: { issue_number: string },
  config: Config
): Promise<CallToolResult> {
  try {
    if (!validateWorkConfig(config)) {
      return errorResult('Work configuration is missing or incomplete. Please configure work.platform and work.token.');
    }

    const manager = new WorkManager(config.work);
    const issue = await manager.fetchIssue(params.issue_number);
    const workType = await manager.classifyWorkType(issue);
    return successResult({ issue_number: params.issue_number, work_type: workType });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error classifying issue: ${message}`);
  }
}

/**
 * Handler for fractary_work_comment_create
 */
export async function handleWorkCommentCreate(
  params: {
    issue_number: string;
    body: string;
    faber_context?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    if (params.faber_context && !isValidFaberContext(params.faber_context)) {
      return errorResult(`Invalid faber_context: ${params.faber_context}. Must be 'frame', 'architect', 'build', 'evaluate', or 'release'`);
    }

    const manager = new WorkManager(config.work);
    const comment = await manager.createComment(
      params.issue_number,
      params.body,
      isValidFaberContext(params.faber_context) ? params.faber_context : undefined
    );
    return successResult(comment);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error creating comment: ${message}`);
  }
}

/**
 * Handler for fractary_work_comment_list
 */
export async function handleWorkCommentList(
  params: {
    issue_number: string;
    limit?: number;
    since?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    if (!validateWorkConfig(config)) {
      return errorResult('Work configuration is missing or incomplete. Please configure work.platform and work.token.');
    }

    const manager = new WorkManager(config.work);
    const comments = await manager.listComments(params.issue_number, {
      limit: params.limit,
      since: params.since,
    });
    return successResult(comments);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error listing comments: ${message}`);
  }
}

/**
 * Handler for fractary_work_label_add
 */
export async function handleWorkLabelAdd(
  params: {
    issue_number: string;
    labels: string[];
  },
  config: Config
): Promise<CallToolResult> {
  try {
    if (!validateWorkConfig(config)) {
      return errorResult('Work configuration is missing or incomplete. Please configure work.platform and work.token.');
    }

    const manager = new WorkManager(config.work);
    const labels = await manager.addLabels(params.issue_number, params.labels);
    return successResult(labels);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error adding labels: ${message}`);
  }
}

/**
 * Handler for fractary_work_label_remove
 */
export async function handleWorkLabelRemove(
  params: {
    issue_number: string;
    labels: string[];
  },
  config: Config
): Promise<CallToolResult> {
  try {
    if (!validateWorkConfig(config)) {
      return errorResult('Work configuration is missing or incomplete. Please configure work.platform and work.token.');
    }

    const manager = new WorkManager(config.work);
    await manager.removeLabels(params.issue_number, params.labels);
    return successResult({ removed: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error removing labels: ${message}`);
  }
}

/**
 * Handler for fractary_work_label_set
 */
export async function handleWorkLabelSet(
  params: {
    issue_number: string;
    labels: string[];
  },
  config: Config
): Promise<CallToolResult> {
  try {
    if (!validateWorkConfig(config)) {
      return errorResult('Work configuration is missing or incomplete. Please configure work.platform and work.token.');
    }

    const manager = new WorkManager(config.work);
    const labels = await manager.setLabels(params.issue_number, params.labels);
    return successResult(labels);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error setting labels: ${message}`);
  }
}

/**
 * Handler for fractary_work_label_list
 */
export async function handleWorkLabelList(
  params: { issue_number?: string },
  config: Config
): Promise<CallToolResult> {
  try {
    if (!validateWorkConfig(config)) {
      return errorResult('Work configuration is missing or incomplete. Please configure work.platform and work.token.');
    }

    const manager = new WorkManager(config.work);
    const labels = await manager.listLabels(params.issue_number);
    return successResult(labels);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error listing labels: ${message}`);
  }
}

/**
 * Handler for fractary_work_milestone_create
 */
export async function handleWorkMilestoneCreate(
  params: {
    title: string;
    description?: string;
    due_on?: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    if (!validateWorkConfig(config)) {
      return errorResult('Work configuration is missing or incomplete. Please configure work.platform and work.token.');
    }

    const manager = new WorkManager(config.work);
    const milestone = await manager.createMilestone({
      title: params.title,
      description: params.description,
      due_on: params.due_on,
    });
    return successResult(milestone);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error creating milestone: ${message}`);
  }
}

/**
 * Handler for fractary_work_milestone_list
 */
export async function handleWorkMilestoneList(
  params: { state?: string },
  config: Config
): Promise<CallToolResult> {
  try {
    if (params.state && !isValidIssueState(params.state)) {
      return errorResult(`Invalid state: ${params.state}. Must be 'open', 'closed', or 'all'`);
    }

    const manager = new WorkManager(config.work);
    const milestones = await manager.listMilestones(isValidIssueState(params.state) ? params.state : undefined);
    return successResult(milestones);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error listing milestones: ${message}`);
  }
}

/**
 * Handler for fractary_work_milestone_set
 */
export async function handleWorkMilestoneSet(
  params: {
    issue_number: string;
    milestone: string;
  },
  config: Config
): Promise<CallToolResult> {
  try {
    if (!validateWorkConfig(config)) {
      return errorResult('Work configuration is missing or incomplete. Please configure work.platform and work.token.');
    }

    const manager = new WorkManager(config.work);
    const issue = await manager.setMilestone(params.issue_number, params.milestone);
    return successResult(issue);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error setting milestone: ${message}`);
  }
}

/**
 * Handler for fractary_work_milestone_remove
 */
export async function handleWorkMilestoneRemove(
  params: { issue_number: string },
  config: Config
): Promise<CallToolResult> {
  try {
    if (!validateWorkConfig(config)) {
      return errorResult('Work configuration is missing or incomplete. Please configure work.platform and work.token.');
    }

    const manager = new WorkManager(config.work);
    const issue = await manager.removeMilestone(params.issue_number);
    return successResult(issue);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResult(`Error removing milestone: ${message}`);
  }
}
