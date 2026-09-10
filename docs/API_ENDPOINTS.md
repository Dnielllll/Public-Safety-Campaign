# REST API Endpoint Reference (Laravel Sanctum)

Base URL: `/api`

## Auth (Process 1)
| Method | Endpoint | Role |
|---|---|---|
| POST | /auth/register | public |
| POST | /auth/login | all |
| POST | /auth/logout | authenticated |
| GET  | /auth/me | authenticated |
| POST | /auth/password/reset | admin (for staff/public), self |

## Users (Admin only — 1.2)
| Method | Endpoint |
|---|---|
| GET | /users |
| POST | /users |
| PUT | /users/{id} |
| PATCH | /users/{id}/activate |
| PATCH | /users/{id}/deactivate |
| DELETE | /users/{id} |

## Campaigns (Process 2 — 1.3 / 2.2)
| Method | Endpoint | Role |
|---|---|---|
| GET | /campaigns | admin, staff (own/assigned), public (published only) |
| POST | /campaigns | admin, staff |
| GET | /campaigns/{id} | all |
| PUT | /campaigns/{id} | admin, staff (own draft) |
| PATCH | /campaigns/{id}/archive | admin |
| DELETE | /campaigns/{id} | admin |

## Content + AI Assistant (Process 3 — 1.4/1.5, 2.3/2.4)
| Method | Endpoint | Role |
|---|---|---|
| GET | /campaigns/{id}/contents | admin, staff |
| POST | /campaigns/{id}/contents | admin, staff |
| PUT | /contents/{id} | admin, staff |
| DELETE | /contents/{id} | admin, staff |
| POST | /ai/generate-text | admin, staff |
| POST | /ai/rewrite | admin, staff |
| POST | /ai/text-to-speech | admin, staff — calls Google Cloud TTS |
| GET  | /campaigns/{id}/voice-announcement | public |

## Approval Workflow (Process 4 — 1.6 / 2.5)
| Method | Endpoint | Role |
|---|---|---|
| POST | /campaigns/{id}/submit | staff |
| GET | /approvals/pending | admin |
| POST | /campaigns/{id}/approve | admin |
| POST | /campaigns/{id}/reject | admin |

## Distribution (Process 5 — 1.7)
| Method | Endpoint | Role |
|---|---|---|
| POST | /campaigns/{id}/publish | admin |
| GET | /campaigns/{id}/channels | admin |

## Notifications (Process 6 — 1.8 / 2.6 / 3.4)
| Method | Endpoint | Role |
|---|---|---|
| GET | /notifications | authenticated (own) |
| POST | /notifications/send | admin, staff |
| POST | /notifications/{id}/resend | admin |
| PATCH | /notifications/{id}/read | authenticated |

## Engagement (Process 7)
| Method | Endpoint | Role |
|---|---|---|
| POST | /campaigns/{id}/engagement | public |
| GET | /campaigns/{id}/engagement/summary | admin, staff |

## Feedback & Surveys (Process 8 — 1.9 / 2.7 / 3.5 / 3.6)
| Method | Endpoint | Role |
|---|---|---|
| POST | /feedback | public |
| GET | /feedback | admin, staff |
| PATCH | /feedback/{id}/respond | admin |
| GET | /surveys | public, admin |
| POST | /surveys | admin |
| POST | /surveys/{id}/responses | public |

## Analytics & Reports (Process 9 & 10 — 1.10 / 2.8)
| Method | Endpoint | Role |
|---|---|---|
| GET | /reports/overview | admin |
| GET | /reports/campaigns/{id} | admin, staff (assigned) |
| GET | /reports/export | admin, staff (if authorized) |

## Audit Trail (Process 11 — 1.11)
| Method | Endpoint | Role |
|---|---|---|
| GET | /audit-logs | admin |

## System Settings (1.12)
| Method | Endpoint | Role |
|---|---|---|
| GET | /settings | admin |
| PUT | /settings | admin |

## Emergency Info (3.7)
| Method | Endpoint | Role |
|---|---|---|
| GET | /emergency-info | public |
