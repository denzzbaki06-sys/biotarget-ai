# BioTarget AI

**Computational Nanomedicine Research Platform**

BioTarget AI brings nanoparticle formulation design, computational simulation, virtual screening, design of experiments (DOE), sensitivity analysis, model validation, uncertainty analysis and scientific reporting into one browser-based research workflow. Built with React and TypeScript, it demonstrates simulation-driven analysis and experiment management using a deterministic computational model.

**[LIVE DEMO](https://denzzbaki06-sys.github.io/biotarget-ai/)** · **[SOURCE CODE](https://github.com/denzzbaki06-sys/biotarget-ai)**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
[![GitHub Pages deployment](https://github.com/denzzbaki06-sys/biotarget-ai/actions/workflows/deploy.yml/badge.svg)](https://github.com/denzzbaki06-sys/biotarget-ai/actions/workflows/deploy.yml)

> **Research and educational simulation only.** The platform does not provide validated biological predictions or clinical decision support. Despite the project name, the current implementation does not use an LLM or a trained machine learning model.

## Overview

Users configure nanoparticle formulation parameters, inspect computational prediction metrics and compare candidate formulations under the application's model. Screening, experiment planning and simulation-based analysis share a common interface with saved experiments, research studies and reporting.

The research workflow connects **formulation design → screening → experimental design → analysis → validation → reporting**. Here, validation refers to internal model behavior and local stability; it does not replace wet-lab experiments or clinical validation.

## Live Demo

[Open BioTarget AI in your browser](https://denzzbaki06-sys.github.io/biotarget-ai/). No local installation is required. Saved experiments and studies are stored in the browser used to access the application.

## Computational Research Workflow

```text
01 DESIGN — LAB          Configure formulation parameters.
        ↓
02 DISCOVER — SCREEN     Screen and rank virtual candidates.
        ↓
03 SAMPLE — DOE          Generate a systematic computational experiment plan.
        ↓
04 INTERPRET — ANALYZE   Compare outputs and explore parameter relationships.
        ↓
05 VERIFY — VALIDATE     Inspect model stability and computational uncertainty.
        ↓
06 DOCUMENT — REPORT    Summarize studies in a structured research report.
```

## Key Features

| Module | Implemented capability |
| --- | --- |
| Formulation Simulation | Adjust particle size, zeta potential, ligand density, drug dose and target cell type; inspect simulated behavior and metrics. |
| Prediction Metrics | Calculate binding score, specificity, release efficiency and toxicity risk. |
| Computational Optimization | Evaluate parameter combinations and reload candidate formulations into the laboratory. |
| Virtual Screening | Generate and rank batches of 25, 50, 100 or 200 formulation candidates. |
| Design of Experiments | Generate stratified computational plans with 8, 12, 16, 24 or 32 conditions; reload conditions or save them to history. |
| Sensitivity Analysis | Sweep individual parameters while holding others fixed and compare their influence on model outputs. |
| Response Surface Analysis | Explore two-parameter interactions using an 11 × 11 grid of 121 simulated conditions. |
| Model Validation | Inspect local output stability, parameter-range coverage, boundary proximity and heuristic computational confidence. |
| Uncertainty Analysis | Evaluate 300 perturbed formulations and summarize means, standard deviations, extrema, P05, median and P95. |
| Pareto Optimization | Compare non-dominated formulations across selected binding, specificity, release and toxicity objectives. |
| Experiment Management | Save, rename, favorite, search, delete and reload experiments. |
| A/B Comparison | Compare the parameters and outputs of two saved formulations. |
| Study Manager | Organize objectives, hypotheses, target profiles, study status and associated experiments. |
| Research Dashboard | Review experiment counts, favorites, aggregate output metrics and ranked formulations. |
| Research Insights | Explore Pearson correlations between formulation parameters and simulated outputs. |
| Dataset Explorer | Search, filter, sort and inspect saved experiment records. |
| Scientific Report Generator | Create structured computational study reports from saved data. |
| Research Workspace | Review stored experiments, target coverage, favorites and candidate rankings in a research overview. |

Screening uses a weighted comparison score: **30% binding + 30% specificity + 25% release + 15% inverse toxicity risk**. Correlations, rankings, confidence scores and uncertainty intervals describe the computational dataset and model; they are not evidence of biological efficacy or causation.

## Simulation Parameters

The laboratory exposes four numeric inputs and one categorical target profile:

| Parameter | Unit | Laboratory range or options |
| --- | --- | --- |
| Particle Size | nm | 20–200 |
| Zeta Potential | mV | −50 to +50 |
| Ligand Density | % | 10–100 |
| Drug Dose | mg/mL | 0.1–3.0 |
| Target Cell Type | Categorical | EGFR-positive lung cancer, HER2-positive breast cancer, PD-L1 immuno-oncology, healthy control |

These are simulation inputs, not experimentally established operating ranges or dosing recommendations.

## Simulation Outputs

| Output | Meaning within the model |
| --- | --- |
| Binding Score | Relative modeled binding score based on formulation parameters and a target-profile factor. |
| Specificity | Rule-based selectivity score influenced by ligand density, particle size, target profile and charge. |
| Release Efficiency | Simulated release score influenced by dose, particle size and ligand density. |
| Toxicity Risk | Computational risk index based on charge, dose and particle-size penalties. |

The engine clamps these four outputs to **0–100** and rounds them to integers. It also assigns a low, medium or high toxicity label. Percentage-style displays are model scores, not measured biological percentages or calibrated probabilities.

## Architecture

```text
React user interface
        ↓
Typed simulation parameters
        ↓
Deterministic prediction engine
        ↓
Computational metrics
        ↓
Screening / DOE / sensitivity / response surface / validation / uncertainty
        ↓
Experiment and study management ↔ Browser localStorage
        ↓
Research dashboards / comparisons / scientific reporting / CSV and JSON export
```

`App.tsx` coordinates shared formulation, experiment and study state. Components implement the research interfaces; `src/engine/` contains prediction and optimization logic, and `src/types/` defines shared simulation types. Computation and persistence run in the browser; the project does not require a backend service or hosted database.

## Prediction Engine

The current prediction engine is a deterministic computational model designed for research workflow simulation and software demonstration.

[`src/engine/predictionEngine.ts`](src/engine/predictionEngine.ts) applies fixed coefficients, target-profile factors, parameter penalties, clamping and rounding. The same input parameters produce the same metrics. No model training, LLM inference or external prediction API is involved. The in-app assistant also uses predefined conditional rules.

The engine is a software model, not a validated pharmacological or biological predictor. Uncertainty analysis perturbs its inputs to explore output variation; it does not establish clinical confidence intervals.

## Experiment Management

Experiments and studies persist through browser `localStorage`. Experiment records retain names, timestamps, target profiles, formulation parameters, metrics and favorite status.

- Save, rename, search, favorite or delete experiment records.
- Reload a formulation into the laboratory and compare two saved experiments.
- Associate experiments with studies containing objectives, hypotheses and progress status.
- Export experiment datasets for external inspection.

Storage is specific to the browser and site origin. It does not provide account-based synchronization; clearing site data removes locally stored records.

## Data Export & Reporting

| Format or interface | Included data and behavior |
| --- | --- |
| CSV | Experiment names, dates, target profiles, formulation parameters and output metrics. |
| JSON | Active formulation, active metrics, experiment records, studies and report metadata. |
| Scientific report | Structured study summaries including an abstract, objectives, methods, results, computational interpretation and conclusions, with research limitations. Reports support clipboard copying and browser printing. |

Scientific reports summarize simulated records; they are not peer-reviewed findings or experimental evidence.

## Tech Stack

| Area | Implementation |
| --- | --- |
| Frontend | React 19, React DOM, TypeScript 6 |
| Build tooling | Vite 8 with the React plugin; npm |
| Styling and visualization | CSS, native Canvas 2D simulation, DOM/CSS charts and heatmaps, inline SVG icons |
| State and persistence | React hooks and browser `localStorage` |
| Code quality tooling | ESLint with TypeScript and React plugins |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages |

## Running Locally

Use **Node.js 24** to match the deployment workflow, with npm available.

```bash
git clone https://github.com/denzzbaki06-sys/biotarget-ai.git
cd biotarget-ai
npm install
npm run dev
```

Open the local URL printed by Vite. The project uses the `/biotarget-ai/` base path.

Build and preview the production output:

```bash
npm run build
npm run preview
```

The build runs TypeScript checks followed by Vite bundling and writes output to `dist/`. CI uses `npm ci` to install the committed lockfile's dependencies.

## Project Structure

Selected files and modules:

```text
.github/workflows/deploy.yml       # GitHub Pages build and deployment
src/
├── components/
│   ├── ControlPanel.tsx
│   ├── SimulationCanvas.tsx
│   ├── MetricsPanel.tsx
│   ├── AIAssistant.tsx
│   ├── OptimizationPanel.tsx
│   ├── VirtualScreening.tsx
│   ├── ExperimentDesign.tsx
│   ├── SensitivityAnalysis.tsx
│   ├── ResponseSurface.tsx
│   ├── ModelValidation.tsx
│   ├── UncertaintyAnalysis.tsx
│   ├── ParetoOptimization.tsx
│   ├── ExperimentHistory.tsx
│   ├── ExperimentComparison.tsx
│   ├── StudyManager.tsx
│   ├── ResearchDashboard.tsx
│   ├── ResearchInsights.tsx
│   ├── DatasetExplorer.tsx
│   ├── ResearchWorkspace.tsx
│   ├── AdvancedResearchSuite.tsx
│   └── ScientificReport.tsx
├── engine/
│   ├── predictionEngine.ts
│   └── optimizationEngine.ts
├── types/
│   └── simulation.ts
├── assets/
├── App.tsx
├── App.css
├── VisualFix.css
├── index.css
└── main.tsx
public/                           # Static SVG assets
vite.config.ts                    # Vite configuration and Pages base path
```

## Deployment

[The deployment workflow](.github/workflows/deploy.yml) runs on pushes to `main` and supports manual dispatch. It sets up Node.js 24, runs `npm ci` and `npm run build`, uploads `dist/` as a Pages artifact and deploys it using the official GitHub Pages actions.

Vite's base path is `/biotarget-ai/`, so production assets resolve under the repository's Pages URL:

**[https://denzzbaki06-sys.github.io/biotarget-ai/](https://denzzbaki06-sys.github.io/biotarget-ai/)**

## Scientific Disclaimer

BioTarget AI is a computational research and educational simulation platform.

It does not provide:

- Clinical diagnosis.
- Treatment recommendations.
- Validated biological predictions.
- Medical decision support.

Simulation outputs are computational estimates generated by the application's current deterministic model and should not be interpreted as experimental or clinical evidence. Real nanomedicine research requires independent experimental validation and appropriate scientific and regulatory review.

## Project Purpose

The project demonstrates modular React interfaces, typed simulation models, a deterministic engine, scientific workflow design, shared state management, custom data visualization, experiment persistence, responsive layouts and automated CI/CD deployment.

Its focus is software engineering for computational research workflows. The “AI” name does not imply that the current implementation contains a trained machine learning model or an LLM.

## Screenshots

Screenshots of the laboratory, research workflow, screening, validation and analytics interfaces can be added here.
