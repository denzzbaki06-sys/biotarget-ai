import { useMemo, useState } from "react";
import type { SimulationParameters } from "../types/simulation";
import { calculateMetrics } from "../engine/predictionEngine";
import "./UncertaintyAnalysis.css";

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

interface UncertaintySettings {
    particleSize: number;
    zetaPotential: number;
    ligandDensity: number;
    drugDose: number;
}

interface Sample {
    id: number;
    parameters: SimulationParameters;
    metrics: ReturnType<typeof calculateMetrics>;
}

interface DistributionStats {
    key: MetricKey;
    label: string;
    mean: number;
    std: number;
    min: number;
    max: number;
    p05: number;
    p50: number;
    p95: number;
    range: number;
}

const SAMPLE_COUNT = 300;

const PARAMETER_LIMITS: Record<
    ParameterKey,
    { min: number; max: number; unit: string; label: string }
> = {
    particleSize: {
        min: 30,
        max: 180,
        unit: "nm",
        label: "Partikül Boyutu",
    },
    zetaPotential: {
        min: -35,
        max: 20,
        unit: "mV",
        label: "Zeta Potansiyeli",
    },
    ligandDensity: {
        min: 20,
        max: 100,
        unit: "%",
        label: "Ligand Yoğunluğu",
    },
    drugDose: {
        min: 0.1,
        max: 1.5,
        unit: "mg/mL",
        label: "İlaç Dozu",
    },
};

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

const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 999.91) * 43758.5453;
    return x - Math.floor(x);
};

const normalRandom = (
    seedA: number,
    seedB: number
) => {
    const u1 = Math.max(
        seededRandom(seedA),
        0.000001
    );

    const u2 = seededRandom(seedB);

    return (
        Math.sqrt(-2 * Math.log(u1)) *
        Math.cos(2 * Math.PI * u2)
    );
};

const percentile = (
    sorted: number[],
    fraction: number
) => {
    if (sorted.length === 0) {
        return 0;
    }

    const index =
        (sorted.length - 1) * fraction;

    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
        return sorted[lower];
    }

    const weight = index - lower;

    return (
        sorted[lower] * (1 - weight) +
        sorted[upper] * weight
    );
};

const mean = (values: number[]) => {
    if (!values.length) {
        return 0;
    }

    return (
        values.reduce(
            (sum, value) => sum + value,
            0
        ) / values.length
    );
};

const standardDeviation = (
    values: number[]
) => {
    if (values.length < 2) {
        return 0;
    }

    const avg = mean(values);

    const variance =
        values.reduce(
            (sum, value) =>
                sum + Math.pow(value - avg, 2),
            0
        ) / values.length;

    return Math.sqrt(variance);
};

const roundParameter = (
    key: ParameterKey,
    value: number
) => {
    if (key === "drugDose") {
        return Number(value.toFixed(3));
    }

    if (key === "zetaPotential") {
        return Number(value.toFixed(2));
    }

    return Number(value.toFixed(1));
};

const formatParameter = (
    key: ParameterKey,
    value: number
) => {
    const definition =
        PARAMETER_LIMITS[key];

    if (key === "drugDose") {
        return `${value.toFixed(2)} ${definition.unit}`;
    }

    if (key === "zetaPotential") {
        return `${value.toFixed(1)} ${definition.unit}`;
    }

    return `${value.toFixed(0)} ${definition.unit}`;
};

const metricValue = (
    metrics: ReturnType<typeof calculateMetrics>,
    key: MetricKey
) => Number(metrics[key]);

