# Module Mapping — 11 Business Processes → Subsystems

| # | Business Process | Type | Admin Module | Staff Module | Public Module |
|---|---|---|---|---|---|
| 1 | User Authentication & Access Control | Additional | 1.1 Dashboard (login gate), 1.2 User Management | 2.1 Dashboard (login gate) | 3.8 Profile Management (login/register) |
| 2 | Campaign Planning | Main | 1.3 Campaign Management | 2.2 Campaign Management (drafts) | — |
| 3 | Public Awareness Content Management | Main | 1.5 Content Management, 1.4 AI Content Assistant | 2.3 Content Management, 2.4 AI Content Assistant | 3.2 Safety Campaigns (view only) |
| 4 | Campaign Approval Workflow | Additional | 1.6 Campaign Approval | 2.5 Campaign Submission | — |
| 5 | Multi-Channel Dissemination | Main | 1.7 Multi-Channel Distribution | — (view status only) | 3.2 Safety Campaigns, 3.3 AI Voice Announcements |
| 6 | Notification Management | Additional | 1.8 Notification Management | 2.6 Notification Management | 3.4 Notifications |
| 7 | Engagement Tracking | Main | 1.10 Analytics and Reports | 2.8 Reports (assigned only) | (tracked implicitly via views/reactions) |
| 8 | Feedback Collection | Additional | 1.9 Feedback Management | 2.7 Feedback Monitoring | 3.5 Feedback, 3.6 Surveys |
| 9 | Campaign Impact Evaluation | Main | 1.10 Analytics and Reports | 2.8 Reports | — |
| 10 | Report Generation | Additional | 1.10 Analytics and Reports | 2.8 Reports (export if authorized) | — |
| 11 | Audit Trail | Additional | 1.11 Audit Trail | — | — |

## Role Permission Summary

| Capability | Admin | Staff | Public |
|---|:---:|:---:|:---:|
| Manage user accounts | ✅ | ❌ | ❌ |
| Create/edit campaigns | ✅ | ✅ (draft only) | ❌ |
| Approve/reject campaigns | ✅ | ❌ | ❌ |
| Publish/distribute campaigns | ✅ | ❌ | ❌ |
| Use AI Content Assistant (text + TTS) | ✅ | ✅ | ❌ |
| Listen to AI voice announcements | ✅ | ✅ | ✅ |
| Send/manage notifications | ✅ | ✅ (approved campaigns) | Receive only |
| View analytics/reports | ✅ (full) | ✅ (assigned only) | ❌ |
| View audit trail | ✅ | ❌ | ❌ |
| Configure system settings / TTS keys | ✅ | ❌ | ❌ |
| Submit feedback / surveys | ❌ (reviews it) | ❌ (monitors it) | ✅ |
| View emergency info | ✅ | ✅ | ✅ |
