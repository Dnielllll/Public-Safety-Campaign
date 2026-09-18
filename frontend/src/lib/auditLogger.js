import { supabase } from "./supabase.js";

/**
 * Centralized Audit Logging Utility
 * Provides secure, consistent audit trail logging with IP capture, data masking, and server-side validation
 */

// IP Address Capture
const getClientIP = async () => {
  try {
    // Try multiple IP detection services for reliability
    const services = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://api.ip.sb/geoip'
    ];

    for (const service of services) {
      try {
        const response = await fetch(service);
        if (response.ok) {
          const data = await response.json();
          return data.ip || data.ip_address || 'Unknown';
        }
      } catch (error) {
        console.warn(`Failed to get IP from ${service}:`, error);
        continue;
      }
    }

    // Fallback to local detection
    return 'Local/Unknown';
  } catch (error) {
    console.error('Failed to get client IP:', error);
    return 'Unknown';
  }
};

// Data Masking Functions
const maskEmail = (email) => {
  if (!email) return 'Unknown';
  const [name, domain] = email.split('@');
  if (!name || !domain) return 'Unknown';
  
  // Show first 2 characters and mask the rest
  const maskedName = name.length > 2 
    ? name.substring(0, 2) + '*'.repeat(name.length - 2)
    : name;
  
  return `${maskedName}@${domain}`;
};

const maskPhone = (phone) => {
  if (!phone) return 'Unknown';
  // Show last 4 digits only
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return '***';
  return '*'.repeat(cleaned.length - 4) + cleaned.substring(cleaned.length - 4);
};

const maskAddress = (address) => {
  if (!address) return 'Unknown';
  // Show first part and mask the rest
  const parts = address.split(',');
  if (parts.length > 1) {
    return parts[0] + ', ***';
  }
  return address.substring(0, 10) + '...';
};

// Enhanced data masking for comprehensive protection
const maskSensitiveData = (data) => {
  if (!data) return data;
  
  // Handle objects
  if (typeof data === 'object' && data !== null) {
    const masked = { ...data };
    
    // Mask email fields
    if (masked.email) {
      masked.email = maskEmail(masked.email);
    }
    
    // Mask phone fields
    if (masked.phone) {
      masked.phone = maskPhone(masked.phone);
    }
    
    // Mask address fields
    if (masked.address) {
      masked.address = maskAddress(masked.address);
    }
    
    // Mask any field containing sensitive keywords
    Object.keys(masked).forEach(key => {
      if (key.toLowerCase().includes('password') || 
          key.toLowerCase().includes('secret') ||
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('key')) {
        masked[key] = '***MASKED***';
      }
    });
    
    return masked;
  }
  
  // Handle strings - check if they look like emails
  if (typeof data === 'string' && data.includes('@')) {
    return maskEmail(data);
  }
  
  return data;
};

// Minimal Metadata Templates
const getMinimalMetadata = (action, userData, additionalData = {}) => {
  const baseData = {
    user_id: userData.id,
    timestamp: new Date().toISOString()
  };

  switch (action) {
    case 'user.login':
      return {
        ...baseData,
        email: maskEmail(userData.email),
        role: userData.role
      };
    
    case 'user.logout':
      return {
        ...baseData,
        session_duration: additionalData.session_duration || 'Unknown'
      };
    
    case 'user.created':
    case 'user.updated':
    case 'user.deleted':
      return {
        ...baseData,
        target_user_id: additionalData.target_user_id,
        email: maskEmail(additionalData.email || userData.email)
      };
    
    case 'campaign.created':
    case 'campaign.updated':
    case 'campaign.deleted':
    case 'campaign.published':
      return {
        ...baseData,
        campaign_id: additionalData.campaign_id,
        campaign_name: additionalData.campaign_name
      };
    
    case 'content.created':
    case 'content.updated':
    case 'content.deleted':
      return {
        ...baseData,
        content_id: additionalData.content_id,
        content_type: additionalData.content_type
      };
    
    case 'settings.updated':
      return {
        ...baseData,
        setting_category: additionalData.setting_category
      };
    
    default:
      // Apply comprehensive data masking to additional data
      return {
        ...baseData,
        ...maskSensitiveData(additionalData)
      };
  }
};

// Server-side validation placeholder
// In production, this would call a database function to validate user data
const validateUserData = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, name, is_active')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Failed to validate user data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error validating user data:', error);
    return null;
  }
};

// Main Audit Logging Function
export const logAuditEvent = async (action, entity, userId, additionalData = {}) => {
  try {
    // Get validated user data
    const userData = await validateUserData(userId);
    if (!userData) {
      console.error('User validation failed for audit logging');
      return;
    }

    // Get client IP address
    const ipAddress = await getClientIP();

    // Get minimal metadata
    const metadata = getMinimalMetadata(action, userData, additionalData);

    // Insert into audit trail
    const { error } = await supabase.from('audit_trail').insert({
      actor: userData.name || userData.email,
      action: action,
      entity: entity,
      user_id: userId,
      timestamp: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: navigator.userAgent,
      metadata: metadata,
      success: true,
      entity_id: additionalData.entity_id,
      old_values: additionalData.old_values,
      new_values: additionalData.new_values
    });

    if (error) {
      console.error('Failed to log audit event:', error);
      throw error;
    }

    console.log(`Audit event logged: ${action} by ${userData.email} from ${ipAddress}`);
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't throw error to avoid blocking operations
    // In production, you might want to implement retry logic or fallback logging
  }
};

// Bulk audit logging for multiple events
export const logBulkAuditEvents = async (events) => {
  try {
    const ipAddress = await getClientIP();
    
    const auditRecords = await Promise.all(
      events.map(async (event) => {
        const userData = await validateUserData(event.userId);
        if (!userData) return null;

        const metadata = getMinimalMetadata(event.action, userData, event.additionalData);

        return {
          actor: userData.name || userData.email,
          action: event.action,
          entity: event.entity,
          user_id: event.userId,
          timestamp: new Date().toISOString(),
          ip_address: ipAddress,
          user_agent: navigator.userAgent,
          metadata: metadata,
          success: true,
          entity_id: event.additionalData?.entity_id,
          old_values: event.additionalData?.old_values,
          new_values: event.additionalData?.new_values
        };
      })
    );

    const validRecords = auditRecords.filter(record => record !== null);

    const { error } = await supabase.from('audit_trail').insert(validRecords);

    if (error) {
      console.error('Failed to log bulk audit events:', error);
      throw error;
    }

    console.log(`Bulk audit events logged: ${validRecords.length} events`);
  } catch (error) {
    console.error('Bulk audit logging failed:', error);
  }
};

// Export utility functions for use in other components
export const auditUtils = {
  getClientIP,
  maskEmail,
  maskPhone,
  maskAddress,
  maskSensitiveData,
  getMinimalMetadata,
  validateUserData
};