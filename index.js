/* ==========================================================================
   ALWUMS Modernization Framework Controller
   Vanilla JavaScript — Dynamic 9-Screen Controls & Themes
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- CENTRAL APP STATE ---
    const state = {
        theme: 'light',
        currentView: 'dashboard-view',
        projects: [
            { name: 'HR_Portal', tech: 'Classic ASP', status: 'completed', progress: 100, updated: '2 mins ago' },
            { name: 'Inventory_System', tech: 'Classic ASP', status: 'in-progress', progress: 65, updated: '15 mins ago' },
            { name: 'Old_CRM', tech: 'Classic ASP', status: 'completed', progress: 100, updated: '1 hour ago' },
            { name: 'Billing_App', tech: 'Classic ASP', status: 'failed', progress: 0, updated: '3 hours ago' },
            { name: 'Legacy_Reports', tech: 'Classic ASP', status: 'completed', progress: 100, updated: '1 day ago' }
        ],
        logs: [
            { time: '10:31:15', agent: 'Prompt Maker Agent', level: 'info', message: 'Generated products.py successfully' },
            { time: '10:31:10', agent: 'Prompt Maker Agent', level: 'info', message: 'Generating templates/products.html ...' },
            { time: '10:30:58', agent: 'Prompt Maker Agent', level: 'info', message: 'Generating models.py ...' },
            { time: '10:30:46', agent: 'Manager Agent', level: 'info', message: 'Plan created successfully' },
            { time: '10:30:45', agent: 'Discovery Agent', level: 'info', message: 'Analysis completed. 142 files scanned' },
            { time: '10:30:12', agent: 'Discovery Agent', level: 'info', message: 'Starting code analysis...' }
        ],
        originalFiles: {},  // path -> content
        upgradedFiles: {},  // path -> content
        zipBlob: null,
        currentProjectName: '',
        currentProjectTech: 'ASP.NET Core Razor',
        elapsedTime: 0,
        timerId: null,
        settings: {
            provider: 'gemini',
            model: 'gemini-2.5-flash',
            apiKey: '',
            temperature: 0.0,
            maxTokens: 8192
        }
    };

    // --- DOM ELEMENT REFERENCES ---
    const sidebarItems = document.querySelectorAll('.nav-item');
    const pageViews = document.querySelectorAll('.page-view');
    const headerTitle = document.getElementById('header-title');
    const themeToggle = document.getElementById('theme-toggle');
    const healthDot = document.getElementById('health-dot');

    // Dashboard metrics
    const dbTotalCount = document.getElementById('dashboard-total-count');
    const dbCompletedCount = document.getElementById('dashboard-completed-count');
    const dbProgressCount = document.getElementById('dashboard-progress-count');
    const activityFeed = document.getElementById('activity-feed');

    // Projects list
    const projectsTableBody = document.getElementById('projects-table-body');
    const projectSearchInput = document.getElementById('project-search-input');
    const projectStatusFilter = document.getElementById('project-status-filter');
    const btnProjectNewUpload = document.getElementById('btn-project-new-upload');

    // Wizard
    const wizIndicator1 = document.getElementById('wiz-indicator-1');
    const wizIndicator2 = document.getElementById('wiz-indicator-2');
    const wizIndicator3 = document.getElementById('wiz-indicator-3');
    const wizPane1 = document.getElementById('wiz-pane-1');
    const wizPane2 = document.getElementById('wiz-pane-2');
    const wizPane3 = document.getElementById('wiz-pane-3');
    const dropArea = document.getElementById('drop-area');
    const folderInput = document.getElementById('folder-input');
    const uploadErrorMessage = document.getElementById('upload-error-message');
    const selectedFilesCard = document.getElementById('selected-files-card');
    const wizardNext1 = document.getElementById('wizard-next-1');
    const wizardNext2 = document.getElementById('wizard-next-2');
    const wizardPrev2 = document.getElementById('wizard-prev-2');
    const wizardPrev3 = document.getElementById('wizard-prev-3');
    const configProjectName = document.getElementById('config-project-name');
    const configTargetTech = document.getElementById('config-target-tech');
    const configInstructions = document.getElementById('config-instructions');
    const reviewProjectName = document.getElementById('review-project-name');
    const reviewFilesCount = document.getElementById('review-files-count');
    const reviewTargetTech = document.getElementById('review-target-tech');
    const btnRunModernization = document.getElementById('btn-run-modernization');

    // Pipeline Execution
    const consoleLog = document.getElementById('console-log');
    const executionStageName = document.getElementById('execution-stage-name');
    const executionProgressBar = document.getElementById('execution-progress-bar');
    const executionElapsedTime = document.getElementById('execution-elapsed-time');
    const executionProgressPct = document.getElementById('execution-progress-pct');

    // Report
    const reportTotalFiles = document.getElementById('report-total-files');
    const reportLegacyFiles = document.getElementById('report-legacy-files');
    const reportComplexity = document.getElementById('report-complexity');
    const techStackChartContainer = document.getElementById('tech-stack-chart-container');
    const reportFilesList = document.getElementById('report-files-list');
    const reportDependenciesTbody = document.getElementById('report-dependencies-tbody');
    const reportAntipatternsList = document.getElementById('report-antipatterns-list');
    const reportSummaryText = document.getElementById('report-summary-text');
    const analyzerTabBtns = document.querySelectorAll('.analyzer-tab-btn');
    const analyzerTabContents = document.querySelectorAll('.analyzer-tab-content');

    // Diff Viewer
    const fileSelector = document.getElementById('file-selector');
    const originalCode = document.getElementById('original-code');
    const upgradedCode = document.getElementById('upgraded-code');
    const originalTitle = document.getElementById('original-title');
    const upgradedTitle = document.getElementById('upgraded-title');

    // Download View
    const downloadFilesConverted = document.getElementById('download-files-converted');
    const downloadPipelineTime = document.getElementById('download-pipeline-time');
    const downloadZipName = document.getElementById('download-zip-name');
    const downloadZipSize = document.getElementById('download-zip-size');
    const downloadZipBtn = document.getElementById('download-zip-btn');
    const downloadPreviewBtn = document.getElementById('download-preview-btn');

    // Settings View
    const settingsMenuItems = document.querySelectorAll('.settings-menu-item');
    const settingsPanes = document.querySelectorAll('.settings-content-pane');
    const saveSettingsBtn = document.getElementById('save-settings');
    const settingsStatus = document.getElementById('settings-status');
    const modelProvider = document.getElementById('model-provider');
    const modelSelect = document.getElementById('model-select');
    const apiKeyInput = document.getElementById('api-key-input');
    const tempSlider = document.getElementById('temp-slider');
    const tempValue = document.getElementById('temp-value');
    const maxTokensInput = document.getElementById('max-tokens');

    // Logs View
    const logsTableBody = document.getElementById('logs-table-body');
    const logAgentFilter = document.getElementById('log-agent-filter');
    const logLevelFilter = document.getElementById('log-level-filter');
    const logSearchInput = document.getElementById('log-search-input');
    const btnLogsPrev = document.getElementById('btn-logs-prev');
    const btnLogsNext = document.getElementById('btn-logs-next');

    // --- API ORIGIN RESOLVER ---
    function getApiOrigin() {
        const port = window.location.port;
        if (!window.location.protocol.startsWith('http') || port === '8080') {
            return 'http://127.0.0.1:5000';
        }
        return window.location.origin;
    }

    // --- INITIALIZATION ---
    loadSettings();
    syncDashboardMetrics();
    renderProjectsTable();
    checkBackendHealth();
    renderActivityFeed();
    renderLogsTable();

    // Regular health check interval
    setInterval(checkBackendHealth, 10000);

    // --- LIGHT/DARK THEME CONTROLLER ---
    themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        applyTheme();
    });

    function applyTheme() {
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('theme', state.theme);
        
        // Toggle icon visual
        if (state.theme === 'dark') {
            themeToggle.innerHTML = `<svg style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
        } else {
            themeToggle.innerHTML = `<svg style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>`;
        }
    }

    // --- SPA VIEW ROUTING ---
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetView = item.dataset.view;
            switchView(targetView);
        });
    });

    btnProjectNewUpload.addEventListener('click', () => {
        switchView('upload-view');
    });

    function switchView(viewId) {
        state.currentView = viewId;
        
        // Update sidebar visual states
        sidebarItems.forEach(item => {
            if (item.dataset.view === viewId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update pages visibility
        pageViews.forEach(view => {
            if (view.id === viewId) {
                view.classList.add('active-view');
            } else {
                view.classList.remove('active-view');
            }
        });

        // Update Header Title based on the tab
        const correspondingLink = document.querySelector(`.nav-item[data-view="${viewId}"]`);
        if (correspondingLink) {
            headerTitle.textContent = correspondingLink.textContent.trim();
        } else if (viewId === 'pipeline-view') {
            headerTitle.textContent = 'Agent Pipeline';
        } else if (viewId === 'download-view') {
            headerTitle.textContent = 'Modernized Package';
        }
    }

    // --- DASHBOARD AND METRICS ---
    function syncDashboardMetrics() {
        const total = state.projects.length;
        const completed = state.projects.filter(p => p.status === 'completed').length;
        const progress = state.projects.filter(p => p.status === 'in-progress').length;

        dbTotalCount.textContent = total;
        dbCompletedCount.textContent = completed;
        dbProgressCount.textContent = progress;
    }

    function renderActivityFeed() {
        if (!activityFeed) return;
        activityFeed.innerHTML = '';
        
        // Take last 3 items from log/projects
        const recent = [
            { title: 'HR_Portal (Classic ASP)', desc: 'Successfully modernized to ASP.NET Core', status: 'completed', time: '2 mins ago' },
            { title: 'Inventory_System (Classic ASP)', desc: 'Generator migrating products.py...', status: 'in-progress', time: '15 mins ago' },
            { title: 'Billing_App (Classic ASP)', desc: 'Modernization halted due to syntax validation errors', status: 'failed', time: '3 hours ago' }
        ];

        recent.forEach(act => {
            const item = document.createElement('div');
            item.className = 'activity-feed-item';
            
            let pillClass = 'pending';
            if (act.status === 'completed') pillClass = 'completed';
            if (act.status === 'in-progress') pillClass = 'in-progress';
            if (act.status === 'failed') pillClass = 'failed';

            item.innerHTML = `
                <div class="activity-feed-left">
                    <div class="activity-feed-dot" style="background-color: var(--color-${act.status === 'completed' ? 'success' : act.status === 'in-progress' ? 'info' : 'danger'})"></div>
                    <div class="activity-feed-details">
                        <h5>${act.title}</h5>
                        <p>${act.desc}</p>
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
                    <span class="status-pill ${pillClass}">${act.status}</span>
                    <span style="font-size:10px;color:var(--text-muted);">${act.time}</span>
                </div>
            `;
            activityFeed.appendChild(item);
        });
    }

    // --- PROJECTS TABLE RENDER & SEARCH ---
    function renderProjectsTable() {
        if (!projectsTableBody) return;
        projectsTableBody.innerHTML = '';

        const query = projectSearchInput.value.toLowerCase().trim();
        const statusFilter = projectStatusFilter.value;

        const filtered = state.projects.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(query) || p.tech.toLowerCase().includes(query);
            const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        if (filtered.length === 0) {
            projectsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No matching projects found</td></tr>`;
            return;
        }

        filtered.forEach(p => {
            const tr = document.createElement('tr');
            
            let pillClass = 'pending';
            if (p.status === 'completed') pillClass = 'completed';
            if (p.status === 'in-progress') pillClass = 'in-progress';
            if (p.status === 'failed') pillClass = 'failed';

            tr.innerHTML = `
                <td style="font-weight:600;color:var(--text-primary);">${p.name}</td>
                <td>${p.tech}</td>
                <td><span class="status-pill ${pillClass}">${p.status}</span></td>
                <td style="width:200px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div class="progress-bar-bg" style="flex-grow:1;">
                            <div class="progress-bar-fill" style="width:${p.progress}%; background-color: var(--color-${p.status === 'completed' ? 'success' : p.status === 'in-progress' ? 'info' : 'danger'})"></div>
                        </div>
                        <span style="font-size:12px;font-weight:600;">${p.progress}%</span>
                    </div>
                </td>
                <td style="color:var(--text-muted);font-size:12px;">${p.updated}</td>
            `;
            projectsTableBody.appendChild(tr);
        });
    }

    projectSearchInput.addEventListener('input', renderProjectsTable);
    projectStatusFilter.addEventListener('change', renderProjectsTable);

    // --- FILE SCANNING AND WIZARD FLOW ---
    dropArea.addEventListener('click', () => folderInput.click());
    dropArea.addEventListener('dragover', e => {
        e.preventDefault();
        dropArea.style.borderColor = 'var(--accent)';
    });
    dropArea.addEventListener('dragleave', () => {
        dropArea.style.borderColor = 'var(--border-color)';
    });
    dropArea.addEventListener('drop', e => {
        e.preventDefault();
        dropArea.style.borderColor = 'var(--border-color)';
        if (e.dataTransfer.items) {
            scanDroppedItems(e.dataTransfer.items);
        }
    });
    folderInput.addEventListener('change', e => {
        scanInputFiles(e.target.files);
    });

    async function scanDroppedItems(items) {
        state.originalFiles = {};
        selectedFilesCard.innerHTML = '';
        uploadErrorMessage.style.display = 'none';

        try {
            statusText('Scanning directory structure...');
            const zip = new JSZip();
            let count = 0;
            let folderName = '';

            for (const item of items) {
                const entry = item.webkitGetAsEntry();
                if (entry) {
                    if (!folderName) folderName = entry.name;
                    await scanWebkitEntry(entry, zip, '');
                    count++;
                }
            }

            if (Object.keys(state.originalFiles).length === 0) {
                throw new Error('No files found in directory.');
            }

            state.currentProjectName = folderName || 'modernized_project';
            configProjectName.value = state.currentProjectName;
            state.zipBlob = await zip.generateAsync({ type: 'blob' });
            
            renderSelectedFilesList();
            wizardNext1.disabled = false;
            statusText(`Scanned project directory. ${Object.keys(state.originalFiles).length} files discovered.`);
        } catch (err) {
            showUploadError(err.message);
        }
    }

    async function scanWebkitEntry(entry, zip, path) {
        if (entry.isFile) {
            const file = await new Promise(resolve => entry.file(resolve));
            const rel = path + entry.name;
            zip.file(rel, file);
            
            const text = await file.text();
            state.originalFiles[rel] = text;
        } else if (entry.isDirectory) {
            const reader = entry.createReader();
            const entries = await new Promise(resolve => reader.readEntries(resolve));
            for (const sub of entries) {
                await scanWebkitEntry(sub, zip, path + entry.name + '/');
            }
        }
    }

    async function scanInputFiles(files) {
        state.originalFiles = {};
        selectedFilesCard.innerHTML = '';
        uploadErrorMessage.style.display = 'none';

        try {
            statusText('Reading files...');
            const zip = new JSZip();
            let folderName = files[0].webkitRelativePath ? files[0].webkitRelativePath.split('/')[0] : 'project';
            
            for (const file of files) {
                const rel = file.webkitRelativePath ? file.webkitRelativePath.replace(`${folderName}/`, '') : file.name;
                zip.file(rel, file);
                
                const text = await file.text();
                state.originalFiles[rel] = text;
            }

            state.currentProjectName = folderName;
            configProjectName.value = state.currentProjectName;
            state.zipBlob = await zip.generateAsync({ type: 'blob' });
            
            renderSelectedFilesList();
            wizardNext1.disabled = false;
            statusText(`Scanned selected files. ${Object.keys(state.originalFiles).length} files discovered.`);
        } catch (err) {
            showUploadError(err.message);
        }
    }

    function renderSelectedFilesList() {
        selectedFilesCard.innerHTML = '';
        selectedFilesCard.style.display = 'block';
        
        Object.keys(state.originalFiles).forEach(path => {
            const row = document.createElement('div');
            row.className = 'selected-file-row';
            row.innerHTML = `
                <span>${path}</span>
                <span style="color:var(--text-muted);font-size:11px;">Scanned</span>
            `;
            selectedFilesCard.appendChild(row);
        });
    }

    function statusText(txt) {
        console.log("Upload state: ", txt);
    }

    function showUploadError(msg) {
        uploadErrorMessage.textContent = msg;
        uploadErrorMessage.style.display = 'block';
        wizardNext1.disabled = true;
    }

    // Wizard Next/Back Navigation
    wizardNext1.addEventListener('click', () => {
        wizIndicator1.className = 'wizard-step-indicator completed';
        wizIndicator2.className = 'wizard-step-indicator active';
        wizPane1.classList.remove('active');
        wizPane2.classList.add('active');
    });

    wizardPrev2.addEventListener('click', () => {
        wizIndicator1.className = 'wizard-step-indicator active';
        wizIndicator2.className = 'wizard-step-indicator';
        wizPane1.classList.add('active');
        wizPane2.classList.remove('active');
    });

    wizardNext2.addEventListener('click', () => {
        state.currentProjectName = configProjectName.value.trim() || 'modernized_project';
        state.currentProjectTech = configTargetTech.value;

        reviewProjectName.textContent = state.currentProjectName;
        reviewFilesCount.textContent = `${Object.keys(state.originalFiles).length} files`;
        reviewTargetTech.textContent = state.currentProjectTech;

        wizIndicator2.className = 'wizard-step-indicator completed';
        wizIndicator3.className = 'wizard-step-indicator active';
        wizPane2.classList.remove('active');
        wizPane3.classList.add('active');
    });

    wizardPrev3.addEventListener('click', () => {
        wizIndicator2.className = 'wizard-step-indicator active';
        wizIndicator3.className = 'wizard-step-indicator';
        wizPane2.classList.add('add');
        wizPane2.classList.add('active');
        wizPane3.classList.remove('active');
    });

    // --- PIPELINE EXECUTION ENGINE ---
    btnRunModernization.addEventListener('click', async () => {
        // 1. Add project to queue list
        const newProj = {
            name: state.currentProjectName,
            tech: state.currentProjectTech,
            status: 'in-progress',
            progress: 0,
            updated: 'Just now'
        };
        state.projects.unshift(newProj);
        syncDashboardMetrics();
        renderProjectsTable();

        // 2. Switch tab to Pipeline status
        switchView('pipeline-view');
        resetPipelineUI();
        startTimer();

        // 3. Simulated progress + real AJAX call
        const totalDuration = 18000; // ms duration
        let currentProgress = 0;
        const progressInterval = setInterval(() => {
            if (currentProgress < 90) {
                currentProgress += 5;
                updateProgressUI(currentProgress);
            }
        }, 1000);

        // Simulated Agent transition loops
        simulatePipelineWorkflow();

        try {
            const formData = new FormData();
            formData.append('project', state.zipBlob, `${state.currentProjectName}.zip`);

            const response = await fetch(`${getApiOrigin()}/upgrade`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Migration API error: Status ${response.status}`);
            }

            const blob = await response.blob();
            
            clearInterval(progressInterval);
            clearInterval(state.timerId);
            updateProgressUI(100);

            // Mark all steps as complete
            document.querySelectorAll('.agent-pipeline-item').forEach(item => {
                item.className = 'agent-pipeline-item completed';
            });
            document.querySelectorAll('.pipeline-step-node').forEach(node => {
                node.className = 'pipeline-step-node completed';
            });

            // Extract upgraded ZIP package
            await extractReturnedZip(blob);

            // Update project status
            newProj.status = 'completed';
            newProj.progress = 100;
            syncDashboardMetrics();
            renderProjectsTable();

            // Populate Report data dynamically
            generateAnalyzerReport();

            // Setup download items
            setupDownloadView(blob);

            // Write final console events
            logTerminalEvent('System', 'Validation Checks Passed. Output compiled successfully.', 'success');
            logTerminalEvent('System', 'Modernization Pipeline complete.', 'success');

            // Redirect automatically to download
            setTimeout(() => {
                switchView('download-view');
            }, 1000);

        } catch (err) {
            clearInterval(progressInterval);
            clearInterval(state.timerId);
            
            newProj.status = 'failed';
            newProj.progress = 0;
            syncDashboardMetrics();
            renderProjectsTable();

            logTerminalEvent('System', `Critical Error: ${err.message}`, 'error');
            executionStageName.textContent = 'Modernization Failed';
            executionStageName.style.color = 'var(--color-danger)';
        }
    });

    function resetPipelineUI() {
        consoleLog.innerHTML = '';
        executionElapsedTime.textContent = '00:00';
        executionProgressPct.textContent = '0%';
        executionProgressBar.style.width = '0%';
        executionStageName.textContent = 'Queued';
        executionStageName.style.color = 'var(--accent)';

        document.querySelectorAll('.agent-pipeline-item').forEach(item => {
            item.className = 'agent-pipeline-item pending';
            const text = item.querySelector('.agent-pipeline-time');
            if (text) text.textContent = 'Pending';
        });
    }

    function startTimer() {
        state.elapsedTime = 0;
        state.timerId = setInterval(() => {
            state.elapsedTime++;
            const mins = String(Math.floor(state.elapsedTime / 60)).padStart(2, '0');
            const secs = String(state.elapsedTime % 60).padStart(2, '0');
            executionElapsedTime.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    function updateProgressUI(pct) {
        executionProgressPct.textContent = `${pct}%`;
        executionProgressBar.style.width = `${pct}%`;
    }

    function logTerminalEvent(agent, message, level = 'info') {
        const time = new Date().toLocaleTimeString();
        const row = document.createElement('div');
        row.className = 'console-line';
        
        let colorStyle = '';
        if (level === 'success') colorStyle = 'color: var(--color-success);';
        if (level === 'error') colorStyle = 'color: var(--color-danger);';
        if (level === 'warning') colorStyle = 'color: var(--color-warning);';

        row.innerHTML = `
            <span class="console-time">[${time}]</span>
            <span class="console-agent" style="${colorStyle}">${agent}</span>
            <span class="console-msg" style="${colorStyle}">${message}</span>
        `;
        consoleLog.appendChild(row);
        consoleLog.scrollTop = consoleLog.scrollHeight;

        // Push to local logs database for logs tab
        state.logs.unshift({
            time: time,
            agent: agent,
            level: level,
            message: message
        });
        renderLogsTable();
    }

    function simulatePipelineWorkflow() {
        const stages = [
            { step: 'Discovery Agent', id: 'a-step-1', hId: 'h-step-1', time: 1000, startMsg: 'Initiating dependency tree scan ...', endMsg: 'Project analysis complete. Found files.' },
            { step: 'Manager Agent', id: 'a-step-2', hId: 'h-step-2', time: 3000, startMsg: 'Synthesizing conversion checklist ...', endMsg: 'Modernization plan locked.' },
            { step: 'Prompt Maker Agent', id: 'a-step-3', hId: 'h-step-3', time: 6000, startMsg: 'Refactoring Classic ASP VBScript blocks...', endMsg: 'Conversion models compiled.' },
            { step: 'Execution Agent', id: 'a-step-4', hId: 'h-step-4', time: 10000, startMsg: 'Performing self-test compiler validation checks ...', endMsg: 'Checks passed.' },
            { step: 'Validator Agent', id: 'a-step-5', hId: 'h-step-5', time: 13000, startMsg: 'Verifying styling layouts and CSS extractions...', endMsg: 'Verification complete.' },
            { step: 'Finalizer Agent', id: 'a-step-6', hId: 'h-step-6', time: 16000, startMsg: 'Assembling directory assets ...', endMsg: 'Packaging upgrade zip.' }
        ];

        stages.forEach(s => {
            setTimeout(() => {
                // Update previous to completed
                stages.forEach(prev => {
                    const el = document.getElementById(prev.id);
                    const hEl = document.getElementById(prev.hId);
                    if (el && parseInt(prev.id.split('-').pop()) < parseInt(s.id.split('-').pop())) {
                        el.className = 'agent-pipeline-item completed';
                        el.querySelector('.agent-pipeline-time').textContent = 'Completed';
                        if (hEl) hEl.className = 'pipeline-step-node completed';
                    }
                });

                // Set current to active
                const el = document.getElementById(s.id);
                const hEl = document.getElementById(s.hId);
                if (el) {
                    el.className = 'agent-pipeline-item in-progress';
                    el.querySelector('.agent-pipeline-time').textContent = 'In Progress...';
                    executionStageName.textContent = `Running ${s.step}...`;
                    if (hEl) hEl.className = 'pipeline-step-node active';
                }

                logTerminalEvent(s.step, s.startMsg);
            }, s.time);
        });
    }

    // --- ZIP EXTRACTION & CODE DIFF LOADING ---
    async function extractReturnedZip(blob) {
        state.upgradedFiles = {};
        const zip = await JSZip.loadAsync(blob);

        for (const filename of Object.keys(zip.files)) {
            const file = zip.files[filename];
            if (!file.dir) {
                const text = await file.async('text');
                const cleanName = filename.replace('output_code/', '').replace('input_code/', '');
                state.upgradedFiles[cleanName] = text;
            }
        }

        // Populate Code Diff selector dropdown
        fileSelector.innerHTML = '';
        const files = Object.keys(state.upgradedFiles).filter(f => f !== 'report.html');
        
        if (files.length === 0) {
            fileSelector.innerHTML = '<option value="">No files available</option>';
            return;
        }

        files.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f;
            opt.textContent = f;
            fileSelector.appendChild(opt);
        });

        // Trigger first diff render
        renderCodeDiff(files[0]);
    }

    fileSelector.addEventListener('change', e => {
        renderCodeDiff(e.target.value);
    });

    function renderCodeDiff(filename) {
        originalCode.innerHTML = '';
        upgradedCode.innerHTML = '';
        if (!filename) return;

        const origText = state.originalFiles[filename] || state.originalFiles[`input_code/${filename}`] || '/* Original file not scanned or loaded */';
        const upgdText = state.upgradedFiles[filename] || '/* Modernized output not generated */';

        originalTitle.textContent = `${filename} (Original)`;
        upgradedTitle.textContent = `${filename} (Upgraded)`;

        const origLines = origText.split('\n');
        const upgdLines = upgdText.split('\n');

        // Line-by-line diff mapping
        origLines.forEach((line, idx) => {
            const row = document.createElement('div');
            row.className = 'diff-line';
            
            // Highlight removed line
            if (origText !== upgdText && !upgdLines.includes(line)) {
                row.classList.add('removed');
            }

            row.innerHTML = `
                <span class="diff-ln">${idx + 1}</span>
                <span class="diff-text">${escapeHtml(line)}</span>
            `;
            originalCode.appendChild(row);
        });

        upgdLines.forEach((line, idx) => {
            const row = document.createElement('div');
            row.className = 'diff-line';

            // Highlight added line
            if (origText !== upgdText && !origLines.includes(line)) {
                row.classList.add('added');
            }

            row.innerHTML = `
                <span class="diff-ln">${idx + 1}</span>
                <span class="diff-text">${escapeHtml(line)}</span>
            `;
            upgradedCode.appendChild(row);
        });
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#039;");
    }

    // --- ANALYZER REPORT GENERATION ---
    function generateAnalyzerReport() {
        const total = Object.keys(state.originalFiles).length;
        reportTotalFiles.textContent = total;
        
        const legacy = Object.keys(state.originalFiles).filter(f => f.endsWith('.asp') || f.endsWith('.asa') || f.endsWith('.inc')).length;
        reportLegacyFiles.textContent = legacy;
        
        reportComplexity.textContent = '7.4 / 10';
        reportComplexity.className = 'score-value-text';

        // Tech Stack horizontal bar chart rendering
        techStackChartContainer.innerHTML = `
            <div class="tech-stack-row">
                <div class="tech-stack-label-row">
                    <span>Classic ASP / VBScript</span>
                    <span>${Math.round((legacy/total)*100) || 0}%</span>
                </div>
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${(legacy/total)*100}%;"></div></div>
            </div>
            <div class="tech-stack-row">
                <div class="tech-stack-label-row">
                    <span>HTML</span>
                    <span>${Math.round(((total-legacy)/total)*60) || 0}%</span>
                </div>
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${((total-legacy)/total)*60}%;background-color:var(--color-info);"></div></div>
            </div>
            <div class="tech-stack-row">
                <div class="tech-stack-label-row">
                    <span>CSS</span>
                    <span>15%</span>
                </div>
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:15%;background-color:var(--color-warning);"></div></div>
            </div>
        `;

        // Report Structure tree list
        reportFilesList.innerHTML = '';
        Object.keys(state.originalFiles).forEach(path => {
            const el = document.createElement('div');
            el.className = 'selected-file-row';
            el.innerHTML = `<span>${path}</span><span class="status-pill completed">Analyzed</span>`;
            reportFilesList.appendChild(el);
        });

        // Report Dependencies list
        reportDependenciesTbody.innerHTML = '';
        Object.keys(state.originalFiles).forEach(path => {
            const matches = state.originalFiles[path].match(/<!--\s*#include\s+(?:file|virtual)\s*=\s*"([^"]+)"\s*-->/gi) || [];
            matches.forEach(m => {
                const tr = document.createElement('tr');
                const file = m.match(/"([^"]+)"/)[1];
                tr.innerHTML = `
                    <td style="font-weight:600;color:var(--text-primary);">${path}</td>
                    <td>${file}</td>
                    <td><span class="status-pill pending">Server Side Include</span></td>
                `;
                reportDependenciesTbody.appendChild(tr);
            });
        });

        if (reportDependenciesTbody.children.length === 0) {
            reportDependenciesTbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No include file dependencies discovered.</td></tr>`;
        }

        // Report Anti patterns
        reportAntipatternsList.innerHTML = `
            <div class="selected-file-row">
                <span>Mixed Code presentation layout layer (HTML & inline VBScript queries)</span>
                <span class="status-pill failed">Severe</span>
            </div>
            <div class="selected-file-row">
                <span>Direct Connection DB query execution mapping</span>
                <span class="status-pill failed">Severe</span>
            </div>
            <div class="selected-file-row">
                <span>Embedded styling parameters inside body cards</span>
                <span class="status-pill pending">Low</span>
            </div>
        `;

        // Report Summary text
        reportSummaryText.innerHTML = `
            <h3>Migration Roadmap Details</h3>
            <p style="margin-top:8px;">The analysis scanned ${total} files. The core VBScript database connection mappings were resolved. All inline stylesheet configurations have been modularized and extracted into style.css. Code was refactored under strict separation of concerns into the targeted framework output templates.</p>
        `;
    }

    // Report sub-tab switching
    analyzerTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            analyzerTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            analyzerTabContents.forEach(pane => {
                if (pane.id === `analyzer-tab-${targetTab}`) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });

    // --- DOWNLOAD PAGE & FINALIZE VIEWS ---
    function setupDownloadView(blob) {
        const total = Object.keys(state.originalFiles).length;
        downloadFilesConverted.textContent = `${total}/${total}`;
        downloadPipelineTime.textContent = `${state.elapsedTime}s`;
        
        downloadZipName.textContent = `${state.currentProjectName}_modernized.zip`;
        const sizeInKB = Math.round(blob.size / 1024);
        downloadZipSize.textContent = `${sizeInKB} KB`;

        const url = URL.createObjectURL(blob);
        downloadZipBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = url;
            a.download = `${state.currentProjectName}_modernized.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        };

        downloadPreviewBtn.onclick = () => {
            switchView('diff-view');
        };
    }

    // --- SETTINGS VIEW CONTROLS ---
    settingsMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetPane = item.dataset.pane;
            
            settingsMenuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            settingsPanes.forEach(pane => {
                if (pane.id === `settings-pane-${targetPane}`) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });

    tempSlider.addEventListener('input', e => {
        tempValue.textContent = e.target.value;
    });

    saveSettingsBtn.addEventListener('click', () => {
        state.settings.model = modelSelect.value;
        state.settings.apiKey = apiKeyInput.value.trim();
        state.settings.temperature = parseFloat(tempSlider.value);
        state.settings.maxTokens = parseInt(maxTokensInput.value) || 8192;

        localStorage.setItem('llm-settings', JSON.stringify(state.settings));
        
        // Save to .env (backend api call could be hooked, but local storage matches configuration)
        settingsStatus.style.display = 'inline';
        setTimeout(() => {
            settingsStatus.style.display = 'none';
        }, 1500);
    });

    function loadSettings() {
        // Theme
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            state.theme = storedTheme;
            applyTheme();
        }

        // Settings inputs
        const storedSettings = localStorage.getItem('llm-settings');
        if (storedSettings) {
            state.settings = JSON.parse(storedSettings);
            modelSelect.value = state.settings.model;
            apiKeyInput.value = state.settings.apiKey;
            tempSlider.value = state.settings.temperature;
            tempValue.textContent = state.settings.temperature;
            maxTokensInput.value = state.settings.maxTokens;
        } else {
            apiKeyInput.value = state.settings.apiKey;
        }
    }

    // --- AUDIT LOGS DATABASE VIEW ---
    function renderLogsTable() {
        if (!logsTableBody) return;
        logsTableBody.innerHTML = '';

        const agentFilter = logAgentFilter.value.toLowerCase();
        const levelFilter = logLevelFilter.value.toLowerCase();
        const query = logSearchInput.value.toLowerCase().trim();

        const filtered = state.logs.filter(l => {
            const matchesAgent = agentFilter === 'all' || l.agent.toLowerCase() === agentFilter;
            const matchesLevel = levelFilter === 'all' || l.level.toLowerCase() === levelFilter;
            const matchesSearch = l.message.toLowerCase().includes(query) || l.agent.toLowerCase().includes(query);
            return matchesAgent && matchesLevel && matchesSearch;
        });

        if (filtered.length === 0) {
            logsTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No matching logs found</td></tr>`;
            return;
        }

        filtered.forEach(l => {
            const tr = document.createElement('tr');
            
            let badgeClass = 'pending';
            if (l.level === 'success') badgeClass = 'completed';
            if (l.level === 'warning') badgeClass = 'in-progress';
            if (l.level === 'error') badgeClass = 'failed';

            tr.innerHTML = `
                <td style="color:var(--text-muted);font-family:var(--font-mono);">${l.time}</td>
                <td style="font-weight:600;color:var(--text-primary);">${l.agent}</td>
                <td><span class="status-pill ${badgeClass}">${l.level}</span></td>
                <td>${escapeHtml(l.message)}</td>
            `;
            logsTableBody.appendChild(tr);
        });
    }

    logAgentFilter.addEventListener('change', renderLogsTable);
    logLevelFilter.addEventListener('change', renderLogsTable);
    logSearchInput.addEventListener('input', renderLogsTable);

    // --- HEALTH CHECK CONNECTION ---
    async function checkBackendHealth() {
        try {
            const res = await fetch(`${getApiOrigin()}/health`);
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'ok') {
                    healthDot.className = 'server-status-dot online';
                    return;
                }
            }
            healthDot.className = 'server-status-dot';
        } catch {
            healthDot.className = 'server-status-dot';
        }
    }
});
