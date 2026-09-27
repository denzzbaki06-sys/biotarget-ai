import { useMemo, useState } from "react";

import type {
    SimulationParameters,
} from "../types/simulation";

import {
    calculateMetrics,
} from "../engine/predictionEngine";

import "./SensitivityAnalysis.css";

interface Props {
    parameters: SimulationParameters;
    onLoad: (
        parameters: SimulationParameters
    ) => void;
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
    minimum: number;
    maximum: number;
    step: number;
    decimals: number;
}

interface MetricDefinition {
    key: MetricKey;
    label: string;
    shortLabel: string;
}

interface SweepPoint {
    parameterValue: number;
    bindingScore: number;
    specificity: number;
    releaseEfficiency: number;
    toxicityRisk: number;
}

interface SensitivityResult {
    parameter: ParameterDefinition;
    points: SweepPoint[];
    sensitivityScore: number;
    normalizedImportance: number;
    strongestMetric: MetricKey;
    strongestChange: number;
}

const parameterDefinitions: ParameterDefinition[] = [
    {
        key: "particleSize",
        label: "Partikül Boyutu",
        shortLabel: "Boyut",
        unit: "nm",
        minimum: 30,
        maximum: 180,
        step: 5,
        decimals: 0,
    },
    {
        key: "zetaPotential",
        label: "Zeta Potansiyeli",
        shortLabel: "Zeta",
        unit: "mV",
        minimum: -35,
        maximum: 20,
        step: 2.5,
        decimals: 1,
    },
    {
        key: "ligandDensity",
        label: "Ligand Yoğunluğu",
        shortLabel: "Ligand",
        unit: "%",
        minimum: 20,
        maximum: 100,
        step: 4,
        decimals: 0,
    },
    {
        key: "drugDose",
        label: "İlaç Dozu",
        shortLabel: "Doz",
        unit: "mg/mL",
        minimum: 0.1,
        maximum: 1.5,
        step: 0.05,
        decimals: 2,
    },
];

const metricDefinitions: MetricDefinition[] = [
    {
        key: "bindingScore",
        label: "Bağlanma Skoru",
        shortLabel: "Bağlanma",
    },
    {
        key: "specificity",
        label: "Özgüllük",
        shortLabel: "Özgüllük",
    },
    {
        key: "releaseEfficiency",
        label: "Salınım Verimliliği",
        shortLabel: "Salınım",
    },
    {
        key: "toxicityRisk",
        label: "Toksisite Riski",
        shortLabel: "Toksisite",
    },
];

const clamp = (
    value: number,
    minimum: number,
    maximum: number
) => {
    return Math.min(
        maximum,
        Math.max(minimum, value)
    );
};

const round = (
    value: number,
    decimals: number
) => {
    const multiplier =
        10 ** decimals;

    return (
        Math.round(
            value * multiplier
        ) / multiplier
    );
};

const getMetricLabel = (
    key: MetricKey
) => {
    return (
        metricDefinitions.find(
            (metric) =>
                metric.key === key
        )?.label ?? key
    );
};

const getParameterLabel = (
    key: ParameterKey
) => {
    return (
        parameterDefinitions.find(
            (parameter) =>
                parameter.key === key
        )?.label ?? key
    );
};

