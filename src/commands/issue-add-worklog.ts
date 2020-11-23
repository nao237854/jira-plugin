import * as vscode from 'vscode';
import { logger, store, utilities } from '../services';
import { NO_WORKING_ISSUE } from '../shared/constants';
import openIssue from './open-issue';

export default async function issueAddWorklog(issueKey: string, timeSpentSeconds: number, comment: string): Promise<void> {
  try {
    if (issueKey !== NO_WORKING_ISSUE.key) {
      if (store.canExecuteJiraAPI()) {
        // call Jira API
        const actualTimeSpentSeconds = Math.ceil(timeSpentSeconds / 60) * 60;
        const startedTime = new Date(Date.now() - actualTimeSpentSeconds * 1000);
        const response = await store.state.jira.addWorkLog({
          issueKey,
          timeSpentSeconds: actualTimeSpentSeconds,
          comment,
          started: utilities.dateToLocalISO(startedTime),
        });
        const jiraAction = await vscode.window.showInformationMessage(`Worklog added to Jira`, 'Open Jira Issue in browser');
        if (jiraAction === 'Open Jira Issue in browser') {
          openIssue(issueKey);
        }
      }
    }
  } catch (err) {
    logger.printErrorMessageInOutputAndShowAlert(err);
  }
}
