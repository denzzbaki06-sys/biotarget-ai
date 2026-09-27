import {
    useEffect,
    useMemo,
    useState,
} from "react";

import type {
    ExperimentRecord,
} from "./ExperimentHistory";

import "./ExperimentComparison.css";

interface Props {
    experiments: ExperimentRecord[];
}

type MetricKey =
    | "bindingScore"
    | "specificity"
    | "releaseEfficiency"
    | "toxicityRisk";

const metricDefinitions: Array<{
    key: MetricKey;
    label: string;
    suffix: string;
}> = [
    {
        key: "bindingScore",
        label: "Bağlanma",
        suffix: "",
    },
    {
        key: "specificity",
        label: "Özgüllük",
        suffix: "%",
    },
    {
        key: "releaseEfficiency",
        label: "Salınım",
        suffix: "%",
    },
    {
        key: "toxicityRisk",
        label: "Risk",
        suffix: "",
    },
];

const getExperimentName = (
    experiment: ExperimentRecord,
    index: number
) =>
    experiment.name?.trim() ||
    `Deney ${index + 1}`;

const formatDifference = (
    value: number,
    suffix = ""
) => {
    const rounded =
        Math.round(value * 10) / 10;

    if (rounded > 0) {
        return `+${rounded}${suffix}`;
    }

    return `${rounded}${suffix}`;
};

