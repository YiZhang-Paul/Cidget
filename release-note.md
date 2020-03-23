# Release Note v0.4.0 - 2020/03/22

### Added

* added enter/exit animation for all notification cards

### Changed

* pull request notifications will only persist when user's review is requested (all other notifications will disappear automatically after 10 seconds)
* pull request review status will be properly displayed (approved/rejected) instead of generic status 'Needs Review'
* pull request names are shortened to save more space on the notifications

### Fixed

* fixed a bug where pull request check status is not properly displayed when a check is finished
* fixed a bug where Zendesk ticket conversations are missing
* fixed a bug where pull request reviews from non-requested reviewers are not included in the review status
* fixed a bug where Outlook push notification is not being renewed properly
* fixed a bug where Microsoft OAuth authentication window does not close sometimes
