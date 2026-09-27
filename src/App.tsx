import {
    useEffect,
    useMemo,
    useState,
} from "react";

import "./App.css";
import "./VisualFix.css";

import ControlPanel from "./components/ControlPanel";
import SimulationCanvas from "./components/SimulationCanvas";
import MetricsPanel from "./components/MetricsPanel";
import AIAssistant from "./components/AIAssistant";
import PresetScenarios from "./components/PresetScenarios";
import ScientificCharts from "./components/ScientificCharts";
import ExperimentComparison from "./components/ExperimentComparison";
import OptimizationPanel from "./components/OptimizationPanel";
import ExperimentHistory from "./components/ExperimentHistory";
import ResearchDashboard from "./components/ResearchDashboard";
import ResearchInsights from "./components/ResearchInsights";
import DatasetExplorer from "./components/DatasetExplorer";
import ParetoOptimization from "./components/ParetoOptimization";
import VirtualScreening from "./components/VirtualScreening";
import SensitivityAnalysis from "./components/SensitivityAnalysis";
import ExperimentDesign from "./components/ExperimentDesign";
import StudyManager from "./components/StudyManager";
import ScientificReport from "./components/ScientificReport";
import AdvancedResearchSuite from "./components/AdvancedResearchSuite";

import type {
    ExperimentRecord,
} from "./components/ExperimentHistory";

import type {
    ResearchStudy,
} from "./components/StudyManager";

import type {
    SimulationParameters,
} from "./types/simulation";

import {
    calculateMetrics,
} from "./engine/predictionEngine";

const defaultParameters: SimulationParameters = {
    cellType: "Akciğer Kanseri (EGFR+)",
    particleSize: 80,
    zetaPotential: -15,
    ligandDensity: 70,
    drugDose: 0.5,
};

const EXPERIMENT_STORAGE =
    "biotarget-experiments";

const STUDY_STORAGE =
    "biotarget-research-studies";