export default function UncertaintyAnalysis({
                                                parameters,
                                                onLoad,
                                            }: Props) {
    const [settings, setSettings] =
        useState<UncertaintySettings>({
            particleSize: 8,
            zetaPotential: 3,
            ligandDensity: 6,
            drugDose: 0.08,
        });

    const [selectedMetric, setSelectedMetric] =
        useState<MetricKey>("bindingScore");

    const analysis = useMemo(() => {
        const samples: Sample[] = [];

        for (
            let index = 0;
            index < SAMPLE_COUNT;
            index += 1
        ) {
            const particleNoise =
                normalRandom(
                    index * 11 + 1,
                    index * 11 + 2
                );

            const zetaNoise =
                normalRandom(
                    index * 13 + 3,
                    index * 13 + 4
                );

            const ligandNoise =
                normalRandom(
                    index * 17 + 5,
                    index * 17 + 6
                );

            const doseNoise =
                normalRandom(
                    index * 19 + 7,
                    index * 19 + 8
                );

            const sampleParameters: SimulationParameters = {
                ...parameters,

                particleSize: roundParameter(
                    "particleSize",
                    clamp(
                        parameters.particleSize +
                        particleNoise *
                        settings.particleSize,
                        PARAMETER_LIMITS.particleSize
                            .min,
                        PARAMETER_LIMITS.particleSize
                            .max
                    )
                ),

                zetaPotential: roundParameter(
                    "zetaPotential",
                    clamp(
                        parameters.zetaPotential +
                        zetaNoise *
                        settings.zetaPotential,
                        PARAMETER_LIMITS.zetaPotential
                            .min,
                        PARAMETER_LIMITS.zetaPotential
                            .max
                    )
                ),

                ligandDensity: roundParameter(
                    "ligandDensity",
                    clamp(
                        parameters.ligandDensity +
                        ligandNoise *
                        settings.ligandDensity,
                        PARAMETER_LIMITS.ligandDensity
                            .min,
                        PARAMETER_LIMITS.ligandDensity
                            .max
                    )
                ),

                drugDose: roundParameter(
                    "drugDose",
                    clamp(
                        parameters.drugDose +
                        doseNoise *
                        settings.drugDose,
                        PARAMETER_LIMITS.drugDose.min,
                        PARAMETER_LIMITS.drugDose.max
                    )
                ),
            };

            samples.push({
                id: index + 1,
                parameters: sampleParameters,
                metrics:
                    calculateMetrics(
                        sampleParameters
                    ),
            });
        }

        const distributions:
            DistributionStats[] =
            METRICS.map((metric) => {
                const values =
                    samples
                        .map((sample) =>
                            metricValue(
                                sample.metrics,
                                metric.key
                            )
                        )
                        .sort((a, b) => a - b);

                const avg = mean(values);
                const std =
                    standardDeviation(values);

                return {
                    key: metric.key,
                    label: metric.label,
                    mean: avg,
                    std,
                    min: values[0],
                    max:
                        values[values.length - 1],
                    p05: percentile(
                        values,
                        0.05
                    ),
                    p50: percentile(
                        values,
                        0.5
                    ),
                    p95: percentile(
                        values,
                        0.95
                    ),
                    range:
                        values[values.length - 1] -
                        values[0],
                };
            });

        const baseMetrics =
            calculateMetrics(parameters);

        const variability =
            mean(
                distributions.map(
                    (distribution) =>
                        distribution.std
                )
            );

        const stabilityScore =
            clamp(
                100 - variability * 9,
                0,
                100
            );

        const selectedDistribution =
            distributions.find(
                (distribution) =>
                    distribution.key ===
                    selectedMetric
            )!;

        const selectedValues =
            samples.map((sample) =>
                metricValue(
                    sample.metrics,
                    selectedMetric
                )
            );

        const histogramBins = 12;

        const histogramMin =
            Math.min(...selectedValues);

        const histogramMax =
            Math.max(...selectedValues);

        const histogramRange =
            Math.max(
                histogramMax -
                histogramMin,
                0.0001
            );

        const histogram =
            Array.from(
                { length: histogramBins },
                (_, bin) => {
                    const start =
                        histogramMin +
                        (histogramRange /
                            histogramBins) *
                        bin;

                    const end =
                        histogramMin +
                        (histogramRange /
                            histogramBins) *
                        (bin + 1);

                    const count =
                        selectedValues.filter(
                            (value) => {
                                if (
                                    bin ===
                                    histogramBins - 1
                                ) {
                                    return (
                                        value >= start &&
                                        value <= end
                                    );
                                }

                                return (
                                    value >= start &&
                                    value < end
                                );
                            }
                        ).length;

                    return {
                        start,
                        end,
                        count,
                    };
                }
            );

        const maxHistogramCount =
            Math.max(
                ...histogram.map(
                    (item) => item.count
                ),
                1
            );

        const safestSample =
            [...samples].sort(
                (a, b) =>
                    a.metrics.toxicityRisk -
                    b.metrics.toxicityRisk
            )[0];

        const highestBindingSample =
            [...samples].sort(
                (a, b) =>
                    b.metrics.bindingScore -
                    a.metrics.bindingScore
            )[0];

        const balancedSample =
            [...samples]
                .map((sample) => {
                    const score =
                        sample.metrics.bindingScore *
                        0.3 +
                        sample.metrics.specificity *
                        0.3 +
                        sample.metrics
                            .releaseEfficiency *
                        0.25 +
                        (100 -
                            sample.metrics
                                .toxicityRisk) *
                        0.15;

                    return {
                        sample,
                        score,
                    };
                })
                .sort(
                    (a, b) =>
                        b.score - a.score
                )[0];

        return {
            samples,
            distributions,
            baseMetrics,
            stabilityScore,
            selectedDistribution,
            histogram,
            maxHistogramCount,
            safestSample,
            highestBindingSample,
            balancedSample,
        };
    }, [
        parameters,
        settings,
        selectedMetric,
    ]);

    const selectedDistribution =
        analysis.selectedDistribution;

    const variabilityLabel =
        analysis.stabilityScore >= 85
            ? "LOW VARIABILITY"
            : analysis.stabilityScore >= 65
                ? "MODERATE VARIABILITY"
                : "HIGH VARIABILITY";

    const updateSetting = (
        key: keyof UncertaintySettings,
        value: number
    ) => {
        setSettings((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    return (
        <div className="uncertainty-analysis">
            <div className="uncertainty-header">
                <div>
          <span className="uncertainty-kicker">
            UNCERTAINTY PROPAGATION ENGINE
          </span>

                    <h3>
                        Uncertainty
                        <span> Analysis</span>
                    </h3>

                    <p>
                        Formülasyon parametrelerine
                        kontrollü belirsizlik ekleyerek
                        BioTarget AI tahminlerinin
                        dağılımını ve lokal
                        değişkenliğini analiz eder.
                    </p>
                </div>

                <div className="uncertainty-status">
                    <span />

                    {SAMPLE_COUNT} SIMULATIONS

                    <strong>
                        {variabilityLabel}
                    </strong>
                </div>
            </div>

            <div className="uncertainty-settings">
                <div className="uncertainty-settings-title">
          <span>
            INPUT UNCERTAINTY
          </span>

                    <strong>
                        Parametre Belirsizlikleri
                    </strong>
                </div>

                <div className="uncertainty-control-grid">
                    <label>
                        <div>
              <span>
                Partikül Boyutu
              </span>

                            <strong>
                                ±{settings.particleSize} nm
                            </strong>
                        </div>

                        <input
                            type="range"
                            min="1"
                            max="25"
                            step="1"
                            value={
                                settings.particleSize
                            }
                            onChange={(event) =>
                                updateSetting(
                                    "particleSize",
                                    Number(
                                        event.target.value
                                    )
                                )
                            }
                        />
                    </label>

                    <label>
                        <div>
              <span>
                Zeta Potansiyeli
              </span>

                            <strong>
                                ±{settings.zetaPotential} mV
                            </strong>
                        </div>

                        <input
                            type="range"
                            min="0.5"
                            max="10"
                            step="0.5"
                            value={
                                settings.zetaPotential
                            }
                            onChange={(event) =>
                                updateSetting(
                                    "zetaPotential",
                                    Number(
                                        event.target.value
                                    )
                                )
                            }
                        />
                    </label>

                    <label>
                        <div>
              <span>
                Ligand Yoğunluğu
              </span>

                            <strong>
                                ±{settings.ligandDensity}%
                            </strong>
                        </div>

                        <input
                            type="range"
                            min="1"
                            max="20"
                            step="1"
                            value={
                                settings.ligandDensity
                            }
                            onChange={(event) =>
                                updateSetting(
                                    "ligandDensity",
                                    Number(
                                        event.target.value
                                    )
                                )
                            }
                        />
                    </label>

                    <label>
                        <div>
              <span>
                İlaç Dozu
              </span>

                            <strong>
                                ±
                                {settings.drugDose.toFixed(
                                    2
                                )}{" "}
                                mg/mL
                            </strong>
                        </div>

                        <input
                            type="range"
                            min="0.01"
                            max="0.3"
                            step="0.01"
                            value={
                                settings.drugDose
                            }
                            onChange={(event) =>
                                updateSetting(
                                    "drugDose",
                                    Number(
                                        event.target.value
                                    )
                                )
                            }
                        />
                    </label>
                </div>
            </div>

            <div className="uncertainty-summary-grid">
                {analysis.distributions.map(
                    (distribution) => (
                        <button
                            key={distribution.key}
                            type="button"
                            className={`uncertainty-summary-card ${
                                selectedMetric ===
                                distribution.key
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                setSelectedMetric(
                                    distribution.key
                                )
                            }
                        >
              <span>
                {distribution.label}
              </span>

                            <strong>
                                {distribution.mean.toFixed(
                                    1
                                )}
                                <small>%</small>
                            </strong>

                            <div>
                                ±{" "}
                                {distribution.std.toFixed(
                                    2
                                )}
                            </div>

                            <p>
                                P05{" "}
                                {distribution.p05.toFixed(
                                    1
                                )}{" "}
                                — P95{" "}
                                {distribution.p95.toFixed(
                                    1
                                )}
                            </p>
                        </button>
                    )
                )}
            </div>

            <div className="uncertainty-main-grid">
                <div className="distribution-panel">
                    <div className="uncertainty-panel-header">
                        <div>
              <span>
                DISTRIBUTION VIEW
              </span>

                            <strong>
                                {
                                    selectedDistribution.label
                                }{" "}
                                Dağılımı
                            </strong>
                        </div>

                        <select
                            value={selectedMetric}
                            onChange={(event) =>
                                setSelectedMetric(
                                    event.target
                                        .value as MetricKey
                                )
                            }
                        >
                            {METRICS.map((metric) => (
                                <option
                                    key={metric.key}
                                    value={metric.key}
                                >
                                    {metric.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="distribution-big-number">
            <span>
              EXPECTED VALUE
            </span>

                        <strong>
                            {selectedDistribution.mean.toFixed(
                                1
                            )}
                            <small>%</small>
                        </strong>

                        <p>
                            ±{" "}
                            {selectedDistribution.std.toFixed(
                                2
                            )}{" "}
                            standard deviation
                        </p>
                    </div>

                    <div className="histogram">
                        {analysis.histogram.map(
                            (bin, index) => (
                                <div
                                    key={index}
                                    className="histogram-column"
                                >
                  <span
                      style={{
                          height: `${
                              (bin.count /
                                  analysis.maxHistogramCount) *
                              100
                          }%`,
                      }}
                  />

                                    <small>
                                        {(
                                            (bin.start +
                                                bin.end) /
                                            2
                                        ).toFixed(0)}
                                    </small>
                                </div>
                            )
                        )}
                    </div>

                    <div className="distribution-range">
                        <div>
                            <span>P05</span>
                            <strong>
                                {selectedDistribution.p05.toFixed(
                                    1
                                )}
                                %
                            </strong>
                        </div>

                        <div>
                            <span>MEDIAN</span>
                            <strong>
                                {selectedDistribution.p50.toFixed(
                                    1
                                )}
                                %
                            </strong>
                        </div>

                        <div>
                            <span>P95</span>
                            <strong>
                                {selectedDistribution.p95.toFixed(
                                    1
                                )}
                                %
                            </strong>
                        </div>

                        <div>
                            <span>STD DEV</span>
                            <strong>
                                {selectedDistribution.std.toFixed(
                                    2
                                )}
                            </strong>
                        </div>
                    </div>
                </div>

                <aside className="uncertainty-inspector">
                    <div className="uncertainty-panel-header">
                        <div>
              <span>
                ROBUSTNESS
              </span>

                            <strong>
                                Stability Score
                            </strong>
                        </div>
                    </div>

                    <div className="uncertainty-score">
                        <div
                            className="uncertainty-score-ring"
                            style={{
                                background: `conic-gradient(
                  #22d3ee 0deg,
                  #60a5fa ${
                                    analysis.stabilityScore *
                                    3.6
                                }deg,
                  rgba(255,255,255,0.05) ${
                                    analysis.stabilityScore *
                                    3.6
                                }deg
                )`,
                            }}
                        >
                            <div>
                                <strong>
                                    {analysis.stabilityScore.toFixed(
                                        0
                                    )}
                                </strong>

                                <small>/100</small>
                            </div>
                        </div>

                        <h4>
                            {variabilityLabel}
                        </h4>

                        <p>
                            Düşük çıktı varyasyonu,
                            seçilen belirsizlikler altında
                            daha kararlı simülasyon
                            davranışına işaret eder.
                        </p>
                    </div>

                    <div className="uncertainty-insight">
            <span>
              UNCERTAINTY INTERVAL
            </span>

                        <strong>
                            {selectedDistribution.p05.toFixed(
                                1
                            )}
                            %
                            <i> → </i>
                            {selectedDistribution.p95.toFixed(
                                1
                            )}
                            %
                        </strong>

                        <p>
                            Simüle edilen örneklerin
                            yaklaşık %90'ını kapsayan
                            hesaplamalı yüzdelik aralığı.
                        </p>
                    </div>
                </aside>
            </div>

            <div className="uncertainty-candidate-grid">
                <article>
                    <div className="candidate-tag">
                        BALANCED
                    </div>

                    <span>
            EN YÜKSEK KOMPOZİT SKOR
          </span>

                    <strong>
                        {
                            analysis.balancedSample
                                .score
                                .toFixed(1)
                        }
                    </strong>

                    <p>
                        {
                            analysis.balancedSample
                                .sample.parameters
                                .particleSize
                        }{" "}
                        nm ·{" "}
                        {
                            analysis.balancedSample
                                .sample.parameters
                                .ligandDensity
                        }
                        % ligand
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            onLoad(
                                analysis.balancedSample
                                    .sample.parameters
                            )
                        }
                    >
                        Laboratuvara Aktar
                    </button>
                </article>

                <article>
                    <div className="candidate-tag cyan">
                        BINDING
                    </div>

                    <span>
            EN YÜKSEK BAĞLANMA
          </span>

                    <strong>
                        {analysis.highestBindingSample.metrics.bindingScore.toFixed(
                            1
                        )}
                        %
                    </strong>

                    <p>
                        {formatParameter(
                            "particleSize",
                            analysis.highestBindingSample
                                .parameters.particleSize
                        )}
                        {" · "}
                        {formatParameter(
                            "ligandDensity",
                            analysis.highestBindingSample
                                .parameters.ligandDensity
                        )}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            onLoad(
                                analysis
                                    .highestBindingSample
                                    .parameters
                            )
                        }
                    >
                        Laboratuvara Aktar
                    </button>
                </article>

                <article>
                    <div className="candidate-tag green">
                        LOW TOX
                    </div>

                    <span>
            EN DÜŞÜK SİMÜLE TOKSİSİTE
          </span>

                    <strong>
                        {analysis.safestSample.metrics.toxicityRisk.toFixed(
                            1
                        )}
                        %
                    </strong>

                    <p>
                        {formatParameter(
                            "drugDose",
                            analysis.safestSample
                                .parameters.drugDose
                        )}
                        {" · "}
                        {formatParameter(
                            "zetaPotential",
                            analysis.safestSample
                                .parameters.zetaPotential
                        )}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            onLoad(
                                analysis.safestSample
                                    .parameters
                            )
                        }
                    >
                        Laboratuvara Aktar
                    </button>
                </article>
            </div>

            <div className="uncertainty-method-note">
                <div>∿</div>

                <section>
                    <strong>
                        Computational Uncertainty
                        Propagation
                    </strong>

                    <p>
                        Bu panel aktif formülasyonun
                        çevresinde deterministik,
                        normal-dağılım benzeri
                        perturbasyonlar oluşturarak{" "}
                        {SAMPLE_COUNT} sanal koşulu
                        BioTarget AI prediction engine
                        üzerinden tekrar hesaplar.
                    </p>

                    <p>
                        <b>Önemli:</b> Gösterilen ±
                        değerleri ve P05–P95 aralıkları
                        gerçek klinik güven aralıkları
                        değildir. Bunlar yalnızca
                        tanımlanan giriş
                        belirsizliklerinin mevcut
                        hesaplamalı modele yayılımını
                        gösterir.
                    </p>
                </section>
            </div>
        </div>
    );
}