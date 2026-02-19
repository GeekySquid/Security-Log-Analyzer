'use client';

import EVTXUploader from '@/components/EVTXUploader';
import Link from 'next/link';
import { ArrowLeft, Shield, Activity } from 'lucide-react';

export default function EVTXAnalysisPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 animate-pulse" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(239, 68, 68, 0.1) 1px, transparent 0)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 glass-effect border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors hover-scale"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-600" />
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-red-400 animate-pulseGlow" />
                <h1 className="text-xl font-bold text-white">
                  EVTX Security Analyzer
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/json"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 text-red-400 hover:text-white hover:bg-red-600/20 transition-all duration-300 rounded-lg border border-red-500/30 hover-glow"
              >
                <Activity className="h-4 w-4" />
                <span>JSON Analyzer</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <EVTXUploader />

      {/* Footer */}
      <div className="relative z-10 glass-effect border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-400">
            <p>
              Powered by Gemini AI and Windows Event Log analysis • 
              Supports dynamic EVTX file processing with real-time threat detection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}