# API Reference - Barangay 178 Safety Campaign Management System

## Architecture Overview

This system uses **Supabase** as the primary backend, providing:
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Secure user authentication with OTP
- **Real-time**: Live data synchronization
- **Storage**: File and media management
- **Edge Functions**: Server-side logic when needed

**Base URL**: Your Supabase Project URL
**Client Library**: `@supabase/supabase-js`

---

## Authentication Endpoints

### User Registration
```javascript
// Public user registration
supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      name: 'John Doe',
      phone: '1234567890',
      address: 'Address',
      role: 'citizen'
    }
  }
})
```

### User Login
```javascript
// Direct login (admin users)
supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'password123'
})

// OTP-based login (staff & public users)
// 1. Send OTP via EmailJS
// 2. Verify OTP + password
```

### User Logout
```javascript
supabase.auth.signOut()
```

### Session Management
```javascript
// Get current session
supabase.auth.getSession()

// Get current user
supabase.auth.getUser()

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session)
})
```

---

## Database RPC Functions

### User Management RPCs

#### create_user_by_admin
**Purpose**: Secure user creation by admin (bypasses auth restrictions)
```javascript
supabase.rpc('create_user_by_admin', {
  p_email: 'user@example.com',
  p_password: 'password123',
  p_name: 'John Doe',
  p_role: 'staff',
  p_phone: '1234567890',
  p_address: 'Address',
  p_allowed_modules: ['campaign_management', 'content_management']
})
```

#### delete_user_by_admin
**Purpose**: Secure user deletion with cleanup
```javascript
supabase.rpc('delete_user_by_admin', {
  p_user_id: 'uuid-here'
})
```

#### verify_user_password
**Purpose**: Verify user password for sensitive operations
```javascript
supabase.rpc('verify_user_password', {
  password: 'current-password'
})
```

---

## Table Operations

### Users Table
```javascript
// Get all users (admin only)
supabase.from('users').select('*')

// Get user by ID
supabase.from('users').select('*').eq('id', 'user-id')

// Update user
supabase.from('users').update({
  name: 'Updated Name',
  role: 'admin'
}).eq('id', 'user-id')

// Get users by role
supabase.from('users').select('*').in('role', ['admin', 'staff'])
```

### Campaigns Table
```javascript
// Get all campaigns
supabase.from('campaigns').select('*')

// Get published campaigns (public view)
supabase.from('campaigns').select('*').eq('status', 'published')

// Create campaign
supabase.from('campaigns').insert({
  title: 'Safety Campaign',
  content: 'Campaign content',
  status: 'draft',
  created_by: 'user-id'
})

// Update campaign
supabase.from('campaigns').update({
  status: 'published'
}).eq('id', 'campaign-id')

// Get campaigns by creator
supabase.from('campaigns').select('*').eq('created_by', 'user-id')
```

### Notifications Table
```javascript
// Get user notifications
supabase.from('notifications').select('*').eq('recipient_id', 'user-id')

// Create notification
supabase.from('notifications').insert({
  recipient_id: 'user-id',
  title: 'New Campaign',
  message: 'A new safety campaign is available',
  type: 'campaign'
})

// Mark as read
supabase.from('notifications').update({
  read: true
}).eq('id', 'notification-id')

// Get unread count
supabase.from('notifications').select('*', { count: 'exact' })
  .eq('recipient_id', 'user-id')
  .eq('read', false)
```

### Feedback Table
```javascript
// Submit feedback
supabase.from('feedback').insert({
  user_id: 'user-id',
  content: 'Feedback message',
  category: 'safety',
  rating: 5
})

// Get all feedback (admin/staff)
supabase.from('feedback').select('*')

// Respond to feedback
supabase.from('feedback').update({
  response: 'Admin response',
  responded_by: 'admin-id',
  responded_at: new Date().toISOString()
}).eq('id', 'feedback-id')
```

### Audit Trail Table
```javascript
// Log audit event
supabase.from('audit_trail').insert({
  actor: 'User Name',
  action: 'user.login',
  entity: 'Authentication',
  user_id: 'user-id',
  timestamp: new Date().toISOString(),
  metadata: {
    ip_address: '192.168.1.1',
    user_agent: 'Browser info'
  }
})

// Get audit logs (admin only)
supabase.from('audit_trail').select('*')
  .order('timestamp', { ascending: false })
  .limit(100)

// Get user activity
supabase.from('audit_trail').select('*')
  .eq('user_id', 'user-id')
  .order('timestamp', { ascending: false })
```

### System Settings Table
```javascript
// Get system settings
supabase.from('system_settings').select('*').single()

// Update settings
supabase.from('system_settings').update({
  auth_settings: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true
  },
  ai_settings: {
    defaultVoice: 'en-US-Wavenet-A',
    speakingRate: '1.0',
    autoGenerateVoice: true
  }
}).eq('id', 1)
```

---

## Real-time Subscriptions

