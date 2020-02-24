# Release Note v0.3.0 - 2020/02/23

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