function ExperimentComparison({
                                  experiments,
                              }: Props) {
    const [experimentAId, setExperimentAId] =
        useState("");

    const [experimentBId, setExperimentBId] =
        useState("");

    useEffect(() => {
        const ids = new Set(
            experiments.map(
                (experiment) => experiment.id
            )
        );

        if (
            experimentAId &&
            !ids.has(experimentAId)
        ) {
            setExperimentAId("");
        }

        if (
            experimentBId &&
            !ids.has(experimentBId)
        ) {
            setExperimentBId("");
        }
    }, [
        experiments,
        experimentAId,
        experimentBId,
    ]);

    const experimentA = useMemo(
        () =>
            experiments.find(
                (experiment) =>
                    experiment.id === experimentAId
            ) ?? null,
        [experiments, experimentAId]
    );

    const experimentB = useMemo(
        () =>
            experiments.find(
                (experiment) =>
                    experiment.id === experimentBId
            ) ?? null,
        [experiments, experimentBId]
    );

    const ready =
        experimentA !== null &&
        experimentB !== null;

    return (
        <section className="ab-panel">
            <header className="ab-header">
                <div>
                    <span className="ab-kicker">
                        KARŞILAŞTIRMALI ANALİZ
                    </span>

                    <h3>
                        Deney A / B Karşılaştırması
                    </h3>

                    <p>
                        Geçmişte kaydettiğiniz iki
                        formülasyonu seçerek parametre ve
                        simülasyon sonuçlarını karşılaştırın.
                    </p>
                </div>

                <div className="ab-count">
                    <strong>
                        {experiments.length}
                    </strong>

                    <span>
                        kayıtlı deney
                    </span>
                </div>
            </header>

            {experiments.length < 2 ? (
                <div className="ab-empty">
                    <div className="ab-empty-icon">
                        ◇
                    </div>

                    <div>
                        <h4>
                            Karşılaştırma için en az 2 deney
                            gerekli
                        </h4>

                        <p>
                            İki farklı formülasyonu kaydedin.
                            Ardından A ve B alanlarından
                            karşılaştırmak istediğiniz deneyleri
                            seçebilirsiniz.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="ab-selector-grid">
                        <div className="ab-selector-card">
                            <span className="ab-selector-label">
                                DENEY A
                            </span>

                            <select
                                value={experimentAId}
                                onChange={(event) =>
                                    setExperimentAId(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="">
                                    Deney A'yı seç
                                </option>

                                {experiments.map(
                                    (experiment, index) => (
                                        <option
                                            key={experiment.id}
                                            value={experiment.id}
                                            disabled={
                                                experiment.id ===
                                                experimentBId
                                            }
                                        >
                                            {getExperimentName(
                                                experiment,
                                                index
                                            )}
                                        </option>
                                    )
                                )}
                            </select>

                            {experimentA && (
                                <ExperimentPreview
                                    experiment={experimentA}
                                />
                            )}
                        </div>

                        <div className="ab-vs">
                            VS
                        </div>

                        <div className="ab-selector-card">
                            <span className="ab-selector-label">
                                DENEY B
                            </span>

                            <select
                                value={experimentBId}
                                onChange={(event) =>
                                    setExperimentBId(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="">
                                    Deney B'yi seç
                                </option>

                                {experiments.map(
                                    (experiment, index) => (
                                        <option
                                            key={experiment.id}
                                            value={experiment.id}
                                            disabled={
                                                experiment.id ===
                                                experimentAId
                                            }
                                        >
                                            {getExperimentName(
                                                experiment,
                                                index
                                            )}
                                        </option>
                                    )
                                )}
                            </select>

                            {experimentB && (
                                <ExperimentPreview
                                    experiment={experimentB}
                                />
                            )}
                        </div>
                    </div>

                    {!ready && (
                        <div className="ab-select-hint">
                            <span>i</span>

                            Karşılaştırmayı görmek için iki
                            farklı deney seçin.
                        </div>
                    )}

                    {ready &&
                        experimentA &&
                        experimentB && (
                            <ComparisonResults
                                experimentA={experimentA}
                                experimentB={experimentB}
                            />
                        )}
                </>
            )}
        </section>
    );
}

interface PreviewProps {
    experiment: ExperimentRecord;
}

function ExperimentPreview({
                               experiment,
                           }: PreviewProps) {
    return (
        <div className="ab-preview">
            <div className="ab-target">
                <span>HEDEF</span>

                <strong>
                    {experiment.parameters.cellType}
                </strong>
            </div>

            <div className="ab-parameter-grid">
                <div>
                    <span>Boyut</span>
                    <strong>
                        {experiment.parameters.particleSize} nm
                    </strong>
                </div>

                <div>
                    <span>Zeta</span>
                    <strong>
                        {experiment.parameters.zetaPotential} mV
                    </strong>
                </div>

                <div>
                    <span>Ligand</span>
                    <strong>
                        %{experiment.parameters.ligandDensity}
                    </strong>
                </div>

                <div>
                    <span>Doz</span>
                    <strong>
                        {experiment.parameters.drugDose} mg/mL
                    </strong>
                </div>
            </div>

            <div className="ab-metric-grid">
                {metricDefinitions.map(
                    (metric) => (
                        <div key={metric.key}>
                            <span>
                                {metric.label}
                            </span>

                            <strong>
                                {
                                    experiment.metrics[
                                        metric.key
                                        ]
                                }
                                {metric.suffix}
                            </strong>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

interface ResultsProps {
    experimentA: ExperimentRecord;
    experimentB: ExperimentRecord;
}

function ComparisonResults({
                               experimentA,
                               experimentB,
                           }: ResultsProps) {
    return (
        <div className="ab-results">
            <div className="ab-results-heading">
                <span>B − A DEĞİŞİMİ</span>

                <h4>
                    Simülasyon Sonuç Farkları
                </h4>
            </div>

            <div className="ab-difference-grid">
                {metricDefinitions.map(
                    (metric) => {
                        const difference =
                            experimentB.metrics[metric.key] -
                            experimentA.metrics[metric.key];

                        return (
                            <article key={metric.key}>
                                <span>
                                    {metric.label}
                                </span>

                                <strong>
                                    {formatDifference(
                                        difference,
                                        metric.suffix
                                    )}
                                </strong>

                                <small>
                                    Deney B − Deney A
                                </small>
                            </article>
                        );
                    }
                )}
            </div>

            <div className="ab-note">
                <span>i</span>

                <p>
                    <strong>
                        Hesaplamalı Karşılaştırma
                    </strong>
                    Gösterilen farklar yalnızca BioTarget
                    AI simülasyon çıktılarının matematiksel
                    karşılaştırmasıdır; deneysel veya klinik
                    üstünlük anlamına gelmez.
                </p>
            </div>
        </div>
    );
}

export default ExperimentComparison;