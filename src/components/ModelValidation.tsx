import { useMemo, useState } from "react";
import type { SimulationParameters } from "../types/simulation";
import { calculateMetrics } from "../engine/predictionEngine";
import "./ModelValidation.css";

interface Props {
    parameters: SimulationParameters;
    onLoad: (parameters: SimulationParameters) => void;
}

type ParameterKey =
    | "particleSize"
    | "zetaPotential"
    | "ligandDensity"
    | "drugDose";

type MetricKey =
    | "bindingScore"
    | "specificity"
    | "releaseEfficiency"
    | "toxicityRisk";

interface ParameterDefinition {
    key: ParameterKey;
    label: string;
    shortLabel: string;
    unit: string;
    min: number;
    max: number;
    perturbation: number;
}

interface NeighborRun {
    id: string;
    label: string;
    changedParameter: ParameterKey | null;
    direction: "base" | "low" | "high";
    parameters: SimulationParameters;
    metrics: ReturnType<typeof calculateMetrics>;
    deviation: number;
}

const PARAMETER_DEFINITIONS: ParameterDefinition[] = [
    {
        key: "particleSize",
        label: "Partikül Boyutu",
        shortLabel: "Boyut",
        unit: "nm",
        min: 30,
        max: 180,
        perturbation: 10,
    },
    {
        key: "zetaPotential",
        label: "Zeta Potansiyeli",
        shortLabel: "Zeta",
        unit: "mV",
        min: -35,
        max: 20,
        perturbation: 5,
    },
    {
        key: "ligandDensity",
        label: "Ligand Yoğunluğu",
        shortLabel: "Ligand",
        unit: "%",
        min: 20,
        max: 100,
        perturbation: 8,
    },
    {
        key: "drugDose",
        label: "İlaç Dozu",
        shortLabel: "Doz",
        unit: "mg/mL",
        min: 0.1,
        max: 1.5,
        perturbation: 0.1,
    },
];

const METRICS: {
    key: MetricKey;
    label: string;
}[] = [
    {
        key: "bindingScore",
        label: "Bağlanma",
    },
    {
        key: "specificity",
        label: "Özgüllük",
    },
    {
        key: "releaseEfficiency",
        label: "Salınım",
    },
    {
        key: "toxicityRisk",
        label: "Toksisite",
    },
];

const clamp = (
    value: number,
    min: number,
    max: number
) => Math.min(max, Math.max(min, value));

const roundParameter = (
    key: ParameterKey,
    value: number
) => {
    if (key === "drugDose") {
        return Number(value.toFixed(2));
    }

    if (key === "zetaPotential") {
        return Number(value.toFixed(1));
    }

    return Math.round(value);
};

const parameterValue = (
    parameters: SimulationParameters,
    key: ParameterKey
) => Number(parameters[key]);

const metricValue = (
    metrics: ReturnType<typeof calculateMetrics>,
    key: MetricKey
) => Number(metrics[key]);

const average = (values: number[]) => {
    if (values.length === 0) {
        return 0;
    }

    return (
        values.reduce(
            (sum, value) => sum + value,
            0
        ) / values.length
    );
};

const formatParameter = (
    key: ParameterKey,
    value: number
) => {
    const definition =
        PARAMETER_DEFINITIONS.find(
            (item) => item.key === key
        )!;

    if (key === "drugDose") {
        return `${value.toFixed(2)} ${definition.unit}`;
    }

    if (key === "zetaPotential") {
        return `${value.toFixed(1)} ${definition.unit}`;
    }

    return `${Math.round(value)} ${definition.unit}`;
};

const confidenceLabel = (score: number) => {
    if (score >= 85) {
        return "HIGH";
    }

    if (score >= 65) {
        return "MODERATE";
    }

    return "LOW";
};

const confidenceLabelTR = (score: number) => {
    if (score >= 85) {
        return "YÜKSEK";
    }

    if (score >= 65) {
        return "ORTA";
    }

    return "DÜŞÜK";
};

const riskLabel = (score: number) => {
    if (score >= 80) {
        return "LOW";
    }

    if (score >= 55) {
        return "MODERATE";
    }

    return "HIGH";
};

