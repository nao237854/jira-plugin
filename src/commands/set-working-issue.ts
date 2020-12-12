import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import NoWorkingIssuePick from '../picks/no-working-issue-pick';
import { configuration, selectValues, statusBar, store, toggl } from '../services';
import { IIssue } from '../services/http.model';
import { NO_WORKING_ISSUE } from '../shared/constants';
import changeIssueTransitionAndAssignee from './change-issue-transition-and-assignee';

export default async function setWorkingIssue(preloadedIssue: IIssue): Promise<void> {
  const workingIssue = store.state.workingIssue || new NoWorkingIssuePick().pickValue;
  const newIssue = preloadedIssue || (await selectValues.selectChangeWorkingIssue());
  if (!!newIssue) {
    if (newIssue.key !== workingIssue.issue.key) {
      if (workingIssue.issue.key !== NO_WORKING_ISSUE.key) {
        await vscode.commands.executeCommand('jira-plugin.stopWorkingIssue');
        // await changeIssueStatus(new IssueItem(workingIssue.issue));
        // await changeIssueAssignee(new IssueItem(workingIssue.issue));
        await changeIssueTransitionAndAssignee(new IssueItem(workingIssue.issue));

        statusBar.clearWorkingIssueInterval();
      }
      if (newIssue.key !== NO_WORKING_ISSUE.key) {
        await store.state.jira.setTransition({
          issueKey: newIssue.key,
          transition: {
            transition: {
              id: configuration.workingIssueStatuses(newIssue.fields.project.key),
            },
          },
        });
      }
    }

    let togglTimeEntryId = 0;
    if (!!newIssue && newIssue.key !== NO_WORKING_ISSUE.key && toggl.enabled) {
      const timeEntry = await toggl.startTimeEntry({
        issueKey: newIssue.key,
        projectKey: newIssue.fields.project.key,
        summary: newIssue.fields.summary,
        labels: newIssue.fields.labels,
      });
      togglTimeEntryId = timeEntry.id;
    }

    // set the new working issue
    store.changeStateWorkingIssue(newIssue, 0, togglTimeEntryId);
  }
}
