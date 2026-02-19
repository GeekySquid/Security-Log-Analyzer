'use client';

import JsonLogProcessor from '@/components/JsonLogProcessor';
import Link from 'next/link';
import { ArrowLeft, FileText, Activity } from 'lucide-react';

export default function JSONAnalysisPage() {
  return (
    <div className="min-h-screen bg-black">
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
                <FileText className="h-6 w-6 text-red-400 animate-pulseGlow" />
                <h1 className="text-xl font-bold text-white">
                  JSON Security Analyzer
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/evtx"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 text-orange-400 hover:text-white hover:bg-orange-600/20 transition-all duration-300 rounded-lg border border-orange-500/30 hover-glow"
              >
                <Activity className="h-4 w-4" />
                <span>EVTX Analyzer</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <JsonLogProcessor onBack={() => {}} />
    </div>
  );
}