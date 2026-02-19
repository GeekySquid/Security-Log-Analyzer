'use client';

import React from 'react';
import { Shield, CheckCircle2 } from 'lucide-react';

export default function LandingFooter() {
    return (
        <footer className="relative z-50 border-t border-gray-800/30 py-8 px-6 md:px-12 bg-[#040806] text-white animate-fadeInUp">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-3 mb-4 md:mb-0 animate-fadeInLeft">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center animate-pulseGlow">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-500 text-sm">AI Cyber Defense Platform © 2026</span>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-500 animate-fadeInRight">
                    <span className="flex items-center space-x-1.5 hover-scale">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-500 animate-pulseGlow" />
                        <span>Gemini AI Powered</span>
                    </span>
                    <span className="flex items-center space-x-1.5 hover-scale">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-500 animate-pulseGlow delay-300" />
                        <span>MITRE ATT&CK Compatible</span>
                    </span>
                </div>
            </div>
        </footer>
    );
}
