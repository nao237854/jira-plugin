import * as vscode from 'vscode';
import NoWorkingIssuePick from '../picks/no-working-issue-pick';
import { configuration, selectValues, store, toggl, utilities } from '../services';
import { IIssue, IWorkingIssue } from '../services/http.model';
import { ACTIONS, CONFIG, NO_WORKING_ISSUE, TRACKING_TIME_MODE } from '../shared/constants';

export default async function setWorkingIssue(storedWorkingIssue: IWorkingIssue, preloadedIssue: IIssue): Promise<void> {
  // run it's called from status bar there is a working issue in the storage
  if (!!storedWorkingIssue) {
    const workingIssues = await selectValues.selectWorkingIssues();
    // the stored working issue is in the current working issues?
    const issue = workingIssues.find((issue: IIssue) => issue.key === storedWorkingIssue.issue.key);
    if (!!issue) {
      // YES - restart tracking time for the stored working issue
      store.state.workingIssue = storedWorkingIssue;
      vscode.window.showInformationMessage(
        `Pending working issue: ${store.state.workingIssue.issue.key} | Time spent: ${utilities.secondsToHHMMSS(
          store.state.workingIssue.trackingTime
        )}`
      );
      // set stored working issue
      store.changeStateWorkingIssue(
        store.state.workingIssue.issue,
        store.state.workingIssue.trackingTime,
        store.state.workingIssue.togglTimeEntryId
      );
    } else {
      // NO - set no working issue
      store.changeStateWorkingIssue(new NoWorkingIssuePick().pickValue, 0, 0);
    }
  } else {
    // normal workflow, user must select a working issue
    const workingIssue = store.state.workingIssue || new NoWorkingIssuePick().pickValue;
    const newIssue = preloadedIssue || (await selectValues.selectChangeWorkingIssue());
    if (!!newIssue && newIssue.key !== workingIssue.issue.key) {
      if (
        workingIssue.issue.key !== NO_WORKING_ISSUE.key &&
        configuration.get(CONFIG.TRACKING_TIME_MODE) !== TRACKING_TIME_MODE.NEVER &&
        utilities.floorSecondsToMinutes(workingIssue.trackingTime) >= configuration.get(CONFIG.WORKLOG_MINIMUM_TRACKING_TIME)
      ) {
        // modal for create Worklog
        let action = await vscode.window.showInformationMessage(
          `Add worklog for the previous working issue ${workingIssue.issue.key} | Time spent: ${utilities.secondsToHHMMSS(
            workingIssue.trackingTime
          )} ?`,
          ACTIONS.YES_WITH_COMMENT,
          ACTIONS.YES,
          ACTIONS.NO
        );
        // menage response
        let comment =
          action === ACTIONS.YES_WITH_COMMENT
            ? await vscode.window.showInputBox({
                ignoreFocusOut: true,
                placeHolder: 'Add worklog comment...',
              })
            : '';
        if (action === ACTIONS.YES || action === ACTIONS.YES_WITH_COMMENT) {
          await vscode.commands.executeCommand(
            'jira-plugin.issueAddWorklog',
            store.state.workingIssue.issue.key,
            store.state.workingIssue.trackingTime,
            comment || ''
          );
        }
      }
      if (toggl.enabled && store.state.workingIssue.togglTimeEntryId) {
        await toggl.stopTimeEntry(store.state.workingIssue.togglTimeEntryId);
        store.state.workingIssue.togglTimeEntryId = 0;
      }
      // set the new working issue
      store.changeStateWorkingIssue(newIssue, 0, 0);
    }
  }
}
