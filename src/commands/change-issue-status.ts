import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import { logger, selectValues, store } from '../services';

export default async function changeIssueStatus(issueItem: IssueItem): Promise<void> {
  try {
    if (issueItem && issueItem.issue && store.canExecuteJiraAPI()) {
      let issue = issueItem.issue;
      const newTransition = await selectValues.selectTransition(issue.key);
      if (newTransition.id) {
        // call Jira API
        const result = await store.state.jira.setTransition({
          issueKey: issue.key,
          transition: {
            transition: {
              id: newTransition.id,
            },
          },
        });
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
