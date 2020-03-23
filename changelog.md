# Changelog

All notable changes to this project will be documented in this file.

## Released

## 0.1.0 - 2020/01/12

## 0.2.0 - 2020/01/19

## 0.3.0 - 2020/02/23

### Added

* module to support OAuth authorization code flow for Outlook services
* module to manage subscriptions to Outlook push notifications
* supports to parse Zendesk ticket information from Outlook messages
* module to manage and display Zendesk notifications
* added reviewer information on pull request notifications

### Changed

* replaced static application-wide configurations with persistent configuration storage
* revamped notification card layouts to achieve cleaner user interfaces
* mouse hover will delay the disappearance of notification cards

### Fixed

* fixed a bug where notification cards will not show on top of other running programs on user's OS
* fixed a bug where pull request check status is not updated when all checks have finished
* fixed styling issues caused by different style sheet inclusion order between development and production environments

## 0.4.0 - 2020/03/22

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

## Unreleased

## 0.5.0 - TBD
