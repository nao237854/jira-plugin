import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import { logger, selectValues, store } from '../services';

export default async function changeIssueAssignee(issueItem: IssueItem): Promise<void> {
  try {
    if (issueItem && issueItem.issue && store.canExecuteJiraAPI()) {
      let issue = issueItem.issue;
      let assignee = await selectValues.selectAssignee(false, false, undefined);
      if (!!assignee.accountId) {
        // call Jira API
        const res = await store.state.jira.setAssignIssue({ issueKey: issue.key, accountId: assignee.accountId });
        await vscode.commands.executeCommand('jira-plugin.refresh');
      }
    } else {
      if (store.canExecuteJiraAPI()) {
        logger.printErrorMessageInOutputAndShowAlert('Use this command from Jira Plugin EXPLORER');
      }
    }
  } catch (err) {
    logger.printErrorMessageInOutputAndShowAlert(err);
  }
}
