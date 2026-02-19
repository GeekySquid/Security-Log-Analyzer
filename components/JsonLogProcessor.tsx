'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, Shield, AlertTriangle, CheckCircle, Brain, Activity, Eye, X, Download } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

interface AnalysisResult {
  fileName: string;
  totalRecords: number;
  normalData: any[];
  anomalousData: any[];
  maliciousData: any[];
  predictions: {
    normal: number;
    anomalous: number;
    malicious: number;
  };
  precautions: string[];
  confidence: number;
}

interface RecordDetails {
  id: string;
  timestamp: string;
  source: string;
  destination: string;
  action: string;
  user: string;
  status: string;
  severity: string;
  type: string;
  rawData: any;
  predictions: {
    attackType: string;
    riskLevel: string;
    confidence: string;
    indicators: string[];
    mitreTactics?: string[];
    threatCategory?: string;
  };
  prevention: {
    immediate: string[];
    longTerm: string[];
  };
  precautions: string[];
  geminiInsights?: {
    reasoning: string;
    falsePositiveLikelihood: string;
    threatSurface: any;
    riskScore: number;
  } | null;
  _threatAnalysis?: {
    authentication: string[];
    networkAccess: string[];
    privilegeUse: string[];
    assetExposure: string[];
    defenseEvasion: string[];
    dataExfiltration: string[];
  };
}

interface JsonLogProcessorProps {
  onBack?: () => void;
}

