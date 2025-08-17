<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Social Media Video Analyzer</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        /* Voice Analysis Styles */
        .analysis-status {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 400px;
        }

        .status-card {
            text-align: center;
            padding: var(--space-8);
            background: var(--card);
            border-radius: var(--radius-card);
            max-width: 400px;
        }

        .status-card h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: var(--space-2);
        }

        .analysis-section {
            margin-bottom: var(--space-8);
        }

        .section-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: var(--space-4);
            display: flex;
            align-items: center;
            color: var(--foreground);
        }

        .voice-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--space-4);
            margin-bottom: var(--space-6);
        }

        .voice-card {
            padding: var(--space-4);
            background: var(--card);
            border-radius: var(--radius-button);
        }

        .voice-label {
            font-size: 12px;
            color: var(--muted-foreground);
            margin-bottom: var(--space-2);
            font-weight: 500;
        }

        .voice-value {
            font-size: 14px;
            font-weight: 600;
            color: var(--foreground);
            margin-bottom: var(--space-3);
        }

        .voice-meter {
            height: 6px;
            background: var(--accent);
            border-radius: 3px;
            overflow: hidden;
        }

        .meter-fill {
            height: 100%;
            background: var(--primary);
            transition: width var(--transition-base);
        }

        .register-scale {
            display: flex;
            align-items: center;
            gap: var(--space-2);
        }

        .scale-label {
            font-size: 11px;
            color: var(--muted-foreground);
        }

        .scale-bar {
            flex: 1;
            height: 6px;
            background: var(--accent);
            border-radius: 3px;
            position: relative;
        }

        .scale-indicator {
            position: absolute;
            top: -3px;
            width: 12px;
            height: 12px;
            background: var(--primary);
            border-radius: 50%;
            transition: left var(--transition-base);
        }

        .energy-dots {
            display: flex;
            gap: var(--space-1);
        }

        .energy-dots .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--accent);
            transition: all var(--transition-fast);
        }

        .energy-dots .dot.active {
            background: var(--brand);
        }

        .pattern-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--space-4);
        }

        .pattern-card {
            padding: var(--space-4);
            background: var(--card);
            border-radius: var(--radius-button);
        }

        .pattern-card h4 {
            font-size: 13px;
            font-weight: 600;
            margin-bottom: var(--space-3);
            color: var(--foreground);
        }

        .pattern-list {
            list-style: none;
            padding: 0;
        }

        .pattern-list li {
            padding: var(--space-2) 0;
            font-size: 13px;
            color: var(--foreground);
            border-bottom: 1px solid var(--border);
        }

        .pattern-list li:last-child {
            border-bottom: none;
        }

        .phrase-tags {
            display: flex;
            flex-wrap: wrap;
            gap: var(--space-2);
        }

        .phrase-tag {
            padding: var(--space-2) var(--space-3);
            background: var(--accent);
            border-radius: var(--radius-button);
            font-size: 12px;
            font-weight: 500;
            color: var(--foreground);
            border: 1px solid var(--border);
        }

        .vocab-stats {
            display: flex;
            flex-direction: column;
            gap: var(--space-3);
        }

        .stat-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
        }

        .stat-label {
            color: var(--muted-foreground);
        }

        .stat-value {
            font-weight: 600;
            color: var(--foreground);
        }

        .rhetorical-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--space-4);
        }

        .rhetorical-card {
            padding: var(--space-4);
            background: var(--card);
            border-radius: var(--radius-button);
        }

        .rhetorical-card h4 {
            font-size: 13px;
            font-weight: 600;
            margin-bottom: var(--space-3);
            color: var(--foreground);
        }

        .technique-list {
            display: flex;
            flex-direction: column;
            gap: var(--space-2);
        }

        .technique-item {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            font-size: 13px;
            color: var(--foreground);
        }

        .technique-icon {
            color: var(--brand);
            font-weight: 600;
        }

        .narrative-desc {
            font-size: 13px;
            line-height: 1.6;
            color: var(--foreground);
            margin-bottom: var(--space-4);
        }

        .narrative-flow {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            padding: var(--space-3);
            background: var(--accent);
            border-radius: var(--radius-button);
        }

        .flow-step {
            padding: var(--space-1) var(--space-3);
            background: var(--muted);
            border-radius: var(--radius-button);
            font-size: 12px;
            font-weight: 500;
            color: var(--muted-foreground);
        }

        .flow-step.active {
            background: var(--primary);
            color: var(--primary-foreground);
        }

        .flow-arrow {
            color: var(--muted-foreground);
        }

        .micro-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--space-4);
        }

        .micro-card {
            padding: var(--space-4);
            background: var(--card);
            border-radius: var(--radius-button);
        }

        .micro-card h4 {
            font-size: 13px;
            font-weight: 600;
            margin-bottom: var(--space-3);
            color: var(--foreground);
        }

        .marker-cloud {
            display: flex;
            flex-wrap: wrap;
            gap: var(--space-2);
        }

        .marker {
            padding: var(--space-1) var(--space-2);
            background: var(--muted);
            border-radius: var(--radius-button);
            font-size: 12px;
            color: var(--foreground);
        }

        .cadence-visual {
            display: flex;
            align-items: flex-end;
            gap: var(--space-1);
            height: 40px;
            margin-bottom: var(--space-3);
        }

        .cadence-bar {
            flex: 1;
            background: var(--primary);
            border-radius: 2px;
            transition: all var(--transition-fast);
        }

        .cadence-bar.short {
            height: 20%;
        }

        .cadence-bar.medium {
            height: 50%;
        }

        .cadence-bar.long {
            height: 80%;
        }

        .cadence-desc {
            font-size: 12px;
            color: var(--muted-foreground);
            line-height: 1.5;
        }

        .export-section {
            display: flex;
            gap: var(--space-3);
            margin-top: var(--space-6);
            padding-top: var(--space-6);
            border-top: 1px solid var(--border);
        }

        @keyframes analyzeProgress {
            0% { width: 0%; }
            100% { width: 100%; }
        }

        .analyzing {
            animation: analyzeProgress 3s ease-out forwards;
        }

        :root {
            /* Clarity Design System Variables */
            --background: #F8F8F7;
            --foreground: #34322D;
            --card: #FFFFFF;
            --card-foreground: #34322D;
            --primary: #1A1A19;
            --primary-foreground: #FFFFFF;
            --brand: #FACC15;
            --muted: #F8F8F7;
            --muted-foreground: #858481;
            --accent: rgba(55,53,47,0.06);
            --border: rgba(0,0,0,0.06);
            --radius-card: 12px;
            --radius-button: 10px;
            --shadow-soft-drop: rgba(0, 0, 0, 0.04) 0px 2px 8px 0px, rgba(0, 0, 0, 0.03) 0px 0px 1px 0px;
            --shadow-hover: rgba(0, 0, 0, 0.06) 0px 4px 12px 0px;
            
            /* Grid System */
            --space-1: 4px;
            --space-2: 8px;
            --space-3: 12px;
            --space-4: 16px;
            --space-6: 24px;
            --space-8: 32px;
            --space-12: 48px;
            
            /* Transition */
            --transition-fast: 150ms ease;
            --transition-base: 200ms ease;
        }

        .dark {
            --background: #1A1A19;
            --foreground: #EAEAE9;
            --card: #262625;
            --card-foreground: #EAEAE9;
            --primary: #FFFFFF;
            --primary-foreground: #1A1A19;
            --muted: #1A1A19;
            --muted-foreground: #858481;
            --accent: rgba(255,255,255,0.1);
            --border: rgba(255,255,255,0.1);
        }

        body {
            font-family: -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif;
            background: var(--background);
            color: var(--foreground);
            padding: var(--space-6);
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        /* Card Component */
        .card {
            background: var(--card);
            border-radius: var(--radius-card);
            box-shadow: var(--shadow-soft-drop);
            overflow: hidden;
            transition: all var(--transition-base);
        }

        /* Header */
        .header {
            padding: var(--space-4);
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: var(--space-3);
        }

        .creator-info {
            display: flex;
            align-items: center;
            gap: var(--space-3);
        }

        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--accent);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
        }

        .creator-details {
            display: flex;
            flex-direction: column;
        }

        .creator-name {
            font-weight: 600;
            font-size: 14px;
        }

        .creator-handle {
            font-size: 12px;
            color: var(--muted-foreground);
        }

        .platform-badge {
            padding: var(--space-1) var(--space-2);
            background: var(--accent);
            border-radius: var(--radius-button);
            font-size: 12px;
            font-weight: 500;
        }

        .header-actions {
            display: flex;
            gap: var(--space-2);
        }

        /* Buttons */
        .btn {
            padding: var(--space-2) var(--space-4);
            border-radius: var(--radius-button);
            border: none;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all var(--transition-fast);
            background: var(--accent);
            color: var(--foreground);
        }

        .btn:hover {
            transform: translateY(-1px);
            box-shadow: var(--shadow-hover);
        }

        .btn:active {
            transform: translateY(0);
        }

        .btn-primary {
            background: var(--primary);
            color: var(--primary-foreground);
        }

        .btn-icon {
            padding: var(--space-2);
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Main Content */
        .main-content {
            display: grid;
            grid-template-columns: 1fr;
            transition: all var(--transition-base);
        }

        .main-content.split-view {
            grid-template-columns: 1fr 1fr;
        }

        /* Video Section */
        .video-section {
            position: relative;
            background: #000;
            aspect-ratio: 9/16;
            max-height: 80vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .video-placeholder {
            color: #fff;
            text-align: center;
            padding: var(--space-6);
        }

        video {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        /* URL Input */
        .url-input-container {
            padding: var(--space-6);
            display: flex;
            flex-direction: column;
            gap: var(--space-4);
            align-items: center;
            justify-content: center;
            min-height: 400px;
        }

        .url-input-group {
            display: flex;
            gap: var(--space-2);
            width: 100%;
            max-width: 500px;
        }

        .url-input {
            flex: 1;
            padding: var(--space-3) var(--space-4);
            border: 1px solid var(--border);
            border-radius: var(--radius-button);
            background: var(--card);
            color: var(--foreground);
            font-size: 14px;
        }

        .url-input:focus {
            outline: none;
            border-color: var(--primary);
        }

        /* Insights Panel */
        .insights-panel {
            background: var(--muted);
            padding: var(--space-6);
            overflow-y: auto;
            max-height: 80vh;
            animation: slideIn var(--transition-base) ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        /* Tabs */
        .tabs {
            display: flex;
            gap: var(--space-2);
            border-bottom: 1px solid var(--border);
            margin-bottom: var(--space-6);
        }

        .tab {
            padding: var(--space-3) var(--space-4);
            background: none;
            border: none;
            color: var(--muted-foreground);
            font-weight: 500;
            cursor: pointer;
            position: relative;
            transition: all var(--transition-fast);
        }

        .tab:hover {
            color: var(--foreground);
        }

        .tab.active {
            color: var(--foreground);
        }

        .tab.active::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--primary);
        }

        /* Metrics Grid */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: var(--space-4);
            margin-bottom: var(--space-6);
        }

        .metric-card {
            padding: var(--space-4);
            background: var(--card);
            border-radius: var(--radius-button);
            transition: all var(--transition-fast);
        }

        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-hover);
        }

        .metric-label {
            font-size: 12px;
            color: var(--muted-foreground);
            margin-bottom: var(--space-1);
        }

        .metric-value {
            font-size: 24px;
            font-weight: 600;
            color: var(--foreground);
        }

        .metric-info {
            font-size: 11px;
            color: var(--muted-foreground);
            margin-top: var(--space-1);
        }

        /* Content Section */
        .content-section {
            margin-bottom: var(--space-6);
        }

        .content-section h3 {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: var(--space-3);
            color: var(--foreground);
        }

        .content-field {
            padding: var(--space-3);
            background: var(--card);
            border-radius: var(--radius-button);
            margin-bottom: var(--space-3);
            position: relative;
        }

        .content-field-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-2);
        }

        .field-label {
            font-size: 12px;
            font-weight: 500;
            color: var(--muted-foreground);
        }

        .field-value {
            font-size: 14px;
            color: var(--foreground);
            line-height: 1.5;
        }

        .copy-btn {
            padding: var(--space-1) var(--space-2);
            font-size: 11px;
            background: var(--accent);
        }

        .ideas-list {
            list-style: none;
            padding: 0;
        }

        .ideas-list li {
            padding: var(--space-2) 0;
            border-bottom: 1px solid var(--border);
            font-size: 14px;
        }

        .ideas-list li:last-child {
            border-bottom: none;
        }

        /* Transcript */
        .transcript {
            padding: var(--space-4);
            background: var(--card);
            border-radius: var(--radius-button);
            max-height: 300px;
            overflow-y: auto;
            font-size: 14px;
            line-height: 1.6;
        }

        /* Toggle Switch */
        .toggle-switch {
            position: relative;
            width: 48px;
            height: 24px;
            background: var(--accent);
            border-radius: 12px;
            cursor: pointer;
            transition: all var(--transition-fast);
        }

        .toggle-switch.active {
            background: var(--primary);
        }

        .toggle-switch::after {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 20px;
            height: 20px;
            background: var(--card);
            border-radius: 50%;
            transition: all var(--transition-fast);
        }

        .toggle-switch.active::after {
            transform: translateX(24px);
        }

        /* Responsive */
        @media (max-width: 599px) {
            body {
                padding: var(--space-3);
            }

            .main-content {
                grid-template-columns: 1fr;
            }

            .main-content.split-view {
                grid-template-columns: 1fr;
            }

            .video-section {
                max-height: 50vh;
            }

            .metrics-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (min-width: 600px) and (max-width: 899px) {
            .metrics-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        @media (min-width: 900px) {
            .main-content.split-view .video-section {
                max-height: calc(100vh - 200px);
            }

            .main-content.split-view .insights-panel {
                max-height: calc(100vh - 200px);
            }
        }

        /* Loading State */
        .skeleton {
            background: linear-gradient(90deg, var(--accent) 25%, var(--muted) 50%, var(--accent) 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }

        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }

        .hidden {
            display: none;
        }

        /* Icons */
        .icon {
            width: 20px;
            height: 20px;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            fill: none;
        }

        /* Analytics Components */
        .analytics-grid {
            display: flex;
            flex-direction: column;
            gap: var(--space-3);
        }

        .readability-bar {
            width: 100%;
            height: 8px;
            background: var(--accent);
            border-radius: 4px;
            overflow: hidden;
            margin: var(--space-2) 0;
        }

        .readability-fill {
            height: 100%;
            background: var(--primary);
            transition: width var(--transition-base);
        }

        .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: var(--space-2);
            margin-top: var(--space-2);
        }

        .tag {
            padding: var(--space-1) var(--space-3);
            background: var(--accent);
            border-radius: var(--radius-button);
            font-size: 12px;
            font-weight: 500;
            color: var(--foreground);
        }

        .sentiment-badge {
            padding: var(--space-1) var(--space-3);
            border-radius: var(--radius-button);
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
        }

        .sentiment-badge.positive {
            background: rgba(34, 197, 94, 0.1);
            color: rgb(34, 197, 94);
        }

        .sentiment-badge.negative {
            background: rgba(239, 68, 68, 0.1);
            color: rgb(239, 68, 68);
        }

        .sentiment-badge.neutral {
            background: var(--accent);
            color: var(--muted-foreground);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <!-- Header -->
            <div class="header">
                <div class="creator-info">
                    <div class="avatar" id="avatar">JD</div>
                    <div class="creator-details">
                        <div class="creator-name" id="creatorName">John Doe</div>
                        <div class="creator-handle" id="creatorHandle">@johndoe</div>
                        <!-- Voice Analysis Tab Content -->
                    <div id="voiceContent" class="hidden" role="tabpanel">
                        <!-- Analysis Status -->
                        <div id="analysisStatus" class="analysis-status">
                            <div class="status-card">
                                <svg class="icon" style="width: 48px; height: 48px; stroke: var(--muted-foreground); margin-bottom: var(--space-3);">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M12 6v6l4 2"></path>
                                </svg>
                                <h3>Deep Linguistic Analysis Available</h3>
                                <p style="color: var(--muted-foreground); margin: var(--space-3) 0;">
                                    Analyze the creator's unique communication style, voice patterns, and rhetorical techniques.
                                </p>
                                <button class="btn btn-primary" id="runAnalysisBtn">
                                    <svg class="icon" style="width: 16px; height: 16px; margin-right: 6px; vertical-align: middle;">
                                        <path d="M5 12h14M12 5l7 7-7 7"></path>
                                    </svg>
                                    Run Deep Analysis
                                </button>
                            </div>
                        </div>

                        <!-- Analysis Results (hidden initially) -->
                        <div id="analysisResults" class="hidden">
                            <!-- Voice Signature Section -->
                            <div class="analysis-section">
                                <h3 class="section-title">
                                    <svg class="icon" style="width: 18px; height: 18px; margin-right: 6px; vertical-align: middle;">
                                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                        <line x1="12" x2="12" y1="19" y2="22"></line>
                                    </svg>
                                    Voice Signature
                                </h3>
                                <div class="voice-grid">
                                    <div class="voice-card">
                                        <div class="voice-label">Tone</div>
                                        <div class="voice-value" id="toneValue">Conversational & Authoritative</div>
                                        <div class="voice-meter">
                                            <div class="meter-fill" id="toneMeter" style="width: 75%"></div>
                                        </div>
                                    </div>
                                    <div class="voice-card">
                                        <div class="voice-label">Register</div>
                                        <div class="voice-value" id="registerValue">Semi-Formal</div>
                                        <div class="register-scale">
                                            <span class="scale-label">Casual</span>
                                            <div class="scale-bar">
                                                <div class="scale-indicator" id="registerIndicator" style="left: 65%"></div>
                                            </div>
                                            <span class="scale-label">Formal</span>
                                        </div>
                                    </div>
                                    <div class="voice-card">
                                        <div class="voice-label">Energy Level</div>
                                        <div class="voice-value" id="energyValue">High Engagement</div>
                                        <div class="energy-dots">
                                            <span class="dot active"></span>
                                            <span class="dot active"></span>
                                            <span class="dot active"></span>
                                            <span class="dot active"></span>
                                            <span class="dot"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Linguistic Patterns Section -->
                            <div class="analysis-section">
                                <h3 class="section-title">
                                    <svg class="icon" style="width: 18px; height: 18px; margin-right: 6px; vertical-align: middle;">
                                        <rect width="8" height="8" x="3" y="3" rx="2"></rect>
                                        <path d="M7 11v4a2 2 0 0 0 2 2h4"></path>
                                        <rect width="8" height="8" x="13" y="13" rx="2"></rect>
                                    </svg>
                                    Linguistic Patterns
                                </h3>
                                <div class="pattern-grid">
                                    <div class="pattern-card">
                                        <h4>Dominant Structures</h4>
                                        <ul class="pattern-list" id="dominantStructures">
                                            <li>Short declarative openers (5-7 words)</li>
                                            <li>Complex middle sentences (15-20 words)</li>
                                            <li>Question-based transitions</li>
                                        </ul>
                                    </div>
                                    <div class="pattern-card">
                                        <h4>Signature Phrases</h4>
                                        <div class="phrase-tags" id="signaturePhrases">
                                            <span class="phrase-tag">"Here's what you need to do"</span>
                                            <span class="phrase-tag">"The key is to understand"</span>
                                            <span class="phrase-tag">"Stop scrolling"</span>
                                            <span class="phrase-tag">"Let's talk about"</span>
                                        </div>
                                    </div>
                                    <div class="pattern-card">
                                        <h4>Vocabulary Profile</h4>
                                        <div class="vocab-stats">
                                            <div class="stat-row">
                                                <span class="stat-label">Complexity:</span>
                                                <span class="stat-value" id="vocabComplexity">Accessible (Grade 8-10)</span>
                                            </div>
                                            <div class="stat-row">
                                                <span class="stat-label">Unique Words:</span>
                                                <span class="stat-value" id="uniqueWords">68%</span>
                                            </div>
                                            <div class="stat-row">
                                                <span class="stat-label">Technical Terms:</span>
                                                <span class="stat-value" id="technicalTerms">12%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Rhetorical Framework Section -->
                            <div class="analysis-section">
                                <h3 class="section-title">
                                    <svg class="icon" style="width: 18px; height: 18px; margin-right: 6px; vertical-align: middle;">
                                        <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path>
                                        <rect x="2" y="6" width="14" height="12" rx="1"></rect>
                                    </svg>
                                    Rhetorical Framework
                                </h3>
                                <div class="rhetorical-grid">
                                    <div class="rhetorical-card">
                                        <h4>Persuasion Techniques</h4>
                                        <div class="technique-list" id="persuasionTechniques">
                                            <div class="technique-item">
                                                <span class="technique-icon">→</span>
                                                <span>Problem-Solution Framework</span>
                                            </div>
                                            <div class="technique-item">
                                                <span class="technique-icon">→</span>
                                                <span>Social Proof & Authority</span>
                                            </div>
                                            <div class="technique-item">
                                                <span class="technique-icon">→</span>
                                                <span>Direct Address ("You")</span>
                                            </div>
                                            <div class="technique-item">
                                                <span class="technique-icon">→</span>
                                                <span>Urgency Triggers</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="rhetorical-card">
                                        <h4>Narrative Style</h4>
                                        <div class="narrative-profile" id="narrativeStyle">
                                            <p class="narrative-desc">Linear progression with strategic hooks. Opens with attention-grabbing statement, builds through logical steps, closes with actionable takeaway.</p>
                                            <div class="narrative-flow">
                                                <span class="flow-step active">Hook</span>
                                                <span class="flow-arrow">→</span>
                                                <span class="flow-step active">Context</span>
                                                <span class="flow-arrow">→</span>
                                                <span class="flow-step active">Solution</span>
                                                <span class="flow-arrow">→</span>
                                                <span class="flow-step active">Action</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Micro-Style Elements Section -->
                            <div class="analysis-section">
                                <h3 class="section-title">
                                    <svg class="icon" style="width: 18px; height: 18px; margin-right: 6px; vertical-align: middle;">
                                        <circle cx="12" cy="12" r="1"></circle>
                                        <circle cx="19" cy="12" r="1"></circle>
                                        <circle cx="5" cy="12" r="1"></circle>
                                    </svg>
                                    Micro-Style Elements
                                </h3>
                                <div class="micro-grid">
                                    <div class="micro-card">
                                        <h4>Discourse Markers</h4>
                                        <div class="marker-cloud" id="discourseMarkers">
                                            <span class="marker">So</span>
                                            <span class="marker">First</span>
                                            <span class="marker">Actually</span>
                                            <span class="marker">Here's the thing</span>
                                            <span class="marker">But</span>
                                            <span class="marker">Now</span>
                                        </div>
                                    </div>
                                    <div class="micro-card">
                                        <h4>Rhythm & Cadence</h4>
                                        <div class="cadence-visual">
                                            <div class="cadence-bar short"></div>
                                            <div class="cadence-bar medium"></div>
                                            <div class="cadence-bar long"></div>
                                            <div class="cadence-bar short"></div>
                                            <div class="cadence-bar medium"></div>
                                        </div>
                                        <p class="cadence-desc" id="cadenceDesc">Varied pacing with punchy openers and detailed explanations</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Export Options -->
                            <div class="export-section">
                                <button class="btn" id="exportStyleBtn">
                                    <svg class="icon" style="width: 16px; height: 16px; margin-right: 6px; vertical-align: middle;">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" x2="12" y1="15" y2="3"></line>
                                    </svg>
                                    Export Style Profile
                                </button>
                                <button class="btn btn-primary" id="replicateStyleBtn">
                                    <svg class="icon" style="width: 16px; height: 16px; margin-right: 6px; vertical-align: middle;">
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                    </svg>
                                    Use Style for Rescript
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                    <div class="platform-badge" id="platformBadge">TikTok</div>
                </div>
                <div class="header-actions">
                    <button class="btn btn-primary" id="insightsToggle" aria-label="Toggle Insights">
                        <span id="insightsToggleText">Show Insights</span>
                    </button>
                    <button class="btn btn-primary" id="rescriptBtn">Rescript Video</button>
                    <button class="btn" id="deepAnalysisBtn" aria-label="Deep Voice Analysis">
                        <svg class="icon" style="width: 16px; height: 16px; margin-right: 6px; vertical-align: middle;">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                        Deep Analysis
                    </button>
                    <button class="btn btn-icon" id="copyLinkBtn" aria-label="Copy Link">
                        <svg class="icon"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </button>
                </div>
            </div>

            <!-- Main Content -->
            <div class="main-content" id="mainContent">
                <!-- Video Section -->
                <div class="video-section" id="videoSection">
                    <div class="url-input-container" id="urlInputContainer">
                        <h2>Analyze Social Media Video</h2>
                        <p style="color: var(--muted-foreground); margin-bottom: var(--space-4);">
                            Paste a TikTok, Instagram Reels, or YouTube Shorts URL
                        </p>
                        <div class="url-input-group">
                            <input 
                                type="url" 
                                class="url-input" 
                                id="urlInput" 
                                placeholder="https://www.tiktok.com/@user/video/..."
                                aria-label="Video URL"
                            >
                            <button class="btn btn-primary" id="loadVideoBtn">Load Video</button>
                        </div>
                        <div style="margin-top: var(--space-4);">
                            <button class="btn" id="loadSampleBtn">Load Sample Video</button>
                        </div>
                    </div>
                    <video id="videoPlayer" class="hidden" controls></video>
                </div>

                <!-- Insights Panel -->
                <div class="insights-panel hidden" id="insightsPanel">
                    <!-- Tabs -->
                    <div class="tabs" role="tablist">
                        <button class="tab active" id="metricsTab" role="tab" aria-selected="true">Metrics</button>
                        <button class="tab" id="contentTab" role="tab" aria-selected="false">Content</button>
                        <button class="tab" id="transcriptTab" role="tab" aria-selected="false">Transcript</button>
                    </div>

                    <!-- Metrics Tab Content -->
                    <div id="metricsContent" role="tabpanel">
                        <div class="metrics-grid">
                            <div class="metric-card">
                                <div class="metric-label">Views</div>
                                <div class="metric-value" id="viewsMetric">250K</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Likes</div>
                                <div class="metric-value" id="likesMetric">12.3K</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Comments</div>
                                <div class="metric-value" id="commentsMetric">321</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Shares</div>
                                <div class="metric-value" id="sharesMetric">210</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Saves</div>
                                <div class="metric-value" id="savesMetric">580</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Engagement Rate</div>
                                <div class="metric-value" id="engagementMetric">7.5%</div>
                                <div class="metric-info" title="(Likes + Comments + Shares) / Views">ℹ Formula</div>
                            </div>
                        </div>
                    </div>

                    <!-- Content Tab Content -->
                    <div id="contentContent" class="hidden" role="tabpanel">
                        <div class="content-section">
                            <div class="content-field">
                                <div class="content-field-header">
                                    <span class="field-label">Format</span>
                                </div>
                                <div class="field-value" id="formatField">Talking Head</div>
                            </div>

                            <div class="content-field">
                                <div class="content-field-header">
                                    <span class="field-label">Hook</span>
                                    <button class="btn copy-btn" onclick="copyToClipboard('hookField')">Copy</button>
                                </div>
                                <div class="field-value" id="hookField">Stop scrolling—this changes your workflow</div>
                            </div>

                            <div class="content-field">
                                <div class="content-field-header">
                                    <span class="field-label">Caption</span>
                                    <button class="btn copy-btn" onclick="copyToClipboard('captionField')">Copy</button>
                                </div>
                                <div class="field-value" id="captionField">Here's the exact setup I use to save 2 hours every day...</div>
                            </div>

                            <div class="content-field">
                                <div class="field-label" style="margin-bottom: var(--space-2);">Hook Ideas</div>
                                <ul class="ideas-list" id="hookIdeasList">
                                    <li>You're wasting time doing X wrong</li>
                                    <li>The 10-second trick that changed everything</li>
                                    <li>Before you try Z, watch this first</li>
                                </ul>
                            </div>

                            <div class="content-field">
                                <div class="field-label" style="margin-bottom: var(--space-2);">Content Ideas</div>
                                <ul class="ideas-list" id="contentIdeasList">
                                    <li>Duet with reaction to show real-time results</li>
                                    <li>Remix with side-by-side comparison demo</li>
                                    <li>Turn into carousel with step-by-step guide</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Transcript Tab Content -->
                    <div id="transcriptContent" class="hidden" role="tabpanel">
                        <!-- Transcript Analytics -->
                        <div class="metrics-grid" style="margin-bottom: var(--space-6);">
                            <div class="metric-card">
                                <div class="metric-label">Word Count</div>
                                <div class="metric-value" id="wordCount">152</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Reading Level</div>
                                <div class="metric-value" id="readingLevel">8th</div>
                                <div class="metric-info">Grade Level</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Speaking Pace</div>
                                <div class="metric-value" id="speakingPace">246</div>
                                <div class="metric-info">words/min</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Avg Sentence</div>
                                <div class="metric-value" id="avgSentence">12.7</div>
                                <div class="metric-info">words</div>
                            </div>
                        </div>

                        <!-- Additional Analytics -->
                        <div class="content-section">
                            <h3>Content Analysis</h3>
                            <div class="analytics-grid">
                                <div class="content-field">
                                    <div class="field-label">Readability Score</div>
                                    <div class="field-value">
                                        <div class="readability-bar">
                                            <div class="readability-fill" id="readabilityBar" style="width: 72%"></div>
                                        </div>
                                        <span id="readabilityScore">72/100 - Fairly Easy</span>
                                    </div>
                                </div>
                                <div class="content-field">
                                    <div class="field-label">Key Topics</div>
                                    <div class="tags-container" id="keyTopics">
                                        <span class="tag">productivity</span>
                                        <span class="tag">workflow</span>
                                        <span class="tag">time-saving</span>
                                        <span class="tag">tutorial</span>
                                    </div>
                                </div>
                                <div class="content-field">
                                    <div class="field-label">Sentiment</div>
                                    <div class="field-value" id="sentiment">
                                        <span class="sentiment-badge positive">Positive</span>
                                        <span style="margin-left: var(--space-2); color: var(--muted-foreground);">Motivational tone</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Transcript Text -->
                        <h3 style="margin-top: var(--space-6); margin-bottom: var(--space-3);">Full Transcript</h3>
                        <div class="transcript" id="transcriptField">
                            <p>Welcome to this comprehensive tutorial where I'll show you the exact setup I use to save 2 hours every day. First, let's talk about why most people fail at productivity...</p>
                            <p>The key is to understand that your current workflow is probably built on outdated assumptions. What worked five years ago doesn't work today. The tools have changed, the technology has evolved, and most importantly, our understanding of human psychology has improved dramatically...</p>
                            <p>So here's what you need to do: Start by auditing your current workflow. Write down every single task you do in a typical day. Yes, everything. Even the small stuff like checking email or responding to messages...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Sample data structure
        const sampleData = {
            platform: "tiktok",
            videoUrl: "https://www.tiktok.com/@example/video/123456",
            creator: {
                name: "Sarah Johnson",
                handle: "@sarahcreates",
                avatarUrl: null
            },
            title: "The productivity hack that changed my life",
            durationSec: 37,
            metrics: {
                likes: 12345,
                comments: 321,
                shares: 210,
                saves: 580,
                views: 250000,
                engagementRate: 0.075
            },
            content: {
                format: "talking-head",
                hook: "Stop scrolling—this changes your workflow",
                hookIdeas: [
                    "You're wasting time doing X wrong",
                    "The 10-second trick that changed everything",
                    "Before you try Z, watch this first"
                ],
                caption: "Here's the exact setup I use to save 2 hours every day...",
                contentIdeas: [
                    "Duet with reaction to show real-time results",
                    "Remix with side-by-side comparison demo",
                    "Turn into carousel with step-by-step guide"
                ],
                transcript: "Welcome to this comprehensive tutorial where I'll show you the exact setup I use to save 2 hours every day. First, let's talk about why most people fail at productivity. The key is to understand that your current workflow is probably built on outdated assumptions. What worked five years ago doesn't work today. The tools have changed, the technology has evolved, and most importantly, our understanding of human psychology has improved dramatically. So here's what you need to do: Start by auditing your current workflow. Write down every single task you do in a typical day. Yes, everything. Even the small stuff like checking email or responding to messages."
            }
        };

        // State management
        let state = {
            isInsightsOpen: false,
            activeTab: 'metrics',
            layoutMode: 'stacked',
            platform: null,
            videoData: null
        };

        // DOM elements
        const elements = {
            mainContent: document.getElementById('mainContent'),
            insightsPanel: document.getElementById('insightsPanel'),
            insightsToggle: document.getElementById('insightsToggle'),
            insightsToggleText: document.getElementById('insightsToggleText'),
            urlInput: document.getElementById('urlInput'),
            loadVideoBtn: document.getElementById('loadVideoBtn'),
            loadSampleBtn: document.getElementById('loadSampleBtn'),
            urlInputContainer: document.getElementById('urlInputContainer'),
            videoPlayer: document.getElementById('videoPlayer'),
            metricsTab: document.getElementById('metricsTab'),
            contentTab: document.getElementById('contentTab'),
            transcriptTab: document.getElementById('transcriptTab'),
            voiceTab: document.getElementById('voiceTab'),
            metricsContent: document.getElementById('metricsContent'),
            contentContent: document.getElementById('contentContent'),
            transcriptContent: document.getElementById('transcriptContent'),
            voiceContent: document.getElementById('voiceContent'),
            copyLinkBtn: document.getElementById('copyLinkBtn'),
            rescriptBtn: document.getElementById('rescriptBtn'),
            deepAnalysisBtn: document.getElementById('deepAnalysisBtn'),
            analysisStatus: document.getElementById('analysisStatus'),
            analysisResults: document.getElementById('analysisResults')
        };

        // Initialize
        function init() {
            // Check if all required elements exist
            const requiredElements = [
                'mainContent', 'insightsPanel', 'insightsToggle', 'urlInput',
                'loadVideoBtn', 'loadSampleBtn', 'metricsTab', 'contentTab', 
                'transcriptTab', 'voiceTab'
            ];
            
            for (const elementName of requiredElements) {
                if (!elements[elementName]) {
                    console.error(`Required element not found: ${elementName}`);
                    return;
                }
            }
            
            setupEventListeners();
            updateLayout();
            
            // Check for responsive layout
            window.addEventListener('resize', updateLayout);
        }

        // Event listeners
        function setupEventListeners() {
            // Only add listeners if elements exist
            if (elements.insightsToggle) elements.insightsToggle.addEventListener('click', toggleInsights);
            if (elements.loadVideoBtn) elements.loadVideoBtn.addEventListener('click', loadVideo);
            if (elements.loadSampleBtn) elements.loadSampleBtn.addEventListener('click', loadSampleVideo);
            if (elements.metricsTab) elements.metricsTab.addEventListener('click', () => switchTab('metrics'));
            if (elements.contentTab) elements.contentTab.addEventListener('click', () => switchTab('content'));
            if (elements.transcriptTab) elements.transcriptTab.addEventListener('click', () => switchTab('transcript'));
            if (elements.voiceTab) elements.voiceTab.addEventListener('click', () => switchTab('voice'));
            if (elements.copyLinkBtn) elements.copyLinkBtn.addEventListener('click', copyVideoLink);
            if (elements.rescriptBtn) elements.rescriptBtn.addEventListener('click', rescriptVideo);
            if (elements.deepAnalysisBtn) elements.deepAnalysisBtn.addEventListener('click', initiateDeepAnalysis);
            
            // Enter key on URL input
            if (elements.urlInput) {
                elements.urlInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') loadVideo();
                });
            }
            
            // Use event delegation for dynamically created buttons
            document.addEventListener('click', (e) => {
                if (e.target && e.target.id === 'runAnalysisBtn') {
                    performDeepAnalysis();
                } else if (e.target && e.target.id === 'exportStyleBtn') {
                    exportStyleProfile();
                } else if (e.target && e.target.id === 'replicateStyleBtn') {
                    useStyleForRescript();
                }
            });
        }

        // Toggle insights panel
        function toggleInsights() {
            state.isInsightsOpen = !state.isInsightsOpen;
            
            if (state.isInsightsOpen) {
                elements.insightsPanel.classList.remove('hidden');
                elements.mainContent.classList.add('split-view');
                elements.insightsToggleText.textContent = 'Hide Insights';
                
                // Announce to screen readers
                announceToScreenReader('Insights panel opened');
                
                // Lazy load insights if needed
                if (state.videoData) {
                    setTimeout(() => loadInsightsData(), 200);
                }
            } else {
                elements.insightsPanel.classList.add('hidden');
                elements.mainContent.classList.remove('split-view');
                elements.insightsToggleText.textContent = 'Show Insights';
                
                announceToScreenReader('Insights panel closed');
            }
        }

        // Switch tabs
        function switchTab(tabName) {
            state.activeTab = tabName;
            
            // Update tab buttons
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
                tab.setAttribute('aria-selected', 'false');
            });
            
            // Update content panels
            elements.metricsContent.classList.add('hidden');
            elements.contentContent.classList.add('hidden');
            elements.transcriptContent.classList.add('hidden');
            elements.voiceContent.classList.add('hidden');
            
            switch(tabName) {
                case 'metrics':
                    elements.metricsTab.classList.add('active');
                    elements.metricsTab.setAttribute('aria-selected', 'true');
                    elements.metricsContent.classList.remove('hidden');
                    break;
                case 'content':
                    elements.contentTab.classList.add('active');
                    elements.contentTab.setAttribute('aria-selected', 'true');
                    elements.contentContent.classList.remove('hidden');
                    break;
                case 'transcript':
                    elements.transcriptTab.classList.add('active');
                    elements.transcriptTab.setAttribute('aria-selected', 'true');
                    elements.transcriptContent.classList.remove('hidden');
                    break;
                case 'voice':
                    elements.voiceTab.classList.add('active');
                    elements.voiceTab.setAttribute('aria-selected', 'true');
                    elements.voiceContent.classList.remove('hidden');
                    break;
            }
        }

        // Load video
        function loadVideo() {
            const url = elements.urlInput.value.trim();
            if (!url) return;
            
            // Detect platform
            const platform = detectPlatform(url);
            if (!platform) {
                alert('Please enter a valid TikTok, Instagram, or YouTube Shorts URL');
                return;
            }
            
            // Show video player
            elements.urlInputContainer.classList.add('hidden');
            elements.videoPlayer.classList.remove('hidden');
            
            // For demo purposes, we'll use a placeholder video
            // In production, this would fetch actual video data
            elements.videoPlayer.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
            
            // Load sample data (in production, this would be fetched based on URL)
            loadSampleData();
        }

        // Load sample video
        function loadSampleVideo() {
            elements.urlInput.value = 'https://www.tiktok.com/@sarahcreates/video/123456789';
            loadVideo();
        }

        // Load sample data
        function loadSampleData() {
            state.videoData = sampleData;
            state.platform = sampleData.platform;
            
            // Update UI with data
            updateUIWithData(sampleData);
            
            // Auto-open insights after a short delay
            setTimeout(() => {
                if (!state.isInsightsOpen) {
                    toggleInsights();
                }
            }, 1000);
        }

        // Update UI with video data
        function updateUIWithData(data) {
            // Update header
            document.getElementById('creatorName').textContent = data.creator.name;
            document.getElementById('creatorHandle').textContent = data.creator.handle;
            document.getElementById('avatar').textContent = data.creator.name.split(' ').map(n => n[0]).join('');
            document.getElementById('platformBadge').textContent = data.platform.charAt(0).toUpperCase() + data.platform.slice(1);
            
            // Update metrics
            document.getElementById('viewsMetric').textContent = formatNumber(data.metrics.views);
            document.getElementById('likesMetric').textContent = formatNumber(data.metrics.likes);
            document.getElementById('commentsMetric').textContent = formatNumber(data.metrics.comments);
            document.getElementById('sharesMetric').textContent = formatNumber(data.metrics.shares);
            document.getElementById('savesMetric').textContent = formatNumber(data.metrics.saves);
            document.getElementById('engagementMetric').textContent = (data.metrics.engagementRate * 100).toFixed(1) + '%';
            
            // Update content
            document.getElementById('formatField').textContent = formatTitle(data.content.format);
            document.getElementById('hookField').textContent = data.content.hook;
            document.getElementById('captionField').textContent = data.content.caption;
            
            // Update ideas lists
            const hookIdeasHtml = data.content.hookIdeas.map(idea => `<li>${idea}</li>`).join('');
            document.getElementById('hookIdeasList').innerHTML = hookIdeasHtml;
            
            const contentIdeasHtml = data.content.contentIdeas.map(idea => `<li>${idea}</li>`).join('');
            document.getElementById('contentIdeasList').innerHTML = contentIdeasHtml;
            
            // Update transcript
            document.getElementById('transcriptField').innerHTML = `<p>${data.content.transcript.split('. ').join('.</p><p>')}</p>`;
            
            // Analyze transcript
            analyzeTranscript(data.content.transcript, data.durationSec);
        }

        // Analyze transcript for readability and metrics
        function analyzeTranscript(transcript, durationSec) {
            // Basic text metrics
            const words = transcript.split(/\s+/).filter(word => word.length > 0);
            const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const wordCount = words.length;
            const sentenceCount = sentences.length;
            const avgWordsPerSentence = wordCount / sentenceCount;
            
            // Calculate speaking pace (words per minute)
            const speakingPace = Math.round((wordCount / durationSec) * 60);
            
            // Calculate reading level using Flesch-Kincaid Grade Level formula
            const syllableCount = words.reduce((count, word) => count + countSyllables(word), 0);
            const avgSyllablesPerWord = syllableCount / wordCount;
            
            // Flesch-Kincaid Grade Level = 0.39 × (words/sentences) + 11.8 × (syllables/words) - 15.59
            const gradeLevel = Math.round(0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59);
            
            // Flesch Reading Ease Score (0-100, higher is easier)
            // 206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)
            const readingEase = Math.round(206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord);
            
            // Update UI with analysis
            document.getElementById('wordCount').textContent = wordCount;
            document.getElementById('readingLevel').textContent = getGradeLevelText(gradeLevel);
            document.getElementById('speakingPace').textContent = speakingPace;
            document.getElementById('avgSentence').textContent = avgWordsPerSentence.toFixed(1);
            
            // Update readability score
            const readabilityPercent = Math.max(0, Math.min(100, readingEase));
            document.getElementById('readabilityBar').style.width = readabilityPercent + '%';
            document.getElementById('readabilityScore').textContent = `${readabilityPercent}/100 - ${getReadabilityText(readingEase)}`;
            
            // Extract key topics (simple keyword extraction)
            const keyTopics = extractKeyTopics(transcript);
            const topicsHtml = keyTopics.map(topic => `<span class="tag">${topic}</span>`).join('');
            document.getElementById('keyTopics').innerHTML = topicsHtml;
            
            // Simple sentiment analysis
            const sentiment = analyzeSentiment(transcript);
            const sentimentHtml = `
                <span class="sentiment-badge ${sentiment.type}">${sentiment.label}</span>
                <span style="margin-left: var(--space-2); color: var(--muted-foreground);">${sentiment.description}</span>
            `;
            document.getElementById('sentiment').innerHTML = sentimentHtml;
        }

        // Count syllables in a word (approximation)
        function countSyllables(word) {
            word = word.toLowerCase();
            let count = 0;
            let previousWasVowel = false;
            
            for (let i = 0; i < word.length; i++) {
                const isVowel = 'aeiou'.includes(word[i]);
                if (isVowel && !previousWasVowel) {
                    count++;
                }
                previousWasVowel = isVowel;
            }
            
            // Adjust for silent e
            if (word.endsWith('e')) {
                count--;
            }
            
            // Ensure at least one syllable
            return Math.max(1, count);
        }

        // Convert grade level to text
        function getGradeLevelText(gradeLevel) {
            if (gradeLevel < 1) return 'K';
            if (gradeLevel === 1) return '1st';
            if (gradeLevel === 2) return '2nd';
            if (gradeLevel === 3) return '3rd';
            if (gradeLevel <= 12) return gradeLevel + 'th';
            if (gradeLevel <= 16) return 'College';
            return 'Graduate';
        }

        // Get readability description
        function getReadabilityText(score) {
            if (score >= 90) return 'Very Easy';
            if (score >= 80) return 'Easy';
            if (score >= 70) return 'Fairly Easy';
            if (score >= 60) return 'Standard';
            if (score >= 50) return 'Fairly Difficult';
            if (score >= 30) return 'Difficult';
            return 'Very Difficult';
        }

        // Extract key topics from text
        function extractKeyTopics(text) {
            // Simple keyword extraction based on frequency
            const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                                        'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
                                        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
                                        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
                                        'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
                                        'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
                                        'your', 'my', 'his', 'her', 'its', 'our', 'their', 'here', 'so']);
            
            const words = text.toLowerCase().split(/\W+/);
            const wordFreq = {};
            
            words.forEach(word => {
                if (word.length > 3 && !commonWords.has(word)) {
                    wordFreq[word] = (wordFreq[word] || 0) + 1;
                }
            });
            
            // Get top 4 most frequent meaningful words
            return Object.entries(wordFreq)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([word]) => word);
        }

        // Simple sentiment analysis
        function analyzeSentiment(text) {
            const positiveWords = ['great', 'amazing', 'excellent', 'good', 'wonderful', 'fantastic', 
                                  'love', 'best', 'happy', 'save', 'improve', 'success', 'easy'];
            const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'fail', 'difficult', 
                                  'problem', 'issue', 'wrong', 'mistake', 'hard', 'complicated'];
            
            const words = text.toLowerCase().split(/\W+/);
            let positiveCount = 0;
            let negativeCount = 0;
            
            words.forEach(word => {
                if (positiveWords.includes(word)) positiveCount++;
                if (negativeWords.includes(word)) negativeCount++;
            });
            
            if (positiveCount > negativeCount * 2) {
                return { type: 'positive', label: 'Positive', description: 'Motivational tone' };
            } else if (negativeCount > positiveCount * 2) {
                return { type: 'negative', label: 'Negative', description: 'Critical tone' };
            } else {
                return { type: 'neutral', label: 'Neutral', description: 'Balanced tone' };
            }
        }

        // Initiate deep analysis
        function initiateDeepAnalysis() {
            if (!state.videoData) {
                alert('Please load a video first');
                return;
            }
            
            // Show voice tab and switch to it
            elements.voiceTab.style.display = 'block';
            switchTab('voice');
            
            announceToScreenReader('Voice Analysis tab opened');
        }

        // Perform deep linguistic analysis
        function performDeepAnalysis() {
            // Show loading state
            const statusCard = document.querySelector('.status-card');
            statusCard.innerHTML = `
                <svg class="icon" style="width: 48px; height: 48px; stroke: var(--primary); margin-bottom: var(--space-3); animation: spin 1s linear infinite;">
                    <circle cx="12" cy="12" r="10" fill="none" stroke-dasharray="30 70"></circle>
                </svg>
                <h3>Analyzing Communication Style...</h3>
                <p style="color: var(--muted-foreground); margin: var(--space-3) 0;">
                    Extracting linguistic patterns and voice characteristics...
                </p>
                <div style="width: 100%; height: 6px; background: var(--accent); border-radius: 3px; overflow: hidden; margin-top: var(--space-4);">
                    <div class="analyzing" style="height: 100%; background: var(--primary);"></div>
                </div>
            `;
            
            // Add spinning animation
            const style = document.createElement('style');
            style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
            document.head.appendChild(style);
            
            // Simulate analysis processing
            setTimeout(() => {
                populateAnalysisResults();
                elements.analysisStatus.classList.add('hidden');
                elements.analysisResults.classList.remove('hidden');
                announceToScreenReader('Deep linguistic analysis complete');
            }, 3000);
        }

        // Populate analysis results with data
        function populateAnalysisResults() {
            // This would normally come from your backend API
            const analysisData = {
                voiceSignature: {
                    tone: 'Conversational & Authoritative',
                    toneStrength: 75,
                    register: 'Semi-Formal',
                    registerPosition: 65,
                    energy: 'High Engagement',
                    energyLevel: 4
                },
                linguisticPatterns: {
                    dominantStructures: [
                        'Short declarative openers (5-7 words)',
                        'Complex middle sentences (15-20 words)',
                        'Question-based transitions',
                        'List-based explanations'
                    ],
                    signaturePhrases: [
                        '"Here\'s what you need to do"',
                        '"The key is to understand"',
                        '"Stop scrolling"',
                        '"Let\'s talk about"',
                        '"First, let\'s"',
                        '"So here\'s"'
                    ],
                    vocabulary: {
                        complexity: 'Accessible (Grade 8-10)',
                        uniqueWords: '68%',
                        technicalTerms: '12%'
                    }
                },
                rhetoricalFramework: {
                    persuasionTechniques: [
                        'Problem-Solution Framework',
                        'Social Proof & Authority',
                        'Direct Address ("You")',
                        'Urgency Triggers',
                        'Concrete Examples'
                    ],
                    narrativeStyle: 'Linear progression with strategic hooks. Opens with attention-grabbing statement, builds through logical steps, closes with actionable takeaway.'
                },
                microElements: {
                    discourseMarkers: ['So', 'First', 'Actually', 'Here\'s the thing', 'But', 'Now', 'Right?'],
                    cadencePattern: 'Varied pacing with punchy openers and detailed explanations'
                }
            };
            
            // Update Voice Signature
            document.getElementById('toneValue').textContent = analysisData.voiceSignature.tone;
            document.getElementById('toneMeter').style.width = analysisData.voiceSignature.toneStrength + '%';
            document.getElementById('registerValue').textContent = analysisData.voiceSignature.register;
            document.getElementById('registerIndicator').style.left = analysisData.voiceSignature.registerPosition + '%';
            document.getElementById('energyValue').textContent = analysisData.voiceSignature.energy;
            
            // Update energy dots
            const dots = document.querySelectorAll('.energy-dots .dot');
            dots.forEach((dot, index) => {
                if (index < analysisData.voiceSignature.energyLevel) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
            
            // Update Linguistic Patterns
            const structuresHtml = analysisData.linguisticPatterns.dominantStructures
                .map(s => `<li>${s}</li>`).join('');
            document.getElementById('dominantStructures').innerHTML = structuresHtml;
            
            const phrasesHtml = analysisData.linguisticPatterns.signaturePhrases
                .map(p => `<span class="phrase-tag">${p}</span>`).join('');
            document.getElementById('signaturePhrases').innerHTML = phrasesHtml;
            
            document.getElementById('vocabComplexity').textContent = analysisData.linguisticPatterns.vocabulary.complexity;
            document.getElementById('uniqueWords').textContent = analysisData.linguisticPatterns.vocabulary.uniqueWords;
            document.getElementById('technicalTerms').textContent = analysisData.linguisticPatterns.vocabulary.technicalTerms;
            
            // Update Rhetorical Framework
            const techniquesHtml = analysisData.rhetoricalFramework.persuasionTechniques
                .map(t => `
                    <div class="technique-item">
                        <span class="technique-icon">→</span>
                        <span>${t}</span>
                    </div>
                `).join('');
            document.getElementById('persuasionTechniques').innerHTML = techniquesHtml;
            
            // Update Micro Elements
            const markersHtml = analysisData.microElements.discourseMarkers
                .map(m => `<span class="marker">${m}</span>`).join('');
            document.getElementById('discourseMarkers').innerHTML = markersHtml;
            
            document.getElementById('cadenceDesc').textContent = analysisData.microElements.cadencePattern;
            
            // Store analysis data for export
            state.analysisData = analysisData;
        }

        // Export style profile
        function exportStyleProfile() {
            if (!state.analysisData) {
                alert('Please run analysis first');
                return;
            }
            
            const profileJson = JSON.stringify(state.analysisData, null, 2);
            const blob = new Blob([profileJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'voice-style-profile.json';
            a.click();
            URL.revokeObjectURL(url);
            
            announceToScreenReader('Style profile exported');
        }

        // Use style for rescript
        function useStyleForRescript() {
            if (!state.analysisData) {
                alert('Please run analysis first');
                return;
            }
            
            // This would normally integrate with your rescript feature
            alert('Style profile loaded for rescripting. The AI will now generate content matching this communication style.');
            
            // Store style for use in rescript
            sessionStorage.setItem('voiceStyleProfile', JSON.stringify(state.analysisData));
            
            announceToScreenReader('Style profile applied for rescripting');
        }

        // Detect platform from URL
        function detectPlatform(url) {
            if (url.includes('tiktok.com')) return 'tiktok';
            if (url.includes('instagram.com')) return 'instagram';
            if (url.includes('youtube.com/shorts')) return 'youtube';
            return null;
        }

        // Format number for display
        function formatNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        }

        // Format title case
        function formatTitle(str) {
            return str.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }

        // Copy to clipboard
        function copyToClipboard(fieldId) {
            const text = document.getElementById(fieldId).textContent;
            navigator.clipboard.writeText(text).then(() => {
                announceToScreenReader('Copied to clipboard');
            });
        }

        // Copy video link
        function copyVideoLink() {
            const url = state.videoData?.videoUrl || elements.urlInput.value;
            navigator.clipboard.writeText(url).then(() => {
                announceToScreenReader('Video link copied');
            });
        }

        // Rescript video placeholder
        function rescriptVideo() {
            alert('Rescript feature coming soon! This will open the AI script editor.');
        }

        // Update layout based on viewport
        function updateLayout() {
            const width = window.innerWidth;
            
            if (width < 600) {
                state.layoutMode = 'stacked';
                elements.mainContent.classList.remove('split-view');
            } else if (width >= 900 && state.isInsightsOpen) {
                state.layoutMode = 'split';
                elements.mainContent.classList.add('split-view');
            } else {
                state.layoutMode = 'compact';
            }
        }

        // Load insights data (simulated async)
        function loadInsightsData() {
            // In production, this would fetch additional data
            console.log('Loading detailed insights...');
        }

        // Announce to screen readers
        function announceToScreenReader(message) {
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.style.position = 'absolute';
            announcement.style.left = '-10000px';
            announcement.textContent = message;
            document.body.appendChild(announcement);
            setTimeout(() => announcement.remove(), 1000);
        }

        // Initialize app
        init();
    </script>
</body>
</html>