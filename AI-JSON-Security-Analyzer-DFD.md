# AI-Powered JSON Security Analyzer - Data Flow Diagram (DFD)

## Project Overview
The AI-Powered JSON Security Analyzer is a comprehensive cybersecurity platform that uses Google Gemini AI to analyze JSON log files for threats, anomalies, and security incidents. The system provides real-time analysis, threat classification, and detailed incident reporting.

## System Architecture Components

### 1. External Entities
- **Security Analyst/SOC Team**: Primary users who upload JSON logs and review analysis results
- **Google Gemini API**: External AI service for advanced threat analysis
- **JSON Log Sources**: Various systems generating security logs (firewalls, servers, applications)

### 2. Main Processes
- **P1**: File Upload & Validation
- **P2**: JSON Parsing & Preprocessing  
- **P3**: Gemini AI Analysis Engine
- **P4**: Threat Classification & Scoring
- **P5**: Threat Surface Analysis
- **P6**: Report Generation & Visualization
- **P7**: Dashboard Rendering & User Interface

### 3. Data Stores
- **D1**: Uploaded Files (Temporary)
- **D2**: Analysis Results Cache
- **D3**: Threat Intelligence Database
- **D4**: User Session Data

---

## Level 0 DFD (Context Diagram)

```
┌─────────────────┐    JSON Log Files    ┌─────────────────────────────────┐
│                 │ ──────────────────► │                                 │
│  Security       │                     │   AI-Powered JSON Security     │
│  Analyst/       │ ◄────────────────── │   Analyzer System              │
│  SOC Team       │   Analysis Reports  │                                 │
└─────────────────┘   & Dashboards      └─────────────────────────────────┘
                                                        │
                                                        │ API Requests
                                                        ▼
                                        ┌─────────────────────────────────┐
                                        │                                 │
                                        │     Google Gemini AI API       │
                                        │                                 │
                                        └─────────────────────────────────┘
```

---

## Level 1 DFD (System Overview)

```
┌─────────────────┐
│  Security       │
│  Analyst        │
└─────────┬───────┘
          │ JSON Files
          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AI JSON Security Analyzer                            │
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │     P1      │    │     P2      │    │     P3      │    │     P4      │     │
│  │   Upload    │───►│   Parse     │───►│   Gemini    │───►│  Classify   │     │
│  │ Validation  │    │   JSON      │    │  Analysis   │    │  Threats    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘     │
│          │                   │                   │                   │         │
│          ▼                   ▼                   ▲                   ▼         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │     D1      │    │     D2      │    │   Gemini    │    │     D3      │     │
│  │  Uploaded   │    │  Analysis   │    │     API     │    │   Threat    │     │
│  │   Files     │    │  Results    │    │             │    │Intelligence │     │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                                   │             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │             │
│  │     P7      │◄───│     P6      │◄───│     P5      │◄──────────┘             │
│  │ Dashboard   │    │   Report    │    │   Threat    │                         │
│  │ Rendering   │    │Generation   │    │  Surface    │                         │
│  └─────────────┘    └─────────────┘    └─────────────┘                         │
│          │                   │                                                  │
└──────────┼───────────────────┼──────────────────────────────────────────────────┘
           │                   │
           ▼                   ▼
┌─────────────────┐    ┌─────────────────┐
│   Interactive   │    │   PDF Reports   │
│   Dashboard     │    │   & Analytics   │
└─────────────────┘    └─────────────────┘
```

---

## Level 2 DFD (Detailed Process Breakdown)

### File Upload & Processing Flow

