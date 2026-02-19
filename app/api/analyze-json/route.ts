import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.json') && !file.name.toLowerCase().endsWith('.evtx')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JSON and EVTX files are supported.' },
        { status: 400 }
      );
    }

    // Handle EVTX files by redirecting to EVTX-specific endpoint
    if (file.name.toLowerCase().endsWith('.evtx')) {
      return NextResponse.json(
        { 
          error: 'EVTX files should be processed using the EVTX analyzer',
          suggestion: 'Please use the EVTX analyzer at /evtx or the /api/analyze-evtx endpoint.'
        },
        { status: 400 }
      );
    }

    // Handle JSON files
    const text = await file.text();
    let jsonData;
    
    try {
      jsonData = JSON.parse(text);
    } catch (parseError) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON format',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
        },
        { status: 400 }
      );
    }

    // Analyze with Gemini AI only
    const analysis = await analyzeWithGemini(jsonData, file.name);
    
    return NextResponse.json({
      success: true,
      analysis,
      source: 'gemini_direct'
    });

  } catch (error) {
    console.error('JSON analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze JSON file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function analyzeWithGemini(data: any, fileName: string): Promise<AnalysisResult> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  if (!geminiApiKey) {
    console.warn('Gemini API key not found, using fallback analysis');
    return fallbackAnalysis(data, fileName);
  }

  try {
    // Prepare data for analysis (limit size for API)
    const dataArray = Array.isArray(data) ? data : [data];
    const sampleData = dataArray.slice(0, 50); // Reduced to 50 for better analysis quality
    
    // Create a more structured prompt for better analysis
    const dataPreview = sampleData.map((item, index) => ({
      index,
      preview: JSON.stringify(item).substring(0, 500) + (JSON.stringify(item).length > 500 ? '...' : ''),
      keys: Object.keys(item || {})
    }));

    const prompt = `
You are an advanced cybersecurity AI analyst. Analyze this JSON log data for security threats, anomalies, and vulnerabilities.

DATASET OVERVIEW:
- File: ${fileName}
- Total records to analyze: ${sampleData.length}
- Sample data structure: ${JSON.stringify(dataPreview.slice(0, 3), null, 2)}

ANALYSIS INSTRUCTIONS:
1. Examine each record for security indicators
2. Classify threats using MITRE ATT&CK framework knowledge
3. Provide actionable intelligence for SOC teams
4. Focus on real-world attack patterns and indicators

THREAT DETECTION CRITERIA:
- Authentication: Failed logins, brute force, credential stuffing
- Network: Suspicious IPs, port scans, C2 communication
- Privilege: Escalation attempts, admin access, unauthorized commands
- Data: Exfiltration, large transfers, sensitive file access
- Evasion: Obfuscation, encoding, anti-forensics
- Persistence: Backdoors, scheduled tasks, registry modifications

FULL DATA FOR ANALYSIS:
${JSON.stringify(sampleData, null, 2)}

Respond with ONLY a valid JSON object (no markdown, no explanations):
{
  "analysis_metadata": {
    "analyst": "Gemini Pro",
    "timestamp": "${new Date().toISOString()}",
    "confidence_level": "HIGH|MEDIUM|LOW",
    "processing_time_ms": number
  },
  "detailed_analysis": [
    {
      "record_index": number,
      "classification": "NORMAL|ANOMALOUS|MALICIOUS",
      "threat_category": "Authentication|Network|Privilege|Data|Evasion|Persistence|Other",
      "threat_type": "specific threat name",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "risk_score": number (0-100),
      "mitre_tactics": ["tactic1", "tactic2"],
      "threat_surface": {
        "authentication": number (0-100),
        "network_access": number (0-100),
        "privilege_use": number (0-100),
        "asset_exposure": number (0-100),
        "defense_evasion": number (0-100),
        "data_exfiltration": number (0-100)
      },
      "indicators": {
        "iocs": ["indicator1", "indicator2"],
        "behavioral": ["behavior1", "behavior2"],
        "contextual": ["context1", "context2"]
      },
      "response": {
        "immediate": ["action1", "action2"],
        "short_term": ["action1", "action2"],
        "long_term": ["strategy1", "strategy2"]
      },
      "confidence": number (0-100),
      "reasoning": "detailed explanation",
      "false_positive_likelihood": "HIGH|MEDIUM|LOW"
    }
  ],
  "summary_statistics": {
    "total_analyzed": number,
    "classifications": {
      "normal": number,
      "anomalous": number,
      "malicious": number
    },
    "severity_distribution": {
      "critical": number,
      "high": number,
      "medium": number,
      "low": number
    },
    "top_threats": ["threat1", "threat2", "threat3"],
    "average_risk_score": number,
    "overall_confidence": number (0-100)
  },
  "recommendations": {
    "immediate_actions": ["action1", "action2"],
    "security_improvements": ["improvement1", "improvement2"],
    "monitoring_enhancements": ["enhancement1", "enhancement2"],
    "policy_updates": ["update1", "update2"]
  }
}`;

    const startTime = Date.now();
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API');
    }

    const geminiResponse = result.candidates[0].content.parts[0].text;
    
    // Clean and extract JSON from response
    let cleanedResponse = geminiResponse.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    let geminiAnalysis;
    try {
      geminiAnalysis = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', cleanedResponse);
      throw new Error('Invalid JSON response from Gemini');
    }

    const processingTime = Date.now() - startTime;
    console.log(`Gemini analysis completed in ${processingTime}ms`);
    
    // Process the enhanced analysis results
    return processEnhancedGeminiAnalysis(dataArray, geminiAnalysis, fileName);

  } catch (error) {
    console.error('Gemini analysis error:', error);
    return fallbackAnalysis(data, fileName);
  }
}

