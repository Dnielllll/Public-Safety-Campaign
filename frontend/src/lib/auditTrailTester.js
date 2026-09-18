import { supabase } from "./supabase.js";

/**
 * Audit Trail Consistency Testing Utility
 * Provides functions to test and verify audit trail consistency across all operations
 */

/**
 * Check audit trail consistency by analyzing recent logs
 */
export const checkAuditTrailConsistency = async () => {
  try {
    const { data, error } = await supabase
      .from('audit_trail')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('timestamp', { ascending: false });

    if (error) throw error;

    const logs = data || [];
    const totalLogs = logs.length;
    
    // Analyze IP address consistency
    const logsWithIP = logs.filter(log => 
      log.ip_address && 
      log.ip_address !== 'N/A' && 
      log.ip_address !== 'Unknown' &&
      log.ip_address !== 'Local/Unknown'
    );
    
    const logsWithoutIP = logs.filter(log => 
      !log.ip_address || 
      log.ip_address === 'N/A' || 
      log.ip_address === 'Unknown' ||
      log.ip_address === 'Local/Unknown'
    );
    
    // Analyze user agent consistency
    const logsWithUserAgent = logs.filter(log => 
      log.user_agent && 
      log.user_agent !== 'Unknown'
    );
    
    const logsWithoutUserAgent = logs.filter(log => 
      !log.user_agent || 
      log.user_agent === 'Unknown'
    );
    
    // Analyze action distribution
    const actionDistribution = {};
    logs.forEach(log => {
      actionDistribution[log.action] = (actionDistribution[log.action] || 0) + 1;
    });
    
    // Analyze recent logs (last 7 days) for better consistency metrics
    const recentLogs = logs.filter(log => 
      new Date(log.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    const recentLogsWithIP = recentLogs.filter(log => 
      log.ip_address && 
      log.ip_address !== 'N/A' && 
      log.ip_address !== 'Unknown' &&
      log.ip_address !== 'Local/Unknown'
    );
    
    const recentIPConsistency = recentLogs.length > 0 
      ? ((recentLogsWithIP.length / recentLogs.length) * 100).toFixed(2)
      : 0;

    return {
      totalLogs,
      logsWithIP: logsWithIP.length,
      logsWithoutIP: logsWithoutIP.length,
      logsWithUserAgent: logsWithUserAgent.length,
      logsWithoutUserAgent: logsWithoutUserAgent.length,
      ipConsistencyPercentage: totalLogs > 0 
        ? ((logsWithIP.length / totalLogs) * 100).toFixed(2)
        : 0,
      recentIPConsistencyPercentage: recentIPConsistency,
      recentLogsCount: recentLogs.length,
      actionDistribution,
      issues: identifyAuditIssues(logs),
      recommendations: generateRecommendations({
        totalLogs,
        logsWithIP: logsWithIP.length,
        logsWithoutIP: logsWithoutIP.length,
        recentIPConsistency
      })
    };
  } catch (error) {
    console.error('Error checking audit trail consistency:', error);
    return {
      error: error.message,
      status: 'failed'
    };
  }
};

/**
 * Identify potential issues in audit trail data
 */
const identifyAuditIssues = (logs) => {
  const issues = [];
  
  // Check for missing required fields
  const logsMissingActor = logs.filter(log => !log.actor || log.actor === 'Unknown');
  if (logsMissingActor.length > 0) {
    issues.push({
      type: 'missing_actor',
      count: logsMissingActor.length,
      severity: 'high',
      message: `${logsMissingActor.length} logs missing actor information`
    });
  }
  
  const logsMissingAction = logs.filter(log => !log.action || log.action === 'unknown');
  if (logsMissingAction.length > 0) {
    issues.push({
      type: 'missing_action',
      count: logsMissingAction.length,
      severity: 'high',
      message: `${logsMissingAction.length} logs missing action information`
    });
  }
  
  const logsMissingTimestamp = logs.filter(log => !log.timestamp);
  if (logsMissingTimestamp.length > 0) {
    issues.push({
      type: 'missing_timestamp',
      count: logsMissingTimestamp.length,
      severity: 'high',
      message: `${logsMissingTimestamp.length} logs missing timestamp`
    });
  }
  
  // Check for IP address issues
  const logsWithNA = logs.filter(log => log.ip_address === 'N/A');
  if (logsWithNA.length > 0) {
    issues.push({
      type: 'ip_address_na',
      count: logsWithNA.length,
      severity: 'medium',
      message: `${logsWithNA.length} logs have IP address set to 'N/A'`
    });
  }
  
  // Check for suspicious patterns
  const uniqueIPs = new Set(logs.map(log => log.ip_address).filter(Boolean));
  const singleUserMultipleIPs = {};
  
  logs.forEach(log => {
    if (log.user_id && log.ip_address && log.ip_address !== 'N/A' && log.ip_address !== 'Unknown') {
      if (!singleUserMultipleIPs[log.user_id]) {
        singleUserMultipleIPs[log.user_id] = new Set();
      }
      singleUserMultipleIPs[log.user_id].add(log.ip_address);
    }
  });
  
  Object.entries(singleUserMultipleIPs).forEach(([userId, ips]) => {
    if (ips.size > 5) { // More than 5 different IPs in 30 days might be suspicious
      issues.push({
        type: 'multiple_ips',
        user_id: userId,
        ip_count: ips.size,
        severity: 'low',
        message: `User ${userId} has ${ips.size} different IP addresses`
      });
    }
  });
  
  return issues;
};

/**
 * Generate recommendations based on audit trail analysis
 */
const generateRecommendations = (metrics) => {
  const recommendations = [];
  
  // IP address consistency recommendations
  if (metrics.recentIPConsistency < 80) {
    recommendations.push({
      priority: 'high',
      category: 'IP Address Logging',
      message: `IP address consistency is ${metrics.recentIPConsistency}%. Implement real IP address capture for all operations.`,
      action: 'Use centralized audit logging utility with getClientIP() function'
    });
  } else if (metrics.recentIPConsistency < 95) {
    recommendations.push({
      priority: 'medium',
      category: 'IP Address Logging',
      message: `IP address consistency is ${metrics.recentIPConsistency}%. Some operations may not be capturing IP addresses correctly.`,
      action: 'Review operations with missing IP addresses and update to use centralized logging'
    });
  }
  
  // Missing IP addresses
  if (metrics.logsWithoutIP > 0) {
    recommendations.push({
      priority: 'high',
      category: 'Data Completeness',
      message: `${metrics.logsWithoutIP} logs are missing IP address information.`,
      action: 'Update all admin operations to use centralized audit logging'
    });
  }
  
  // General recommendations
  if (metrics.totalLogs < 100) {
    recommendations.push({
      priority: 'low',
      category: 'Audit Coverage',
      message: 'Audit trail has limited data. Ensure all critical operations are being logged.',
      action: 'Add audit logging to all user management, campaign, and settings operations'
    });
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'success',
      category: 'Overall Status',
      message: 'Audit trail consistency is good. Continue using centralized logging.',
      action: 'Monitor regularly and maintain current standards'
    });
  }
  
  return recommendations;
};