```
┌─────────────────┐
│  Security       │
│  Analyst        │
└─────────┬───────┘
          │ 1. JSON File Upload
          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              P1: Upload & Validation                           │
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   P1.1      │    │   P1.2      │    │   P1.3      │    │   P1.4      │     │
│  │   File      │───►│   Size      │───►│   Format    │───►│   Store     │     │
│  │  Receipt    │    │ Validation  │    │ Validation  │    │   File      │     │
│  │             │    │ (<1GB)      │    │  (.json)    │    │             │     │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘     │
│                              │                   │                   │         │
│                              ▼                   ▼                   ▼         │
│                      ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│                      │   Error     │    │   Error     │    │     D1      │     │
│                      │  Response   │    │  Response   │    │  Uploaded   │     │
│                      │ (Size Limit)│    │(Invalid JSON)│   │   Files     │     │
│                      └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                                                      │
                                                                      │ 2. Valid File
                                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              P2: JSON Parsing                                  │
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   P2.1      │    │   P2.2      │    │   P2.3      │    │   P2.4      │     │
│  │   Read      │───►│   Parse     │───►│  Normalize  │───►│   Store     │     │
│  │   File      │    │   JSON      │    │    Data     │    │  Parsed     │     │
│  │  Content    │    │  Structure  │    │  Structure  │    │   Data      │     │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘     │
│                              │                                       │         │
│                              ▼                                       ▼         │
│                      ┌─────────────┐                        ┌─────────────┐     │
│                      │   Parse     │                        │     D2      │     │
│                      │   Error     │                        │  Parsed     │     │
│                      │  Response   │                        │    Data     │     │
│                      └─────────────┘                        └─────────────┘     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### AI Analysis & Threat Detection Flow

```
┌─────────────┐
│     D2      │
│  Parsed     │ 3. Structured Data
│    Data     │────────────────────┐
└─────────────┘                    │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           P3: Gemini AI Analysis                               │
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   P3.1      │    │   P3.2      │    │   P3.3      │    │   P3.4      │     │
│  │  Prepare    │───►│   Send to   │───►│  Process    │───►│   Parse     │     │
│  │  Prompt     │    │   Gemini    │    │   Gemini    │    │  Response   │     │
│  │ & Context   │    │    API      │    │  Response   │    │             │     │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘     │
│          │                   │                   │                   │         │
│          │                   ▼                   ▲                   ▼         │
│          │          ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│          │          │   Gemini    │    │   API Key   │    │    AI       │     │
│          │          │     API     │    │ Validation  │    │  Analysis   │     │
│          │          │             │    │             │    │  Results    │     │
│          │          └─────────────┘    └─────────────┘    └─────────────┘     │
│          │                                                         │           │
│          │ 4. Fallback Analysis                                    │           │
│          ▼                                                         ▼           │
│  ┌─────────────┐                                          ┌─────────────┐     │
│  │   P3.5      │                                          │     D2      │     │
│  │  Heuristic  │─────────────────────────────────────────►│  Enhanced   │     │
│  │  Analysis   │          5. Basic Classification         │  Analysis   │     │
│  │ (Fallback)  │                                          │  Results    │     │
│  └─────────────┘                                          └─────────────┘     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                                                      │
                                                                      │ 6. Analysis Data
                                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         P4: Threat Classification                              │
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   P4.1      │    │   P4.2      │    │   P4.3      │    │   P4.4      │     │
│  │ Categorize  │───►│   Risk      │───►│   MITRE     │───►│   Store     │     │
│  │  Threats    │    │  Scoring    │    │  ATT&CK     │    │Classified   │     │
│  │(N/A/M)      │    │  (0-100)    │    │  Mapping    │    │   Data      │     │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                                   │             │
│                                                                   ▼             │
│                                                          ┌─────────────┐       │
│                                                          │     D3      │       │
│                                                          │  Classified │       │
│                                                          │   Threats   │       │
│                                                          └─────────────┘       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Threat Surface Analysis & Visualization Flow

```
┌─────────────┐
│     D3      │
│ Classified  │ 7. Threat Data
│  Threats    │─────────────────┐
└─────────────┘                 │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        P5: Threat Surface Analysis                             │
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   P5.1      │    │   P5.2      │    │   P5.3      │    │   P5.4      │     │
│  │6-Dimension  │───►│   Radar     │───►│  Generate   │───►│   Store     │     │
│  │  Analysis   │    │   Chart     │    │  Insights   │    │  Analysis   │     │
│  │             │    │   Data      │    │             │    │             │     │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘     │
│          │                                                         │           │
│          ▼                                                         ▼           │
│  ┌─────────────┐                                          ┌─────────────┐     │
│  │ Dimensions: │                                          │     D2      │     │
│  │• Auth       │                                          │   Threat    │     │
│  │• Network    │                                          │  Surface    │     │
│  │• Privilege  │                                          │   Data      │     │
│  │• Assets     │                                          └─────────────┘     │
│  │• Evasion    │                                                  │           │
│  │• Exfiltration│                                                 │           │
│  └─────────────┘                                                  │           │
└─────────────────────────────────────────────────────────────────────┼─────────┘
                                                                      │
                                                                      │ 8. Surface Data
                                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          P6: Report Generation                                 │
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   P6.1      │    │   P6.2      │    │   P6.3      │    │   P6.4      │     │
│  │  Compile    │───►│   Format    │───►│  Generate   │───►│   Export    │     │
│  │   Data      │    │   Report    │    │    PDF      │    │   Report    │     │
│  │             │    │  Template   │    │             │    │             │     │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                                   │             │
│                                                                   ▼             │
│                                                          ┌─────────────┐       │
│                                                          │     PDF     │       │
│                                                          │   Report    │       │
│                                                          │   Output    │       │
│                                                          └─────────────┘       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                                                      │
                                                                      │ 9. Report Data
                                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         P7: Dashboard Rendering                                │
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   P7.1      │    │   P7.2      │    │   P7.3      │    │   P7.4      │     │
│  │  Render     │───►│   Create    │───►│  Generate   │───►│   Display   │     │
│  │  Charts     │    │   Tables    │    │  Statistics │    │ Dashboard   │     │
│  │             │    │             │    │             │    │             │     │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘     │
│          │                   │                   │                   │         │
│          ▼                   ▼                   ▼                   ▼         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │• Pie Charts │    │• Event      │    │• Threat     │    │ Interactive │     │
│  │• Line Charts│    │  Tables     │    │  Metrics    │    │  Dashboard  │     │
│  │• Radar      │    │• Sortable   │    │• Risk       │    │             │     │
│  │  Charts     │    │  Columns    │    │  Scores     │    │             │     │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                                                      │
                                                                      │ 10. UI Output
                                                                      ▼
                                                          ┌─────────────────┐
                                                          │  Security       │
                                                          │  Analyst        │
                                                          │  Dashboard      │
                                                          └─────────────────┘
```

