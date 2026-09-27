import { useMemo, useState } from "react";
import type { SimulationParameters } from "../types/simulation";
import { calculateMetrics } from "../engine/predictionEngine";
import "./ResponseSurface.css";

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
}

interface MetricDefinition {
    key: MetricKey;
    label: string;
    shortLabel: string;
    unit: string;
    minimize?: boolean;
}

interface HeatmapPoint {
    x: number;
    y: number;
    value: number;
    parameters: SimulationParameters;
}

const PARAMETER_DEFINITIONS: ParameterDefinition[] = [
    {
        key: "particleSize",
        label: "Partikül Boyutu",
        shortLabel: "Boyut",
        unit: "nm",
        min: 30,
        max: 180,
    },
    {
        key: "zetaPotential",
        label: "Zeta Potansiyeli",
        shortLabel: "Zeta",
        unit: "mV",
        min: -35,
        max: 20,
    },
    {
        key: "ligandDensity",
        label: "Ligand Yoğunluğu",
        shortLabel: "Ligand",
        unit: "%",
        min: 20,
        max: 100,
    },
    {
        key: "drugDose",
        label: "İlaç Dozu",
        shortLabel: "Doz",
        unit: "mg/mL",
        min: 0.1,
        max: 1.5,
    },
];

const METRIC_DEFINITIONS: MetricDefinition[] = [
    {
        key: "bindingScore",
        label: "Bağlanma Skoru",
        shortLabel: "Bağlanma",
        unit: "%",
    },
    {
        key: "specificity",
        label: "Özgüllük",
        shortLabel: "Özgüllük",
        unit: "%",
    },
    {
        key: "releaseEfficiency",
        label: "Salınım Verimliliği",
        shortLabel: "Salınım",
        unit: "%",
    },
    {
        key: "toxicityRisk",
        label: "Toksisite Riski",
        shortLabel: "Toksisite",
        unit: "%",
        minimize: true,
    },
];

const GRID_SIZE = 11;

const clamp = (
    value: number,
    min: number,
    max: number
) => Math.min(max, Math.max(min, value));

const interpolate = (
    min: number,
    max: number,
    index: number,
    count: number
) => {
    if (count <= 1) {
        return min;
    }

    return min + ((max - min) * index) / (count - 1);
};

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

const formatValue = (
    value: number,
    unit: string
) => {
    if (unit === "mg/mL") {
        return `${value.toFixed(2)} ${unit}`;
    }

    if (unit === "mV") {
        return `${value.toFixed(1)} ${unit}`;
    }

    return `${Math.round(value)} ${unit}`;
};

const getMetricValue = (
    metrics: ReturnType<typeof calculateMetrics>,
    key: MetricKey
) => {
    return metrics[key];
};