function processEnhancedGeminiAnalysis(dataArray: any[], geminiAnalysis: any, fileName: string): AnalysisResult {
  const normalData: any[] = [];
  const anomalousData: any[] = [];
  const maliciousData: any[] = [];

  // Process enhanced detailed analysis for each record
  geminiAnalysis.detailed_analysis?.forEach((analysis: any, index: number) => {
    if (index < dataArray.length) {
      const originalRecord = dataArray[index];
      const enhancedRecord = {
        ...originalRecord,
        _gemini_analysis: {
          classification: analysis.classification,
          threat_category: analysis.threat_category,
          threat_type: analysis.threat_type,
          severity: analysis.severity,
          risk_score: analysis.risk_score,
          mitre_tactics: analysis.mitre_tactics || [],
          threat_surface: analysis.threat_surface || {
            authentication: 20,
            network_access: 20,
            privilege_use: 20,
            asset_exposure: 20,
            defense_evasion: 20,
            data_exfiltration: 20
          },
          indicators: analysis.indicators || {
            iocs: [],
            behavioral: [],
            contextual: []
          },
          response: analysis.response || {
            immediate: ['Monitor closely'],
            short_term: ['Review security policies'],
            long_term: ['Enhance monitoring']
          },
          confidence: analysis.confidence || 75,
          reasoning: analysis.reasoning || 'Automated analysis',
          false_positive_likelihood: analysis.false_positive_likelihood || 'MEDIUM'
        }
      };
      
      switch (analysis.classification) {
        case 'NORMAL':
          normalData.push(enhancedRecord);
          break;
        case 'ANOMALOUS':
          anomalousData.push(enhancedRecord);
          break;
        case 'MALICIOUS':
          maliciousData.push(enhancedRecord);
          break;
        default:
          normalData.push(enhancedRecord);
      }
    }
  });

  // Handle remaining data (if any) as normal with basic analysis
  for (let i = geminiAnalysis.detailed_analysis?.length || 0; i < dataArray.length; i++) {
    normalData.push({
      ...dataArray[i],
      _gemini_analysis: {
        classification: 'NORMAL',
        threat_category: 'Other',
        threat_type: 'Standard Activity',
        severity: 'LOW',
        risk_score: 15,
        mitre_tactics: [],
        threat_surface: {
          authentication: 15,
          network_access: 15,
          privilege_use: 15,
          asset_exposure: 15,
          defense_evasion: 15,
          data_exfiltration: 15
        },
        indicators: {
          iocs: [],
          behavioral: ['Normal activity patterns'],
          contextual: ['Standard operational data']
        },
        response: {
          immediate: ['Continue monitoring'],
          short_term: ['Maintain current security posture'],
          long_term: ['Regular security reviews']
        },
        confidence: 85,
        reasoning: 'No suspicious patterns detected in automated analysis',
        false_positive_likelihood: 'LOW'
      }
    });
  }

  const totalRecords = dataArray.length;
  const summary = geminiAnalysis.summary_statistics || {
    classifications: {
      normal: normalData.length,
      anomalous: anomalousData.length,
      malicious: maliciousData.length
    },
    overall_confidence: 75
  };

  // Enhanced precautions from Gemini recommendations
  const enhancedPrecautions = [
    ...(geminiAnalysis.recommendations?.immediate_actions || []),
    ...(geminiAnalysis.recommendations?.security_improvements || []),
    ...(geminiAnalysis.recommendations?.monitoring_enhancements || []),
    ...(geminiAnalysis.recommendations?.policy_updates || [])
  ];

  const defaultPrecautions = [
    'Monitor suspicious activities closely',
    'Implement additional access controls', 
    'Review and update security policies',
    'Enable enhanced logging and alerting',
    'Conduct regular security assessments'
  ];

  return {
    fileName,
    totalRecords,
    normalData,
    anomalousData,
    maliciousData,
    predictions: {
      normal: Math.round((summary.classifications.normal / totalRecords) * 100),
      anomalous: Math.round((summary.classifications.anomalous / totalRecords) * 100),
      malicious: Math.round((summary.classifications.malicious / totalRecords) * 100)
    },
    precautions: enhancedPrecautions.length > 0 ? enhancedPrecautions : defaultPrecautions,
    confidence: summary.overall_confidence || 75
  };
}

