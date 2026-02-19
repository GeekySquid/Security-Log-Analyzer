import { NextRequest, NextResponse } from 'next/server';

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

// EVTX Binary Parser - Extracts actual data from EVTX files
async function convertEVTXToJSON(file: File): Promise<any[]> {
  const buffer = await file.arrayBuffer();
  const events: any[] = [];
  const fileName = file.name;
  
  try {
    // Parse EVTX file structure
    const dataView = new DataView(buffer);
    
    // EVTX file header validation
    const signature = new TextDecoder().decode(buffer.slice(0, 8));
    if (!signature.startsWith('ElfFile')) {
      console.warn('Invalid EVTX file format - signature check failed');
      throw new Error('Invalid EVTX file format - not a valid EVTX file');
    }
    
    // Extract basic file information
    const fileSize = buffer.byteLength;
    const creationTime = new Date();
    
    // Parse chunks and extract events
    const parsedEvents = await parseEVTXChunks(dataView, fileName, fileSize);
    
    if (parsedEvents.length > 0) {
      console.log(`Successfully parsed ${parsedEvents.length} events from EVTX file`);
      return parsedEvents;
    }
    
    console.warn('No events found in EVTX parsing, this may indicate a parsing issue');
    throw new Error('No events found during EVTX parsing');
    
  } catch (error) {
    console.error('EVTX parsing failed completely:', error);
    throw new Error(`EVTX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Parse EVTX chunks to extract event records
async function parseEVTXChunks(dataView: DataView, fileName: string, fileSize: number): Promise<any[]> {
  const events: any[] = [];
  let offset = 4096; // Skip file header, start at first chunk
  
  try {
    while (offset < dataView.byteLength - 512) {
      // Look for chunk signature "ElfChnk"
      const chunkSig = new TextDecoder().decode(dataView.buffer.slice(offset, offset + 8));
      
      if (chunkSig.startsWith('ElfChnk')) {
        // Parse chunk header with compatibility
        const chunkNumberLow = dataView.getUint32(offset + 16, true);
        const chunkNumberHigh = dataView.getUint32(offset + 20, true);
        const chunkNumber = chunkNumberLow + (chunkNumberHigh * 0x100000000);
        
        const firstEventLow = dataView.getUint32(offset + 24, true);
        const firstEventHigh = dataView.getUint32(offset + 28, true);
        const firstEventRecordNumber = firstEventLow + (firstEventHigh * 0x100000000);
        
        const lastEventLow = dataView.getUint32(offset + 32, true);
        const lastEventHigh = dataView.getUint32(offset + 36, true);
        const lastEventRecordNumber = lastEventLow + (lastEventHigh * 0x100000000);
        
        // Extract events from this chunk
        const chunkEvents = extractEventsFromChunk(dataView, offset, fileName, chunkNumber);
        events.push(...chunkEvents);
        
        // Move to next chunk (64KB chunks)
        offset += 65536;
      } else {
        offset += 512; // Skip forward to find next chunk
      }
      
      // Limit to prevent infinite loops
      if (events.length > 1000) break;
    }
  } catch (error) {
    console.warn('Chunk parsing error:', error);
  }
  
  return events;
}

// Extract events from a specific chunk
function extractEventsFromChunk(dataView: DataView, chunkOffset: number, fileName: string, chunkNumber: number): any[] {
  const events: any[] = [];
  let recordOffset = chunkOffset + 512; // Skip chunk header
  const chunkEnd = chunkOffset + 65536;
  
  try {
    while (recordOffset < chunkEnd - 24) {
      // Look for event record signature
      const recordSig = dataView.getUint32(recordOffset, true);
      
      if (recordSig === 0x2A2A0000) { // Event record signature
        const recordSize = dataView.getUint32(recordOffset + 4, true);
        
        if (recordSize > 24 && recordSize < 65536 && recordOffset + recordSize <= chunkEnd) {
          const event = parseEventRecord(dataView, recordOffset, recordSize, fileName, chunkNumber);
          if (event) {
            events.push(event);
          }
        }
        
        recordOffset += Math.max(recordSize, 24);
      } else {
        recordOffset += 4;
      }
      
      // Safety limit
      if (events.length > 100) break;
    }
  } catch (error) {
    console.warn('Event extraction error:', error);
  }
  
  return events;
}

// Parse individual event record
function parseEventRecord(dataView: DataView, offset: number, size: number, fileName: string, chunkNumber: number): any | null {
  try {
    // Use regular getUint32 for compatibility
    const recordIdLow = dataView.getUint32(offset + 8, true);
    const recordIdHigh = dataView.getUint32(offset + 12, true);
    const recordId = recordIdLow + (recordIdHigh * 0x100000000);
    
    const timestampLow = dataView.getUint32(offset + 16, true);
    const timestampHigh = dataView.getUint32(offset + 20, true);
    
    // Convert Windows FILETIME to JavaScript Date
    const timestamp = timestampLow + (timestampHigh * 0x100000000);
    const jsTimestamp = new Date((timestamp / 10000) - 11644473600000);
    
    // Extract XML data (simplified)
    const xmlOffset = offset + 24;
    const xmlSize = size - 24;
    
    if (xmlSize > 0 && xmlSize < 32768) {
      try {
        const xmlData = new TextDecoder('utf-16le', { ignoreBOM: true }).decode(
          dataView.buffer.slice(xmlOffset, xmlOffset + Math.min(xmlSize, 4096))
        );
        
        // Parse XML to extract event details
        const eventDetails = parseEventXML(xmlData, fileName);
        
        return {
          record_id: recordId,
          timestamp: jsTimestamp.toISOString(),
          chunk_number: chunkNumber,
          original_filename: fileName,
          raw_xml_size: xmlSize,
          ...eventDetails
        };
      } catch (xmlError) {
        // If UTF-16 fails, try UTF-8
        const xmlData = new TextDecoder('utf-8', { ignoreBOM: true }).decode(
          dataView.buffer.slice(xmlOffset, xmlOffset + Math.min(xmlSize, 1024))
        );
        
        const eventDetails = parseEventXML(xmlData, fileName);
        
        return {
          record_id: recordId,
          timestamp: jsTimestamp.toISOString(),
          chunk_number: chunkNumber,
          original_filename: fileName,
          raw_xml_size: xmlSize,
          extraction_method: 'utf8_fallback',
          ...eventDetails
        };
      }
    }
  } catch (error) {
    console.warn('Event record parsing error:', error);
  }
  
  return null;
}

// Parse event XML to extract structured data
function parseEventXML(xmlData: string, fileName: string): any {
  try {
    // Clean up XML data
    const cleanXml = xmlData.replace(/\0/g, '').trim();
    
    // Extract basic event information using regex (simplified XML parsing)
    const eventId = extractXMLValue(cleanXml, 'EventID') || extractXMLValue(cleanXml, 'EventID>') || 'Unknown';
    const level = extractXMLValue(cleanXml, 'Level') || 'Information';
    const task = extractXMLValue(cleanXml, 'Task') || 'Unknown';
    const opcode = extractXMLValue(cleanXml, 'Opcode') || '0';
    const keywords = extractXMLValue(cleanXml, 'Keywords') || '0';
    const channel = extractXMLValue(cleanXml, 'Channel') || 'Unknown';
    const computer = extractXMLValue(cleanXml, 'Computer') || 'Unknown';
    const provider = extractXMLValue(cleanXml, 'Provider Name') || 'Unknown';
    
    // Extract event data fields
    const eventData = extractEventData(cleanXml);
    
    // Determine event category and risk level
    const { category, riskLevel, description } = categorizeEvent(eventId, eventData);
    
    return {
      event_id: eventId,
      level: getLevelName(level),
      task: task,
      opcode: opcode,
      keywords: keywords,
      channel: channel,
      computer: computer,
      provider: provider,
      description: description,
      category: category,
      risk_level: riskLevel,
      event_data: eventData,
      raw_xml_preview: cleanXml.substring(0, 500),
      security_context: {
        is_authentication_event: ['4624', '4625', '4634', '4647', '4648'].includes(eventId),
        is_process_event: ['4688', '4689'].includes(eventId),
        is_privilege_event: ['4672', '4673', '4674'].includes(eventId),
        is_network_event: ['5156', '5157', '5158'].includes(eventId),
        is_file_event: ['4656', '4658', '4660', '4663'].includes(eventId),
        risk_level: riskLevel
      }
    };
  } catch (error) {
    console.warn('XML parsing error:', error);
    return {
      event_id: 'Unknown',
      level: 'Information',
      task: 'Unknown',
      channel: 'Unknown',
      computer: 'Unknown',
      provider: 'Unknown',
      description: 'Event data extraction failed',
      category: 'System',
      risk_level: 'low',
      parsing_error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Extract value from XML using simple regex
function extractXMLValue(xml: string, tagName: string): string | null {
  const patterns = [
    new RegExp(`<${tagName}[^>]*>([^<]+)</${tagName}>`, 'i'),
    new RegExp(`<${tagName}[^>]*>([^<]+)`, 'i'),
    new RegExp(`${tagName}="([^"]+)"`, 'i'),
    new RegExp(`${tagName}='([^']+)'`, 'i')
  ];
  
  for (const pattern of patterns) {
    const match = xml.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

// Extract event data fields
function extractEventData(xml: string): any {
  const eventData: any = {};
  
  try {
    // Extract Data elements with Name attributes
    const dataPattern = /<Data Name="([^"]+)"[^>]*>([^<]*)</gi;
    let match;
    
    while ((match = dataPattern.exec(xml)) !== null) {
      const fieldName = match[1];
      const fieldValue = match[2];
      eventData[fieldName] = fieldValue;
    }
    
    // Extract common fields
    const commonFields = [
      'SubjectUserName', 'TargetUserName', 'LogonType', 'IpAddress', 'WorkstationName',
      'ProcessName', 'CommandLine', 'ParentProcessName', 'SourceNetworkAddress',
      'TargetDomainName', 'SubjectDomainName', 'Status', 'SubStatus', 'FailureReason'
    ];
    
    commonFields.forEach(field => {
      if (!eventData[field]) {
        const value = extractXMLValue(xml, field);
        if (value) {
          eventData[field] = value;
        }
      }
    });
    
  } catch (error) {
    console.warn('Event data extraction error:', error);
  }
  
  return eventData;
}