const getHeatColor = (
    value: number,
    min: number,
    max: number
) => {
    const range = Math.max(max - min, 0.0001);

    const normalized = clamp(
        (value - min) / range,
        0,
        1
    );

    /*
      Low  -> dark blue
      Mid  -> cyan / blue
      High -> violet / pink
    */

    const hue =
        205 + normalized * 75;

    const saturation =
        72 + normalized * 16;

    const lightness =
        19 + normalized * 34;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export default function ResponseSurface({
                                            parameters,
                                            onLoad,
                                        }: Props) {
    const [xParameter, setXParameter] =
        useState<ParameterKey>("particleSize");

    const [yParameter, setYParameter] =
        useState<ParameterKey>("ligandDensity");

    const [metric, setMetric] =
        useState<MetricKey>("bindingScore");

    const [selectedPoint, setSelectedPoint] =
        useState<HeatmapPoint | null>(null);

    const xDefinition =
        PARAMETER_DEFINITIONS.find(
            (item) => item.key === xParameter
        )!;

    const yDefinition =
        PARAMETER_DEFINITIONS.find(
            (item) => item.key === yParameter
        )!;

    const metricDefinition =
        METRIC_DEFINITIONS.find(
            (item) => item.key === metric
        )!;

    const availableYParameters =
        PARAMETER_DEFINITIONS.filter(
            (item) => item.key !== xParameter
        );

    const heatmap = useMemo(() => {
        const points: HeatmapPoint[] = [];

        for (
            let yIndex = 0;
            yIndex < GRID_SIZE;
            yIndex += 1
        ) {
            for (
                let xIndex = 0;
                xIndex < GRID_SIZE;
                xIndex += 1
            ) {
                const xValue = roundParameter(
                    xParameter,
                    interpolate(
                        xDefinition.min,
                        xDefinition.max,
                        xIndex,
                        GRID_SIZE
                    )
                );

                const yValue = roundParameter(
                    yParameter,
                    interpolate(
                        yDefinition.min,
                        yDefinition.max,
                        yIndex,
                        GRID_SIZE
                    )
                );

                const testParameters: SimulationParameters = {
                    ...parameters,
                    [xParameter]: xValue,
                    [yParameter]: yValue,
                };

                const metrics =
                    calculateMetrics(testParameters);

                points.push({
                    x: xValue,
                    y: yValue,
                    value: getMetricValue(
                        metrics,
                        metric
                    ),
                    parameters: testParameters,
                });
            }
        }

        const values =
            points.map((point) => point.value);

        const minimum =
            Math.min(...values);

        const maximum =
            Math.max(...values);

        const average =
            values.reduce(
                (sum, value) => sum + value,
                0
            ) / values.length;

        const optimum = points.reduce(
            (best, current) => {
                if (metricDefinition.minimize) {
                    return current.value < best.value
                        ? current
                        : best;
                }

                return current.value > best.value
                    ? current
                    : best;
            },
            points[0]
        );

        return {
            points,
            minimum,
            maximum,
            average,
            optimum,
        };
    }, [
        parameters,
        xParameter,
        yParameter,
        metric,
        xDefinition,
        yDefinition,
        metricDefinition.minimize,
    ]);

    const currentMetrics =
        useMemo(
            () => calculateMetrics(parameters),
            [parameters]
        );

    const currentMetricValue =
        getMetricValue(
            currentMetrics,
            metric
        );

    const handleXParameterChange = (
        value: ParameterKey
    ) => {
        setXParameter(value);
        setSelectedPoint(null);

        if (value === yParameter) {
            const replacement =
                PARAMETER_DEFINITIONS.find(
                    (item) => item.key !== value
                );

            if (replacement) {
                setYParameter(replacement.key);
            }
        }
    };

    const handleYParameterChange = (
        value: ParameterKey
    ) => {
        setYParameter(value);
        setSelectedPoint(null);
    };

    const handleMetricChange = (
        value: MetricKey
    ) => {
        setMetric(value);
        setSelectedPoint(null);
    };

    const activePoint =
        selectedPoint ?? heatmap.optimum;

    return (
        <div className="response-surface">
            <div className="response-surface-header">
                <div>
          <span className="response-surface-kicker">
            PARAMETER INTERACTION ENGINE
          </span>

                    <h3>
                        2D Response
                        <span> Surface</span>
                    </h3>

                    <p>
                        İki formülasyon parametresini aynı
                        anda tarayarak seçilen simülasyon
                        çıktısının nasıl değiştiğini
                        karşılaştır.
                    </p>
                </div>

                <div className="response-surface-live">
                    <span />
                    LIVE COMPUTATIONAL MAP
                </div>
            </div>

            <div className="response-controls">
                <label>
                    <span>X EKSENİ</span>

                    <select
                        value={xParameter}
                        onChange={(event) =>
                            handleXParameterChange(
                                event.target.value as ParameterKey
                            )
                        }
                    >
                        {PARAMETER_DEFINITIONS.map(
                            (definition) => (
                                <option
                                    key={definition.key}
                                    value={definition.key}
                                >
                                    {definition.label}
                                </option>
                            )
                        )}
                    </select>
                </label>

                <label>
                    <span>Y EKSENİ</span>

                    <select
                        value={yParameter}
                        onChange={(event) =>
                            handleYParameterChange(
                                event.target.value as ParameterKey
                            )
                        }
                    >
                        {availableYParameters.map(
                            (definition) => (
                                <option
                                    key={definition.key}
                                    value={definition.key}
                                >
                                    {definition.label}
                                </option>
                            )
                        )}
                    </select>
                </label>

                <label>
                    <span>ÇIKTI METRİĞİ</span>

                    <select
                        value={metric}
                        onChange={(event) =>
                            handleMetricChange(
                                event.target.value as MetricKey
                            )
                        }
                    >
                        {METRIC_DEFINITIONS.map(
                            (definition) => (
                                <option
                                    key={definition.key}
                                    value={definition.key}
                                >
                                    {definition.label}
                                </option>
                            )
                        )}
                    </select>
                </label>
            </div>

            <div className="response-summary-grid">
                <article>
                    <span>AKTİF DEĞER</span>

                    <strong>
                        {currentMetricValue.toFixed(1)}
                        <small>
                            {metricDefinition.unit}
                        </small>
                    </strong>

                    <p>
                        Mevcut laboratuvar
                        formülasyonu
                    </p>
                </article>

                <article>
          <span>
            {metricDefinition.minimize
                ? "MİNİMUM"
                : "MAKSİMUM"}
          </span>

                    <strong>
                        {heatmap.optimum.value.toFixed(1)}
                        <small>
                            {metricDefinition.unit}
                        </small>
                    </strong>

                    <p>
                        2D taramada bulunan hedef
                        nokta
                    </p>
                </article>

                <article>
                    <span>ORTALAMA</span>

                    <strong>
                        {heatmap.average.toFixed(1)}
                        <small>
                            {metricDefinition.unit}
                        </small>
                    </strong>

                    <p>
                        {GRID_SIZE * GRID_SIZE} sanal
                        koşulun ortalaması
                    </p>
                </article>

                <article>
                    <span>ARAMA ALANI</span>

                    <strong>
                        {GRID_SIZE * GRID_SIZE}
                        <small> RUN</small>
                    </strong>

                    <p>
                        {GRID_SIZE} × {GRID_SIZE} grid
                        taraması
                    </p>
                </article>
            </div>

            <div className="response-main-grid">
                <div className="heatmap-panel">
                    <div className="heatmap-panel-header">
                        <div>
              <span>
                RESPONSE SURFACE
              </span>

                            <strong>
                                {xDefinition.shortLabel}
                                {" × "}
                                {yDefinition.shortLabel}
                                {" → "}
                                {metricDefinition.shortLabel}
                            </strong>
                        </div>

                        <div className="heatmap-range">
              <span>
                {heatmap.minimum.toFixed(1)}
              </span>

                            <div className="heatmap-gradient" />

                            <span>
                {heatmap.maximum.toFixed(1)}
              </span>
                        </div>
                    </div>

                    <div className="heatmap-layout">
                        <div className="heatmap-y-title">
                            {yDefinition.label}
                        </div>

                        <div className="heatmap-y-scale">
              <span>
                {formatValue(
                    yDefinition.max,
                    yDefinition.unit
                )}
              </span>

                            <span>
                {formatValue(
                    (
                        yDefinition.min +
                        yDefinition.max
                    ) / 2,
                    yDefinition.unit
                )}
              </span>

                            <span>
                {formatValue(
                    yDefinition.min,
                    yDefinition.unit
                )}
              </span>
                        </div>

                        <div className="heatmap-grid-wrapper">
                            <div className="heatmap-grid">
                                {[...heatmap.points]
                                    .sort((a, b) => {
                                        if (a.y !== b.y) {
                                            return b.y - a.y;
                                        }

                                        return a.x - b.x;
                                    })
                                    .map((point, index) => {
                                        const isOptimum =
                                            point === heatmap.optimum;

                                        const isSelected =
                                            selectedPoint?.x ===
                                            point.x &&
                                            selectedPoint?.y ===
                                            point.y;

                                        return (
                                            <button
                                                key={`${point.x}-${point.y}-${index}`}
                                                type="button"
                                                className={[
                                                    "heatmap-cell",
                                                    isOptimum
                                                        ? "optimum"
                                                        : "",
                                                    isSelected
                                                        ? "selected"
                                                        : "",
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")}
                                                style={{
                                                    background:
                                                        getHeatColor(
                                                            point.value,
                                                            heatmap.minimum,
                                                            heatmap.maximum
                                                        ),
                                                }}
                                                title={
                                                    `${xDefinition.label}: ` +
                                                    `${formatValue(
                                                        point.x,
                                                        xDefinition.unit
                                                    )}\n` +
                                                    `${yDefinition.label}: ` +
                                                    `${formatValue(
                                                        point.y,
                                                        yDefinition.unit
                                                    )}\n` +
                                                    `${metricDefinition.label}: ` +
                                                    `${point.value.toFixed(1)}` +
                                                    `${metricDefinition.unit}`
                                                }
                                                onClick={() =>
                                                    setSelectedPoint(point)
                                                }
                                            >
                        <span>
                          {point.value.toFixed(0)}
                        </span>

                                                {isOptimum && (
                                                    <i>★</i>
                                                )}
                                            </button>
                                        );
                                    })}
                            </div>

                            <div className="heatmap-x-scale">
                <span>
                  {formatValue(
                      xDefinition.min,
                      xDefinition.unit
                  )}
                </span>

                                <span>
                  {formatValue(
                      (
                          xDefinition.min +
                          xDefinition.max
                      ) / 2,
                      xDefinition.unit
                  )}
                </span>

                                <span>
                  {formatValue(
                      xDefinition.max,
                      xDefinition.unit
                  )}
                </span>
                            </div>

                            <div className="heatmap-x-title">
                                {xDefinition.label}
                            </div>
                        </div>
                    </div>

                    <div className="heatmap-legend-note">
            <span>
              <i className="legend-star">
                ★
              </i>
              Hedef nokta
            </span>

                        <span>
              Bir hücreye tıklayarak
              formülasyonu inceleyebilirsin.
            </span>
                    </div>
                </div>

                <div className="response-inspector">
                    <div className="response-inspector-header">
            <span>
              SELECTED CONDITION
            </span>

                        <strong>
                            Sanal Formülasyon
                        </strong>
                    </div>

                    <div className="selected-score">
            <span>
              {metricDefinition.label}
            </span>

                        <strong>
                            {activePoint.value.toFixed(1)}
                            <small>
                                {metricDefinition.unit}
                            </small>
                        </strong>

                        <div
                            className={
                                activePoint ===
                                heatmap.optimum
                                    ? "target-badge"
                                    : "selected-badge"
                            }
                        >
                            {activePoint ===
                            heatmap.optimum
                                ? metricDefinition.minimize
                                    ? "↓ Minimum Nokta"
                                    : "↑ Maksimum Nokta"
                                : "Seçili Hücre"}
                        </div>
                    </div>

                    <div className="selected-parameters">
                        <article>
              <span>
                Partikül Boyutu
              </span>

                            <strong>
                                {activePoint.parameters
                                    .particleSize}
                                <small> nm</small>
                            </strong>
                        </article>

                        <article>
              <span>
                Zeta Potansiyeli
              </span>

                            <strong>
                                {activePoint.parameters
                                    .zetaPotential}
                                <small> mV</small>
                            </strong>
                        </article>

                        <article>
              <span>
                Ligand Yoğunluğu
              </span>

                            <strong>
                                {activePoint.parameters
                                    .ligandDensity}
                                <small>%</small>
                            </strong>
                        </article>

                        <article>
              <span>
                İlaç Dozu
              </span>

                            <strong>
                                {activePoint.parameters
                                    .drugDose}
                                <small> mg/mL</small>
                            </strong>
                        </article>
                    </div>

                    <div className="interaction-insight">
            <span>
              COMPUTATIONAL INTERPRETATION
            </span>

                        <p>
                            Bu harita{" "}
                            <strong>
                                {xDefinition.label}
                            </strong>{" "}
                            ile{" "}
                            <strong>
                                {yDefinition.label}
                            </strong>{" "}
                            birlikte değiştirildiğinde{" "}
                            <strong>
                                {metricDefinition.label}
                            </strong>{" "}
                            çıktısının model içinde nasıl
                            değiştiğini gösterir.
                        </p>

                        <p>
                            Diğer parametreler mevcut
                            laboratuvar değerlerinde sabit
                            tutulmuştur.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="response-load-button"
                        onClick={() =>
                            onLoad(activePoint.parameters)
                        }
                    >
                        <span>↗</span>
                        Bu Noktayı Laboratuvara Aktar
                    </button>
                </div>
            </div>

            <div className="response-method-note">
                <div className="response-method-icon">
                    ∑
                </div>

                <div>
                    <strong>
                        Computational Response Surface
                    </strong>

                    <p>
                        Bu analiz iki parametreyi{" "}
                        {GRID_SIZE} × {GRID_SIZE} grid
                        üzerinde tarar ve toplam{" "}
                        {GRID_SIZE * GRID_SIZE} sanal
                        koşulu mevcut BioTarget AI
                        tahmin motoruyla hesaplar. Sonuçlar
                        araştırma ve eğitim amaçlı
                        hesaplamalı simülasyonlardır;
                        biyolojik veya klinik doğrulama
                        değildir.
                    </p>
                </div>
            </div>
        </div>
    );
}