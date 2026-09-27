import { useState } from "react";

import type { SimulationParameters } from "../types/simulation";
import type { ExperimentRecord } from "./ExperimentHistory";

import ResponseSurface from "./ResponseSurface";
import ModelValidation from "./ModelValidation";
import UncertaintyAnalysis from "./UncertaintyAnalysis";
import ResearchWorkspace from "./ResearchWorkspace";

import "./AdvancedResearchSuite.css";

interface Props {
    parameters: SimulationParameters;
    experiments: ExperimentRecord[];
    onLoad: (parameters: SimulationParameters) => void;
}

type ResearchModule =
    | "workspace"
    | "surface"
    | "validation"
    | "uncertainty";

interface ModuleDefinition {
    key: ResearchModule;
    number: string;
    label: string;
    title: string;
    description: string;
    icon: string;
}

const MODULES: ModuleDefinition[] = [
    {
        key: "workspace",
        number: "01",
        label: "WORKSPACE",
        title: "Research Workspace",
        description:
            "Tüm deney kayıtlarını ve araştırma sonuçlarını tek merkezden incele.",
        icon: "◇",
    },
    {
        key: "surface",
        number: "02",
        label: "INTERACTION",
        title: "2D Response Surface",
        description:
            "İki formülasyon parametresinin birlikte oluşturduğu model davranışını tara.",
        icon: "⌗",
    },
    {
        key: "validation",
        number: "03",
        label: "VALIDATION",
        title: "Model Validation",
        description:
            "Lokal perturbasyonlarla prediction engine kararlılığını incele.",
        icon: "✓",
    },
    {
        key: "uncertainty",
        number: "04",
        label: "UNCERTAINTY",
        title: "Uncertainty Analysis",
        description:
            "Giriş belirsizliklerini yüzlerce sanal koşula yayarak çıktı dağılımlarını analiz et.",
        icon: "∿",
    },
];

export default function AdvancedResearchSuite({
                                                  parameters,
                                                  experiments,
                                                  onLoad,
                                              }: Props) {
    const [activeModule, setActiveModule] =
        useState<ResearchModule>("workspace");

    const activeDefinition =
        MODULES.find(
            (module) => module.key === activeModule
        ) ?? MODULES[0];

    return (
        <div className="advanced-research-suite">
            <div className="research-suite-header">
                <div>
                    <span className="research-suite-kicker">
                        ADVANCED COMPUTATIONAL RESEARCH
                    </span>

                    <h2>
                        BioTarget
                        <span> Research Suite</span>
                    </h2>

                    <p>
                        Parametre etkileşimi, lokal model
                        stabilitesi, belirsizlik yayılımı ve
                        deney portföyü analizi için gelişmiş
                        hesaplamalı araştırma çalışma alanı.
                    </p>
                </div>

                <div className="research-suite-status">
                    <div>
                        <span className="suite-status-dot" />
                        ENGINE ONLINE
                    </div>

                    <strong>4</strong>
                    <small>RESEARCH MODULES</small>
                </div>
            </div>

            <div className="research-suite-nav">
                {MODULES.map((module) => (
                    <button
                        key={module.key}
                        type="button"
                        className={
                            activeModule === module.key
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveModule(module.key)
                        }
                    >
                        <span className="suite-module-number">
                            {module.number}
                        </span>

                        <div className="suite-module-icon">
                            {module.icon}
                        </div>

                        <div className="suite-module-text">
                            <small>{module.label}</small>
                            <strong>{module.title}</strong>
                        </div>

                        <i>→</i>
                    </button>
                ))}
            </div>

            <div className="research-suite-context">
                <div>
                    <span>ACTIVE MODULE</span>
                    <strong>
                        {activeDefinition.title}
                    </strong>
                    <p>
                        {activeDefinition.description}
                    </p>
                </div>

                <div className="suite-active-target">
                    <span>ACTIVE TARGET</span>
                    <strong>
                        {parameters.cellType}
                    </strong>
                </div>

                <div className="suite-record-count">
                    <span>SAVED DATA</span>
                    <strong>
                        {experiments.length}
                        <small> experiments</small>
                    </strong>
                </div>
            </div>

            <div className="research-suite-content">
                {activeModule === "workspace" && (
                    <ResearchWorkspace
                        experiments={experiments}
                        parameters={parameters}
                        onLoad={onLoad}
                    />
                )}

                {activeModule === "surface" && (
                    <ResponseSurface
                        parameters={parameters}
                        onLoad={onLoad}
                    />
                )}

                {activeModule === "validation" && (
                    <ModelValidation
                        parameters={parameters}
                        onLoad={onLoad}
                    />
                )}

                {activeModule === "uncertainty" && (
                    <UncertaintyAnalysis
                        parameters={parameters}
                        onLoad={onLoad}
                    />
                )}
            </div>

            <div className="research-suite-disclaimer">
                <div>i</div>

                <p>
                    <strong>
                        Computational Research Environment
                    </strong>
                    BioTarget Research Suite yalnızca
                    hesaplamalı araştırma ve eğitim
                    amaçlıdır. Üretilen skorlar,
                    optimizasyon sonuçları, belirsizlik
                    dağılımları ve model stabilite
                    göstergeleri deneysel veya klinik
                    doğrulamanın yerine geçmez.
                </p>
            </div>
        </div>
    );
}