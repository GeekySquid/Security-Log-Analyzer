'use client';

import React from 'react';
import { Shield } from 'lucide-react';

interface LandingHeaderProps {
    onEnterApp?: () => void;
    showLaunchButton?: boolean;
    onBack?: () => void;
}

export default function LandingHeader({ onEnterApp, showLaunchButton = true, onBack }: LandingHeaderProps) {
    return (
        <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 bg-[#040806]/50 backdrop-blur-md animate-fadeInDown">
            <div className="flex items-center space-x-3 cursor-pointer hover-scale animate-fadeInLeft" onClick={() => window.location.href = '/'}>
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 animate-pulseGlow">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                    <span className="text-lg font-bold tracking-tight text-white">CYBER DEFENSE</span>
                    <span className="text-red-400 text-xs ml-2 font-mono animate-shimmer">AI</span>
                </div>
            </div>

            {showLaunchButton ? (
                <>
                    <div className="hidden md:flex items-center space-x-8 text-sm text-gray-400 animate-fadeInUp delay-200">
                        <a href="#features" className="hover:text-red-400 transition-colors hover-scale">Features</a>
                        <a href="#capabilities" className="hover:text-red-400 transition-colors hover-scale">Capabilities</a>
                        <a href="#stats" className="hover:text-red-400 transition-colors hover-scale">Performance</a>
                    </div>
                    <button
                        onClick={onEnterApp}
                        className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-red-600/20 hover:shadow-red-500/30 animate-fadeInRight hover-lift hover-glow animate-shimmer"
                    >
                        Launch Platform
                    </button>
                </>
            ) : (
                <button
                    onClick={onBack ? onBack : () => window.location.href = '/'}
                    className="text-gray-400 hover:text-red-400 text-sm font-medium transition-colors animate-fadeInRight hover-scale"
                >
                    Back to Home
                </button>
            )}
        </nav>
    );
}
