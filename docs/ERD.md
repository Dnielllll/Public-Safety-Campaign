# Entity Relationship Overview (Supabase / PostgreSQL)

```
users
├── id (uuid, pk)
├── name
├── email (unique)
├── password (hashed)
├── role            enum: admin | staff | public
├── phone
├── address
├── avatar_url
├── is_active       boolean
├── notif_prefs     jsonb
├── created_at / updated_at

campaigns
├── id (uuid, pk)
├── title
├── objectives      text
├── target_audience
├── category        enum: emergency | health | fire_safety | disaster_prep | crime_prevention | general
├── priority        enum: low | medium | high | critical
├── status          enum: draft | pending_approval | approved | rejected | published | archived
├── schedule_start / schedule_end
├── created_by (fk -> users.id)   -- staff or admin
├── approved_by (fk -> users.id, nullable)
├── created_at / updated_at

campaign_contents
├── id (uuid, pk)
├── campaign_id (fk -> campaigns.id)
├── type            enum: announcement | poster | infographic | video | advisory | voice_script
├── body_text
├── media_url
├── ai_generated    boolean
├── tts_audio_url   -- Google Cloud TTS output
├── created_by (fk -> users.id)
├── created_at / updated_at

campaign_approvals
├── id (uuid, pk)
├── campaign_id (fk -> campaigns.id)
├── reviewed_by (fk -> users.id)
├── decision        enum: approved | rejected | needs_revision
├── comments
├── created_at

distribution_channels
├── id (uuid, pk)
├── campaign_id (fk -> campaigns.id)
├── channel         enum: website | sms | email | facebook | mobile_app | voice_announcement
├── status          enum: pending | sent | failed
├── sent_at

notifications
├── id (uuid, pk)
├── campaign_id (fk -> campaigns.id)
├── user_id (fk -> users.id, nullable = broadcast)
├── channel
├── delivery_status enum: pending | delivered | failed
├── sent_at / read_at

engagement_logs
├── id (uuid, pk)
├── campaign_id (fk -> campaigns.id)
├── user_id (fk -> users.id, nullable)
├── action          enum: view | play_audio | reaction | share | comment
├── metadata        jsonb
├── created_at

feedback
├── id (uuid, pk)
├── campaign_id (fk -> campaigns.id, nullable)
├── user_id (fk -> users.id)
├── type            enum: comment | suggestion | complaint | concern
├── message
├── status          enum: new | reviewed | responded
├── responded_by (fk -> users.id, nullable)
├── response_text
├── created_at

surveys
├── id (uuid, pk)
├── campaign_id (fk -> campaigns.id)
├── title
├── questions       jsonb
├── is_active
├── created_at

survey_responses
├── id (uuid, pk)
├── survey_id (fk -> surveys.id)
├── user_id (fk -> users.id)
├── answers         jsonb
├── submitted_at

audit_logs
├── id (uuid, pk)
├── user_id (fk -> users.id)
├── action           -- e.g. "campaign.created", "user.deactivated"
├── entity_type
├── entity_id
├── ip_address
├── created_at

system_settings
├── id (pk)
├── key              -- e.g. "gcloud_tts_voice", "barangay_name"
├── value             jsonb
├── updated_by (fk -> users.id)
├── updated_at
```

### Relationships
- `users` 1—many `campaigns` (created_by)
- `campaigns` 1—many `campaign_contents`
- `campaigns` 1—many `campaign_approvals`
- `campaigns` 1—many `distribution_channels`
- `campaigns` 1—many `notifications`, `engagement_logs`, `feedback`, `surveys`
- `surveys` 1—many `survey_responses`
- `users` 1—many `audit_logs`
