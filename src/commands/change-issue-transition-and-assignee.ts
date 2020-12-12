import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import { logger, selectValues, store } from '../services';

export default async function changeIssueTransitionAndAssignee(issueItem: IssueItem): Promise<void> {
  try {
    if (issueItem && issueItem.issue && store.canExecuteJiraAPI()) {
      let issue = issueItem.issue;
      const { transtion, assignee } = await selectValues.selectTransitionAndAssignee(issue.key);
      if (transtion.id) {
        // call Jira API
        await store.state.jira.setTransition({
          issueKey: issue.key,
          transition: {
            transition: {
              id: transtion.id,
            },
          },
        });
      }
      await store.state.jira.setAssignIssue({ issueKey: issue.key, accountId: assignee.accountId, assignee: assignee.accountId });
      await vscode.commands.executeCommand('jira-plugin.refresh');
    } else {
      if (store.canExecuteJiraAPI()) {
        logger.printErrorMessageInOutputAndShowAlert('Use this command from Jira Plugin EXPLORER');
      }
    }
  } catch (err) {
    logger.printErrorMessageInOutputAndShowAlert(err);
  }
}