function SensitivityAnalysis({
                                 parameters,
                                 onLoad,
                             }: Props) {
    const [
        selectedParameter,
        setSelectedParameter,
    ] = useState<ParameterKey>(
        "particleSize"
    );

    const [
        selectedMetric,
        setSelectedMetric,
    ] = useState<MetricKey>(
        "bindingScore"
    );

    const analysis = useMemo(() => {
        const rawResults =
            parameterDefinitions.map(
                (definition) => {
                    const points: SweepPoint[] = [];

                    for (
                        let value =
                            definition.minimum;
                        value <=
                        definition.maximum +
                        definition.step / 2;
                        value +=
                            definition.step
                    ) {
                        const cleanValue =
                            round(
                                value,
                                definition.decimals
                            );

                        const testParameters: SimulationParameters =
                            {
                                ...parameters,
                                [definition.key]:
                                cleanValue,
                            };

                        const metrics =
                            calculateMetrics(
                                testParameters
                            );

                        points.push({
                            parameterValue:
                            cleanValue,

                            bindingScore:
                            metrics.bindingScore,

                            specificity:
                            metrics.specificity,

                            releaseEfficiency:
                            metrics.releaseEfficiency,

                            toxicityRisk:
                            metrics.toxicityRisk,
                        });
                    }

                    const metricRanges =
                        metricDefinitions.map(
                            (metric) => {
                                const values =
                                    points.map(
                                        (point) =>
                                            point[
                                                metric.key
                                                ]
                                    );

                                const minimum =
                                    Math.min(
                                        ...values
                                    );

                                const maximum =
                                    Math.max(
                                        ...values
                                    );

                                return {
                                    key: metric.key,
                                    range:
                                        maximum -
                                        minimum,
                                };
                            }
                        );

                    const strongest =
                        [...metricRanges].sort(
                            (a, b) =>
                                b.range -
                                a.range
                        )[0];

                    const sensitivityScore =
                        metricRanges.reduce(
                            (
                                total,
                                metric
                            ) =>
                                total +
                                metric.range,
                            0
                        ) /
                        metricRanges.length;

                    return {
                        parameter:
                        definition,

                        points,

                        sensitivityScore,

                        normalizedImportance:
                            0,

                        strongestMetric:
                        strongest.key,

                        strongestChange:
                        strongest.range,
                    } satisfies SensitivityResult;
                }
            );

        const totalSensitivity =
            rawResults.reduce(
                (
                    total,
                    result
                ) =>
                    total +
                    result.sensitivityScore,
                0
            );

        const results =
            rawResults
                .map(
                    (result) => ({
                        ...result,

                        normalizedImportance:
                            totalSensitivity ===
                            0
                                ? 0
                                : (result.sensitivityScore /
                                    totalSensitivity) *
                                100,
                    })
                )
                .sort(
                    (a, b) =>
                        b.normalizedImportance -
                        a.normalizedImportance
                );

        return results;
    }, [parameters]);

    const activeAnalysis =
        useMemo(() => {
            return (
                analysis.find(
                    (result) =>
                        result.parameter
                            .key ===
                        selectedParameter
                ) ?? analysis[0]
            );
        }, [
            analysis,
            selectedParameter,
        ]);

    const chartPoints =
        useMemo(() => {
            if (!activeAnalysis) {
                return [];
            }

            return activeAnalysis.points.map(
                (point) => ({
                    x:
                    point.parameterValue,
                    y:
                        point[
                            selectedMetric
                            ],
                })
            );
        }, [
            activeAnalysis,
            selectedMetric,
        ]);

    const chartBounds =
        useMemo(() => {
            if (
                chartPoints.length === 0
            ) {
                return {
                    minimumX: 0,
                    maximumX: 1,
                    minimumY: 0,
                    maximumY: 100,
                };
            }

            const xValues =
                chartPoints.map(
                    (point) =>
                        point.x
                );

            const yValues =
                chartPoints.map(
                    (point) =>
                        point.y
                );

            let minimumY =
                Math.min(
                    ...yValues
                );

            let maximumY =
                Math.max(
                    ...yValues
                );

            if (
                minimumY ===
                maximumY
            ) {
                minimumY -= 1;
                maximumY += 1;
            }

            const padding =
                Math.max(
                    2,
                    (maximumY -
                        minimumY) *
                    0.12
                );

            return {
                minimumX:
                    Math.min(
                        ...xValues
                    ),

                maximumX:
                    Math.max(
                        ...xValues
                    ),

                minimumY:
                    minimumY -
                    padding,

                maximumY:
                    maximumY +
                    padding,
            };
        }, [chartPoints]);

    const svgWidth = 900;
    const svgHeight = 330;

    const paddingLeft = 58;
    const paddingRight = 24;
    const paddingTop = 24;
    const paddingBottom = 46;

    const plotWidth =
        svgWidth -
        paddingLeft -
        paddingRight;

    const plotHeight =
        svgHeight -
        paddingTop -
        paddingBottom;

    const mapX = (
        value: number
    ) => {
        const range =
            chartBounds.maximumX -
            chartBounds.minimumX;

        if (range === 0) {
            return paddingLeft;
        }

        return (
            paddingLeft +
            ((value -
                    chartBounds.minimumX) /
                range) *
            plotWidth
        );
    };

    const mapY = (
        value: number
    ) => {
        const range =
            chartBounds.maximumY -
            chartBounds.minimumY;

        if (range === 0) {
            return paddingTop;
        }

        return (
            paddingTop +
            plotHeight -
            ((value -
                    chartBounds.minimumY) /
                range) *
            plotHeight
        );
    };

    const polylinePoints =
        chartPoints
            .map(
                (point) =>
                    `${mapX(
                        point.x
                    )},${mapY(
                        point.y
                    )}`
            )
            .join(" ");

    const selectedDefinition =
        parameterDefinitions.find(
            (definition) =>
                definition.key ===
                selectedParameter
        ) ??
        parameterDefinitions[0];

    const selectedMetricDefinition =
        metricDefinitions.find(
            (metric) =>
                metric.key ===
                selectedMetric
        ) ??
        metricDefinitions[0];

    const currentParameterValue =
        parameters[
            selectedParameter
            ];

    const nearestCurrentPoint =
        useMemo(() => {
            if (
                !activeAnalysis ||
                activeAnalysis.points
                    .length === 0
            ) {
                return null;
            }

            return [
                ...activeAnalysis.points,
            ].sort(
                (a, b) =>
                    Math.abs(
                        a.parameterValue -
                        currentParameterValue
                    ) -
                    Math.abs(
                        b.parameterValue -
                        currentParameterValue
                    )
            )[0];
        }, [
            activeAnalysis,
            currentParameterValue,
        ]);

    const minimumMetricPoint =
        useMemo(() => {
            if (
                !activeAnalysis ||
                activeAnalysis.points
                    .length === 0
            ) {
                return null;
            }

            return [
                ...activeAnalysis.points,
            ].sort(
                (a, b) =>
                    a[selectedMetric] -
                    b[selectedMetric]
            )[0];
        }, [
            activeAnalysis,
            selectedMetric,
        ]);

    const maximumMetricPoint =
        useMemo(() => {
            if (
                !activeAnalysis ||
                activeAnalysis.points
                    .length === 0
            ) {
                return null;
            }

            return [
                ...activeAnalysis.points,
            ].sort(
                (a, b) =>
                    b[selectedMetric] -
                    a[selectedMetric]
            )[0];
        }, [
            activeAnalysis,
            selectedMetric,
        ]);

    const firstPoint =
        activeAnalysis
            ?.points[0];

    const lastPoint =
        activeAnalysis
            ?.points[
        activeAnalysis.points
            .length - 1
            ];

    const overallDirection =
        useMemo(() => {
            if (
                !firstPoint ||
                !lastPoint
            ) {
                return {
                    text:
                        "Hesaplanamadı",
                    className:
                        "neutral",
                    difference: 0,
                };
            }

            const difference =
                lastPoint[
                    selectedMetric
                    ] -
                firstPoint[
                    selectedMetric
                    ];

            if (
                Math.abs(
                    difference
                ) < 0.5
            ) {
                return {
                    text:
                        "Belirgin yön yok",
                    className:
                        "neutral",
                    difference,
                };
            }

            if (
                difference > 0
            ) {
                return {
                    text:
                        "Artış eğilimi",
                    className:
                        "positive",
                    difference,
                };
            }

            return {
                text:
                    "Azalış eğilimi",
                className:
                    "negative",
                difference,
            };
        }, [
            firstPoint,
            lastPoint,
            selectedMetric,
        ]);

    const strongestParameter =
        analysis[0];

    const loadMaximumPoint = () => {
        if (!maximumMetricPoint) {
            return;
        }

        onLoad({
            ...parameters,

            [selectedParameter]:
            maximumMetricPoint
                .parameterValue,
        });
    };

    return (
        <div className="sensitivity-panel">
            <div className="sensitivity-header">
                <div>
          <span className="sensitivity-kicker">
            LOCAL MODEL INTERPRETABILITY
          </span>

                    <h3>
                        Sensitivity Analysis
                    </h3>

                    <p>
                        Aktif formülasyonda diğer
                        parametreleri sabit tutarak her
                        parametrenin simülasyon
                        çıktılarındaki değişimini tarar.
                    </p>
                </div>

                <div className="sensitivity-engine-badge">
                    <span />

                    ANALYSIS ENGINE
                </div>
            </div>

            <div className="sensitivity-current">
                <div>
          <span>
            AKTİF HEDEF
          </span>

                    <strong>
                        {parameters.cellType}
                    </strong>
                </div>

                <div>
          <span>
            BOYUT
          </span>

                    <strong>
                        {parameters.particleSize}
                        {" nm"}
                    </strong>
                </div>

                <div>
          <span>
            ZETA
          </span>

                    <strong>
                        {parameters.zetaPotential}
                        {" mV"}
                    </strong>
                </div>

                <div>
          <span>
            LİGAND
          </span>

                    <strong>
                        %{parameters.ligandDensity}
                    </strong>
                </div>

                <div>
          <span>
            DOZ
          </span>

                    <strong>
                        {parameters.drugDose}
                        {" mg/mL"}
                    </strong>
                </div>
            </div>

            <div className="importance-section">
                <div className="importance-heading">
                    <div>
            <span>
              PARAMETER IMPORTANCE
            </span>

                        <h4>
                            Simülasyon Duyarlılık Profili
                        </h4>
                    </div>

                    {strongestParameter && (
                        <div className="importance-leader">
              <span>
                EN YÜKSEK DUYARLILIK
              </span>

                            <strong>
                                {
                                    strongestParameter
                                        .parameter
                                        .label
                                }
                            </strong>
                        </div>
                    )}
                </div>

                <div className="importance-grid">
                    {analysis.map(
                        (
                            result,
                            index
                        ) => (
                            <button
                                type="button"
                                key={
                                    result.parameter
                                        .key
                                }
                                className={`importance-card ${
                                    selectedParameter ===
                                    result.parameter
                                        .key
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    setSelectedParameter(
                                        result.parameter
                                            .key
                                    )
                                }
                            >
                                <div className="importance-card-top">
                  <span className="importance-rank">
                    #
                      {index + 1}
                  </span>

                                    <span className="importance-value">
                    {result.normalizedImportance.toFixed(
                        1
                    )}
                                        %
                  </span>
                                </div>

                                <strong>
                                    {
                                        result.parameter
                                            .label
                                    }
                                </strong>

                                <small>
                                    En fazla değişen çıktı:
                                    {" "}
                                    {getMetricLabel(
                                        result.strongestMetric
                                    )}
                                </small>

                                <div className="importance-track">
                                    <div
                                        style={{
                                            width:
                                                `${clamp(
                                                    result.normalizedImportance,
                                                    0,
                                                    100
                                                )}%`,
                                        }}
                                    />
                                </div>

                                <div className="importance-footer">
                  <span>
                    Ortalama duyarlılık
                  </span>

                                    <strong>
                                        {result.sensitivityScore.toFixed(
                                            2
                                        )}
                                    </strong>
                                </div>
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="sensitivity-controls">
                <div className="sensitivity-control-group">
          <span>
            PARAMETRE
          </span>

                    <div className="sensitivity-button-row">
                        {parameterDefinitions.map(
                            (definition) => (
                                <button
                                    type="button"
                                    key={
                                        definition.key
                                    }
                                    className={
                                        selectedParameter ===
                                        definition.key
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setSelectedParameter(
                                            definition.key
                                        )
                                    }
                                >
                                    {
                                        definition.shortLabel
                                    }
                                </button>
                            )
                        )}
                    </div>
                </div>

                <div className="sensitivity-control-group">
          <span>
            ÇIKTI METRİĞİ
          </span>

                    <div className="sensitivity-button-row metric-buttons">
                        {metricDefinitions.map(
                            (metric) => (
                                <button
                                    type="button"
                                    key={
                                        metric.key
                                    }
                                    className={
                                        selectedMetric ===
                                        metric.key
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setSelectedMetric(
                                            metric.key
                                        )
                                    }
                                >
                                    {
                                        metric.shortLabel
                                    }
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            <div className="sensitivity-chart-card">
                <div className="sensitivity-chart-header">
                    <div>
            <span>
              SENSITIVITY CURVE
            </span>

                        <h4>
                            {
                                selectedDefinition.label
                            }
                            {" → "}
                            {
                                selectedMetricDefinition.label
                            }
                        </h4>

                        <p>
                            Diğer üç parametre aktif
                            formülasyondaki değerlerinde sabit
                            tutulmuştur.
                        </p>
                    </div>

                    <div
                        className={`sensitivity-direction ${overallDirection.className}`}
                    >
            <span>
              GENEL EĞİLİM
            </span>

                        <strong>
                            {
                                overallDirection.text
                            }
                        </strong>

                        <small>
                            {overallDirection.difference >=
                            0
                                ? "+"
                                : ""}
                            {overallDirection.difference.toFixed(
                                2
                            )}
                        </small>
                    </div>
                </div>

                <div className="sensitivity-chart-wrapper">
                    <svg
                        className="sensitivity-chart"
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        role="img"
                        aria-label={`${selectedDefinition.label} ve ${selectedMetricDefinition.label} sensitivity curve`}
                    >
                        {[0, 1, 2, 3, 4].map(
                            (index) => {
                                const y =
                                    paddingTop +
                                    (plotHeight /
                                        4) *
                                    index;

                                const value =
                                    chartBounds.maximumY -
                                    ((chartBounds.maximumY -
                                            chartBounds.minimumY) /
                                        4) *
                                    index;

                                return (
                                    <g
                                        key={
                                            index
                                        }
                                    >
                                        <line
                                            x1={
                                                paddingLeft
                                            }
                                            y1={y}
                                            x2={
                                                svgWidth -
                                                paddingRight
                                            }
                                            y2={y}
                                            className="sensitivity-grid-line"
                                        />

                                        <text
                                            x={
                                                paddingLeft -
                                                10
                                            }
                                            y={
                                                y + 4
                                            }
                                            textAnchor="end"
                                            className="sensitivity-axis-text"
                                        >
                                            {value.toFixed(
                                                1
                                            )}
                                        </text>
                                    </g>
                                );
                            }
                        )}

                        <line
                            x1={
                                paddingLeft
                            }
                            y1={
                                paddingTop +
                                plotHeight
                            }
                            x2={
                                svgWidth -
                                paddingRight
                            }
                            y2={
                                paddingTop +
                                plotHeight
                            }
                            className="sensitivity-axis-line"
                        />

                        <line
                            x1={
                                paddingLeft
                            }
                            y1={
                                paddingTop
                            }
                            x2={
                                paddingLeft
                            }
                            y2={
                                paddingTop +
                                plotHeight
                            }
                            className="sensitivity-axis-line"
                        />

                        <polyline
                            points={
                                polylinePoints
                            }
                            fill="none"
                            className="sensitivity-polyline-glow"
                        />

                        <polyline
                            points={
                                polylinePoints
                            }
                            fill="none"
                            className="sensitivity-polyline"
                        />

                        {chartPoints.map(
                            (
                                point,
                                index
                            ) => (
                                <circle
                                    key={
                                        `${point.x}-${index}`
                                    }
                                    cx={
                                        mapX(
                                            point.x
                                        )
                                    }
                                    cy={
                                        mapY(
                                            point.y
                                        )
                                    }
                                    r="3.4"
                                    className="sensitivity-point"
                                />
                            )
                        )}

                        {nearestCurrentPoint && (
                            <>
                                <line
                                    x1={mapX(
                                        nearestCurrentPoint.parameterValue
                                    )}
                                    y1={
                                        paddingTop
                                    }
                                    x2={mapX(
                                        nearestCurrentPoint.parameterValue
                                    )}
                                    y2={
                                        paddingTop +
                                        plotHeight
                                    }
                                    className="sensitivity-current-line"
                                />

                                <circle
                                    cx={mapX(
                                        nearestCurrentPoint.parameterValue
                                    )}
                                    cy={mapY(
                                        nearestCurrentPoint[
                                            selectedMetric
                                            ]
                                    )}
                                    r="7"
                                    className="sensitivity-current-point"
                                />
                            </>
                        )}

                        <text
                            x={
                                paddingLeft
                            }
                            y={
                                svgHeight -
                                12
                            }
                            textAnchor="start"
                            className="sensitivity-axis-text"
                        >
                            {chartBounds.minimumX.toFixed(
                                selectedDefinition.decimals
                            )}
                            {" "}
                            {
                                selectedDefinition.unit
                            }
                        </text>

                        <text
                            x={
                                svgWidth -
                                paddingRight
                            }
                            y={
                                svgHeight -
                                12
                            }
                            textAnchor="end"
                            className="sensitivity-axis-text"
                        >
                            {chartBounds.maximumX.toFixed(
                                selectedDefinition.decimals
                            )}
                            {" "}
                            {
                                selectedDefinition.unit
                            }
                        </text>
                    </svg>
                </div>

                <div className="sensitivity-chart-legend">
                    <div>
                        <span className="legend-line curve" />

                        Simülasyon eğrisi
                    </div>

                    <div>
                        <span className="legend-line current" />

                        Aktif parametre
                    </div>
                </div>
            </div>

            <div className="sensitivity-stat-grid">
                <article>
          <span>
            AKTİF DEĞER
          </span>

                    <strong>
                        {currentParameterValue}
                    </strong>

                    <small>
                        {
                            selectedDefinition.unit
                        }
                    </small>
                </article>

                <article>
          <span>
            AKTİF ÇIKTI
          </span>

                    <strong>
                        {nearestCurrentPoint
                            ? nearestCurrentPoint[
                                selectedMetric
                                ].toFixed(2)
                            : "—"}
                    </strong>

                    <small>
                        {
                            selectedMetricDefinition.shortLabel
                        }
                    </small>
                </article>

                <article>
          <span>
            TARAMA MİN.
          </span>

                    <strong>
                        {minimumMetricPoint
                            ? minimumMetricPoint[
                                selectedMetric
                                ].toFixed(2)
                            : "—"}
                    </strong>

                    <small>
                        {minimumMetricPoint
                            ? `${minimumMetricPoint.parameterValue} ${selectedDefinition.unit}`
                            : "—"}
                    </small>
                </article>

                <article>
          <span>
            TARAMA MAKS.
          </span>

                    <strong>
                        {maximumMetricPoint
                            ? maximumMetricPoint[
                                selectedMetric
                                ].toFixed(2)
                            : "—"}
                    </strong>

                    <small>
                        {maximumMetricPoint
                            ? `${maximumMetricPoint.parameterValue} ${selectedDefinition.unit}`
                            : "—"}
                    </small>
                </article>
            </div>

            {maximumMetricPoint && (
                <div className="sensitivity-load-card">
                    <div>
            <span>
              PARAMETER PROBE
            </span>

                        <strong>
                            {
                                selectedMetricDefinition.label
                            } için taramadaki en yüksek
                            hesaplanan nokta
                        </strong>

                        <p>
                            {
                                selectedDefinition.label
                            }
                            {" = "}
                            {
                                maximumMetricPoint.parameterValue
                            }
                            {" "}
                            {
                                selectedDefinition.unit
                            }
                            {" → "}
                            {
                                selectedMetricDefinition.shortLabel
                            }
                            {" = "}
                            {maximumMetricPoint[
                                selectedMetric
                                ].toFixed(2)}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={
                            loadMaximumPoint
                        }
                    >
                        → Bu Noktayı Laboratuvara Aktar
                    </button>
                </div>
            )}

            <div className="sensitivity-explanation-grid">
                {analysis.map(
                    (result) => (
                        <article
                            key={
                                result.parameter
                                    .key
                            }
                        >
                            <div>
                <span>
                  {
                      result.parameter
                          .shortLabel
                  }
                </span>

                                <strong>
                                    {result.normalizedImportance.toFixed(
                                        1
                                    )}
                                    %
                                </strong>
                            </div>

                            <p>
                                {
                                    getParameterLabel(
                                        result.parameter
                                            .key
                                    )
                                }
                                {" taramasında en geniş değişim "}
                                <b>
                                    {getMetricLabel(
                                        result.strongestMetric
                                    )}
                                </b>
                                {" metriğinde gözlendi. Aralık: "}
                                <b>
                                    {result.strongestChange.toFixed(
                                        2
                                    )}
                                </b>
                                .
                            </p>
                        </article>
                    )
                )}
            </div>

            <div className="sensitivity-method">
                <div className="sensitivity-method-icon">
                    ƒ
                </div>

                <div>
                    <strong>
                        One-at-a-Time Sensitivity Analysis
                    </strong>

                    <p>
                        Her taramada yalnızca bir parametre
                        değiştirilir; diğer parametreler aktif
                        formülasyondaki değerlerinde tutulur.
                        Parameter Importance yüzdeleri, dört
                        simülasyon çıktısındaki ortalama
                        değişim aralıklarından normalize
                        edilmiştir. Bu değerler model
                        davranışını açıklar; biyolojik
                        nedensellik veya klinik önem ölçüsü
                        değildir.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SensitivityAnalysis;