import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertTriangle, FileText } from "lucide-react";
import { checkAuditTrailConsistency, performAuditTrailHealthCheck, generateAuditTrailReport } from "@/lib/auditTrailTester.js";

export default function AuditTrailTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('consistency');

  const handleConsistencyCheck = async () => {
    setLoading(true);
    try {
      const data = await checkAuditTrailConsistency();
      setResults({ type: 'consistency', data });
    } catch (error) {
      console.error('Consistency check failed:', error);
      setResults({ type: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    setLoading(true);
    try {
      const data = await performAuditTrailHealthCheck();
      setResults({ type: 'health', data });
    } catch (error) {
      console.error('Health check failed:', error);
      setResults({ type: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const data = await generateAuditTrailReport();
      setResults({ type: 'report', data });
    } catch (error) {
      console.error('Report generation failed:', error);
      setResults({ type: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getHealthBadge = (health) => {
    const colors = {
      excellent: 'bg-green-600 text-white',
      good: 'bg-blue-600 text-white',
      fair: 'bg-yellow-600 text-white',
      poor: 'bg-red-600 text-white'
    };
    return <Badge className={colors[health] || 'bg-gray-600 text-white'}>{health || 'Unknown'}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Trail Security Testing
          </CardTitle>
          <CardDescription>
            Test and verify audit trail consistency, IP logging, and data masking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button onClick={handleConsistencyCheck} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Check Consistency
            </Button>
            <Button onClick={handleHealthCheck} disabled={loading} variant="outline">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Health Check
            </Button>
            <Button onClick={handleGenerateReport} disabled={loading} variant="outline">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Generate Report
            </Button>
          </div>

          {results && (
            <div className="space-y-4">
              {results.type === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="text-red-600 mt-2">{results.error}</p>
                </div>
              )}

              {results.type === 'consistency' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-600">Total Logs</p>
                      <p className="text-2xl font-bold text-blue-800">{results.data.totalLogs}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-600">Logs with IP</p>
                      <p className="text-2xl font-bold text-green-800">{results.data.logsWithIP}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-600">Logs without IP</p>
                      <p className="text-2xl font-bold text-red-800">{results.data.logsWithoutIP}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <p className="text-sm text-purple-600">IP Consistency</p>
                      <p className="text-2xl font-bold text-purple-800">{results.data.ipConsistencyPercentage}%</p>
                    </div>
                  </div>

                  {results.data.issues && results.data.issues.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">Issues Found</h4>
                      <ul className="space-y-2">
                        {results.data.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-yellow-700">
                            <Badge variant="outline" className="mr-2">{issue.severity}</Badge>
                            {issue.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.data.recommendations && results.data.recommendations.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Recommendations</h4>
                      <ul className="space-y-2">
                        {results.data.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-blue-700">
                            <Badge variant="outline" className="mr-2">{rec.priority}</Badge>
                            {rec.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {results.type === 'health' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Overall Health:</span>
                    {getHealthBadge(results.data.overallHealth)}
                  </div>

                  {results.data.consistency && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600">Total Logs</p>
                        <p className="text-2xl font-bold text-blue-800">{results.data.consistency.totalLogs}</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600">Recent IP Consistency</p>
                        <p className="text-2xl font-bold text-green-800">{results.data.consistency.recentIPConsistencyPercentage}%</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-purple-600">Recent Logs</p>
                        <p className="text-2xl font-bold text-purple-800">{results.data.consistency.recentLogsCount}</p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-sm text-orange-600">Issues Found</p>
                        <p className="text-2xl font-bold text-orange-800">{results.data.consistency.issues?.length || 0}</p>
                      </div>
                    </div>
                  )}

                  {results.data.testLogging && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">Test Logging Results</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {results.data.testLogging.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm">Log Created: {results.data.testLogging.logCreated ? 'Yes' : 'No'}</span>
                        </div>
                        {results.data.testLogging.verification && (
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-2">
                              {results.data.testLogging.verification.hasIP ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-600" />
                              )}
                              <span>IP Address Logged</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {results.data.testLogging.verification.hasUserAgent ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-600" />
                              )}
                              <span>User Agent Logged</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {results.data.testLogging.verification.hasTimestamp ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-600" />
                              )}
                              <span>Timestamp Logged</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {results.type === 'report' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">Audit Trail Report</h4>
                    <div className="text-sm space-y-2">
                      <p><strong>Generated:</strong> {new Date(results.data.generatedAt).toLocaleString()}</p>
                      <p><strong>Status:</strong> {results.data.summary.status}</p>
                      <p><strong>Overall Health:</strong> {getHealthBadge(results.data.summary.overallHealth)}</p>
                      <p><strong>Total Logs:</strong> {results.data.summary.totalLogs}</p>
                      <p><strong>IP Consistency:</strong> {results.data.summary.ipConsistency}%</p>
                    </div>
                  </div>

                  {results.data.issues && results.data.issues.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">Issues ({results.data.issues.length})</h4>
                      <ul className="space-y-2">
                        {results.data.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-yellow-700">
                            <Badge variant="outline" className="mr-2">{issue.severity}</Badge>
                            {issue.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.data.recommendations && results.data.recommendations.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Recommendations ({results.data.recommendations.length})</h4>
                      <ul className="space-y-2">
                        {results.data.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-blue-700">
                            <Badge variant="outline" className="mr-2">{rec.priority}</Badge>
                            {rec.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}