/**
 * Handler registration system - routes tool calls to appropriate handlers
 */
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { Config } from '../config.js';
import { errorResult } from './helpers.js';

// Import all handler modules
import * as specHandlers from './spec.js';
import * as logsHandlers from './logs.js';
import * as fileHandlers from './file.js';
import * as docsHandlers from './docs.js';
import * as workHandlers from './work.js';
import * as repoHandlers from './repo.js';

/**
 * Route tool calls to appropriate handlers
 */
export async function handleToolCall(
  name: string,
  args: Record<string, unknown>,
  config: Config
): Promise<CallToolResult> {
  switch (name) {
    // Spec module (5 tools)
    case 'fractary_spec_create':
      return specHandlers.handleSpecCreate(args as Parameters<typeof specHandlers.handleSpecCreate>[0], config);
    case 'fractary_spec_validate':
      return specHandlers.handleSpecValidate(args as Parameters<typeof specHandlers.handleSpecValidate>[0], config);
    case 'fractary_spec_refine':
      return specHandlers.handleSpecRefine(args as Parameters<typeof specHandlers.handleSpecRefine>[0], config);
    case 'fractary_spec_list':
      return specHandlers.handleSpecList(args as Parameters<typeof specHandlers.handleSpecList>[0], config);
    case 'fractary_spec_read':
      return specHandlers.handleSpecRead(args as Parameters<typeof specHandlers.handleSpecRead>[0], config);

    // Logs module (5 tools)
    case 'fractary_logs_capture':
      return logsHandlers.handleLogsCapture(args as Parameters<typeof logsHandlers.handleLogsCapture>[0], config);
    case 'fractary_logs_search':
      return logsHandlers.handleLogsSearch(args as Parameters<typeof logsHandlers.handleLogsSearch>[0], config);
    case 'fractary_logs_archive':
      return logsHandlers.handleLogsArchive(args as Parameters<typeof logsHandlers.handleLogsArchive>[0], config);
    case 'fractary_logs_list':
      return logsHandlers.handleLogsList(args as Parameters<typeof logsHandlers.handleLogsList>[0], config);
    case 'fractary_logs_read':
      return logsHandlers.handleLogsRead(args as Parameters<typeof logsHandlers.handleLogsRead>[0], config);

    // File module (7 tools)
    case 'fractary_file_read':
      return fileHandlers.handleFileRead(args as Parameters<typeof fileHandlers.handleFileRead>[0], config);
    case 'fractary_file_write':
      return fileHandlers.handleFileWrite(args as Parameters<typeof fileHandlers.handleFileWrite>[0], config);
    case 'fractary_file_list':
      return fileHandlers.handleFileList(args as Parameters<typeof fileHandlers.handleFileList>[0], config);
    case 'fractary_file_delete':
      return fileHandlers.handleFileDelete(args as Parameters<typeof fileHandlers.handleFileDelete>[0], config);
    case 'fractary_file_exists':
      return fileHandlers.handleFileExists(args as Parameters<typeof fileHandlers.handleFileExists>[0], config);
    case 'fractary_file_copy':
      return fileHandlers.handleFileCopy(args as Parameters<typeof fileHandlers.handleFileCopy>[0], config);
    case 'fractary_file_move':
      return fileHandlers.handleFileMove(args as Parameters<typeof fileHandlers.handleFileMove>[0], config);

    // Docs module (7 tools)
    case 'fractary_docs_create':
      return docsHandlers.handleDocsCreate(args as Parameters<typeof docsHandlers.handleDocsCreate>[0], config);
    case 'fractary_docs_update':
      return docsHandlers.handleDocsUpdate(args as Parameters<typeof docsHandlers.handleDocsUpdate>[0], config);
    case 'fractary_docs_search':
      return docsHandlers.handleDocsSearch(args as Parameters<typeof docsHandlers.handleDocsSearch>[0], config);
    case 'fractary_docs_export':
      return docsHandlers.handleDocsExport(args as Parameters<typeof docsHandlers.handleDocsExport>[0], config);
    case 'fractary_docs_list':
      return docsHandlers.handleDocsList(args as Parameters<typeof docsHandlers.handleDocsList>[0], config);
    case 'fractary_docs_read':
      return docsHandlers.handleDocsRead(args as Parameters<typeof docsHandlers.handleDocsRead>[0], config);
    case 'fractary_docs_delete':
      return docsHandlers.handleDocsDelete(args as Parameters<typeof docsHandlers.handleDocsDelete>[0], config);

    // Work module (19 tools)
    case 'fractary_work_issue_fetch':
      return workHandlers.handleWorkIssueFetch(args as Parameters<typeof workHandlers.handleWorkIssueFetch>[0], config);
    case 'fractary_work_issue_create':
      return workHandlers.handleWorkIssueCreate(args as Parameters<typeof workHandlers.handleWorkIssueCreate>[0], config);
    case 'fractary_work_issue_update':
      return workHandlers.handleWorkIssueUpdate(args as Parameters<typeof workHandlers.handleWorkIssueUpdate>[0], config);
    case 'fractary_work_issue_assign':
      return workHandlers.handleWorkIssueAssign(args as Parameters<typeof workHandlers.handleWorkIssueAssign>[0], config);
    case 'fractary_work_issue_unassign':
      return workHandlers.handleWorkIssueUnassign(args as Parameters<typeof workHandlers.handleWorkIssueUnassign>[0], config);
    case 'fractary_work_issue_close':
      return workHandlers.handleWorkIssueClose(args as Parameters<typeof workHandlers.handleWorkIssueClose>[0], config);
    case 'fractary_work_issue_reopen':
      return workHandlers.handleWorkIssueReopen(args as Parameters<typeof workHandlers.handleWorkIssueReopen>[0], config);
    case 'fractary_work_issue_search':
      return workHandlers.handleWorkIssueSearch(args as Parameters<typeof workHandlers.handleWorkIssueSearch>[0], config);
    case 'fractary_work_issue_classify':
      return workHandlers.handleWorkIssueClassify(args as Parameters<typeof workHandlers.handleWorkIssueClassify>[0], config);
    case 'fractary_work_comment_create':
      return workHandlers.handleWorkCommentCreate(args as Parameters<typeof workHandlers.handleWorkCommentCreate>[0], config);
    case 'fractary_work_comment_list':
      return workHandlers.handleWorkCommentList(args as Parameters<typeof workHandlers.handleWorkCommentList>[0], config);
    case 'fractary_work_label_add':
      return workHandlers.handleWorkLabelAdd(args as Parameters<typeof workHandlers.handleWorkLabelAdd>[0], config);
    case 'fractary_work_label_remove':
      return workHandlers.handleWorkLabelRemove(args as Parameters<typeof workHandlers.handleWorkLabelRemove>[0], config);
    case 'fractary_work_label_set':
      return workHandlers.handleWorkLabelSet(args as Parameters<typeof workHandlers.handleWorkLabelSet>[0], config);
    case 'fractary_work_label_list':
      return workHandlers.handleWorkLabelList(args as Parameters<typeof workHandlers.handleWorkLabelList>[0], config);
    case 'fractary_work_milestone_create':
      return workHandlers.handleWorkMilestoneCreate(args as Parameters<typeof workHandlers.handleWorkMilestoneCreate>[0], config);
    case 'fractary_work_milestone_list':
      return workHandlers.handleWorkMilestoneList(args as Parameters<typeof workHandlers.handleWorkMilestoneList>[0], config);
    case 'fractary_work_milestone_set':
      return workHandlers.handleWorkMilestoneSet(args as Parameters<typeof workHandlers.handleWorkMilestoneSet>[0], config);
    case 'fractary_work_milestone_remove':
      return workHandlers.handleWorkMilestoneRemove(args as Parameters<typeof workHandlers.handleWorkMilestoneRemove>[0], config);

    // Repo module (38 tools)
    case 'fractary_repo_status':
      return repoHandlers.handleRepoStatus(args as Parameters<typeof repoHandlers.handleRepoStatus>[0], config);
    case 'fractary_repo_branch_current':
      return repoHandlers.handleRepoBranchCurrent(args as Parameters<typeof repoHandlers.handleRepoBranchCurrent>[0], config);
    case 'fractary_repo_is_dirty':
      return repoHandlers.handleRepoIsDirty(args as Parameters<typeof repoHandlers.handleRepoIsDirty>[0], config);
    case 'fractary_repo_diff':
      return repoHandlers.handleRepoDiff(args as Parameters<typeof repoHandlers.handleRepoDiff>[0], config);
    case 'fractary_repo_branch_create':
      return repoHandlers.handleRepoBranchCreate(args as Parameters<typeof repoHandlers.handleRepoBranchCreate>[0], config);
    case 'fractary_repo_branch_delete':
      return repoHandlers.handleRepoBranchDelete(args as Parameters<typeof repoHandlers.handleRepoBranchDelete>[0], config);
    case 'fractary_repo_branch_list':
      return repoHandlers.handleRepoBranchList(args as Parameters<typeof repoHandlers.handleRepoBranchList>[0], config);
    case 'fractary_repo_branch_get':
      return repoHandlers.handleRepoBranchGet(args as Parameters<typeof repoHandlers.handleRepoBranchGet>[0], config);
    case 'fractary_repo_checkout':
      return repoHandlers.handleRepoCheckout(args as Parameters<typeof repoHandlers.handleRepoCheckout>[0], config);
    case 'fractary_repo_branch_name_generate':
      return repoHandlers.handleRepoBranchNameGenerate(args as Parameters<typeof repoHandlers.handleRepoBranchNameGenerate>[0], config);
    case 'fractary_repo_stage':
      return repoHandlers.handleRepoStage(args as Parameters<typeof repoHandlers.handleRepoStage>[0], config);
    case 'fractary_repo_stage_all':
      return repoHandlers.handleRepoStageAll(args as Parameters<typeof repoHandlers.handleRepoStageAll>[0], config);
    case 'fractary_repo_unstage':
      return repoHandlers.handleRepoUnstage(args as Parameters<typeof repoHandlers.handleRepoUnstage>[0], config);
    case 'fractary_repo_commit':
      return repoHandlers.handleRepoCommit(args as Parameters<typeof repoHandlers.handleRepoCommit>[0], config);
    case 'fractary_repo_commit_get':
      return repoHandlers.handleRepoCommitGet(args as Parameters<typeof repoHandlers.handleRepoCommitGet>[0], config);
    case 'fractary_repo_commit_list':
      return repoHandlers.handleRepoCommitList(args as Parameters<typeof repoHandlers.handleRepoCommitList>[0], config);
    case 'fractary_repo_push':
      return repoHandlers.handleRepoPush(args as Parameters<typeof repoHandlers.handleRepoPush>[0], config);
    case 'fractary_repo_pull':
      return repoHandlers.handleRepoPull(args as Parameters<typeof repoHandlers.handleRepoPull>[0], config);
    case 'fractary_repo_fetch':
      return repoHandlers.handleRepoFetch(args as Parameters<typeof repoHandlers.handleRepoFetch>[0], config);
    case 'fractary_repo_pr_create':
      return repoHandlers.handleRepoPrCreate(args as Parameters<typeof repoHandlers.handleRepoPrCreate>[0], config);
    case 'fractary_repo_pr_get':
      return repoHandlers.handleRepoPrGet(args as Parameters<typeof repoHandlers.handleRepoPrGet>[0], config);
    case 'fractary_repo_pr_update':
      return repoHandlers.handleRepoPrUpdate(args as Parameters<typeof repoHandlers.handleRepoPrUpdate>[0], config);
    case 'fractary_repo_pr_comment':
      return repoHandlers.handleRepoPrComment(args as Parameters<typeof repoHandlers.handleRepoPrComment>[0], config);
    case 'fractary_repo_pr_review':
      return repoHandlers.handleRepoPrReview(args as Parameters<typeof repoHandlers.handleRepoPrReview>[0], config);
    case 'fractary_repo_pr_request_review':
      return repoHandlers.handleRepoPrRequestReview(args as Parameters<typeof repoHandlers.handleRepoPrRequestReview>[0], config);
    case 'fractary_repo_pr_approve':
      return repoHandlers.handleRepoPrApprove(args as Parameters<typeof repoHandlers.handleRepoPrApprove>[0], config);
    case 'fractary_repo_pr_merge':
      return repoHandlers.handleRepoPrMerge(args as Parameters<typeof repoHandlers.handleRepoPrMerge>[0], config);
    case 'fractary_repo_pr_list':
      return repoHandlers.handleRepoPrList(args as Parameters<typeof repoHandlers.handleRepoPrList>[0], config);
    case 'fractary_repo_tag_create':
      return repoHandlers.handleRepoTagCreate(args as Parameters<typeof repoHandlers.handleRepoTagCreate>[0], config);
    case 'fractary_repo_tag_delete':
      return repoHandlers.handleRepoTagDelete(args as Parameters<typeof repoHandlers.handleRepoTagDelete>[0], config);
    case 'fractary_repo_tag_push':
      return repoHandlers.handleRepoTagPush(args as Parameters<typeof repoHandlers.handleRepoTagPush>[0], config);
    case 'fractary_repo_tag_list':
      return repoHandlers.handleRepoTagList(args as Parameters<typeof repoHandlers.handleRepoTagList>[0], config);
    case 'fractary_repo_worktree_create':
      return repoHandlers.handleRepoWorktreeCreate(args as Parameters<typeof repoHandlers.handleRepoWorktreeCreate>[0], config);
    case 'fractary_repo_worktree_list':
      return repoHandlers.handleRepoWorktreeList(args as Parameters<typeof repoHandlers.handleRepoWorktreeList>[0], config);
    case 'fractary_repo_worktree_remove':
      return repoHandlers.handleRepoWorktreeRemove(args as Parameters<typeof repoHandlers.handleRepoWorktreeRemove>[0], config);
    case 'fractary_repo_worktree_prune':
      return repoHandlers.handleRepoWorktreePrune(args as Parameters<typeof repoHandlers.handleRepoWorktreePrune>[0], config);
    case 'fractary_repo_worktree_cleanup':
      return repoHandlers.handleRepoWorktreeCleanup(args as Parameters<typeof repoHandlers.handleRepoWorktreeCleanup>[0], config);

    default:
      return errorResult(`Unknown tool: ${name}`);
  }
}
