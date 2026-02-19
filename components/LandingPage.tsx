'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Brain, Activity, FileSearch, Target, Zap, Upload, BarChart3, Eye } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, PieChart, Pie, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

interface LandingPageProps {
  onEnterApp: () => void;
  onTryDemo: () => void;
}

export default function LandingPage({ onEnterApp, onTryDemo }: LandingPageProps) {
  const [animatedStats, setAnimatedStats] = useState({
    threatsDetected: 0,
    incidentsResolved: 0,
    systemsProtected: 0
  });

  // Animate numbers on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({
        threatsDetected: 15847,
        incidentsResolved: 12563,
        systemsProtected: 2847
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const securityData = [
    { 
      type: 'Authentication Threats', 
      icon: '🔐', 
      threatsDetected: '2,847', 
      accuracy: '99.2%', 
      avgResponseTime: '0.3s', 
      riskLevel: 'Critical',
      status: 'Active'
    },
    { 
      type: 'Network Security', 
      icon: '🌐', 
      threatsDetected: '1,923', 
      accuracy: '98.7%', 
      avgResponseTime: '0.2s', 
      riskLevel: 'High',
      status: 'Monitoring'
    },
    { 
      type: 'Privilege Escalation', 
      icon: '⬆️', 
      threatsDetected: '856', 
      accuracy: '99.8%', 
      avgResponseTime: '0.1s', 
      riskLevel: 'High',
      status: 'Protected'
    },
    { 
      type: 'Data Exfiltration', 
      icon: '📤', 
      threatsDetected: '1,247', 
      accuracy: '99.5%', 
      avgResponseTime: '0.4s', 
      riskLevel: 'Critical',
      status: 'Blocked'
    },
    { 
      type: 'Defense Evasion', 
      icon: '🛡️', 
      threatsDetected: '634', 
      accuracy: '99.9%', 
      avgResponseTime: '0.2s', 
      riskLevel: 'Critical',
      status: 'Quarantined'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Enhanced Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 animate-pulse" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 0)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Enhanced Animated Geometric Lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent rotate-12 animate-dataFlow"></div>
        <div className="absolute top-40 right-20 w-48 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent -rotate-45 animate-dataFlow delay-300"></div>
        <div className="absolute bottom-40 left-20 w-32 h-px bg-gradient-to-r from-transparent via-red-500/35 to-transparent rotate-45 animate-dataFlow delay-700"></div>
        <div className="absolute top-60 left-1/3 w-40 h-px bg-gradient-to-r from-transparent via-orange-400/25 to-transparent -rotate-12 animate-dataFlow delay-1000"></div>
        
        {/* Floating Data Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-400 rounded-full animate-floatingOrb"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-orange-400 rounded-full animate-floatingOrb delay-500"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-floatingOrb delay-1000"></div>
        
        {/* Matrix Rain Effect */}
        <div className="absolute top-0 left-1/6 w-px h-20 bg-gradient-to-b from-red-500/60 to-transparent animate-matrixRain"></div>
        <div className="absolute top-0 left-2/6 w-px h-16 bg-gradient-to-b from-orange-500/40 to-transparent animate-matrixRain delay-700"></div>
        <div className="absolute top-0 left-4/6 w-px h-24 bg-gradient-to-b from-red-400/50 to-transparent animate-matrixRain delay-1200"></div>
        <div className="absolute top-0 left-5/6 w-px h-18 bg-gradient-to-b from-orange-400/30 to-transparent animate-matrixRain delay-300"></div>
      </div>

      {/* NAVBAR */}
      <LandingHeader onEnterApp={onEnterApp} />

      {/* HERO SECTION */}
      <div className="relative z-10 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center relative">
            {/* Enhanced Animated Glowing Orb Effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-20">
              <div className="w-96 h-96 rounded-full bg-gradient-to-r from-red-500/30 via-orange-500/40 to-red-600/30 blur-3xl animate-pulseGlow animate-morphing"></div>
              <div className="absolute inset-0 w-96 h-96 rounded-full bg-gradient-to-r from-red-400/20 via-orange-400/30 to-red-500/20 blur-2xl animate-pulseGlow delay-500 animate-floatingOrb"></div>
              <div className="absolute inset-0 w-80 h-80 rounded-full bg-gradient-to-r from-orange-500/40 via-red-500/50 to-orange-600/40 blur-xl animate-pulseGlow delay-1000 m-8 animate-morphing"></div>
            </div>

            {/* Main Headline with Enhanced Animation */}
            <div className="mb-12 relative z-10">
              <h1 className="text-5xl md:text-7xl font-light leading-tight mb-6 text-gray-100 animate-fadeInDown">
                AI-Powered Security Log Analyzer
                <br />
                <span className="text-gray-200 animate-fadeInUp delay-300">JSON & EVTX Threat Detection</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed animate-fadeInUp delay-500">
                Intelligent cybersecurity log analysis platform using Google Gemini AI to detect threats, anomalies, 
                and security incidents in JSON log files and Windows Event Logs (EVTX). Real-time security monitoring with MITRE ATT&CK framework integration.
              </p>
            </div>

            {/* Enhanced CTA Buttons with Animation */}
            <div className="mb-16 relative z-10 animate-fadeInUp delay-700">
              <button
                onClick={onTryDemo}
                className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg text-base font-medium transition-all duration-300 shadow-lg hover:shadow-red-500/25 transform hover:scale-105 mr-4 hover-lift hover-glow animate-shimmer"
              >
                Analyze JSON Logs
              </button>
              <button
                onClick={() => window.location.href = '/evtx'}
                className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-lg text-base font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25 transform hover:scale-105 mr-4 hover-lift hover-glow animate-shimmer"
              >
                Analyze EVTX Files
              </button>
              <button
                onClick={onEnterApp}
                className="border border-red-600 hover:bg-red-600 text-red-400 hover:text-white px-8 py-3 rounded-lg text-base font-medium transition-all duration-300 hover-lift"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATS DASHBOARD - Reference UI Style */}
      <div className="relative z-10 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          {/* Top Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 p-6 animate-slideInUp hover-lift hover-glow">
              <div className="text-gray-400 text-sm mb-2">Threats Detected</div>
              <div className="text-2xl font-light text-white">
                {animatedStats.threatsDetected.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 p-6 animate-slideInUp delay-200 hover-lift hover-glow">
              <div className="text-gray-400 text-sm mb-2">Incidents Resolved</div>
              <div className="text-2xl font-light text-white">
                {animatedStats.incidentsResolved.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 p-6 animate-slideInUp delay-400 hover-lift hover-glow">
              <div className="text-gray-400 text-sm mb-2">Systems Protected</div>
              <div className="text-2xl font-light text-white">
                {animatedStats.systemsProtected.toLocaleString()}
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={onTryDemo}
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm transition-colors hover-scale animate-shimmer"
                >
                  Analyze
                </button>
                <button className="border border-gray-600 hover:border-gray-500 text-gray-300 px-4 py-2 rounded text-sm transition-colors hover-scale">
                  Monitor
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Charts Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Threat Distribution Chart */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 p-6 animate-fadeInLeft delay-600 hover-lift">
              <h3 className="text-lg font-semibold text-white mb-4">Threat Classification Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Normal', value: 65, fill: '#10B981' },
                        { name: 'Anomalous', value: 25, fill: '#F59E0B' },
                        { name: 'Malicious', value: 10, fill: '#EF4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Threat Timeline Chart */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 p-6 animate-fadeInRight delay-700 hover-lift">
              <h3 className="text-lg font-semibold text-white mb-4">Threat Detection Timeline</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { time: '00:00', threats: 12, anomalies: 8 },
                      { time: '04:00', threats: 19, anomalies: 15 },
                      { time: '08:00', threats: 35, anomalies: 22 },
                      { time: '12:00', threats: 28, anomalies: 18 },
                      { time: '16:00', threats: 42, anomalies: 31 },
                      { time: '20:00', threats: 38, anomalies: 25 },
                      { time: '24:00', threats: 23, anomalies: 16 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                    <Line type="monotone" dataKey="threats" stroke="#EF4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="anomalies" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Threat Surface Radar Chart */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 p-6 mb-8 animate-scaleIn delay-800 hover-lift">
            <h3 className="text-lg font-semibold text-white mb-4">6-Dimensional Threat Surface Analysis</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={[
                    { subject: 'Authentication', value: 85, fullMark: 100 },
                    { subject: 'Network Access', value: 72, fullMark: 100 },
                    { subject: 'Privilege Use', value: 68, fullMark: 100 },
                    { subject: 'Asset Exposure', value: 91, fullMark: 100 },
                    { subject: 'Defense Evasion', value: 78, fullMark: 100 },
                    { subject: 'Data Exfiltration', value: 83, fullMark: 100 }
                  ]}>
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
              <div className="space-y-4">
                <div className="text-gray-300 text-sm">
                  <h4 className="font-semibold mb-3">Risk Assessment Breakdown</h4>
                  {[
                    { category: 'Asset Exposure', score: 91, color: 'text-red-400' },
                    { category: 'Authentication', score: 85, color: 'text-red-400' },
                    { category: 'Data Exfiltration', score: 83, color: 'text-red-400' },
                    { category: 'Defense Evasion', score: 78, color: 'text-orange-400' },
                    { category: 'Network Access', score: 72, color: 'text-orange-400' },
                    { category: 'Privilege Use', score: 68, color: 'text-orange-400' }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0 animate-fadeInRight" style={{ animationDelay: `${900 + index * 100}ms` }}>
                      <span className="text-gray-300">{item.category}</span>
                      <span className={`font-semibold ${item.color}`}>{item.score}/100</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg animate-pulseGlow">
                  <h5 className="text-red-400 font-semibold text-sm mb-2">Critical Alert</h5>
                  <p className="text-red-300 text-xs">High asset exposure detected. Immediate review recommended for data access patterns and external connections.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Threats Table */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden animate-fadeInUp delay-600 hover-lift">
            <div className="p-4 border-b border-gray-800">
              <div className="grid grid-cols-6 gap-4 text-gray-400 text-sm">
                <div>Threat Type</div>
                <div>Detected</div>
                <div>Accuracy</div>
                <div>Response Time</div>
                <div>Risk Level</div>
                <div>Status</div>
              </div>
            </div>
            <div className="divide-y divide-gray-800">
              {securityData.map((threat, index) => (
                <div 
                  key={threat.type} 
                  className="p-4 hover:bg-gray-800/50 transition-colors animate-fadeInLeft hover-glow"
                  style={{ animationDelay: `${800 + index * 100}ms` }}
                >
                  <div className="grid grid-cols-6 gap-4 items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white text-sm animate-rotateIn" style={{ animationDelay: `${900 + index * 100}ms` }}>
                        {threat.icon}
                      </div>
                      <span className="text-white font-medium">{threat.type}</span>
                    </div>
                    <div className="text-gray-300">{threat.threatsDetected}</div>
                    <div className="text-red-400">{threat.accuracy}</div>
                    <div className="text-gray-300">{threat.avgResponseTime}</div>
                    <div className={`text-sm px-2 py-1 rounded hover-scale ${
                      threat.riskLevel === 'Critical' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {threat.riskLevel}
                    </div>
                    <div className={`text-sm px-2 py-1 rounded hover-scale ${
                      threat.status === 'Active' ? 'bg-red-900/30 text-red-400' : 
                      threat.status === 'Blocked' ? 'bg-red-900/30 text-red-400' :
                      'bg-orange-900/30 text-orange-400'
                    }`}>
                      {threat.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CAPABILITIES SECTION */}
      <div id="capabilities" className="relative z-10 py-20 bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 animate-fadeInDown">JSON Security Intelligence Platform</h2>
            <p className="text-gray-400 text-lg animate-fadeInUp delay-200">
              AI-powered log analysis with advanced threat detection using Google Gemini Pro
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Capabilities list */}
            <div className="space-y-8">
              {[
                {
                  title: "📄 JSON Log Processing",
                  description: "Upload and analyze JSON security logs up to 1GB with structured parsing and normalization",
                  metrics: "1GB file support, 1000+ events in <30s"
                },
                {
                  title: "🗂️ EVTX File Conversion",
                  description: "Dynamic Windows Event Log (EVTX) to JSON conversion with real-time threat analysis",
                  metrics: "100MB EVTX support, automatic Event ID mapping"
                },
                {
                  title: "🤖 Gemini AI Integration",
                  description: "Advanced threat detection using Google's Gemini Pro model with MITRE ATT&CK framework mapping",
                  metrics: "95%+ accuracy, real-time classification"
                },
                {
                  title: "📊 Interactive Dashboard",
                  description: "Real-time threat visualization with sortable tables and detailed incident analysis",
                  metrics: "Sub-second UI updates, color-coded risk levels"
                },
                {
                  title: "🛡️ Threat Classification",
                  description: "Automatic categorization of Normal, Anomalous, and Malicious events with confidence scoring",
                  metrics: "6-dimensional analysis, PDF report generation"
                }
              ].map((capability, index) => (
                <div 
                  key={index}
                  className="animate-fadeInLeft hover-lift"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <h3 className="text-xl font-semibold text-white mb-2">{capability.title}</h3>
                  <p className="text-gray-400 mb-2">{capability.description}</p>
                  <p className="text-red-400 text-sm font-medium">{capability.metrics}</p>
                </div>
              ))}
            </div>

            {/* Right side - Visual representation */}
            <div className="relative">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 animate-fadeInRight delay-400 hover-lift hover-glow">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-semibold text-white mb-2">Gemini AI Analysis Pipeline</h4>
                  <p className="text-gray-400 text-sm">Real-time JSON log processing</p>
                </div>
                
                {/* Mock dashboard elements */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg animate-slideInUp delay-600 hover-glow">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulseGlow"></div>
                      <span className="text-white text-sm">Malicious Events</span>
                    </div>
                    <span className="text-red-400 font-semibold">23</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg animate-slideInUp delay-700 hover-glow">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulseGlow delay-300"></div>
                      <span className="text-white text-sm">Anomalous Events</span>
                    </div>
                    <span className="text-orange-400 font-semibold">147</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg animate-slideInUp delay-800 hover-glow">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulseGlow delay-500"></div>
                      <span className="text-white text-sm">Normal Events</span>
                    </div>
                    <span className="text-green-400 font-semibold">2,847</span>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-lg animate-scaleIn delay-900 hover-glow">
                    <div className="text-red-400 text-xs font-medium mb-1">MITRE ATT&CK Classification</div>
                    <div className="text-white text-sm">T1078 - Valid Accounts</div>
                    <div className="text-gray-400 text-xs mt-1">Confidence: 94.7%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PERFORMANCE SECTION */}
      <div id="stats" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 animate-fadeInDown">AI-Powered Analysis Performance</h2>
            <p className="text-gray-400 text-lg animate-fadeInUp delay-200">
              Gemini Pro model delivers industry-leading accuracy and speed
            </p>
          </div>

          {/* Performance Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              { 
                value: "95%+", 
                label: "AI Accuracy", 
                icon: <Target className="w-8 h-8" />,
                description: "Gemini Pro threat detection"
              },
              { 
                value: "<30s", 
                label: "Processing Time", 
                icon: <Zap className="w-8 h-8" />,
                description: "1000+ events analysis"
              },
              { 
                value: "1GB", 
                label: "File Support", 
                icon: <Upload className="w-8 h-8" />,
                description: "Large JSON log files"
              },
              { 
                value: "6D", 
                label: "Threat Analysis", 
                icon: <BarChart3 className="w-8 h-8" />,
                description: "Multi-dimensional scoring"
              }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-8 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 hover:border-red-500/30 transition-all duration-300 animate-bounceIn hover-lift hover-glow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-red-400 mb-4 flex justify-center animate-rotateIn" style={{ animationDelay: `${200 + index * 100}ms` }}>
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-white mb-2 animate-scaleIn" style={{ animationDelay: `${300 + index * 100}ms` }}>{stat.value}</div>
                <div className="text-lg font-semibold text-gray-300 mb-2">{stat.label}</div>
                <div className="text-sm text-gray-400">{stat.description}</div>
              </div>
            ))}
          </div>

          {/* Performance Comparison */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 animate-fadeInUp delay-600 hover-lift">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Threat Detection Capabilities</h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  category: "Authentication Threats",
                  threats: ["Failed logins", "Brute force attacks", "Credential stuffing"],
                  detection: "Real-time"
                },
                {
                  category: "Network Security",
                  threats: ["Suspicious IPs", "External connections", "Port scanning"],
                  detection: "Pattern-based"
                },
                {
                  category: "Data Protection",
                  threats: ["Large transfers", "Sensitive access", "SQL injection"],
                  detection: "Behavioral"
                }
              ].map((category, index) => (
                <div key={index} className="text-center">
                  <h4 className="text-lg font-semibold text-white mb-4 animate-fadeInDown" style={{ animationDelay: `${700 + index * 100}ms` }}>{category.category}</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg animate-scaleIn hover-glow" style={{ animationDelay: `${800 + index * 100}ms` }}>
                      <div className="text-red-400 text-sm font-medium mb-2">Detection Method</div>
                      <div className="text-xl font-bold text-white mb-3">{category.detection}</div>
                      <div className="space-y-1">
                        {category.threats.map((threat, i) => (
                          <div key={i} className="text-gray-300 text-sm animate-fadeInLeft" style={{ animationDelay: `${900 + index * 100 + i * 50}ms` }}>• {threat}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* FEATURES SECTION */}
      <div id="features" className="relative z-10 py-20 bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 animate-fadeInDown">Advanced Security Features</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto animate-fadeInUp delay-200">
              Comprehensive JSON log analysis powered by Google Gemini AI with MITRE ATT&CK framework integration
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-8 h-8" />,
                title: "Gemini AI Analysis",
                description: "Google's Gemini Pro model provides advanced pattern recognition and threat classification with confidence scoring"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "MITRE ATT&CK Mapping",
                description: "Industry-standard threat categorization with detailed attack technique identification and response guidance"
              },
              {
                icon: <Activity className="w-8 h-8" />,
                title: "Real-time Processing",
                description: "Instant analysis of uploaded JSON logs with sub-second threat detection and classification"
              },
              {
                icon: <FileSearch className="w-8 h-8" />,
                title: "Threat Surface Mapping",
                description: "6-dimensional security analysis with interactive radar charts and risk scoring (0-100 scale)"
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "Incident Reports",
                description: "Detailed PDF reports with AI-generated insights, recommendations, and visual threat analysis"
              },
              {
                icon: <Eye className="w-8 h-8" />,
                title: "Interactive Dashboard",
                description: "Real-time threat visualization with sortable tables, color-coded risk levels, and detailed event analysis"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 hover:border-red-500/30 transition-all duration-300 hover:transform hover:scale-105 animate-bounceIn hover-lift hover-glow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-red-400 mb-4 group-hover:text-red-300 transition-colors animate-rotateIn" style={{ animationDelay: `${200 + index * 100}ms` }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-red-100 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TECH STACK */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 animate-fade-in">Technical Architecture</h2>
            <p className="text-gray-400 text-lg animate-fade-in delay-200">
              Built with cutting-edge tools and frameworks for maximum performance and scalability
            </p>
          </div>

          {/* Architecture Overview */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
              <h3 className="text-2xl font-bold text-white mb-6">AI Processing Pipeline</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Data Ingestion</h4>
                    <p className="text-gray-400 text-sm">JSON file upload, validation (up to 1GB), structured parsing and normalization</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">AI Threat Analysis</h4>
                    <p className="text-gray-400 text-sm">Gemini Pro pattern recognition, MITRE ATT&CK mapping, risk scoring</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Intelligence Generation</h4>
                    <p className="text-gray-400 text-sm">Detailed analysis, actionable recommendations, executive reporting</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Supported Log Formats</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="text-red-400 font-semibold mb-2">Authentication Logs</h4>
                  <p className="text-gray-400 text-sm">Login attempts, failures, successes, user sessions</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="text-red-400 font-semibold mb-2">System Access Logs</h4>
                  <p className="text-gray-400 text-sm">File access, command execution, privilege changes</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="text-red-400 font-semibold mb-2">Network Activity</h4>
                  <p className="text-gray-400 text-sm">IP addresses, external connections, traffic patterns</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="text-red-400 font-semibold mb-2">Application Security</h4>
                  <p className="text-gray-400 text-sm">Script execution, data exports, injection attempts</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70 hover:opacity-100 transition-opacity duration-300">
            {[
              { name: "Google Gemini Pro", color: "from-red-400 to-orange-400" },
              { name: "Next.js 14", color: "from-red-500 to-red-600" },
              { name: "TypeScript", color: "from-orange-400 to-red-500" },
              { name: "Tailwind CSS", color: "from-red-600 to-orange-500" },
              { name: "Recharts", color: "from-orange-500 to-red-400" },
              { name: "MITRE ATT&CK", color: "from-red-400 to-orange-600" }
            ].map((tech, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 px-6 py-3 bg-gray-900/30 rounded-full border border-gray-800 hover:border-red-500/30 transition-all duration-300 animate-fadeInUp hover-lift hover-glow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-6 h-6 bg-gradient-to-r ${tech.color} rounded-full animate-pulseGlow`}></div>
                <span className="text-white font-medium">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK START SECTION */}
      <div className="relative z-10 py-20 bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 animate-fadeInDown">Quick Start Guide</h2>
            <p className="text-gray-400 text-lg animate-fadeInUp delay-200">
              Get started with AI-powered JSON security analysis in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              {
                step: "1",
                title: "Upload JSON Logs",
                description: "Drag & drop or browse to upload JSON security log files up to 1GB",
                icon: <Upload className="w-8 h-8" />
              },
              {
                step: "2", 
                title: "AI Analysis",
                description: "Gemini Pro analyzes patterns and classifies threats using MITRE ATT&CK framework",
                icon: <Brain className="w-8 h-8" />
              },
              {
                step: "3",
                title: "Review Results",
                description: "Interactive dashboard shows threat classification with confidence scores",
                icon: <BarChart3 className="w-8 h-8" />
              },
              {
                step: "4",
                title: "Generate Reports",
                description: "Download detailed PDF reports with AI insights and recommendations",
                icon: <FileSearch className="w-8 h-8" />
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 hover:border-red-500/30 transition-all duration-300 animate-bounceIn hover-lift hover-glow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 animate-pulseGlow">
                  {item.step}
                </div>
                <div className="text-red-400 mb-4 flex justify-center animate-rotateIn" style={{ animationDelay: `${200 + index * 100}ms` }}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 max-w-2xl mx-auto animate-scaleIn delay-600 hover-lift hover-glow">
              <h3 className="text-xl font-bold text-white mb-4">Try Sample Data</h3>
              <p className="text-gray-400 mb-6">
                Test the platform with included sample security log data containing various threat scenarios including 
                authentication attacks, SQL injection attempts, and data exfiltration activities.
              </p>
              <button
                onClick={onTryDemo}
                className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-red-500/25 transform hover:scale-105 animate-shimmer hover-glow"
              >
                Try Sample Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}