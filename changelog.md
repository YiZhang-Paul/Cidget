# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

## 0.3.0 - 2020/02/11

### Added

* module to support OAuth authorization code flow for Outlook services
* module to manage subscription to Outlook push notifications
* module to manage and display Zendesk notifications
* module to manage webhook subscription for Jira service
* module to manage and display Jira notifications
* ability to parse Zendesk ticket information from Outlook mails
* added visual clues on pull request notification when reviewer is requested or changed

### Changed

* replaced static application-wide configurations with persistent data storage
* changed delimiter for source/target branches on pull request notification to slash
* notifications will not disappear automatically when mouse hovers over

### Fixed

* fixed styling issues caused by different style sheet inclusion order between development and production environments
