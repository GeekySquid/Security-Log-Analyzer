'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2, Shield, Activity, TrendingUp } from 'lucide-react';

interface EVTXAnalysisResult {
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
  evtxMetadata?: {
    eventsProcessed: number;
    originalFormat: string;
    conversionTimestamp: string;
  };
}

interface AnalysisResponse {
  success: boolean;
  analysis: EVTXAnalysisResult;
  source: string;
  conversion_info?: any;
}

export default function EVTXUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.toLowerCase().endsWith('.evtx')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please select a valid EVTX file');
      }
    }
  }, []);
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.toLowerCase().endsWith('.evtx')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a valid EVTX file');
      }
    }
  };

  const analyzeFile = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-evtx', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const analysisResult: AnalysisResponse = await response.json();
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getRiskColor = (percentage: number) => {
    if (percentage >= 70) return 'text-red-400 bg-red-900/20 border-red-500/30';
    if (percentage >= 40) return 'text-orange-400 bg-orange-900/20 border-orange-500/30';
    return 'text-green-400 bg-green-900/20 border-green-500/30';
  };

  const getRiskBadgeColor = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'malicious':
        return 'bg-red-900/30 text-red-400 border-red-500/30';
      case 'anomalous':
        return 'bg-orange-900/30 text-orange-400 border-orange-500/30';
      default:
        return 'bg-green-900/30 text-green-400 border-green-500/30';
    }
  };
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0 animate-pulse" 
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(239, 68, 68, 0.1) 1px, transparent 0)',
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* Floating Data Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-400 rounded-full animate-floatingOrb"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-orange-400 rounded-full animate-floatingOrb delay-500"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-floatingOrb delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center animate-fadeInDown">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-red-400 mr-4 animate-pulseGlow" />
            <h2 className="text-4xl font-bold text-white">
              EVTX Security Analyzer
            </h2>
          </div>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Upload Windows Event Log (EVTX) files for dynamic conversion and AI-powered security analysis using advanced threat detection algorithms
          </p>
        </div>

        {/* File Upload Area */}
        <div className="animate-fadeInUp delay-200">
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 glass-effect ${
              dragActive
                ? 'border-red-400 bg-red-900/10 animate-pulseGlow'
                : 'border-gray-600 hover:border-red-500/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".evtx"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isAnalyzing}
            />
            
            <div className="space-y-6">
              <div className="relative">
                <Upload className="mx-auto h-16 w-16 text-red-400 animate-float" />
                <div className="absolute inset-0 bg-red-400/20 rounded-full blur-xl animate-pulseGlow"></div>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white mb-2">
                  Drop your EVTX file here, or click to browse
                </p>
                <p className="text-gray-400">
                  Supports Windows Event Log (.evtx) files up to 100MB
                </p>
                <p className="text-sm text-red-400 mt-2">
                  Advanced AI-powered threat detection • Real-time analysis • MITRE ATT&CK mapping
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Selected File Info */}
        {file && (
          <div className="glass-effect rounded-xl p-6 animate-slideInUp delay-300">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FileText className="h-12 w-12 text-red-400" />
                <div className="absolute inset-0 bg-red-400/20 rounded-lg blur-lg animate-pulseGlow"></div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white text-lg">{file.name}</p>
                <p className="text-gray-400">
                  {formatFileSize(file.size)} • EVTX File • Windows Event Log
                </p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="text-xs px-2 py-1 bg-red-900/30 text-red-400 rounded border border-red-500/30">
                    Security Analysis Ready
                  </span>
                  <span className="text-xs px-2 py-1 bg-orange-900/30 text-orange-400 rounded border border-orange-500/30">
                    AI-Powered Detection
                  </span>
                </div>
              </div>
              <button
                onClick={analyzeFile}
                disabled={isAnalyzing}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-red-500/25 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 btn-cyber"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Activity className="h-5 w-5" />
                    <span>Analyze EVTX</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="glass-effect rounded-xl p-6 border border-red-500/30 animate-fadeInUp">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <div>
                <p className="text-red-400 font-semibold">Analysis Error</p>
                <p className="text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        {/* Analysis Results */}
        {result && result.success && (
          <div className="space-y-8 animate-fadeInUp delay-400">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-effect rounded-xl p-6 hover-lift hover-glow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Events</p>
                    <p className="text-3xl font-bold text-white">
                      {result.analysis.totalRecords.toLocaleString()}
                    </p>
                  </div>
                  <FileText className="h-10 w-10 text-red-400" />
                </div>
              </div>

              <div className="glass-effect rounded-xl p-6 hover-lift hover-glow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Confidence</p>
                    <p className="text-3xl font-bold text-white">
                      {result.analysis.confidence}%
                    </p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-400" />
                </div>
              </div>

              <div className="glass-effect rounded-xl p-6 hover-lift hover-glow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Analysis Source</p>
                    <p className="text-sm font-bold text-white capitalize">
                      {result.source.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <Activity className="h-10 w-10 text-orange-400" />
                </div>
              </div>

              <div className="glass-effect rounded-xl p-6 hover-lift hover-glow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Threat Level</p>
                    <p className="text-sm font-bold text-red-400">
                      {result.analysis.predictions.malicious > 20 ? 'HIGH' : 
                       result.analysis.predictions.anomalous > 30 ? 'MEDIUM' : 'LOW'}
                    </p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-red-400" />
                </div>
              </div>
            </div>
            {/* Risk Distribution */}
            <div className="glass-effect rounded-xl p-8 hover-lift">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Shield className="w-6 h-6 text-red-400 mr-3" />
                Security Risk Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-xl border ${getRiskColor(result.analysis.predictions.normal)}`}>
                  <p className="text-sm font-semibold mb-2">Normal Events</p>
                  <p className="text-4xl font-bold mb-2">{result.analysis.predictions.normal}%</p>
                  <p className="text-xs opacity-75">{result.analysis.normalData.length} events</p>
                  <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-400 transition-all duration-1000"
                      style={{ width: `${result.analysis.predictions.normal}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className={`p-6 rounded-xl border ${getRiskColor(result.analysis.predictions.anomalous)}`}>
                  <p className="text-sm font-semibold mb-2">Anomalous Events</p>
                  <p className="text-4xl font-bold mb-2">{result.analysis.predictions.anomalous}%</p>
                  <p className="text-xs opacity-75">{result.analysis.anomalousData.length} events</p>
                  <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-400 transition-all duration-1000 delay-300"
                      style={{ width: `${result.analysis.predictions.anomalous}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className={`p-6 rounded-xl border ${getRiskColor(result.analysis.predictions.malicious)}`}>
                  <p className="text-sm font-semibold mb-2">Malicious Events</p>
                  <p className="text-4xl font-bold mb-2">{result.analysis.predictions.malicious}%</p>
                  <p className="text-xs opacity-75">{result.analysis.maliciousData.length} events</p>
                  <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-400 transition-all duration-1000 delay-600"
                      style={{ width: `${result.analysis.predictions.malicious}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Event Details Tables */}
            {result.analysis.maliciousData.length > 0 && (
              <div className="glass-effect rounded-xl p-8 hover-lift">
                <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Malicious Events ({result.analysis.maliciousData.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400">Event ID</th>
                        <th className="text-left py-3 px-4 text-gray-400">Timestamp</th>
                        <th className="text-left py-3 px-4 text-gray-400">Computer</th>
                        <th className="text-left py-3 px-4 text-gray-400">Description</th>
                        <th className="text-left py-3 px-4 text-gray-400">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.analysis.maliciousData.slice(0, 10).map((event, index) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs font-mono">
                              {event.event_id || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300 font-mono text-xs">
                            {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {event.computer || event.workstation_name || 'Unknown'}
                          </td>
                          <td className="py-3 px-4 text-gray-300 max-w-xs">
                            <div className="truncate" title={event.description || event.task || 'No description'}>
                              {event.description || event.task || 'No description'}
                            </div>
                            {event._gemini_analysis && (
                              <div className="text-xs text-orange-400 mt-1">
                                {event._gemini_analysis.threat_type}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${getRiskBadgeColor('malicious')}`}>
                              {event._gemini_analysis?.severity || event.risk_level?.toUpperCase() || 'HIGH'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {result.analysis.maliciousData.length > 10 && (
                    <div className="mt-4 text-center text-sm text-gray-400">
                      Showing 10 of {result.analysis.maliciousData.length} malicious events
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Anomalous Events Table */}
            {result.analysis.anomalousData.length > 0 && (
              <div className="glass-effect rounded-xl p-8 hover-lift">
                <h3 className="text-xl font-bold text-orange-400 mb-6 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Anomalous Events ({result.analysis.anomalousData.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400">Event ID</th>
                        <th className="text-left py-3 px-4 text-gray-400">Timestamp</th>
                        <th className="text-left py-3 px-4 text-gray-400">Computer</th>
                        <th className="text-left py-3 px-4 text-gray-400">Description</th>
                        <th className="text-left py-3 px-4 text-gray-400">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.analysis.anomalousData.slice(0, 10).map((event, index) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-orange-900/30 text-orange-400 rounded text-xs font-mono">
                              {event.event_id || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300 font-mono text-xs">
                            {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {event.computer || event.workstation_name || 'Unknown'}
                          </td>
                          <td className="py-3 px-4 text-gray-300 max-w-xs">
                            <div className="truncate" title={event.description || event.task || 'No description'}>
                              {event.description || event.task || 'No description'}
                            </div>
                            {event._gemini_analysis && (
                              <div className="text-xs text-orange-400 mt-1">
                                {event._gemini_analysis.threat_type}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${getRiskBadgeColor('anomalous')}`}>
                              {event._gemini_analysis?.severity || event.risk_level?.toUpperCase() || 'MEDIUM'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {result.analysis.anomalousData.length > 10 && (
                    <div className="mt-4 text-center text-sm text-gray-400">
                      Showing 10 of {result.analysis.anomalousData.length} anomalous events
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* EVTX Metadata */}
            {result.analysis.evtxMetadata && (
              <div className="glass-effect rounded-xl p-8 hover-lift">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <FileText className="w-5 h-5 text-orange-400 mr-2" />
                  EVTX Processing Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Events Processed</p>
                    <p className="text-2xl font-bold text-white">{result.analysis.evtxMetadata.eventsProcessed}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Original Format</p>
                    <p className="text-lg font-bold text-orange-400">{result.analysis.evtxMetadata.originalFormat}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400 text-sm">File Name</p>
                    <p className="text-sm font-bold text-white truncate">{result.analysis.fileName}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Processing Method</p>
                    <p className="text-xs text-gray-300">
                      {result.source === 'python_ml_service_evtx' ? 'Python ML Service' : 
                       result.source === 'javascript_fallback_evtx_conversion' ? 'JavaScript Fallback' : 
                       'Gemini Direct'}
                    </p>
                  </div>
                </div>
                
                {/* Data Source Warning */}
                {result.source === 'javascript_fallback_evtx_conversion' && (
                  <div className="mt-6 p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-orange-400 font-semibold text-sm">Processing Notice</p>
                        <p className="text-orange-300 text-sm mt-1">
                          This analysis used JavaScript fallback parsing. For more accurate results with real EVTX data, 
                          ensure the Python ML service is running or try a different EVTX file.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {result.source === 'python_ml_service_evtx' && (
                  <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-green-400 font-semibold text-sm">Optimal Processing</p>
                        <p className="text-green-300 text-sm mt-1">
                          This analysis used the Python ML service with proper EVTX parsing libraries for accurate event extraction.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Recommendations */}
            <div className="glass-effect rounded-xl p-8 hover-lift">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Shield className="w-5 h-5 text-green-400 mr-2" />
                Security Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.analysis.precautions.map((precaution, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-800/30 rounded-lg hover-glow">
                    <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{precaution}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}