'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Zap, Brain, Eye, ArrowRight, Play } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

const LandingHero: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Initialize particles for background animation
  useEffect(() => {
    const initialParticles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      initialParticles.push({
        id: i,
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
    setParticles(initialParticles);
  }, []);

  // Animate particles
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => {
        const newX = particle.x + particle.vx;
        const newY = particle.y + particle.vy;
        const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
        
        return {
          ...particle,
          x: newX > screenWidth ? 0 : newX < 0 ? screenWidth : newX,
          y: newY > screenHeight ? 0 : newY < 0 ? screenHeight : newY,
        };
      }));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  // Track mouse position for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const handleTryDemo = async () => {
    try {
      const response = await fetch('/sample-data.json');
      const sampleData = await response.json();
      
      // Trigger analysis with sample data
      const analysisResponse = await fetch('/api/analyze-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleData),
      });
      
      if (analysisResponse.ok) {
        // Navigate to dashboard or show results
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Failed to load demo data:', error);
    }
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms detect threats in real-time"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Threat Detection",
      description: "Identify and classify security incidents with 99.7% accuracy"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Real-time Monitoring",
      description: "Continuous surveillance of your network infrastructure"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Response",
      description: "Automated incident response and threat mitigation"
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
          }}
        />
        
        {/* Animated Particles */}
        <svg className="absolute inset-0 w-full h-full">
          {particles.map(particle => (
            <circle
              key={particle.id}
              cx={particle.x}
              cy={particle.y}
              r={particle.size}
              fill="rgba(59, 130, 246, 0.6)"
              opacity={particle.opacity}
              className="animate-pulse"
            />
          ))}
          
          {/* Connection Lines */}
          {particles.map((particle, i) => 
            particles.slice(i + 1).map((otherParticle, j) => {
              const distance = Math.sqrt(
                Math.pow(particle.x - otherParticle.x, 2) + 
                Math.pow(particle.y - otherParticle.y, 2)
              );
              
              if (distance < 100) {
                return (
                  <line
                    key={`${i}-${j}`}
                    x1={particle.x}
                    y1={particle.y}
                    x2={otherParticle.x}
                    y2={otherParticle.y}
                    stroke="rgba(59, 130, 246, 0.2)"
                    strokeWidth="1"
                    opacity={1 - distance / 100}
                  />
                );
              }
              return null;
            })
          )}
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          {/* Glowing Title */}
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            <span className="drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              CyberGuard AI
            </span>
          </h1>
          
          {/* Animated Tagline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            <span className="text-blue-400 font-semibold glow-text">Next-Generation</span> AI-Powered Cyber Defense Platform
            <br />
            <span className="text-purple-400">Detect • Analyze • Respond</span> to threats in real-time
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={handleTryDemo}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-white text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center gap-2"
            >
              <Play className="w-5 h-5 group-hover:animate-pulse" />
              Try Live Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="px-8 py-4 border-2 border-blue-400 rounded-lg font-semibold text-blue-400 text-lg transition-all duration-300 hover:bg-blue-400 hover:text-gray-900 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              View Documentation
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
            >
              <div className="text-blue-400 mb-4 group-hover:text-cyan-400 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Tech Stack Showcase */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-white mb-8">Powered by Cutting-Edge Technology</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70 hover:opacity-100 transition-opacity duration-300">
            {/* Gemini AI Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full border border-purple-500/30">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
              <span className="text-white font-medium">Gemini AI</span>
            </div>
            
            {/* Next.js */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full border border-gray-600">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-bold">N</span>
              </div>
              <span className="text-white font-medium">Next.js</span>
            </div>
            
            {/* TypeScript */}
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 rounded-full border border-blue-500/30">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">TS</span>
              </div>
              <span className="text-white font-medium">TypeScript</span>
            </div>
            
            {/* Tailwind CSS */}
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 rounded-full border border-cyan-500/30">
              <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded"></div>
              <span className="text-white font-medium">Tailwind CSS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-blue-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-blue-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LandingHero;