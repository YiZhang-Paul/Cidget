enum PullRequestAction {
    Opened = 'opened',
    Updated = 'updated',
    Approved = 'approved',
    Rejected = 'rejected',
    Merged = 'merged',
    CheckRunning = 'check running',
    CheckPassed = 'check passed',
    CheckFailed = 'check failed',
    ReviewRequested = 'needs review'
}

export default PullRequestAction;
