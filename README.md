# ALWUMS — Autonomous Legacy Web Application Upgrade using Multi-Agent System

ALWUMS is a premium, enterprise-grade codebase modernization platform designed to migrate legacy software systems (such as Classic ASP/VBScript or PHP) into modern, secure web architectures (such as ASP.NET Core Razor Pages, Python Flask, or Node.js Express). 

Driven by a highly collaborative multi-agent execution pipeline powered by the **Google Gemini API**, ALWUMS automatically scans, analyzes, plans, refactors, tests, and validates legacy code directories, outputting fully modernized codebases with clean separation of concerns and modern security practices.

---

## 🌟 Key Features

* **🌓 Premium Dual-Theme System**: Clean, premium dashboard supporting dynamic Light and Dark mode switching, styled with Royal Indigo accents and modern glassmorphic panels.
* **📦 Wizard-Driven Uploads**: 3-step directory migration configurator featuring folder scanning, automated zipping, target tech configuration, and custom modernization directives.
* **🤖 Multi-Agent Pipeline Status**: Live status tracking maps the execution of the sequential agent nodes (Analyzer $\rightarrow$ Planner $\rightarrow$ Generator $\rightarrow$ Tester $\rightarrow$ Verifier $\rightarrow$ Finalizer) with real-time progress bars, timers, and scrolling terminal consoles.
* **📊 Live Reports Analytics**: Dynamically generated report dashboards featuring:
  * **Overview**: Total files, legacy counters, and Complexity Score metrics.
  * **Structure**: Interactive file tree structures of scanned projects.
  * **Dependencies**: Automated dependency analysis parsing server-side includes and imports.
  * **Anti-Patterns**: Identified security or layout flaws (e.g. mixed layout, direct SQL connections).
  * **Summary**: AI-generated text roadmap detailing the upgrade changes.
* **🔍 Synchronized Code Diff Viewer**: Side-by-side scroll panels showing the original legacy source (red line removals) vs modernized output (green line additions).
* **⚡ Unified Single-Port Architecture**: Built as a self-contained service; the Flask backend hosts both the static frontend assets and the upgrade API endpoints on a single port for simple, production-ready cloud deployments.

---

## 🛠️ Tools & Technologies

* **Core Engine**: **Agentic AI** Multi-Agent Orchestration (utilising collaborative agents for analysis, refactoring, and self-test validations).
* **LLM Model**: Google Gemini API (`gemini-2.5-flash`).
* **Backend & API**: Python, Flask, Requests, python-dotenv.
* **Frontend Panels**: HTML5, Vanilla CSS3 (CSS Variable Theme Matrix), Vanilla JavaScript (JSZip client zipping, AJAX).

### 🔄 Supported Migration Targets
The Agentic AI pipeline is capable of refactoring legacy codebases to:
* **Frontend frameworks**: **React.js**, Angular, or raw modern HTML5 templates.
* **Backend frameworks**: Node.js Express, Python Flask, C# ASP.NET Core Razor Pages.
* **Databases**: **MongoDB** (NoSQL documents migration), PostgreSQL, or SQL Server.

### 🗄️ Architectural Design Decisions
* **No Database Server Required**: The control panel uses a file-system JSON cache database (`llm_cache.json`) for tracking LLM queries, keeping the system lightweight. Setting up MongoDB or SQL Server is NOT required to run the orchestrator tool itself.
* **No Frontend Compilation Node Bloat**: The dashboard panel is written in native Vanilla JS and CSS variables (rather than React.js) to avoid heavy `node_modules` dependency installations and webpack compile steps, achieving instant browser load-times out-of-the-box.

---

## 📋 Prerequisites

* **Python 3.8+** installed on your system.
* A **Google Gemini API Key** (free or paid tier).

---

## ⚙️ Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Athiya-Farhanaz/alwums-modernizer-core.git
   cd alwums-modernizer-core
   ```

2. **Install Dependencies**:
   Install the required libraries from the requirements file:
   ```bash
   pip install -r alwums/requirements.txt
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory of the project (e.g. `Alwums-Legacy-Web-application-upgrade-/.env`) and add your Gemini API Key:
   ```env
   # Gemini API Credentials
   GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY
   ```
   *(Refer to `.env.example` for details).*

---

## 🚀 Running the Application

1. **Start the Unified Server**:
   Run the backend orchestrator:
   ```bash
   python alwums/universal_upgrader.py
   ```

2. **Access in Browser**:
   Open your browser and navigate to:
   ```
   http://localhost:5000
   ```
   *The dashboard will load immediately, verify connection state (green dot in top-right), and is ready for drag-and-drop upgrades!*

---

## 🤖 The Multi-Agent Pipeline Workflow

When you submit a project, the orchestrator triggers a structured pipeline of specialised LLM agents:

1. **Analyzer Agent**: Scans files, detects technologies, counts lines of code, and identifies include file dependency structures.
2. **Planner Agent**: Synthesizes a refactoring checklist, highlighting deprecations and security risks.
3. **Generator Agent**: Refactors Classic ASP blocks into modern C# Razor, Python Flask, or Node.js equivalents.
4. **Tester Agent**: Conducts syntax validity checks and basic testing on the generated code.
5. **Verifier Agent**: Checks styling extractions, output encoding, and ensures zero content truncation.
6. **Finalizer Agent**: Packages the modernized assets into a clean folder structure alongside an HTML migration report.

---

## 🌐 Production Deployment

The codebase is built for MAANG-level robustness and is deployment-ready:
* **Relative API Routing**: The frontend automatically resolves API calls relatively if served from the same server, allowing seamless deployment on cloud services like **Render**, **GCP**, **AWS**, or **Heroku**.
* **Zero Configuration**: The frontend checks the active host port and gracefully handles fallback routes internally.