export default function JsonLogProcessor({ onBack }: JsonLogProcessorProps = {}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<RecordDetails | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type - now supports both JSON and EVTX
    const isJsonFile = file.name.toLowerCase().endsWith('.json');
    const isEvtxFile = file.name.toLowerCase().endsWith('.evtx');
    
    if (!isJsonFile && !isEvtxFile) {
      setError('Please select a JSON or EVTX file');
      return;
    }

    // Validate file size
    const maxSize = isEvtxFile ? 100 * 1024 * 1024 : 1024 * 1024 * 1024; // 100MB for EVTX, 1GB for JSON
    if (file.size > maxSize) {
      setError(`File size must be less than ${isEvtxFile ? '100MB' : '1GB'}`);
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Choose appropriate endpoint based on file type
      const endpoint = isEvtxFile ? '/api/analyze-evtx' : '/api/analyze-json';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Analysis failed');
      }

      const result = await response.json();
      
      if (!result.success || !result.analysis) {
        throw new Error(result.error || 'Analysis failed');
      }
      
      setAnalysisResult(result.analysis);

      // Add to uploaded files list with file type info
      const newFile = {
        id: Date.now(),
        name: file.name,
        size: file.size,
        type: isEvtxFile ? 'EVTX' : 'JSON',
        uploadedAt: new Date(),
        status: 'processed',
        analysis: result.analysis,
        conversionInfo: result.conversion_info || null
      };
      setUploadedFiles(prev => [newFile, ...prev]);

      // Show success message for EVTX files
      if (isEvtxFile && result.conversion_info) {
        console.log(`Successfully converted ${result.conversion_info.events_converted || 'unknown'} EVTX events to JSON format`);
      }

    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze file. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getRecordType = (record: any) => {
    // Determine if record is normal, anomalous, or malicious
    if (analysisResult?.maliciousData.includes(record)) return 'malicious';
    if (analysisResult?.anomalousData.includes(record)) return 'anomalous';
    return 'normal';
  };

  const getRecordDetails = (record: any, index: number) => {
    const recordType = getRecordType(record);
    const geminiAnalysis = record._gemini_analysis;

    const baseDetails = {
      id: (index + 1).toString(),
      timestamp: record.timestamp || record.time || record.date || new Date().toISOString(),
      source: String(record.ip_address || record.source || record.src || record.origin || 'Unknown'),
      destination: String(record.destination || record.dest || record.target || record.external_server || 'Internal'),
      action: String(record.action || record.event || record.type || 'Unknown'),
      user: String(record.user || record.username || record.email || 'Unknown'),
      status: String(record.status || 'Unknown'),
      severity: geminiAnalysis?.severity || (recordType === 'malicious' ? 'High' : recordType === 'anomalous' ? 'Medium' : 'Low'),
      type: recordType,
      rawData: record
    };

    // Enhanced threat details from Gemini analysis
    const threatDetails = {
      predictions: {
        attackType: geminiAnalysis?.threat_type || (recordType === 'malicious' ?
          (record.action === 'sql_injection' ? 'SQL Injection Attack' :
            record.action === 'script_execution' ? 'Malicious Script Execution' :
              record.command && record.command.includes('rm -rf') ? 'System File Deletion' :
                record.attempts && record.attempts > 10 ? 'Brute Force Attack' :
                  'Potential Security Breach') :
          recordType === 'anomalous' ?
            (record.status === 'failed' ? 'Authentication Failure' :
              record.status === 'denied' ? 'Unauthorized Access Attempt' :
                record.data_size && parseFloat(record.data_size) > 1 ? 'Large Data Transfer' :
                  'Suspicious Activity') :
            'Normal Activity'),
        riskLevel: geminiAnalysis?.severity || (recordType === 'malicious' ? 'Critical' :
          recordType === 'anomalous' ? 'Medium' : 'Low'),
        confidence: geminiAnalysis?.confidence ? `${geminiAnalysis.confidence}%` : (recordType === 'malicious' ? '90-95%' :
          recordType === 'anomalous' ? '75-85%' : '95-99%'),
        indicators: geminiAnalysis?.indicators?.iocs?.concat(geminiAnalysis?.indicators?.behavioral || []) ||
          (recordType === 'malicious' ?
            [
              record.query && record.query.includes('DROP TABLE') ? 'SQL injection patterns detected' : 'Malicious code patterns',
              record.command && record.command.includes('rm -rf') ? 'Destructive system commands' : 'Suspicious commands',
              record.attempts && record.attempts > 10 ? 'Multiple failed attempts' : 'Unusual access patterns',
              record.ip_address && !record.ip_address.startsWith('192.168') ? 'External IP address' : 'Privilege escalation'
            ].filter(Boolean) :
            recordType === 'anomalous' ?
              [
                record.status === 'failed' ? 'Authentication failures' : 'Access anomalies',
                record.status === 'denied' ? 'Permission violations' : 'Irregular patterns',
                record.file_path === '/etc/passwd' ? 'Sensitive file access' : 'Unusual file access',
                record.data_size ? 'Large data volumes' : 'Timing anomalies'
              ].filter(Boolean) :
              ['Standard operations', 'Expected patterns', 'Normal user activity']),
        mitreTactics: geminiAnalysis?.mitre_tactics || [],
        threatCategory: geminiAnalysis?.threat_category || 'Other'
      },
      prevention: {
        immediate: geminiAnalysis?.response?.immediate || (recordType === 'malicious' ?
          [
            record.action === 'sql_injection' ? 'Block source IP and sanitize inputs' : 'Block source IP immediately',
            record.command ? 'Isolate system and check for damage' : 'Isolate affected systems',
            'Enable enhanced monitoring and logging',
            record.user !== 'unknown' ? `Suspend user account: ${record.user}` : 'Review user permissions'
          ].filter(Boolean) :
          recordType === 'anomalous' ?
            [
              record.status === 'failed' ? 'Monitor for additional failed attempts' : 'Increase monitoring frequency',
              record.file_path ? 'Review file access permissions' : 'Verify user identity',
              record.data_size ? 'Investigate data transfer legitimacy' : 'Check system integrity',
              'Document incident for analysis'
            ].filter(Boolean) :
            ['Continue normal monitoring', 'Maintain current security posture']),
        longTerm: geminiAnalysis?.response?.long_term || (recordType === 'malicious' ?
          [
            'Update firewall rules and WAF policies',
            'Implement additional access controls',
            'Conduct comprehensive security audit',
            'Update incident response procedures',
            'Enhance user training on security'
          ] :
          recordType === 'anomalous' ?
            [
              'Review and update access policies',
              'Implement additional monitoring rules',
              'Conduct user security training',
              'Update detection algorithms'
            ] :
            ['Regular security updates', 'Maintain backup schedules', 'Periodic security reviews'])
      },
      precautions: geminiAnalysis?.response?.immediate?.concat(geminiAnalysis?.response?.short_term || []) ||
        (recordType === 'malicious' ?
          [
            'IMMEDIATE: Disconnect affected systems from network',
            'Preserve all logs and evidence for forensic analysis',
            'Notify security team and management immediately',
            'Document all actions taken with timestamps',
            'Activate incident response plan',
            record.user !== 'unknown' ? `Investigate user account: ${record.user}` : 'Review all user accounts',
            record.action === 'sql_injection' ? 'Check database integrity and recent queries' : 'Scan for additional malicious activities'
          ].filter(Boolean) :
          recordType === 'anomalous' ?
            [
              'Monitor closely for escalation to malicious activity',
              'Verify legitimacy of all flagged activities',
              'Check for related anomalies in system logs',
              'Update security policies if patterns emerge',
              record.status === 'failed' ? 'Implement account lockout policies' : 'Review access controls',
              record.file_path ? 'Audit file access permissions' : 'Review user behavior patterns'
            ].filter(Boolean) :
            [
              'Maintain regular security monitoring',
              'Keep all security tools updated',
              'Follow standard operating procedures',
              'Document normal activity patterns for baseline'
            ]),
      geminiInsights: geminiAnalysis ? {
        reasoning: geminiAnalysis.reasoning,
        falsePositiveLikelihood: geminiAnalysis.false_positive_likelihood,
        threatSurface: geminiAnalysis.threat_surface,
        riskScore: geminiAnalysis.risk_score
      } : null
    };

    return { ...baseDetails, ...threatDetails };
  };

  const getAllRecords = () => {
    if (!analysisResult) return [];

    const allRecords = [
      ...analysisResult.normalData,
      ...analysisResult.anomalousData,
      ...analysisResult.maliciousData
    ];

    return allRecords.map((record, index) => getRecordDetails(record, index));
  };

  const getSortedRecords = () => {
    const records = getAllRecords();

    if (!sortConfig) return records;

    return [...records].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      // Handle different data types
      let comparison = 0;

      if (sortConfig.key === 'id') {
        comparison = parseInt(aValue) - parseInt(bValue);
      } else if (sortConfig.key === 'timestamp') {
        comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
      } else {
        // String comparison
        comparison = aValue.toString().localeCompare(bValue.toString());
      }

      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return '↕️'; // Default sort icon
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const handleRowClick = (record: RecordDetails) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const generateRadarData = (record: any) => {
    const geminiAnalysis = record.rawData?._gemini_analysis;
    const threatSurface = geminiAnalysis?.threat_surface;

    if (threatSurface) {
      // Use Gemini's detailed threat surface analysis
      return [
        {
          subject: 'Authentication',
          value: threatSurface.authentication || 20,
          fullMark: 100
        },
        {
          subject: 'Network Access',
          value: threatSurface.network_access || 20,
          fullMark: 100
        },
        {
          subject: 'Privilege Use',
          value: threatSurface.privilege_use || 20,
          fullMark: 100
        },
        {
          subject: 'Asset Exposure',
          value: threatSurface.asset_exposure || 20,
          fullMark: 100
        },
        {
          subject: 'Defense Evasion',
          value: threatSurface.defense_evasion || 20,
          fullMark: 100
        },
        {
          subject: 'Data Exfiltration',
          value: threatSurface.data_exfiltration || 20,
          fullMark: 100
        }
      ];
    }

    // Analysis based ONLY on actual data present in the record
    const rawData = record.rawData;
    let authScore = 20;
    let networkScore = 20;
    let privilegeScore = 20;
    let assetScore = 20;
    let evasionScore = 20;
    let exfiltrationScore = 20;

    // Store analysis details showing only actual data found
    const analysisDetails: {
      authentication: string[];
      networkAccess: string[];
      privilegeUse: string[];
      assetExposure: string[];
      defenseEvasion: string[];
      dataExfiltration: string[];
    } = {
      authentication: [],
      networkAccess: [],
      privilegeUse: [],
      assetExposure: [],
      defenseEvasion: [],
      dataExfiltration: []
    };

    // Authentication Analysis - only if authentication-related data exists
    if (rawData?.action === 'login') {
      if (rawData?.status === 'failed') {
        if (rawData?.attempts) {
          authScore = rawData.attempts > 10 ? 95 : rawData.attempts > 5 ? 80 : 60;
          analysisDetails.authentication.push(`Failed login attempts: ${rawData.attempts}`);
        } else {
          authScore = 60;
          analysisDetails.authentication.push('Failed login (attempts not specified)');
        }
      } else if (rawData?.status === 'success') {
        if (rawData?.user_agent?.includes('curl')) {
          authScore = 70;
          analysisDetails.authentication.push(`Successful login via automated tool: ${rawData.user_agent}`);
        } else {
          authScore = 30;
          analysisDetails.authentication.push('Successful login via normal browser');
        }
      }
    } else if (rawData?.action === 'password_change') {
      authScore = 40;
      analysisDetails.authentication.push('Password change activity');
    } else {
      analysisDetails.authentication.push('No authentication activity in this record');
    }

    // Network Access Analysis - only if IP data exists
    if (rawData?.ip_address) {
      if (rawData.ip_address.startsWith('192.168.') || rawData.ip_address.startsWith('10.') || rawData.ip_address === '127.0.0.1') {
        networkScore = 25;
        analysisDetails.networkAccess.push(`Internal network IP: ${rawData.ip_address}`);
      } else {
        networkScore = 85;
        analysisDetails.networkAccess.push(`External IP address: ${rawData.ip_address}`);

        // Check for specific known ranges
        if (rawData.ip_address.startsWith('203.0.113.')) {
          networkScore = 95;
          analysisDetails.networkAccess.push('IP in known test/malicious range');
        }
      }
    } else {
      analysisDetails.networkAccess.push('No IP address data in this record');
    }

    // Privilege Use Analysis - only if privilege-related data exists
    if (rawData?.command) {
      if (rawData.command.includes('rm -rf')) {
        privilegeScore = 95;
        analysisDetails.privilegeUse.push(`Destructive command found: "${rawData.command}"`);
      } else if (rawData.command.includes('sudo') || rawData.command.includes('su ')) {
        privilegeScore = 80;
        analysisDetails.privilegeUse.push(`Privilege escalation command: "${rawData.command}"`);
      } else {
        privilegeScore = 50;
        analysisDetails.privilegeUse.push(`System command: "${rawData.command}"`);
      }
    }

    if (rawData?.file_path) {
      if (rawData.file_path === '/etc/passwd' || rawData.file_path.includes('/etc/')) {
        privilegeScore = Math.max(privilegeScore, 85);
        analysisDetails.privilegeUse.push(`System file access: ${rawData.file_path}`);
      } else if (rawData.file_path.includes('/var/log/')) {
        privilegeScore = Math.max(privilegeScore, 70);
        analysisDetails.privilegeUse.push(`Log file access: ${rawData.file_path}`);
      } else {
        analysisDetails.privilegeUse.push(`File access: ${rawData.file_path}`);
      }
    }

    if (rawData?.user) {
      if (rawData.user === 'admin' || rawData.user === 'root' || rawData.user === 'system') {
        privilegeScore = Math.max(privilegeScore, 75);
        analysisDetails.privilegeUse.push(`Administrative user: ${rawData.user}`);
      } else if (rawData.user !== 'unknown') {
        analysisDetails.privilegeUse.push(`User account: ${rawData.user}`);
      } else {
        analysisDetails.privilegeUse.push('Unknown user account');
      }
    }

    if (analysisDetails.privilegeUse.length === 0) {
      analysisDetails.privilegeUse.push('No privilege-related data in this record');
    }

    // Asset Exposure Analysis - only if data transfer info exists
    if (rawData?.data_size) {
      const sizeStr = rawData.data_size.toString();
      const sizeGB = parseFloat(sizeStr);
      if (sizeGB > 2) {
        assetScore = 90;
        analysisDetails.assetExposure.push(`Large data volume: ${rawData.data_size}`);
      } else if (sizeGB > 0.5) {
        assetScore = 70;
        analysisDetails.assetExposure.push(`Medium data volume: ${rawData.data_size}`);
      } else {
        assetScore = 45;
        analysisDetails.assetExposure.push(`Small data volume: ${rawData.data_size}`);
      }
    }

    if (rawData?.destination) {
      if (rawData.destination === 'external_server') {
        assetScore = Math.max(assetScore, 85);
        analysisDetails.assetExposure.push('Destination: external server');
      } else {
        analysisDetails.assetExposure.push(`Destination: ${rawData.destination}`);
      }
    }

    if (rawData?.action === 'data_export') {
      assetScore = Math.max(assetScore, 75);
      analysisDetails.assetExposure.push('Data export operation detected');
    }

    if (analysisDetails.assetExposure.length === 0) {
      analysisDetails.assetExposure.push('No asset exposure data in this record');
    }

    // Defense Evasion Analysis - only if evasion indicators exist
    if (rawData?.query) {
      if (rawData.query.includes('DROP TABLE') || rawData.query.includes('UNION SELECT')) {
        evasionScore = 95;
        analysisDetails.defenseEvasion.push(`SQL injection query: "${rawData.query}"`);
      } else if (rawData.query.includes('--') || rawData.query.includes('/*')) {
        evasionScore = 80;
        analysisDetails.defenseEvasion.push(`SQL with comment evasion: "${rawData.query}"`);
      } else {
        analysisDetails.defenseEvasion.push(`Database query: "${rawData.query}"`);
      }
    }

    if (rawData?.action === 'sql_injection') {
      evasionScore = 95;
      analysisDetails.defenseEvasion.push('Action type: SQL injection');
    }

    if (rawData?.action === 'script_execution') {
      evasionScore = Math.max(evasionScore, 80);
      analysisDetails.defenseEvasion.push('Action type: Script execution');
    }

    if (rawData?.user_agent && (rawData.user_agent.includes('curl') || rawData.user_agent.includes('wget'))) {
      evasionScore = Math.max(evasionScore, 65);
      analysisDetails.defenseEvasion.push(`Automated tool user agent: ${rawData.user_agent}`);
    }

    if (rawData?.status === 'blocked') {
      evasionScore = Math.max(evasionScore, 80);
      analysisDetails.defenseEvasion.push('Status: blocked (attack attempt detected)');
    }

    if (analysisDetails.defenseEvasion.length === 0) {
      analysisDetails.defenseEvasion.push('No evasion indicators in this record');
    }

    // Data Exfiltration Analysis - only if exfiltration indicators exist
    if (rawData?.destination === 'external_server') {
      exfiltrationScore = 90;
      analysisDetails.dataExfiltration.push('Data sent to external server');
    }

    if (rawData?.action === 'data_export' && rawData?.data_size) {
      exfiltrationScore = Math.max(exfiltrationScore, 85);
      analysisDetails.dataExfiltration.push(`Data export: ${rawData.data_size} to ${rawData.destination || 'unknown destination'}`);
    }

    if (rawData?.file_path && (rawData.file_path.includes('database') || rawData.file_path.includes('backup'))) {
      exfiltrationScore = Math.max(exfiltrationScore, 75);
      analysisDetails.dataExfiltration.push(`Sensitive file accessed: ${rawData.file_path}`);
    }

    if (analysisDetails.dataExfiltration.length === 0) {
      analysisDetails.dataExfiltration.push('No data exfiltration indicators in this record');
    }

    // Apply record type multipliers based on classification
    const typeMultiplier = record.type === 'malicious' ? 1.2 : record.type === 'anomalous' ? 1.1 : 0.8;

    // Store analysis details in the record for display
    record._threatAnalysis = analysisDetails;

    return [
      {
        subject: 'Authentication',
        value: Math.min(100, Math.round(authScore * typeMultiplier)),
        fullMark: 100
      },
      {
        subject: 'Network Access',
        value: Math.min(100, Math.round(networkScore * typeMultiplier)),
        fullMark: 100
      },
      {
        subject: 'Privilege Use',
        value: Math.min(100, Math.round(privilegeScore * typeMultiplier)),
        fullMark: 100
      },
      {
        subject: 'Asset Exposure',
        value: Math.min(100, Math.round(assetScore * typeMultiplier)),
        fullMark: 100
      },
      {
        subject: 'Defense Evasion',
        value: Math.min(100, Math.round(evasionScore * typeMultiplier)),
        fullMark: 100
      },
      {
        subject: 'Data Exfiltration',
        value: Math.min(100, Math.round(exfiltrationScore * typeMultiplier)),
        fullMark: 100
      }
    ];
  };

  const generateThreatReport = (record: RecordDetails) => {
    const radarData = generateRadarData(record);
    const avgThreatScore = Math.round(radarData.reduce((sum, item) => sum + item.value, 0) / radarData.length);

    const reportData = {
      incidentId: `INC-${record.id.padStart(4, '0')}`,
      timestamp: new Date(record.timestamp).toLocaleString(),
      threatLevel: avgThreatScore > 80 ? 'Critical' : avgThreatScore > 60 ? 'High' : avgThreatScore > 40 ? 'Medium' : 'Low',
      avgThreatScore,
      record,
      radarData,
      generatedAt: new Date().toLocaleString()
    };

    return reportData;
  };

  const downloadReport = async (record: RecordDetails) => {
    const reportData = generateThreatReport(record);

    if (!modalContentRef.current) {
      console.error('Modal content ref not found');
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const modalEl = modalContentRef.current;

      // Hide the header buttons bar during capture
      const headerBar = modalEl.querySelector('[data-pdf-hide]') as HTMLElement | null;
      if (headerBar) headerBar.style.display = 'none';

      // Remember original scroll position and temporarily expand modal to full height
      const originalMaxHeight = modalEl.style.maxHeight;
      const originalOverflow = modalEl.style.overflow;
      modalEl.style.maxHeight = 'none';
      modalEl.style.overflow = 'visible';

      // Wait for any re-renders / chart animations to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture the actual modal DOM
      const canvas = await html2canvas(modalEl, {
        backgroundColor: '#111827',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: modalEl.scrollWidth,
        windowHeight: modalEl.scrollHeight,
      });

      // Restore modal styles
      modalEl.style.maxHeight = originalMaxHeight;
      modalEl.style.overflow = originalOverflow;
      if (headerBar) headerBar.style.display = '';

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      pdf.save(`Incident_${reportData.incidentId}_Report.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to text-based PDF if HTML rendering fails
      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text('CYBERSECURITY INCIDENT REPORT', 20, 20);
      pdf.setFontSize(12);
      pdf.text(`Incident ID: ${reportData.incidentId}`, 20, 40);
      pdf.text(`Generated: ${reportData.generatedAt}`, 20, 50);
      pdf.text('Error: Could not generate visual report. Please try again.', 20, 70);
      pdf.save(`Incident_${reportData.incidentId}_Report.pdf`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const totalEvents = analysisResult ? analysisResult.totalRecords : 0;
  const threatsDetected = analysisResult ? analysisResult.maliciousData.length : 0;
  const vulnerabilities = analysisResult ? analysisResult.anomalousData.length : 0;
  const anomalies = analysisResult ? analysisResult.anomalousData.length + analysisResult.maliciousData.length : 0;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-red-500/30">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 animate-pulse" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(239, 68, 68, 0.1) 1px, transparent 0)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Floating Data Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-400 rounded-full animate-floatingOrb"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-orange-400 rounded-full animate-floatingOrb delay-500"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-floatingOrb delay-1000"></div>
      </div>
      <LandingHeader showLaunchButton={false} onBack={onBack} />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">JSON Security Analyzer</h1>
            <p className="text-gray-400 mt-1">Advanced threat detection and analysis</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-500">{totalEvents}</div>
              <div className="text-sm text-gray-400">Total Events</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-500">{threatsDetected}</div>
              <div className="text-sm text-gray-400">Threats</div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="glass-effect rounded-xl border border-gray-800 p-8 hover-lift">
          <input
            ref={(input) => {
              if (input) {
                (window as any).fileInput = input;
              }
            }}
            type="file"
            accept=".json,.evtx"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <div
            className="cursor-pointer hover:bg-gray-800/30 transition-all duration-300 rounded-xl p-8 border-2 border-dashed border-gray-600 hover:border-red-500/50 hover-glow"
            onClick={() => {
              const input = (window as any).fileInput;
              if (input) input.click();
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="text-center">
              <Upload className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Upload Security Logs
              </h3>
              <p className="text-gray-400 mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports JSON files up to 1GB and EVTX files up to 100MB
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <div className="mt-4 bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full"></div>
                <span className="text-orange-300">Analyzing with Gemini AI...</span>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6">
              <div className="glass-effect rounded-xl border border-gray-800 p-6 hover-lift hover-glow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-400">{analysisResult.normalData.length}</div>
                    <div className="text-gray-400">Normal Events</div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className="glass-effect rounded-xl border border-gray-800 p-6 hover-lift hover-glow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-orange-400">{analysisResult.anomalousData.length}</div>
                    <div className="text-gray-400">Anomalies</div>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-400" />
                </div>
              </div>

              <div className="glass-effect rounded-xl border border-gray-800 p-6 hover-lift hover-glow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-red-400">{analysisResult.maliciousData.length}</div>
                    <div className="text-gray-400">Threats</div>
                  </div>
                  <Shield className="h-8 w-8 text-red-400" />
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="glass-effect rounded-xl border border-gray-800 overflow-hidden hover-lift">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Activity className="w-5 h-5 text-red-400 mr-2" />
                  Security Events
                </h3>
                <p className="text-gray-400 text-sm mt-1">Click on any event for detailed analysis</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-750">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('id')}>
                        ID {getSortIcon('id')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('timestamp')}>
                        Time {getSortIcon('timestamp')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('user')}>
                        User {getSortIcon('user')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('action')}>
                        Action {getSortIcon('action')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('source')}>
                        Source {getSortIcon('source')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('type')}>
                        Threat Level {getSortIcon('type')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {getSortedRecords().map((record, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-gray-750 cursor-pointer transition-colors ${record.type === 'malicious' ? 'bg-red-900/10' :
                          record.type === 'anomalous' ? 'bg-yellow-900/10' :
                            ''
                          }`}
                        onClick={() => handleRowClick(record)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          #{record.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {record.timestamp ? new Date(record.timestamp).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {record.user}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {record.action}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                          {record.source}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${record.type === 'malicious' ? 'bg-red-900 text-red-200' :
                            record.type === 'anomalous' ? 'bg-yellow-900 text-yellow-200' :
                              'bg-green-900 text-green-200'
                            }`}>
                            {record.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-400 hover:text-orange-300">
                          <Eye className="h-4 w-4 inline mr-1" />
                          View
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Processing Queue */}
        {uploadedFiles.length > 0 && (
          <div className="glass-effect rounded-xl border border-gray-800 p-6 hover-lift">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 text-orange-400 mr-2" />
              Processing History
            </h3>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="font-medium text-white flex items-center space-x-2">
                        <span>{file.name}</span>
                        {file.type && (
                          <span className="px-2 py-1 text-xs bg-orange-900/30 text-orange-300 rounded">
                            {file.type}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatFileSize(file.size)} • {file.uploadedAt.toLocaleTimeString()}
                        {file.conversionInfo && (
                          <span className="ml-2 text-blue-400">
                            • {file.conversionInfo.events_converted || 'N/A'} events converted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-green-900 text-green-200 text-xs rounded-full">
                      Processed
                    </span>
                    {file.analysis && (
                      <span className="text-sm text-gray-400">
                        {file.analysis.totalRecords} events
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Detailed Analysis Modal */}
        {showDetailModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div ref={modalContentRef} className="glass-effect text-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto border border-gray-800">
              {/* Header */}
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium">
                    New Risk
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold flex items-center">
                      <Shield className="h-6 w-6 mr-2 text-red-400" />
                      Incident - {selectedRecord.id.padStart(4, '0')}
                    </h3>
                    <p className="text-gray-400 text-sm">Incident details</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3" data-pdf-hide>
                  <button
                    onClick={() => downloadReport(selectedRecord)}
                    disabled={isGeneratingPdf}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-wait text-white px-4 py-2 rounded flex items-center space-x-2 transition-colors"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Download PDF report</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Information */}
                <div className="space-y-6">
                  {/* Incident Information */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-4 text-gray-200">Information</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-400 text-sm">Incident ID:</span>
                          <p className="text-white font-mono">INC-{selectedRecord.id.padStart(4, '0')}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Status:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${selectedRecord.status === 'failed' || selectedRecord.status === 'denied' || selectedRecord.status === 'blocked'
                            ? 'bg-red-900 text-red-200'
                            : selectedRecord.status === 'success' || selectedRecord.status === 'completed'
                              ? 'bg-green-900 text-green-200'
                              : 'bg-yellow-900 text-yellow-200'
                            }`}>
                            {selectedRecord.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">User:</span>
                          <p className="text-white">{selectedRecord.user}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Source IP:</span>
                          <p className="text-white font-mono">{selectedRecord.source}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Action:</span>
                          <p className="text-white">{selectedRecord.action}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Severity:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${selectedRecord.severity === 'High' ? 'bg-red-900 text-red-200' :
                            selectedRecord.severity === 'Medium' ? 'bg-yellow-900 text-yellow-200' :
                              'bg-green-900 text-green-200'
                            }`}>
                            {selectedRecord.severity}
                          </span>
                        </div>
                      </div>

                      {/* Additional Details */}
                      {selectedRecord.rawData?.attempts && (
                        <div>
                          <span className="text-gray-400 text-sm">Failed Attempts:</span>
                          <p className="text-red-400 font-semibold">{selectedRecord.rawData.attempts}</p>
                        </div>
                      )}
                      {selectedRecord.rawData?.command && (
                        <div>
                          <span className="text-gray-400 text-sm">Command:</span>
                          <p className="text-red-400 font-mono bg-red-900/20 p-2 rounded mt-1">{selectedRecord.rawData.command}</p>
                        </div>
                      )}
                      {selectedRecord.rawData?.query && (
                        <div>
                          <span className="text-gray-400 text-sm">SQL Query:</span>
                          <p className="text-red-400 font-mono bg-red-900/20 p-2 rounded mt-1">{selectedRecord.rawData.query}</p>
                        </div>
                      )}
                    </div>
                  </div>


                </div>

                {/* Right Column - Threat Surface Map & Analysis */}
                <div className="space-y-6">
                  {/* Threat Surface Map */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-200">Threat Surface Map</h4>
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-400">Low Risk (0-40)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-gray-400">Medium Risk (41-70)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-gray-400">High Risk (71-100)</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={generateRadarData(selectedRecord)}>
                          <PolarGrid stroke="#374151" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fill: '#6B7280', fontSize: 10 }}
                            tickCount={5}
                          />
                          <Radar
                            name="Threat Level"
                            dataKey="value"
                            stroke="#EF4444"
                            fill="#EF4444"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Threat Surface Breakdown */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      {generateRadarData(selectedRecord).map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-700 px-3 py-2 rounded">
                          <span className="text-gray-300">{item.subject}:</span>
                          <span className={`font-semibold ${item.value > 70 ? 'text-red-400' :
                            item.value > 40 ? 'text-orange-400' :
                              'text-green-400'
                            }`}>
                            {item.value}/100
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Detailed Analysis Breakdown */}
                    {selectedRecord._threatAnalysis && (
                      <div className="mt-6">
                        <h5 className="text-gray-200 font-medium mb-3">Analysis Details</h5>
                        <div className="space-y-3 text-xs">
                          {Object.entries(selectedRecord._threatAnalysis).map(([category, details]: [string, any]) => (
                            <div key={category} className="bg-gray-700 p-3 rounded">
                              <div className="font-medium text-gray-300 mb-2 capitalize">
                                {category.replace(/([A-Z])/g, ' $1').trim()}:
                              </div>
                              <ul className="space-y-1">
                                {details.map((detail: string, idx: number) => (
                                  <li key={idx} className="text-gray-400 flex items-start">
                                    <span className="w-1 h-1 bg-gray-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    {detail}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>


                </div>
              </div>

              {/* Bottom Section - Detailed Analysis */}
              <div className="border-t border-gray-700 p-6 space-y-6">
                {/* Enhanced AI Threat Predictions with Gemini Insights */}
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                  <h4 className="font-semibold text-red-200 mb-3 flex items-center">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Threat Analysis (Gemini Pro)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-red-300 text-sm">Attack Type:</span>
                      <p className="text-red-100">{selectedRecord.predictions.attackType}</p>
                    </div>
                    <div>
                      <span className="text-red-300 text-sm">Risk Level:</span>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedRecord.predictions.riskLevel === 'Critical' ? 'bg-red-900 text-red-200' :
                        selectedRecord.predictions.riskLevel === 'Medium' ? 'bg-yellow-900 text-yellow-200' :
                          'bg-green-900 text-green-200'
                        }`}>
                        {selectedRecord.predictions.riskLevel}
                      </span>
                    </div>
                    <div>
                      <span className="text-red-300 text-sm">Confidence:</span>
                      <p className="text-red-100">{selectedRecord.predictions.confidence}</p>
                    </div>
                    {selectedRecord.geminiInsights?.riskScore && (
                      <div>
                        <span className="text-red-300 text-sm">Risk Score:</span>
                        <p className="text-red-100">{selectedRecord.geminiInsights.riskScore}/100</p>
                      </div>
                    )}
                    {selectedRecord.predictions.threatCategory && (
                      <div>
                        <span className="text-red-300 text-sm">Threat Category:</span>
                        <p className="text-red-100">{selectedRecord.predictions.threatCategory}</p>
                      </div>
                    )}
                    {selectedRecord.predictions.mitreTactics && selectedRecord.predictions.mitreTactics.length > 0 && (
                      <div>
                        <span className="text-red-300 text-sm">MITRE Tactics:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedRecord.predictions.mitreTactics.map((tactic: string, index: number) => (
                            <span key={index} className="bg-red-800 text-red-200 px-2 py-1 text-xs rounded">
                              {tactic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <span className="text-red-300 text-sm">Threat Indicators:</span>
                      <ul className="mt-1 space-y-1">
                        {selectedRecord.predictions.indicators.map((indicator: string, index: number) => (
                          <li key={index} className="text-red-100 text-sm flex items-center">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                            {indicator}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {selectedRecord.geminiInsights?.reasoning && (
                      <div className="md:col-span-2">
                        <span className="text-red-300 text-sm">AI Reasoning:</span>
                        <p className="text-red-100 text-sm mt-1 italic">{selectedRecord.geminiInsights.reasoning}</p>
                      </div>
                    )}
                    {selectedRecord.geminiInsights?.falsePositiveLikelihood && (
                      <div>
                        <span className="text-red-300 text-sm">False Positive Risk:</span>
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedRecord.geminiInsights.falsePositiveLikelihood === 'HIGH' ? 'bg-yellow-900 text-yellow-200' :
                          selectedRecord.geminiInsights.falsePositiveLikelihood === 'MEDIUM' ? 'bg-orange-900 text-orange-200' :
                            'bg-green-900 text-green-200'
                          }`}>
                          {selectedRecord.geminiInsights.falsePositiveLikelihood}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prevention Measures */}
                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-200 mb-3 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Prevention Measures
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-blue-300 text-sm font-medium mb-2">Immediate Actions:</h5>
                      <ul className="space-y-1">
                        {selectedRecord.prevention.immediate.map((action: string, index: number) => (
                          <li key={index} className="text-blue-100 text-sm flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-blue-300 text-sm font-medium mb-2">Long-term Strategies:</h5>
                      <ul className="space-y-1">
                        {selectedRecord.prevention.longTerm.map((strategy: string, index: number) => (
                          <li key={index} className="text-blue-100 text-sm flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                            {strategy}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Security Precautions */}
                <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-200 mb-3 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Security Precautions & Recommendations
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRecord.precautions.map((precaution: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-orange-100 text-sm">{precaution}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <LandingFooter />
    </div>
  );
}