function App() {
    const [
        saveNotice,
        setSaveNotice,
    ] = useState(false);

    const [
        parameters,
        setParameters,
    ] =
        useState<SimulationParameters>(
            defaultParameters
        );

    const [
        simulationRun,
        setSimulationRun,
    ] = useState(0);

    const [
        experiments,
        setExperiments,
    ] =
        useState<
            ExperimentRecord[]
        >(() => {
            try {
                const saved =
                    localStorage.getItem(
                        EXPERIMENT_STORAGE
                    );

                return saved
                    ? JSON.parse(saved)
                    : [];
            } catch {
                return [];
            }
        });

    const [
        studies,
        setStudies,
    ] =
        useState<
            ResearchStudy[]
        >(() => {
            try {
                const saved =
                    localStorage.getItem(
                        STUDY_STORAGE
                    );

                return saved
                    ? JSON.parse(saved)
                    : [];
            } catch {
                return [];
            }
        });

    const metrics =
        useMemo(
            () =>
                calculateMetrics(
                    parameters
                ),
            [parameters]
        );

    useEffect(() => {
        localStorage.setItem(
            EXPERIMENT_STORAGE,
            JSON.stringify(
                experiments
            )
        );
    }, [experiments]);

    useEffect(() => {
        localStorage.setItem(
            STUDY_STORAGE,
            JSON.stringify(
                studies
            )
        );
    }, [studies]);

    const scrollTo = (
        id: string
    ) => {
        document
            .getElementById(id)
            ?.scrollIntoView({
                behavior:
                    "smooth",
                block:
                    "start",
            });
    };

    const startSimulation =
        () => {
            setSimulationRun(
                (
                    previous
                ) =>
                    previous + 1
            );

            window.setTimeout(
                () =>
                    scrollTo(
                        "simulation"
                    ),
                50
            );
        };

    const showSaveNotice =
        () => {
            setSaveNotice(
                true
            );

            window.setTimeout(
                () =>
                    setSaveNotice(
                        false
                    ),
                2600
            );
        };

    const saveExperiment =
        () => {
            const record:
                ExperimentRecord =
                {
                    id:
                        `${Date.now()}-${Math.random()}`,

                    createdAt:
                        new Date()
                            .toLocaleString(
                                "tr-TR"
                            ),

                    parameters: {
                        ...parameters,
                    },

                    metrics: {
                        ...metrics,
                    },

                    name:
                        `Deney ${
                            experiments.length +
                            1
                        }`,

                    favorite:
                        false,
                };

            setExperiments(
                (
                    previous
                ) => [
                    record,
                    ...previous,
                ]
            );

            showSaveNotice();

            window.setTimeout(
                () =>
                    scrollTo(
                        "history"
                    ),
                120
            );
        };

    const saveExperimentPlan =
        (
            plan:
            SimulationParameters[]
        ) => {
            if (
                plan.length ===
                0
            ) {
                return;
            }

            const timestamp =
                Date.now();

            const records:
                ExperimentRecord[] =
                plan.map(
                    (
                        experimentParameters,
                        index
                    ) => ({
                        id:
                            `doe-${timestamp}-${index}-${Math.random()}`,

                        createdAt:
                            new Date()
                                .toLocaleString(
                                    "tr-TR"
                                ),

                        parameters: {
                            ...experimentParameters,
                        },

                        metrics:
                            calculateMetrics(
                                experimentParameters
                            ),

                        name:
                            `DOE Run ${
                                index + 1
                            }`,

                        favorite:
                            false,
                    })
                );

            setExperiments(
                (
                    previous
                ) => [
                    ...records,
                    ...previous,
                ]
            );

            showSaveNotice();
        };

    const clearExperiments =
        () => {
            setExperiments(
                []
            );

            setStudies(
                (previous) =>
                    previous.map(
                        (study) => ({
                            ...study,
                            experimentIds:
                                [],
                        })
                    )
            );
        };

    const deleteExperiment =
        (
            id: string
        ) => {
            setExperiments(
                (
                    previous
                ) =>
                    previous.filter(
                        (
                            experiment
                        ) =>
                            experiment.id !==
                            id
                    )
            );

            setStudies(
                (
                    previous
                ) =>
                    previous.map(
                        (study) => ({
                            ...study,

                            experimentIds:
                                study.experimentIds.filter(
                                    (
                                        experimentId
                                    ) =>
                                        experimentId !==
                                        id
                                ),
                        })
                    )
            );
        };

    const toggleExperimentFavorite =
        (
            id: string
        ) => {
            setExperiments(
                (
                    previous
                ) =>
                    previous.map(
                        (
                            experiment
                        ) =>
                            experiment.id ===
                            id
                                ? {
                                    ...experiment,

                                    favorite:
                                        !experiment.favorite,
                                }
                                : experiment
                    )
            );
        };

    const renameExperiment =
        (
            id: string,
            name: string
        ) => {
            setExperiments(
                (
                    previous
                ) =>
                    previous.map(
                        (
                            experiment
                        ) =>
                            experiment.id ===
                            id
                                ? {
                                    ...experiment,
                                    name,
                                }
                                : experiment
                    )
            );
        };

    const loadExperiment =
        (
            loadedParameters:
            SimulationParameters
        ) => {
            setParameters({
                ...loadedParameters,
            });

            window.setTimeout(
                () =>
                    scrollTo(
                        "laboratory"
                    ),
                50
            );
        };

    const downloadExperimentsCSV =
        () => {
            if (
                experiments.length ===
                0
            ) {
                window.alert(
                    "CSV oluşturmak için önce en az bir deney kaydetmelisin."
                );

                return;
            }

            const headers = [
                "Deney Adı",
                "Tarih",
                "Favori",
                "Hedef Hücre",
                "Partikül Boyutu (nm)",
                "Zeta Potansiyeli (mV)",
                "Ligand Yoğunluğu (%)",
                "İlaç Dozu (mg/mL)",
                "Bağlanma Skoru",
                "Özgüllük (%)",
                "Salınım Verimliliği (%)",
                "Toksisite Riski",
            ];

            const escapeCSV =
                (
                    value:
                        | string
                        | number
                        | boolean
                ) => {
                    const text =
                        String(
                            value
                        );

                    return `"${text.replace(
                        /"/g,
                        '""'
                    )}"`;
                };

            const rows =
                experiments.map(
                    (
                        experiment,
                        index
                    ) => [
                        experiment.name ||
                        `Deney ${
                            index + 1
                        }`,

                        experiment.createdAt,

                        experiment.favorite
                            ? "Evet"
                            : "Hayır",

                        experiment
                            .parameters
                            .cellType,

                        experiment
                            .parameters
                            .particleSize,

                        experiment
                            .parameters
                            .zetaPotential,

                        experiment
                            .parameters
                            .ligandDensity,

                        experiment
                            .parameters
                            .drugDose,

                        experiment
                            .metrics
                            .bindingScore,

                        experiment
                            .metrics
                            .specificity,

                        experiment
                            .metrics
                            .releaseEfficiency,

                        experiment
                            .metrics
                            .toxicityRisk,
                    ]
                );

            const csv =
                [
                    headers,
                    ...rows,
                ]
                    .map(
                        (row) =>
                            row
                                .map(
                                    escapeCSV
                                )
                                .join(",")
                    )
                    .join("\n");

            const blob =
                new Blob(
                    [
                        "\uFEFF" +
                        csv,
                    ],
                    {
                        type:
                            "text/csv;charset=utf-8;",
                    }
                );

            const url =
                URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement(
                    "a"
                );

            link.href =
                url;

            link.download =
                "biotarget-experiments.csv";

            document.body
                .appendChild(
                    link
                );

            link.click();

            document.body
                .removeChild(
                    link
                );

            URL.revokeObjectURL(
                url
            );
        };

    const downloadJSONReport =
        () => {
            const report = {
                project:
                    "BioTarget AI",

                version:
                    "10.0",

                generatedAt:
                    new Date()
                        .toISOString(),

                activeFormulation:
                parameters,

                activeMetrics:
                metrics,

                experiments,

                studies,

                notice:
                    "Educational computational simulation. Not clinical evidence or treatment guidance.",
            };

            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            report,
                            null,
                            2
                        ),
                    ],
                    {
                        type:
                            "application/json",
                    }
                );

            const url =
                URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement(
                    "a"
                );

            link.href =
                url;

            link.download =
                "biotarget-ai-research-data.json";

            document.body
                .appendChild(
                    link
                );

            link.click();

            document.body
                .removeChild(
                    link
                );

            URL.revokeObjectURL(
                url
            );
        };

    return (
        <div className="app">
            {saveNotice && (
                <div
                    className="save-toast"
                    role="status"
                >
              <span className="save-toast-icon">
                ✓
              </span>

                    <div>
                        <strong>
                            Deney kaydedildi
                        </strong>

                        <small>
                            Araştırma
                            verilerine
                            eklendi.
                        </small>
                    </div>
                </div>
            )}

            <header className="navbar">
                <div className="navbar-inner">
                    <button
                        className="brand"
                        onClick={() =>
                            window.scrollTo({
                                top: 0,
                                behavior:
                                    "smooth",
                            })
                        }
                    >
                        <div className="brand-icon">
                            <span className="brand-core" />
                        </div>

                        <div className="brand-copy">
                            <strong>
                                BioTarget{" "}
                                <span>
                    AI
                  </span>
                            </strong>

                            <small>
                                Intelligent
                                Nanomedicine
                                Research Platform
                            </small>
                        </div>
                    </button>

                    <nav className="desktop-nav">
                        <button
                            onClick={() =>
                                scrollTo(
                                    "laboratory"
                                )
                            }
                        >
                            Lab
                        </button>

                        <button
                            onClick={() =>
                                scrollTo(
                                    "simulation"
                                )
                            }
                        >
                            Simülasyon
                        </button>

                        <button
                            onClick={() =>
                                scrollTo(
                                    "optimization"
                                )
                            }
                        >
                            Optimize
                        </button>

                        <button
                            onClick={() =>
                                scrollTo(
                                    "screening"
                                )
                            }
                        >
                            Screening
                        </button>

                        <button
                            onClick={() =>
                                scrollTo(
                                    "doe"
                                )
                            }
                        >
                            DOE
                        </button>

                        <button
                            onClick={() =>
                                scrollTo(
                                    "sensitivity"
                                )
                            }
                        >
                            Sensitivity
                        </button>

                        <button
                            onClick={() =>
                                scrollTo(
                                    "research-suite"
                                )
                            }
                        >
                            Research Suite
                        </button>

                        <button
                            onClick={() =>
                                scrollTo(
                                    "studies"
                                )
                            }
                        >
                            Studies
                        </button>

                        <button
                            onClick={() =>
                                scrollTo(
                                    "scientific-report"
                                )
                            }
                        >
                            Report
                        </button>

                        <button
                            onClick={() =>
                                scrollTo(
                                    "analytics"
                                )
                            }
                        >
                            Analytics
                        </button>

                        <button
                            onClick={() =>
                                scrollTo(
                                    "dataset"
                                )
                            }
                        >
                            Dataset
                        </button>
                    </nav>

                    <button
                        className="share-button"
                        onClick={
                            saveExperiment
                        }
                    >
                        Deneyi Kaydet
                    </button>
                </div>
            </header>
            <main>
                <section className="hero">
                    <div className="hero-grid" />
                    <div className="hero-glow hero-glow-one" />
                    <div className="hero-glow hero-glow-two" />

                    <div className="hero-content">
                        <div className="hero-left">
                            <div className="hero-badge">
                                <span className="badge-dot" />

                                AI DESTEKLİ
                                NANOTIP ARAŞTIRMA
                                PLATFORMU
                            </div>

                            <h1>
                                Yapay Zeka ile

                                <span>
                    Daha Hedefli
                    Sistemler
                  </span>
                            </h1>

                            <p className="hero-description">
                                Nanopartikül
                                formülasyonlarını
                                tasarlayın,
                                simüle edin,
                                sistematik deney
                                planları oluşturun
                                ve araştırma
                                çalışmalarınızı
                                tek platformda
                                yönetin.
                            </p>

                            <div className="hero-features">
                                <div className="feature-pill">
                                    ◉ Simulation
                                </div>

                                <div className="feature-pill">
                                    ✦ Virtual
                                    Screening
                                </div>

                                <div className="feature-pill">
                                    ◈ DOE
                                </div>

                                <div className="feature-pill">
                                    ▤ Scientific
                                    Reports
                                </div>
                            </div>

                            <div className="hero-actions">
                                <button
                                    className="primary-button"
                                    onClick={
                                        startSimulation
                                    }
                                >
                                    ▶ Simülasyonu
                                    Başlat
                                </button>

                                <button
                                    className="secondary-button"
                                    onClick={() =>
                                        scrollTo(
                                            "research-suite"
                                        )
                                    }
                                >
                                    ⌬ Research
                                    Suite
                                </button>
                            </div>

                            <div className="hero-status">
                                <span className="status-dot" />

                                Simulation Engine
                                Online

                                <span>
                    •
                  </span>

                                Research Engine
                                Active
                            </div>
                        </div>

                        <div className="hero-visual">
                            <div className="visual-orbit orbit-one" />
                            <div className="visual-orbit orbit-two" />
                            <div className="visual-orbit orbit-three" />

                            <div className="nano-particle">
                                <div className="nano-glow" />

                                <div className="nano-inner">
                                    <div className="nano-core" />

                                    <div className="drug-dot drug-dot-1" />
                                    <div className="drug-dot drug-dot-2" />
                                    <div className="drug-dot drug-dot-3" />
                                    <div className="drug-dot drug-dot-4" />
                                    <div className="drug-dot drug-dot-5" />
                                </div>

                                <div className="ligand ligand-1" />
                                <div className="ligand ligand-2" />
                                <div className="ligand ligand-3" />
                                <div className="ligand ligand-4" />
                                <div className="ligand ligand-5" />
                            </div>

                            <div className="visual-card visual-card-left">
                  <span>
                    Taşıyıcı
                  </span>

                                <strong>
                                    Lipid
                                    Nanopartikül
                                </strong>
                            </div>

                            <div className="visual-card visual-card-right">
                  <span>
                    Ligand
                  </span>

                                <strong>
                                    %
                                    {
                                        parameters.ligandDensity
                                    }
                                </strong>
                            </div>

                            <div className="visual-card visual-card-bottom">
                  <span>
                    Aktif Hedef
                  </span>

                                <strong>
                                    {
                                        parameters.cellType
                                    }
                                </strong>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    className="section"
                    id="laboratory"
                >
                    <div className="section-heading">
              <span className="section-kicker">
                BIOTARGET AI LAB
              </span>

                        <h2>
                            Akıllı

                            <span>
                  Formülasyon
                  Laboratuvarı
                </span>
                        </h2>
                    </div>

                    <PresetScenarios
                        setParameters={
                            setParameters
                        }
                    />

                    <div className="lab-layout v3-lab-layout">
                        <ControlPanel
                            parameters={
                                parameters
                            }
                            setParameters={
                                setParameters
                            }
                        />

                        <MetricsPanel
                            metrics={
                                metrics
                            }
                        />
                    </div>

                    <div className="laboratory-actions">
                        <button
                            className="primary-button"
                            onClick={
                                startSimulation
                            }
                        >
                            ▶ Simüle Et
                        </button>

                        <button
                            className="secondary-button"
                            onClick={
                                saveExperiment
                            }
                        >
                            ＋ Deneyi Kaydet
                        </button>
                    </div>
                </section>

                <section
                    className="section"
                    id="simulation"
                >
                    <div className="section-heading">
              <span className="section-kicker">
                MOLECULAR
                SIMULATION
              </span>

                        <h2>
                            Nanopartikül

                            <span>
                  Hücre Etkileşimi
                </span>
                        </h2>
                    </div>

                    <SimulationCanvas
                        parameters={
                            parameters
                        }
                        simulationRun={
                            simulationRun
                        }
                    />
                </section>

                <section
                    className="section"
                    id="optimization"
                >
                    <div className="section-heading">
              <span className="section-kicker">
                COMPUTATIONAL
                SEARCH
              </span>

                        <h2>
                            AI

                            <span>
                  Optimizasyon
                  Motoru
                </span>
                        </h2>
                    </div>

                    <OptimizationPanel
                        parameters={
                            parameters
                        }
                        setParameters={
                            setParameters
                        }
                        startSimulation={
                            startSimulation
                        }
                    />
                </section>

                <section
                    className="section"
                    id="screening"
                >
                    <div className="section-heading">
              <span className="section-kicker">
                VIRTUAL SCREENING
              </span>

                        <h2>
                            Batch

                            <span>
                  Experiment Runner
                </span>
                        </h2>
                    </div>

                    <VirtualScreening
                        currentParameters={
                            parameters
                        }
                        onLoad={
                            loadExperiment
                        }
                    />
                </section>

                <section
                    className="section"
                    id="doe"
                >
                    <div className="section-heading">
              <span className="section-kicker">
                EXPERIMENT DESIGN
              </span>

                        <h2>
                            Design of

                            <span>
                  Experiments
                </span>
                        </h2>
                    </div>

                    <ExperimentDesign
                        parameters={
                            parameters
                        }
                        onLoad={
                            loadExperiment
                        }
                        onSavePlan={
                            saveExperimentPlan
                        }
                    />
                </section>

                <section
                    className="section"
                    id="sensitivity"
                >
                    <div className="section-heading">
              <span className="section-kicker">
                MODEL
                INTERPRETABILITY
              </span>

                        <h2>
                            Sensitivity

                            <span>
                  Analysis
                </span>
                        </h2>

                        <p>
                            Formülasyon
                            parametrelerinin
                            hesaplanan model
                            çıktıları üzerindeki
                            etkisini inceleyin.
                        </p>
                    </div>

                    <SensitivityAnalysis
                        parameters={
                            parameters
                        }
                        onLoad={
                            loadExperiment
                        }
                    />
                </section>

                <section
                    className="section"
                    id="research-suite"
                >
                    <div className="section-heading">
              <span className="section-kicker">
                ADVANCED
                COMPUTATIONAL
                RESEARCH
              </span>

                        <h2>
                            Advanced

                            <span>
                  Research Suite
                </span>
                        </h2>

                        <p>
                            Response Surface,
                            Model Validation,
                            Uncertainty Analysis
                            ve Research Workspace
                            modüllerini tek
                            gelişmiş hesaplamalı
                            araştırma merkezinde
                            kullanın.
                        </p>
                    </div>

                    <AdvancedResearchSuite
                        parameters={
                            parameters
                        }
                        experiments={
                            experiments
                        }
                        onLoad={
                            loadExperiment
                        }
                    />
                </section>

                <section
                    className="section"
                    id="studies"
                >
                    <div className="section-heading">
              <span className="section-kicker">
                RESEARCH
                WORKSPACE
              </span>

                        <h2>
                            Study

                            <span>
                  Manager
                </span>
                        </h2>

                        <p>
                            Hipotezlerinizi,
                            araştırma
                            amaçlarınızı ve
                            simülasyon
                            deneylerinizi tek
                            bilimsel çalışma
                            altında yönetin.
                        </p>
                    </div>

                    <StudyManager
                        experiments={
                            experiments
                        }
                        parameters={
                            parameters
                        }
                        studies={
                            studies
                        }
                        setStudies={
                            setStudies
                        }
                        onLoad={
                            loadExperiment
                        }
                    />
                </section>

                <section
                    className="section"
                    id="scientific-report"
                >
                    <div className="section-heading">
              <span className="section-kicker">
                SCIENTIFIC
                DOCUMENTATION
              </span>

                        <h2>
                            Scientific

                            <span>
                  Report Generator
                </span>
                        </h2>

                        <p>
                            Araştırma
                            projenizdeki
                            simülasyon
                            deneylerinden
                            yapılandırılmış
                            bilimsel rapor
                            oluşturun.
                        </p>
                    </div>

                    <ScientificReport
                        studies={
                            studies
                        }
                        experiments={
                            experiments
                        }
                    />
                </section>
                <section
                    className="section"
                    id="analytics"
                >
                    <div className="section-heading">
              <span className="section-kicker">
                RESEARCH
                ANALYTICS
              </span>

                        <h2>
                            Bilimsel

                            <span>
                  Analiz
                </span>
                        </h2>

                        <p>
                            Kayıtlı
                            simülasyonlardan
                            üretilen araştırma
                            istatistiklerini,
                            ilişkileri ve deney
                            karşılaştırmalarını
                            inceleyin.
                        </p>
                    </div>

                    <ResearchDashboard
                        experiments={
                            experiments
                        }
                    />

                    <div className="section-gap" />

                    <ResearchInsights
                        experiments={
                            experiments
                        }
                    />

                    <div className="section-gap" />

                    <ScientificCharts
                        parameters={
                            parameters
                        }
                        metrics={
                            metrics
                        }
                    />

                    <div className="section-gap">
                        <ExperimentComparison
                            experiments={
                                experiments
                            }
                        />
                    </div>
                </section>

                <section
                    className="section"
                    id="pareto"
                >
                    <div className="section-heading">
              <span className="section-kicker">
                MULTI-OBJECTIVE
                OPTIMIZATION
              </span>

                        <h2>
                            Pareto

                            <span>
                  Frontier
                </span>
                        </h2>

                        <p>
                            Binding,
                            specificity,
                            release ve
                            toxicity hedefleri
                            arasındaki
                            trade-off
                            ilişkilerini
                            inceleyin.
                        </p>
                    </div>

                    <ParetoOptimization
                        experiments={
                            experiments
                        }
                        onLoad={
                            loadExperiment
                        }
                    />
                </section>

                <section
                    className="section"
                    id="dataset"
                >
                    <div className="section-heading">
              <span className="section-kicker">
                RESEARCH DATA
              </span>

                        <h2>
                            Dataset

                            <span>
                  Explorer
                </span>
                        </h2>

                        <p>
                            Kayıtlı
                            formülasyonları
                            arayın, filtreleyin,
                            sıralayın ve
                            performans
                            metriklerine göre
                            karşılaştırın.
                        </p>
                    </div>

                    <DatasetExplorer
                        experiments={
                            experiments
                        }
                        onLoad={
                            loadExperiment
                        }
                    />
                </section>

                <section
                    className="section"
                    id="history"
                >
                    <div className="section-heading">
              <span className="section-kicker">
                EXPERIMENT STORAGE
              </span>

                        <h2>
                            Deney

                            <span>
                  Geçmişi
                </span>
                        </h2>

                        <p>
                            Kaydettiğiniz
                            deneyleri yeniden
                            yükleyin,
                            favorilere ekleyin,
                            yeniden adlandırın
                            veya araştırma
                            arşivinden kaldırın.
                        </p>
                    </div>

                    <ExperimentHistory
                        experiments={
                            experiments
                        }
                        onClear={
                            clearExperiments
                        }
                        onLoad={
                            loadExperiment
                        }
                        onDelete={
                            deleteExperiment
                        }
                        onToggleFavorite={
                            toggleExperimentFavorite
                        }
                        onRename={
                            renameExperiment
                        }
                    />
                </section>

                <section
                    className="section"
                    id="assistant"
                >
                    <div className="section-heading">
              <span className="section-kicker">
                COMPUTATIONAL
                ASSISTANT
              </span>

                        <h2>
                            BioTarget

                            <span>
                  AI Asistan
                </span>
                        </h2>

                        <p>
                            Aktif
                            formülasyonun
                            hesaplanan
                            metriklerini
                            yorumlamak için
                            araştırma
                            asistanını kullanın.
                        </p>
                    </div>

                    <AIAssistant
                        parameters={
                            parameters
                        }
                        metrics={
                            metrics
                        }
                    />
                </section>

                <section
                    className="section"
                    id="export"
                >
                    <div className="report-card">
                        <div className="report-copy">
                <span className="section-kicker">
                  DATA EXPORT
                </span>

                            <h2>
                                Araştırma

                                <span>
                    Verileri
                  </span>
                            </h2>

                            <p>
                                Aktif
                                formülasyonu,
                                deneyleri ve
                                araştırma
                                projelerini dışa
                                aktarın.
                            </p>
                        </div>

                        <div className="report-actions">
                            <button
                                className="secondary-button"
                                onClick={
                                    downloadExperimentsCSV
                                }
                            >
                                ↓ Dataset CSV
                            </button>

                            <button
                                className="primary-button"
                                onClick={
                                    downloadJSONReport
                                }
                            >
                                ↓ Research JSON
                            </button>
                        </div>
                    </div>
                </section>

                <section className="section">
                    <div className="research-flow-section">
                        <div className="section-heading">
                <span className="section-kicker">
                  BIOTARGET AI
                  WORKFLOW
                </span>

                            <h2>
                                Computational{" "}
                                <span>
                    Research Flow
                  </span>
                            </h2>

                            <p>
                                BioTarget AI
                                modülleri,
                                formülasyon
                                tasarımından
                                hesaplamalı
                                araştırma
                                raporlamasına
                                kadar birbirini
                                tamamlayan bir
                                çalışma akışı
                                oluşturur.
                            </p>
                        </div>

                        <div className="research-flow-grid">
                            <button
                                type="button"
                                onClick={() =>
                                    scrollTo(
                                        "laboratory"
                                    )
                                }
                            >
                  <span className="flow-number">
                    01
                  </span>

                                <svg className="flow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" /><circle cx="12" cy="12" r="1" /></svg>

                                <div>
                                    <small>
                                        DESIGN
                                    </small>

                                    <strong>
                                        LAB
                                    </strong>

                                    <p>
                                        Formülasyon
                                        parametrelerini
                                        oluştur.
                                    </p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    scrollTo(
                                        "screening"
                                    )
                                }
                            >
                  <span className="flow-number">
                    02
                  </span>

                                <svg className="flow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 3H3v4M17 3h4v4M3 17v4h4M21 17v4h-4" /><circle cx="11" cy="11" r="4" /><path d="m14 14 4 4" /></svg>

                                <div>
                                    <small>
                                        DISCOVER
                                    </small>

                                    <strong>
                                        SCREEN
                                    </strong>

                                    <p>
                                        Sanal aday
                                        uzayını tara.
                                    </p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    scrollTo(
                                        "doe"
                                    )
                                }
                            >
                  <span className="flow-number">
                    03
                  </span>

                                <svg className="flow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" /></svg>

                                <div>
                                    <small>
                                        SAMPLE
                                    </small>

                                    <strong>
                                        DOE
                                    </strong>

                                    <p>
                                        Sistematik
                                        deney planı
                                        oluştur.
                                    </p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    scrollTo(
                                        "analytics"
                                    )
                                }
                            >
                  <span className="flow-number">
                    04
                  </span>

                                <svg className="flow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3v18h18M7 17v-5M12 17V8M17 17V4" /></svg>

                                <div>
                                    <small>
                                        INTERPRET
                                    </small>

                                    <strong>
                                        ANALYZE
                                    </strong>

                                    <p>
                                        Deney
                                        sonuçlarını
                                        karşılaştır.
                                    </p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    scrollTo(
                                        "research-suite"
                                    )
                                }
                            >
                  <span className="flow-number">
                    05
                  </span>

                                <svg className="flow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Z" /><path d="m8 12 3 3 5-6" /></svg>

                                <div>
                                    <small>
                                        VERIFY
                                    </small>

                                    <strong>
                                        VALIDATE
                                    </strong>

                                    <p>
                                        Model
                                        davranışını ve
                                        belirsizliği
                                        incele.
                                    </p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    scrollTo(
                                        "scientific-report"
                                    )
                                }
                            >
                  <span className="flow-number">
                    06
                  </span>

                                <svg className="flow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H5v20h14V7Z M14 2v5h5M8 11h8M8 15h8M8 18h5" /></svg>

                                <div>
                                    <small>
                                        DOCUMENT
                                    </small>

                                    <strong>
                                        REPORT
                                    </strong>

                                    <p>
                                        Araştırmayı
                                        raporla.
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="section">
                    <div className="platform-summary-section">
                        <div className="platform-summary-panel">
                            <div className="platform-summary-copy">
                  <span className="section-kicker">
                    ACTIVE
                    FORMULATION
                  </span>

                                <h2>
                                    Research{" "}
                                    <span>
                      Engine Status
                    </span>
                                </h2>

                                <p>
                                    Aktif
                                    formülasyonun
                                    hesaplanan
                                    performans
                                    metriklerinin
                                    hızlı görünümü.
                                </p>
                            </div>

                            <div className="platform-summary-metrics">
                                <div>
                    <span>
                      Binding
                    </span>

                                    <strong>
                                        {metrics.bindingScore.toFixed(
                                            1
                                        )}
                                    </strong>

                                    <small>
                                        SCORE
                                    </small>
                                </div>

                                <div>
                    <span>
                      Specificity
                    </span>

                                    <strong>
                                        {metrics.specificity.toFixed(
                                            1
                                        )}
                                    </strong>

                                    <small>
                                        %
                                    </small>
                                </div>

                                <div>
                    <span>
                      Release
                    </span>

                                    <strong>
                                        {metrics.releaseEfficiency.toFixed(
                                            1
                                        )}
                                    </strong>

                                    <small>
                                        %
                                    </small>
                                </div>

                                <div>
                    <span>
                      Toxicity
                    </span>

                                    <strong>
                                        {metrics.toxicityRisk.toFixed(
                                            1
                                        )}
                                    </strong>

                                    <small>
                                        RISK
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section">
                    <div className="disclaimer-card">
                        <div className="disclaimer-icon">
                            i
                        </div>

                        <div>
                            <strong>
                                Computational
                                Research Notice
                            </strong>

                            <p>
                                BioTarget AI
                                hesaplamalı
                                araştırma ve
                                eğitim amaçlı bir
                                simülasyon
                                platformudur.
                                Üretilen
                                simülasyon
                                skorları,
                                optimizasyon
                                sonuçları,
                                response surface
                                analizleri,
                                validation
                                göstergeleri ve
                                uncertainty
                                analizleri
                                deneysel
                                doğrulama,
                                klinik kanıt,
                                tanı veya tedavi
                                önerisi değildir.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="footer-inner">
                    <div className="footer-brand">
                        <div className="brand-icon">
                            <span className="brand-core" />
                        </div>

                        <div>
                            <strong>
                                BioTarget{" "}
                                <span>
                    AI
                  </span>
                            </strong>

                            <p>
                                Intelligent
                                Nanomedicine
                                Research Platform
                            </p>
                        </div>
                    </div>

                    <div className="footer-links">
                        <button
                            type="button"
                            onClick={() =>
                                scrollTo(
                                    "laboratory"
                                )
                            }
                        >
                            Laboratory
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                scrollTo(
                                    "screening"
                                )
                            }
                        >
                            Screening
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                scrollTo(
                                    "research-suite"
                                )
                            }
                        >
                            Research Suite
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                scrollTo(
                                    "analytics"
                                )
                            }
                        >
                            Analytics
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                scrollTo(
                                    "scientific-report"
                                )
                            }
                        >
                            Reports
                        </button>
                    </div>

                    <div className="footer-status">
                        <span className="status-dot" />

                        <div>
                            <strong>
                                Research Engine
                                Active
                            </strong>

                            <small>
                                Computational
                                simulation
                                environment
                            </small>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>
                        BioTarget AI —
                        Computational
                        Nanomedicine
                        Research Platform
                    </p>

                    <span>
              Research &
              Educational Use
            </span>
                </div>
            </footer>
        </div>
    );
}

export default App;