---

## Data Dictionary

### Data Flows

| Flow ID | Name | Description | Data Elements |
|---------|------|-------------|---------------|
| 1 | JSON File Upload | Raw JSON log files from security systems | file_name, file_size, file_content, timestamp |
| 2 | Valid File | Validated JSON file ready for processing | validated_file, file_metadata |
| 3 | Structured Data | Parsed and normalized JSON data | parsed_records[], record_count, data_structure |
| 4 | Fallback Analysis | Basic heuristic analysis when Gemini unavailable | classification_rules, pattern_matches |
| 5 | Basic Classification | Simple threat categorization | threat_level, confidence_score |
| 6 | Analysis Data | Enhanced AI analysis results from Gemini | ai_insights, threat_classification, risk_scores |
| 7 | Threat Data | Classified threats with risk assessments | normal_events[], anomalous_events[], malicious_events[] |
| 8 | Surface Data | 6-dimensional threat surface analysis | auth_score, network_score, privilege_score, asset_score, evasion_score, exfiltration_score |
| 9 | Report Data | Compiled data for report generation | incident_details, recommendations, charts_data |
| 10 | UI Output | Rendered dashboard components | charts, tables, statistics, interactive_elements |

### Data Stores

| Store ID | Name | Description | Data Elements |
|----------|------|-------------|---------------|
| D1 | Uploaded Files | Temporary storage for uploaded JSON files | file_id, file_name, file_size, upload_timestamp, file_content |
| D2 | Analysis Results | Cached analysis results and processed data | analysis_id, file_id, gemini_response, threat_classifications, processing_timestamp |
| D3 | Threat Intelligence | Classified threats and risk assessments | threat_id, threat_type, risk_score, mitre_tactics, indicators, recommendations |
| D4 | User Session | User session and interaction data | session_id, user_actions, uploaded_files[], analysis_history[] |

### Processes

| Process ID | Name | Description | Inputs | Outputs |
|------------|------|-------------|---------|---------|
| P1 | Upload & Validation | Validates uploaded JSON files | JSON files | Valid files, Error messages |
| P2 | JSON Parsing | Parses and normalizes JSON structure | Valid files | Structured data, Parse errors |
| P3 | Gemini AI Analysis | Advanced AI threat analysis using Gemini Pro | Structured data | AI analysis results |
| P4 | Threat Classification | Categorizes threats and assigns risk scores | AI analysis | Classified threats |
| P5 | Threat Surface Analysis | 6-dimensional security analysis | Classified threats | Threat surface data |
| P6 | Report Generation | Creates PDF reports and analytics | Analysis data | PDF reports |
| P7 | Dashboard Rendering | Renders interactive dashboard UI | All analysis data | Interactive dashboard |

---

## Security & Data Flow Considerations

### Security Measures
1. **File Validation**: Strict validation of file type, size, and format
2. **API Security**: Secure handling of Gemini API keys and responses
3. **Data Privacy**: Temporary storage with automatic cleanup
4. **Input Sanitization**: Protection against malicious JSON payloads
5. **Error Handling**: Graceful degradation with fallback analysis

### Performance Optimizations
1. **Streaming Processing**: Large file handling with streaming
2. **Caching**: Analysis results caching for repeated queries
3. **Batch Processing**: Efficient processing of multiple records
4. **Lazy Loading**: On-demand loading of detailed analysis
5. **Client-Side Rendering**: Responsive UI with client-side chart rendering

### Scalability Features
1. **Stateless Design**: Serverless architecture with Next.js API routes
2. **External AI Service**: Leveraging Google's scalable Gemini API
3. **Modular Components**: Reusable React components for UI
4. **Progressive Enhancement**: Fallback analysis when AI unavailable
5. **Responsive Design**: Multi-device compatibility

---

## Technology Stack Integration

### Frontend (Next.js + React)
- **Components**: LandingPage, JsonLogProcessor, Charts
- **State Management**: React hooks for local state
- **Visualization**: Recharts for interactive charts
- **Styling**: Tailwind CSS for responsive design

### Backend (Next.js API Routes)
- **API Endpoint**: `/api/analyze-json/route.ts`
- **File Processing**: FormData handling and JSON parsing
- **AI Integration**: Google Gemini API integration
- **Error Handling**: Comprehensive error management

### External Services
- **Google Gemini Pro**: Advanced AI analysis and threat detection
- **MITRE ATT&CK Framework**: Threat categorization standards
- **PDF Generation**: Client-side PDF report creation

This comprehensive DFD illustrates the complete data flow from initial file upload through AI analysis to final dashboard presentation, showing how the AI-Powered JSON Security Analyzer processes security logs and provides actionable intelligence to cybersecurity professionals.