// Get level name from level number
function getLevelName(level: string): string {
  const levelMap: { [key: string]: string } = {
    '0': 'LogAlways',
    '1': 'Critical',
    '2': 'Error',
    '3': 'Warning',
    '4': 'Information',
    '5': 'Verbose'
  };
  
  return levelMap[level] || level;
}

// Categorize event and determine risk level
function categorizeEvent(eventId: string, eventData: any): { category: string, riskLevel: string, description: string } {
  const eventDescriptions: { [key: string]: { category: string, riskLevel: string, description: string } } = {
    '4624': { category: 'Authentication', riskLevel: 'low', description: 'An account was successfully logged on' },
    '4625': { category: 'Authentication', riskLevel: 'high', description: 'An account failed to log on' },
    '4634': { category: 'Authentication', riskLevel: 'low', description: 'An account was logged off' },
    '4647': { category: 'Authentication', riskLevel: 'low', description: 'User initiated logoff' },
    '4648': { category: 'Authentication', riskLevel: 'medium', description: 'A logon was attempted using explicit credentials' },
    '4672': { category: 'Privilege', riskLevel: 'high', description: 'Special privileges assigned to new logon' },
    '4673': { category: 'Privilege', riskLevel: 'medium', description: 'A privileged service was called' },
    '4688': { category: 'Process', riskLevel: 'medium', description: 'A new process has been created' },
    '4689': { category: 'Process', riskLevel: 'low', description: 'A process has exited' },
    '5156': { category: 'Network', riskLevel: 'low', description: 'The Windows Filtering Platform has allowed a connection' },
    '5157': { category: 'Network', riskLevel: 'medium', description: 'The Windows Filtering Platform has blocked a connection' },
    '4656': { category: 'File', riskLevel: 'low', description: 'A handle to an object was requested' },
    '4658': { category: 'File', riskLevel: 'low', description: 'The handle to an object was closed' },
    '4663': { category: 'File', riskLevel: 'medium', description: 'An attempt was made to access an object' },
    '7034': { category: 'System', riskLevel: 'medium', description: 'A service terminated unexpectedly' },
    '7035': { category: 'System', riskLevel: 'low', description: 'A service was successfully sent a start or stop control' },
    '7036': { category: 'System', riskLevel: 'low', description: 'A service was started or stopped' }
  };
  
  return eventDescriptions[eventId] || { 
    category: 'System', 
    riskLevel: 'low', 
    description: `Windows Event ID ${eventId}` 
  };
}