/**
 * Test specific audit event logging
 */
export const testAuditEvent = async (action, entity, userId, testData = {}) => {
  try {
    const { logAuditEvent } = await import('./auditLogger.js');
    
    const testResult = await logAuditEvent(action, entity, userId, testData);
    
    // Verify the log was created
    const { data: recentLogs, error } = await supabase
      .from('audit_trail')
      .select('*')
      .eq('action', action)
      .eq('entity', entity)
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    const log = recentLogs && recentLogs[0];
    
    return {
      success: true,
      logCreated: !!log,
      logData: log,
      testMetadata: {
        action,
        entity,
        userId,
        testData
      },
      verification: {
        hasIP: log && log.ip_address && log.ip_address !== 'N/A' && log.ip_address !== 'Unknown',
        hasUserAgent: log && log.user_agent && log.user_agent !== 'Unknown',
        hasTimestamp: log && !!log.timestamp,
        hasActor: log && !!log.actor
      }
    };
  } catch (error) {
    console.error('Audit event test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Comprehensive audit trail health check
 */
export const performAuditTrailHealthCheck = async () => {
  try {
    console.log('Starting audit trail health check...');
    
    const consistency = await checkAuditTrailConsistency();
    
    if (consistency.error) {
      return {
        status: 'failed',
        error: consistency.error
      };
    }
    
    // Test current user's audit logging
    const { user } = await supabase.auth.getUser();
    if (user?.user) {
      const testResult = await testAuditEvent('system.test', 'Health Check', user.user.id, {
        test_type: 'audit_trail_health_check',
        timestamp: new Date().toISOString()
      });
      
      return {
        status: 'completed',
        consistency,
        testLogging: testResult,
        overallHealth: determineOverallHealth(consistency, testResult)
      };
    }
    
    return {
      status: 'completed',
      consistency,
      overallHealth: determineOverallHealth(consistency, null)
    };
  } catch (error) {
    console.error('Audit trail health check failed:', error);
    return {
      status: 'failed',
      error: error.message
    };
  }
};

/**
 * Determine overall health status
 */
const determineOverallHealth = (consistency, testResult) => {
  const ipConsistency = parseFloat(consistency.recentIPConsistencyPercentage || 0);
  const issuesCount = consistency.issues?.length || 0;
  
  if (ipConsistency >= 95 && issuesCount === 0) {
    return 'excellent';
  } else if (ipConsistency >= 80 && issuesCount <= 2) {
    return 'good';
  } else if (ipConsistency >= 60 && issuesCount <= 5) {
    return 'fair';
  } else {
    return 'poor';
  }
};

/**
 * Generate audit trail report
 */
export const generateAuditTrailReport = async () => {
  const healthCheck = await performAuditTrailHealthCheck();
  
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      status: healthCheck.status,
      overallHealth: healthCheck.overallHealth,
      totalLogs: healthCheck.consistency?.totalLogs || 0,
      ipConsistency: healthCheck.consistency?.recentIPConsistencyPercentage || 0
    },
    details: healthCheck.consistency,
    issues: healthCheck.consistency?.issues || [],
    recommendations: healthCheck.consistency?.recommendations || [],
    testResults: healthCheck.testLogging
  };
};