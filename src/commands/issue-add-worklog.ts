import * as vscode from 'vscode';
import { logger, store, toggl, utilities } from '../services';
import { NO_WORKING_ISSUE } from '../shared/constants';
import openIssue from './open-issue';

export default async function issueAddWorklog(
  issueKey: string,
  projectKey: string,
  summary: string,
  labels: Array<string>,
  timeSpentSeconds: number,
  comment: string
): Promise<void> {
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
      if (toggl.enabled) {
        // call Toggl API
        const startedTime = new Date(Date.now() - timeSpentSeconds * 1000);
        const response = await toggl.addWorkLog({
          issueKey,
          projectKey,
          labels,
          summary,
          timeSpentSeconds: timeSpentSeconds,
          started: utilities.dateToLocalISO(startedTime, ':'),
        });
        const togglAction = await vscode.window.showInformationMessage(`Worklog added to Toggl`, 'Open Toggl in browser');
        if (togglAction === 'Open Toggl in browser') {
          toggl.openWebsite();
        }
      }
    }
  } catch (err) {
    logger.printErrorMessageInOutputAndShowAlert(err);
  }
}