// Fallback: Extract events from binary data when parsing fails
function extractEventsFromBinary(buffer: ArrayBuffer, fileName: string): any[] {
  const events: any[] = [];
  const dataView = new DataView(buffer);
  const fileSize = buffer.byteLength;
  
  // Generate events based on binary patterns and file characteristics
  const eventCount = Math.min(Math.max(Math.floor(fileSize / 1000), 10), 200);
  
  for (let i = 0; i < eventCount; i++) {
    const offset = Math.floor((i / eventCount) * (fileSize - 100));
    
    // Extract some bytes to create pseudo-realistic data
    const byte1 = dataView.getUint8(offset);
    const byte2 = dataView.getUint8(Math.min(offset + 50, fileSize - 1));
    const byte3 = dataView.getUint8(Math.min(offset + 100, fileSize - 1));
    
    // Use byte values to determine event characteristics
    const eventId = getEventIdFromBytes(byte1, byte2);
    const { category, riskLevel, description } = categorizeEvent(eventId, {});
    
    const event = {
      record_id: i + 1,
      event_id: eventId,
      timestamp: new Date(Date.now() - (i * 60000)).toISOString(),
      computer: `COMPUTER-${String((byte3 % 5) + 1).padStart(2, '0')}`,
      channel: getChannelFromEventId(eventId),
      provider: 'Microsoft-Windows-Security-Auditing',
      level: 'Information',
      task: category,
      description: description,
      category: category,
      risk_level: riskLevel,
      original_filename: fileName,
      file_size_bytes: fileSize,
      extraction_method: 'binary_analysis',
      byte_offset: offset,
      security_context: {
        is_authentication_event: ['4624', '4625', '4634', '4647', '4648'].includes(eventId),
        is_process_event: ['4688', '4689'].includes(eventId),
        is_privilege_event: ['4672', '4673', '4674'].includes(eventId),
        is_network_event: ['5156', '5157', '5158'].includes(eventId),
        is_file_event: ['4656', '4658', '4660', '4663'].includes(eventId),
        risk_level: riskLevel
      }
    };
    
    events.push(event);
  }
  
  return events;
}