export default function ModelValidation({
                                            parameters,
                                            onLoad,
                                        }: Props) {
    const [selectedRunId, setSelectedRunId] =
        useState<string>("base");

    const analysis = useMemo(() => {
        const baseMetrics =
            calculateMetrics(parameters);

        const runs: NeighborRun[] = [
            {
                id: "base",
                label: "Aktif Formülasyon",
                changedParameter: null,
                direction: "base",
                parameters: {
                    ...parameters,
                },
                metrics: baseMetrics,
                deviation: 0,
            },
        ];

        PARAMETER_DEFINITIONS.forEach(
            (definition) => {
                const current = parameterValue(
                    parameters,
                    definition.key
                );

                const lower = roundParameter(
                    definition.key,
                    clamp(
                        current - definition.perturbation,
                        definition.min,
                        definition.max
                    )
                );

                const upper = roundParameter(
                    definition.key,
                    clamp(
                        current + definition.perturbation,
                        definition.min,
                        definition.max
                    )
                );

                if (lower !== current) {
                    const lowParameters: SimulationParameters = {
                        ...parameters,
                        [definition.key]: lower,
                    };

                    const lowMetrics =
                        calculateMetrics(lowParameters);

                    runs.push({
                        id: `${definition.key}-low`,
                        label: `${definition.shortLabel} ↓`,
                        changedParameter: definition.key,
                        direction: "low",
                        parameters: lowParameters,
                        metrics: lowMetrics,
                        deviation: 0,
                    });
                }

                if (upper !== current) {
                    const highParameters: SimulationParameters = {
                        ...parameters,
                        [definition.key]: upper,
                    };

                    const highMetrics =
                        calculateMetrics(highParameters);

                    runs.push({
                        id: `${definition.key}-high`,
                        label: `${definition.shortLabel} ↑`,
                        changedParameter: definition.key,
                        direction: "high",
                        parameters: highParameters,
                        metrics: highMetrics,
                        deviation: 0,
                    });
                }
            }
        );

        const evaluatedRuns =
            runs.map((run) => {
                if (run.id === "base") {
                    return run;
                }

                const deviations =
                    METRICS.map((metric) =>
                        Math.abs(
                            metricValue(
                                run.metrics,
                                metric.key
                            ) -
                            metricValue(
                                baseMetrics,
                                metric.key
                            )
                        )
                    );

                return {
                    ...run,
                    deviation: average(deviations),
                };
            });

        const neighborRuns =
            evaluatedRuns.filter(
                (run) => run.id !== "base"
            );

        const averageDeviation = average(
            neighborRuns.map(
                (run) => run.deviation
            )
        );

        /*
          Local stability:
          Small output changes after small input
          perturbations -> higher stability.

          This is NOT real-world model accuracy.
        */
        const localStability = clamp(
            100 - averageDeviation * 6,
            0,
            100
        );

        /*
          Parameter coverage:
          Measures how far the active point is
          from the defined parameter-space edges.
        */
        const coverageValues =
            PARAMETER_DEFINITIONS.map(
                (definition) => {
                    const current = parameterValue(
                        parameters,
                        definition.key
                    );

                    const normalized =
                        (current - definition.min) /
                        (definition.max -
                            definition.min);

                    const distanceFromEdge =
                        Math.min(
                            normalized,
                            1 - normalized
                        );

                    return clamp(
                        distanceFromEdge * 200,
                        0,
                        100
                    );
                }
            );

        const parameterCoverage =
            average(coverageValues);

        const boundaryDistances =
            PARAMETER_DEFINITIONS.map(
                (definition) => {
                    const current = parameterValue(
                        parameters,
                        definition.key
                    );

                    const normalized =
                        (current - definition.min) /
                        (definition.max -
                            definition.min);

                    return {
                        definition,
                        distance:
                            Math.min(
                                normalized,
                                1 - normalized
                            ) * 100,
                    };
                }
            );

        const closestBoundary =
            [...boundaryDistances].sort(
                (a, b) =>
                    a.distance - b.distance
            )[0];

        /*
          Robustness combines local output stability
          and centrality inside the simulated domain.
        */
        const robustnessScore = clamp(
            localStability * 0.65 +
            parameterCoverage * 0.35,
            0,
            100
        );

        const extrapolationSafety =
            clamp(
                closestBoundary.distance * 5,
                0,
                100
            );

        const metricStability =
            METRICS.map((metric) => {
                const base =
                    metricValue(
                        baseMetrics,
                        metric.key
                    );

                const deviations =
                    neighborRuns.map((run) =>
                        Math.abs(
                            metricValue(
                                run.metrics,
                                metric.key
                            ) - base
                        )
                    );

                const meanDeviation =
                    average(deviations);

                return {
                    ...metric,
                    meanDeviation,
                    stability: clamp(
                        100 - meanDeviation * 6,
                        0,
                        100
                    ),
                };
            });

        const mostStableMetric =
            [...metricStability].sort(
                (a, b) =>
                    b.stability - a.stability
            )[0];

        const leastStableMetric =
            [...metricStability].sort(
                (a, b) =>
                    a.stability - b.stability
            )[0];

        const largestDeviationRun =
            [...neighborRuns].sort(
                (a, b) =>
                    b.deviation - a.deviation
            )[0];

        const computationalConfidence =
            clamp(
                localStability * 0.5 +
                parameterCoverage * 0.3 +
                extrapolationSafety * 0.2,
                0,
                100
            );

        return {
            baseMetrics,
            runs: evaluatedRuns,
            localStability,
            parameterCoverage,
            robustnessScore,
            extrapolationSafety,
            closestBoundary,
            metricStability,
            mostStableMetric,
            leastStableMetric,
            largestDeviationRun,
            computationalConfidence,
        };
    }, [parameters]);

    const selectedRun =
        analysis.runs.find(
            (run) => run.id === selectedRunId
        ) ?? analysis.runs[0];

    const baseMetrics =
        analysis.baseMetrics;

    const selectedParameterDefinition =
        selectedRun.changedParameter
            ? PARAMETER_DEFINITIONS.find(
                (definition) =>
                    definition.key ===
                    selectedRun.changedParameter
            )
            : null;

    const confidence =
        confidenceLabel(
            analysis.computationalConfidence
        );

    const confidenceTR =
        confidenceLabelTR(
            analysis.computationalConfidence
        );

    const risk =
        riskLabel(
            analysis.extrapolationSafety
        );

    return (
        <div className="model-validation">
            <div className="validation-header">
                <div>
          <span className="validation-kicker">
            MODEL VALIDATION ENGINE
          </span>

                    <h3>
                        Prediction
                        <span> Confidence</span>
                    </h3>

                    <p>
                        Aktif formülasyonun çevresinde
                        küçük parametre değişimleri
                        oluşturarak simülasyon motorunun
                        lokal kararlılığını, parametre
                        alanı kapsamını ve sınır riskini
                        analiz eder.
                    </p>
                </div>

                <div
                    className={`validation-confidence-badge ${confidence.toLowerCase()}`}
                >
                    <span className="validation-live-dot" />

                    COMPUTATIONAL CONFIDENCE

                    <strong>
                        {confidence}
                    </strong>
                </div>
            </div>

            <div className="validation-score-grid">
                <article className="validation-score-card">
                    <div className="validation-score-top">
            <span>
              LOCAL STABILITY
            </span>

                        <i>LS</i>
                    </div>

                    <strong>
                        {analysis.localStability.toFixed(1)}
                        <small>%</small>
                    </strong>

                    <div className="validation-progress">
            <span
                style={{
                    width: `${analysis.localStability}%`,
                }}
            />
                    </div>

                    <p>
                        Küçük parametre değişimlerinde
                        tahminlerin ne kadar kararlı
                        kaldığı.
                    </p>
                </article>

                <article className="validation-score-card">
                    <div className="validation-score-top">
            <span>
              PARAMETER COVERAGE
            </span>

                        <i>PC</i>
                    </div>

                    <strong>
                        {analysis.parameterCoverage.toFixed(1)}
                        <small>%</small>
                    </strong>

                    <div className="validation-progress">
            <span
                style={{
                    width: `${analysis.parameterCoverage}%`,
                }}
            />
                    </div>

                    <p>
                        Aktif koşulun tanımlı simülasyon
                        alanındaki konumu.
                    </p>
                </article>

                <article className="validation-score-card">
                    <div className="validation-score-top">
            <span>
              ROBUSTNESS SCORE
            </span>

                        <i>RS</i>
                    </div>

                    <strong>
                        {analysis.robustnessScore.toFixed(1)}
                        <small>%</small>
                    </strong>

                    <div className="validation-progress">
            <span
                style={{
                    width: `${analysis.robustnessScore}%`,
                }}
            />
                    </div>

                    <p>
                        Lokal stabilite ve parametre
                        kapsamının birleşik göstergesi.
                    </p>
                </article>

                <article className="validation-score-card">
                    <div className="validation-score-top">
            <span>
              EXTRAPOLATION RISK
            </span>

                        <i>ER</i>
                    </div>

                    <strong className="validation-risk-value">
                        {risk}
                    </strong>

                    <div className="validation-progress">
            <span
                style={{
                    width: `${analysis.extrapolationSafety}%`,
                }}
            />
                    </div>

                    <p>
                        En yakın tanımlı parametre
                        sınırına göre hesaplanan risk.
                    </p>
                </article>
            </div>

            <div className="validation-main-grid">
                <div className="validation-neighborhood">
                    <div className="validation-panel-header">
                        <div>
              <span>
                LOCAL PERTURBATION TEST
              </span>

                            <strong>
                                Neighborhood Stability
                            </strong>
                        </div>

                        <div className="validation-run-count">
                            {analysis.runs.length} RUN
                        </div>
                    </div>

                    <div className="validation-base-row">
                        <div>
              <span>
                AKTİF FORMÜLASYON
              </span>

                            <strong>
                                {parameters.cellType}
                            </strong>
                        </div>

                        <div className="validation-base-parameters">
              <span>
                {parameters.particleSize} nm
              </span>

                            <span>
                {parameters.zetaPotential} mV
              </span>

                            <span>
                {parameters.ligandDensity}%
              </span>

                            <span>
                {parameters.drugDose} mg/mL
              </span>
                        </div>
                    </div>

                    <div className="validation-run-table">
                        <div className="validation-table-head">
                            <span>KOŞUL</span>
                            <span>BIND</span>
                            <span>SPEC</span>
                            <span>REL</span>
                            <span>TOX</span>
                            <span>Δ</span>
                        </div>

                        {analysis.runs.map((run) => {
                            const active =
                                selectedRun.id === run.id;

                            return (
                                <button
                                    key={run.id}
                                    type="button"
                                    className={`validation-run-row ${
                                        active ? "active" : ""
                                    }`}
                                    onClick={() =>
                                        setSelectedRunId(run.id)
                                    }
                                >
                  <span className="validation-run-name">
                    {run.label}
                  </span>

                                    <span>
                    {run.metrics.bindingScore.toFixed(
                        1
                    )}
                  </span>

                                    <span>
                    {run.metrics.specificity.toFixed(
                        1
                    )}
                  </span>

                                    <span>
                    {run.metrics.releaseEfficiency.toFixed(
                        1
                    )}
                  </span>

                                    <span>
                    {run.metrics.toxicityRisk.toFixed(
                        1
                    )}
                  </span>

                                    <span
                                        className={
                                            run.deviation > 5
                                                ? "deviation-high"
                                                : run.deviation > 2
                                                    ? "deviation-mid"
                                                    : "deviation-low"
                                        }
                                    >
                    {run.id === "base"
                        ? "BASE"
                        : run.deviation.toFixed(1)}
                  </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="validation-metric-stability">
                        <div className="validation-subtitle">
              <span>
                OUTPUT STABILITY
              </span>

                            <strong>
                                Metrik Bazlı Kararlılık
                            </strong>
                        </div>

                        <div className="metric-stability-list">
                            {analysis.metricStability.map(
                                (metric) => (
                                    <div
                                        key={metric.key}
                                        className="metric-stability-row"
                                    >
                                        <div>
                      <span>
                        {metric.label}
                      </span>

                                            <small>
                                                Ortalama değişim{" "}
                                                {metric.meanDeviation.toFixed(
                                                    2
                                                )}{" "}
                                                puan
                                            </small>
                                        </div>

                                        <div className="metric-stability-track">
                      <span
                          style={{
                              width: `${metric.stability}%`,
                          }}
                      />
                                        </div>

                                        <strong>
                                            {metric.stability.toFixed(
                                                0
                                            )}
                                            %
                                        </strong>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <aside className="validation-inspector">
                    <div className="validation-panel-header">
                        <div>
              <span>
                CONDITION INSPECTOR
              </span>

                            <strong>
                                Seçili Koşul
                            </strong>
                        </div>
                    </div>

                    <div className="validation-selected-run">
            <span>
              {selectedRun.id === "base"
                  ? "BASELINE"
                  : "PERTURBATION"}
            </span>

                        <strong>
                            {selectedRun.label}
                        </strong>

                        {selectedParameterDefinition && (
                            <p>
                                {
                                    selectedParameterDefinition.label
                                }
                                :{" "}
                                <b>
                                    {formatParameter(
                                        selectedParameterDefinition.key,
                                        parameterValue(
                                            selectedRun.parameters,
                                            selectedParameterDefinition.key
                                        )
                                    )}
                                </b>
                            </p>
                        )}
                    </div>

                    <div className="validation-selected-metrics">
                        {METRICS.map((metric) => {
                            const current =
                                metricValue(
                                    selectedRun.metrics,
                                    metric.key
                                );

                            const base =
                                metricValue(
                                    baseMetrics,
                                    metric.key
                                );

                            const difference =
                                current - base;

                            return (
                                <article key={metric.key}>
                  <span>
                    {metric.label}
                  </span>

                                    <strong>
                                        {current.toFixed(1)}
                                        <small>%</small>
                                    </strong>

                                    <em
                                        className={
                                            difference > 0
                                                ? "positive"
                                                : difference < 0
                                                    ? "negative"
                                                    : "neutral"
                                        }
                                    >
                                        {selectedRun.id === "base"
                                            ? "BASE"
                                            : `${
                                                difference > 0
                                                    ? "+"
                                                    : ""
                                            }${difference.toFixed(
                                                1
                                            )}`}
                                    </em>
                                </article>
                            );
                        })}
                    </div>

                    <div className="validation-confidence-panel">
            <span>
              COMPUTATIONAL CONFIDENCE
            </span>

                        <div className="confidence-circle">
                            <div>
                                <strong>
                                    {analysis.computationalConfidence.toFixed(
                                        0
                                    )}
                                </strong>

                                <small>/100</small>
                            </div>
                        </div>

                        <h4>
                            {confidenceTR} GÜVEN
                        </h4>

                        <p>
                            Bu skor gerçek deneysel
                            doğruluk oranı değildir. Lokal
                            stabilite, parametre alanındaki
                            konum ve sınır yakınlığından
                            oluşturulan hesaplamalı bir
                            güven göstergesidir.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="validation-load-button"
                        onClick={() =>
                            onLoad(
                                selectedRun.parameters
                            )
                        }
                    >
                        <span>↗</span>
                        Bu Koşulu Laboratuvara Aktar
                    </button>
                </aside>
            </div>

            <div className="validation-insight-grid">
                <article>
          <span className="validation-insight-icon">
            ✓
          </span>

                    <div>
                        <small>
                            MOST STABLE OUTPUT
                        </small>

                        <strong>
                            {
                                analysis.mostStableMetric
                                    .label
                            }
                        </strong>

                        <p>
                            Lokal perturbasyonlarda en
                            düşük ortalama değişimi
                            gösteren çıktı.
                        </p>
                    </div>
                </article>

                <article>
          <span className="validation-insight-icon warning">
            ∿
          </span>

                    <div>
                        <small>
                            MOST SENSITIVE OUTPUT
                        </small>

                        <strong>
                            {
                                analysis.leastStableMetric
                                    .label
                            }
                        </strong>

                        <p>
                            Komşu koşullarda en fazla
                            değişkenlik gösteren çıktı.
                        </p>
                    </div>
                </article>

                <article>
          <span className="validation-insight-icon purple">
            ◇
          </span>

                    <div>
                        <small>
                            CLOSEST BOUNDARY
                        </small>

                        <strong>
                            {
                                analysis.closestBoundary
                                    .definition.label
                            }
                        </strong>

                        <p>
                            Aktif noktanın tanımlı aralıkta
                            sınıra en yakın olduğu
                            parametre.
                        </p>
                    </div>
                </article>

                <article>
          <span className="validation-insight-icon blue">
            Δ
          </span>

                    <div>
                        <small>
                            LARGEST LOCAL SHIFT
                        </small>

                        <strong>
                            {analysis.largestDeviationRun
                                ?.label ?? "—"}
                        </strong>

                        <p>
                            Çıktılarda en yüksek ortalama
                            değişimi oluşturan komşu koşul.
                        </p>
                    </div>
                </article>
            </div>

            <div className="validation-method-note">
                <div className="validation-method-symbol">
                    ∑
                </div>

                <div>
                    <strong>
                        Validation Methodology
                    </strong>

                    <p>
                        BioTarget AI bu panelde aktif
                        formülasyonun dört parametresini
                        ayrı ayrı küçük miktarlarda
                        artırıp azaltarak prediction
                        engine'i yeniden çalıştırır.
                        Çıktılardaki değişim lokal
                        stabiliteyi değerlendirmek için
                        kullanılır.
                    </p>

                    <p>
                        <b>Önemli:</b> Bu panel gerçek
                        deneysel validation, accuracy,
                        R², RMSE veya klinik doğruluk
                        ölçümü değildir. Böyle bir
                        değerlendirme için bağımsız
                        ground-truth deneysel veri
                        gerekir. Buradaki skorlar yalnızca
                        hesaplamalı simülasyon
                        davranışını açıklar.
                    </p>
                </div>
            </div>
        </div>
    );
}