### Real-time User Updates
```javascript
// Subscribe to user changes
supabase
  .channel('user-changes')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'users' 
  }, (payload) => {
    console.log('User changed:', payload)
  })
  .subscribe()
```

### Real-time Campaign Updates
```javascript
// Subscribe to campaign changes
supabase
  .channel('campaign-changes')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'campaigns',
    filter: 'status=eq.published'
  }, (payload) => {
    console.log('New campaign published:', payload)
  })
  .subscribe()
```

### Real-time Notifications
```javascript
// Subscribe to new notifications
supabase
  .channel('notifications')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'notifications',
    filter: `recipient_id=eq.${userId}`
  }, (payload) => {
    console.log('New notification:', payload)
  })
  .subscribe()
```

---

## AI Service Integration

### Google Cloud Text-to-Speech
```javascript
// Text-to-Speech conversion
// (Called from frontend via AI helper functions)
const generateVoice = async (text, voiceSettings) => {
  // Integration with Google Cloud TTS API
  // Returns audio file URL or base64 audio
}
```

### AI Content Generation
```javascript
// AI-powered content generation
// (Uses AI service for campaign content)
const generateContent = async (prompt, type) => {
  // Integration with AI service
  // Returns generated text content
}
```

---

## External Services

### EmailJS (OTP & Notifications)
```javascript
// Send OTP via EmailJS
emailjs.send(
  'service_id',
  'template_id',
  {
    to_email: 'user@example.com',
    otp_code: '123456',
    expiry_minutes: 3
  },
  'public_key'
)
```

### Google Cloud TTS
```javascript
// Generate voice from text
// Requires service account authentication
const textToSpeech = async (text, voice, speakingRate) => {
  // Google Cloud TTS API call
  // Returns audio content
}
```

---

## Storage Operations

### File Upload
```javascript
// Upload campaign images
supabase.storage.from('campaigns').upload('path/to/file.jpg', file)

// Upload voice files
supabase.storage.from('voice-announcements').upload('path/to/audio.mp3', audioFile)
```

### File Download
```javascript
// Get public URL
supabase.storage.from('campaigns').getPublicUrl('path/to/file.jpg')

// Download file
supabase.storage.from('campaigns').download('path/to/file.jpg')
```

---

## Error Handling

### Standard Error Response
```javascript
try {
  const { data, error } = await supabase.from('users').select('*')
  if (error) throw error
} catch (error) {
  console.error('Supabase error:', error.message)
  // Handle error appropriately
}
```

### Common Error Codes
- `PGRST116`: No rows returned
- `23505`: Unique constraint violation
- `23503`: Foreign key constraint violation
- `42501`: Insufficient privilege (RLS violation)
- `PGRST301`: Not found

---

## Security Considerations

### Row Level Security (RLS)
- All tables have RLS policies enabled
- Users can only access data based on their role
- Admin users have broader access
- Public users have read-only access to published content

### Authentication Security
- OTP-based authentication for staff and public users
- 3-minute OTP validity with automatic cleanup
- 3-minute bypass grace period after logout
- Secure session management with timeout

### Data Security
- Encrypted password storage via Supabase Auth
- Secure RPC functions for sensitive operations
- Audit trail for all system activities
- No plaintext sensitive data in database

---

## Rate Limiting & Performance

### Supabase Limits
- Free tier: 500MB database, 1GB bandwidth, 2 API calls/second
- Pro tier: Higher limits and dedicated resources
- Consider implementing client-side rate limiting for heavy operations

### Optimization Tips
- Use select with specific columns instead of `*`
- Implement pagination for large datasets
- Use real-time subscriptions efficiently
- Cache frequently accessed data
- Optimize database queries with proper indexes

---

## API Versioning

Current Version: **1.0.0**

Breaking changes will be documented in:
- Migration guides
- Updated documentation
- Version-specific endpoints (if needed)

---

## Testing & Development

### Local Development
```javascript
// Use local Supabase instance or development project
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Testing RPC Functions
```javascript
// Test RPC functions in Supabase SQL Editor
SELECT public.create_user_by_admin(
  'test@example.com',
  'password123',
  'Test User',
  'staff',
  '1234567890',
  'Test Address',
  ARRAY['campaign_management']
)
```

---

## Support & Troubleshooting

### Common Issues
1. **Authentication Errors**: Check OTP configuration and email delivery
2. **RPC Function Not Found**: Run corresponding SQL script in Supabase
3. **RLS Violations**: Verify user role and table policies
4. **Real-time Not Working**: Check channel subscription and permissions

### Debug Mode
```javascript
// Enable Supabase debug mode
supabase = createClient(
  url,
  key,
  {
    auth: {
      debug: true
    }
  }
)
```

---

**Last Updated**: 2026-09-18  
**System Version**: 1.0.0  
**Backend**: Supabase (PostgreSQL)  
**Authentication**: Supabase Auth with OTP