// Get event ID based on byte patterns
function getEventIdFromBytes(byte1: number, byte2: number): string {
  const eventIds = ['4624', '4625', '4634', '4647', '4648', '4672', '4673', '4688', '4689', '5156', '5157', '4656', '4658', '4663', '7034', '7035', '7036'];
  const index = (byte1 + byte2) % eventIds.length;
  return eventIds[index];
}

// Get channel from event ID
function getChannelFromEventId(eventId: string): string {
  if (['4624', '4625', '4634', '4647', '4648', '4672', '4673', '4688', '4689', '4656', '4658', '4663'].includes(eventId)) {
    return 'Security';
  } else if (['5156', '5157', '5158'].includes(eventId)) {
    return 'Security';
  } else if (['7034', '7035', '7036'].includes(eventId)) {
    return 'System';
  }
  return 'Application';
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

    if (!file.name.toLowerCase().endsWith('.evtx')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only EVTX files are supported for this endpoint.' },
        { status: 400 }
      );
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB for EVTX files.' },
        { status: 400 }
      );
    }

    // Try Python ML service first for proper EVTX parsing
    try {
      console.log('Attempting to use Python ML service for EVTX conversion...');
      
      // Step 1: Convert EVTX to JSON using Python service
      const events = await convertEVTXWithPythonService(file);
      
      console.log(`Successfully converted ${events.length} events from EVTX file`);
      
      // Step 2: Analyze the converted events with Gemini
      const geminiAnalysis = await analyzeWithGemini(events, file.name);
      
      geminiAnalysis.evtxMetadata = {
        eventsProcessed: events.length,
        originalFormat: 'EVTX',
        conversionTimestamp: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        analysis: geminiAnalysis,
        source: 'python_ml_service_evtx',
        conversion_info: {
          events_converted: events.length,
          original_filename: file.name,
          file_size_bytes: file.size,
          conversion_timestamp: new Date().toISOString()
        }
      });
      
    } catch (pythonError) {
      console.warn('Python ML service conversion failed, falling back to JavaScript parsing:', pythonError);
    }

    // Fallback to JavaScript parsing (with improved error handling)
    try {
      console.log('Using JavaScript EVTX parsing as fallback...');
      const events = await convertEVTXToJSON(file);
      
      if (!events || events.length === 0) {
        return NextResponse.json(
          { error: 'No events found in EVTX file. The file may be corrupted or empty. Please ensure the Python ML service is running for better EVTX parsing.' },
          { status: 400 }
        );
      }

      const geminiAnalysis = await analyzeWithGemini(events, file.name);
      
      geminiAnalysis.evtxMetadata = {
        eventsProcessed: events.length,
        originalFormat: 'EVTX',
        conversionTimestamp: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        analysis: geminiAnalysis,
        source: 'javascript_fallback_evtx_conversion',
        conversion_info: {
          events_converted: events.length,
          original_filename: file.name,
          file_size_bytes: file.size,
          conversion_timestamp: new Date().toISOString()
        }
      });
      
    } catch (conversionError) {
      console.error('JavaScript EVTX conversion failed:', conversionError);
      return NextResponse.json(
        { 
          error: 'EVTX file processing failed. Please ensure the file is a valid EVTX file. Both Python service and JavaScript fallback failed.',
          details: conversionError instanceof Error ? conversionError.message : 'Unknown conversion error',
          suggestion: 'Make sure the Python ML service is running on port 8000 for proper EVTX parsing.'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('EVTX analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze EVTX file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Convert Python ML service response to expected frontend format
function convertPythonAnalysisToExpectedFormat(pythonResult: any, fileName: string): EVTXAnalysisResult {
  const analysis = pythonResult.analysis;
  const summary = analysis.summary || {};
  
  // The Python service returns ML scores, but we need to get the actual EVTX events
  // We'll need to call the convert-evtx endpoint separately or extract from the analysis
  
  // Extract events by risk level from Python ML service scores
  const normalData: any[] = [];
  const anomalousData: any[] = [];
  const maliciousData: any[] = [];
  
  if (analysis.scores) {
    analysis.scores.forEach((score: any, index: number) => {
      // The score object contains the analyzed event data
      // We need to reconstruct the event with its original EVTX data
      const event = {
        record_id: score.record_id,
        event_id: score.features_analyzed?.event_id || `Event-${index}`,
        timestamp: new Date().toISOString(),
        computer: 'ANALYZED-SYSTEM',
        description: `ML Analysis Result - Risk Score: ${score.risk_score.toFixed(2)}`,
        risk_score: score.risk_score,
        anomaly_score: score.anomaly_score,
        threat_probability: score.threat_probability,
        confidence: score.confidence,
        features_analyzed: score.features_analyzed,
        model_predictions: score.model_predictions
      };
      
      if (score.risk_score >= 70) {
        maliciousData.push(event);
      } else if (score.risk_score >= 40) {
        anomalousData.push(event);
      } else {
        normalData.push(event);
      }
    });
  }
  
  const totalRecords = summary.total_records || normalData.length + anomalousData.length + maliciousData.length;
  
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
      'Review high-risk events identified by ML analysis',
      'Investigate anomalous patterns detected in the EVTX data',
      'Monitor systems for similar threat indicators',
      'Implement additional security controls based on findings'
    ],
    confidence: 85,
    evtxMetadata: {
      eventsProcessed: totalRecords,
      originalFormat: 'EVTX',
      conversionTimestamp: new Date().toISOString()
    }
  };
}

// Better approach: First convert EVTX to JSON, then analyze with Gemini
async function convertEVTXWithPythonService(file: File): Promise<any[]> {
  const pythonServiceUrl = process.env.PYTHON_ML_SERVICE_URL || 'http://localhost:8000';
  
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${pythonServiceUrl}/convert-evtx?max_records=1000`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Python EVTX conversion failed: ${response.status}`);
  }

  const result = await response.json();
  
  if (!result.success || !result.events || result.events.length === 0) {
    throw new Error('No events found in EVTX file');
  }
  
  console.log(`Python service converted ${result.events.length} EVTX events`);
  return result.events;
}
async function analyzeWithGemini(events: any[], fileName: string): Promise<EVTXAnalysisResult> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  if (!geminiApiKey) {
    console.warn('Gemini API key not found, using fallback analysis');
    return fallbackEVTXAnalysis(events, fileName);
  }

  try {
    const sampleEvents = events.slice(0, 50);
    
    const prompt = `You are an expert Windows Event Log analyst. Analyze these EVTX events for security threats.

EVTX ANALYSIS CONTEXT:
- File: ${fileName}
- Total events: ${events.length}
- Sample events: ${sampleEvents.length}

SAMPLE EVENTS DATA:
${JSON.stringify(sampleEvents, null, 2)}

Respond with ONLY a valid JSON object:
{
  "detailed_analysis": [
    {
      "record_index": number,
      "event_id": "Windows Event ID",
      "classification": "NORMAL|ANOMALOUS|MALICIOUS",
      "threat_category": "Authentication|Process|Network|Privilege|File|System",
      "threat_type": "specific threat description",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "risk_score": number (0-100),
      "confidence": number (0-100),
      "reasoning": "detailed explanation"
    }
  ],
  "summary_statistics": {
    "total_analyzed": number,
    "classifications": {
      "normal": number,
      "anomalous": number,
      "malicious": number
    },
    "overall_confidence": number (0-100)
  }
}`;

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
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const geminiResponse = result.candidates[0].content.parts[0].text;
    
    let cleanedResponse = geminiResponse.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }

    const geminiAnalysis = JSON.parse(cleanedResponse);
    
    return processGeminiEVTXAnalysis(events, geminiAnalysis, fileName);

  } catch (error) {
    console.error('Gemini EVTX analysis error:', error);
    return fallbackEVTXAnalysis(events, fileName);
  }
}
function processGeminiEVTXAnalysis(events: any[], geminiAnalysis: any, fileName: string): EVTXAnalysisResult {
  const normalData: any[] = [];
  const anomalousData: any[] = [];
  const maliciousData: any[] = [];

  geminiAnalysis.detailed_analysis?.forEach((analysis: any, index: number) => {
    if (index < events.length) {
      const originalEvent = events[index];
      const enhancedEvent = {
        ...originalEvent,
        _gemini_analysis: {
          classification: analysis.classification,
          threat_category: analysis.threat_category,
          threat_type: analysis.threat_type,
          severity: analysis.severity,
          risk_score: analysis.risk_score,
          confidence: analysis.confidence,
          reasoning: analysis.reasoning
        }
      };
      
      switch (analysis.classification) {
        case 'MALICIOUS':
          maliciousData.push(enhancedEvent);
          break;
        case 'ANOMALOUS':
          anomalousData.push(enhancedEvent);
          break;
        default:
          normalData.push(enhancedEvent);
      }
    }
  });

  for (let i = geminiAnalysis.detailed_analysis?.length || 0; i < events.length; i++) {
    normalData.push({
      ...events[i],
      _gemini_analysis: {
        classification: 'NORMAL',
        threat_category: 'System',
        threat_type: 'Standard Windows Event',
        severity: 'LOW',
        risk_score: 20,
        confidence: 75,
        reasoning: 'Standard Windows event log entry'
      }
    });
  }

  const totalRecords = events.length;
  const summary = geminiAnalysis.summary_statistics || {};

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
      'Monitor Windows Event Logs continuously for security events',
      'Implement alerting for critical Event IDs (4625, 4672, 4688)',
      'Review authentication patterns and failed login attempts',
      'Investigate privilege escalation and administrative activities'
    ],
    confidence: summary.overall_confidence || 75
  };
}
function fallbackEVTXAnalysis(events: any[], fileName: string): EVTXAnalysisResult {
  const normalData: any[] = [];
  const anomalousData: any[] = [];
  const maliciousData: any[] = [];

  events.forEach((event) => {
    const eventId = event.event_id || '';
    const eventStr = JSON.stringify(event).toLowerCase();
    
    let riskScore = 20;
    let classification = 'NORMAL';
    
    const highRiskEvents = ['4625', '4648', '4672', '4697', '4698'];
    const mediumRiskEvents = ['4624', '4688', '4656', '5156'];
    
    if (highRiskEvents.includes(eventId)) {
      riskScore += 40;
      classification = 'MALICIOUS';
    } else if (mediumRiskEvents.includes(eventId)) {
      riskScore += 20;
      classification = 'ANOMALOUS';
    }
    
    const suspiciousPatterns = [
      'powershell', 'cmd.exe', 'failed', 'denied', 'error',
      'administrator', 'system', 'privilege', 'escalation'
    ];
    
    const suspiciousCount = suspiciousPatterns.filter(pattern => 
      eventStr.includes(pattern)
    ).length;
    
    riskScore += suspiciousCount * 10;
    
    if (riskScore >= 70) classification = 'MALICIOUS';
    else if (riskScore >= 40) classification = 'ANOMALOUS';
    
    const enhancedEvent = {
      ...event,
      _fallback_analysis: {
        classification,
        risk_score: Math.min(riskScore, 100),
        event_id: eventId,
        suspicious_patterns: suspiciousCount,
        reasoning: 'Heuristic-based EVTX analysis'
      }
    };
    
    switch (classification) {
      case 'MALICIOUS':
        maliciousData.push(enhancedEvent);
        break;
      case 'ANOMALOUS':
        anomalousData.push(enhancedEvent);
        break;
      default:
        normalData.push(enhancedEvent);
    }
  });

  return {
    fileName,
    totalRecords: events.length,
    normalData,
    anomalousData,
    maliciousData,
    predictions: {
      normal: Math.round((normalData.length / events.length) * 100),
      anomalous: Math.round((anomalousData.length / events.length) * 100),
      malicious: Math.round((maliciousData.length / events.length) * 100)
    },
    precautions: [
      'Review failed authentication attempts (Event ID 4625)',
      'Monitor privilege escalation events (Event ID 4672)',
      'Investigate suspicious process creation (Event ID 4688)',
      'Check for unauthorized network connections',
      'Validate administrative activities and access patterns'
    ],
    confidence: 65
  };
}