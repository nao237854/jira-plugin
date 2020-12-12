import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import NoWorkingIssuePick from '../picks/no-working-issue-pick';
import { configuration, statusBar, store, toggl, utilities } from '../services';
import { CONFIG, NO_WORKING_ISSUE } from '../shared/constants';
import changeIssueStatus from './change-issue-status';

export default async function stopWorkingIssue(): Promise<void> {
  const workingIssue = { ...store.state.workingIssue } || new NoWorkingIssuePick().pickValue;
  if (!!workingIssue.issue.key && workingIssue.issue.key !== NO_WORKING_ISSUE.key) {
    if (
      workingIssue.issue.key !== NO_WORKING_ISSUE.key &&
      utilities.floorSecondsToMinutes(workingIssue.trackingTime) >= configuration.get(CONFIG.WORKLOG_MINIMUM_TRACKING_TIME)
    ) {
      // old working issue has trackingTime and it's equal or bigger then WORKLOG_MINIMUM_TRACKING_TIME setting
      statusBar.clearWorkingIssueInterval();

      changeIssueStatus(new IssueItem(store.state.workingIssue.issue));

      // modal for create Worklog
      // To re-implement being asked if you want to store a comment, remove the following let, uncomment until the if (!!comment) and replace it with the if (action...)
      vscode.commands.executeCommand('jira-plugin.issueAddWorklog', workingIssue.issue.key, workingIssue.trackingTime);
      if (toggl.enabled) {
        // call Toggl API
        toggl.stopTimeEntry(workingIssue.togglTimeEntryId);
      }
      store.changeStateWorkingIssue(new NoWorkingIssuePick().pickValue, 0, 0);
    }
  } else {
    vscode.window.showInformationMessage('You are not currently working on a ticket');
  }
}