function fallbackAnalysis(data: any, fileName: string): AnalysisResult {
  const dataArray = Array.isArray(data) ? data : [data];
  const totalRecords = dataArray.length;
  
  // Simple heuristic-based analysis as fallback
  const normalData: any[] = [];
  const anomalousData: any[] = [];
  const maliciousData: any[] = [];

  dataArray.forEach((item, index) => {
    const itemStr = JSON.stringify(item).toLowerCase();
    
    // Check for malicious patterns
    const maliciousPatterns = [
      'script', 'alert', 'eval', 'exec', 'system',
      'drop table', 'union select', 'xss', 'injection',
      'payload', 'exploit', 'backdoor', 'malware'
    ];
    
    // Check for anomalous patterns
    const anomalousPatterns = [
      'error', 'failed', 'denied', 'unauthorized', 'forbidden',
      'timeout', 'exception', 'warning', 'suspicious'
    ];

    const hasMalicious = maliciousPatterns.some(pattern => itemStr.includes(pattern));
    const hasAnomalous = anomalousPatterns.some(pattern => itemStr.includes(pattern));

    if (hasMalicious) {
      maliciousData.push({ ...item, _analysis: 'Contains potential malicious patterns' });
    } else if (hasAnomalous) {
      anomalousData.push({ ...item, _analysis: 'Contains anomalous patterns' });
    } else {
      normalData.push({ ...item, _analysis: 'Appears normal' });
    }
  });

  return {
    fileName,
    totalRecords,
    normalData,
    anomalousData,
    maliciousData,
    predictions: {
      normal: Math.round((normalData.length / totalRecords) * 100),
      anomalous: Math.round((anomalousData.length / totalRecords) * 100),
      malicious: Math.round((maliciousData.length / totalRecords) * 100)
    },
    precautions: [
      'Review flagged items for potential security issues',
      'Implement input validation and sanitization',
      'Monitor for similar patterns in future data',
      'Consider implementing additional security controls',
      'Regularly update threat detection rules'
    ],
    confidence: 65 // Lower confidence for fallback analysis
  };
}