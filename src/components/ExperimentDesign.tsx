import { useMemo, useState } from "react";

import type {
    SimulationParameters,
} from "../types/simulation";

import {
    calculateMetrics,
} from "../engine/predictionEngine";

import "./ExperimentDesign.css";

interface Props {
    parameters: SimulationParameters;

    onLoad: (
        parameters: SimulationParameters
    ) => void;

    onSavePlan: (
        experiments: SimulationParameters[]
    ) => void;
}

type DesignSize =
    | 8
    | 12
    | 16
    | 24
    | 32;

interface DesignedExperiment {
    id: string;

    run: number;

    parameters: SimulationParameters;

    metrics: ReturnType<
        typeof calculateMetrics
    >;

    score: number;
}

const clamp = (
    value: number,
    minimum: number,
    maximum: number
) => {
    return Math.min(
        maximum,
        Math.max(
            minimum,
            value
        )
    );
};

const round = (
    value: number,
    decimals = 0
) => {
    const multiplier =
        10 ** decimals;

    return (
        Math.round(
            value * multiplier
        ) / multiplier
    );
};

const seededShuffle = (
    values: number[],
    seed: number
) => {
    const result = [
        ...values,
    ];

    let state =
        seed >>> 0;

    const random = () => {
        state =
            (
                state *
                1664525 +
                1013904223
            ) >>> 0;

        return (
            state /
            4294967296
        );
    };

    for (
        let i =
            result.length - 1;
        i > 0;
        i--
    ) {
        const j =
            Math.floor(
                random() *
                (i + 1)
            );

        [
            result[i],
            result[j],
        ] = [
            result[j],
            result[i],
        ];
    }

    return result;
};

const createLevels = (
    count: number,
    minimum: number,
    maximum: number,
    decimals: number
) => {
    if (count <= 1) {
        return [
            round(
                (minimum +
                    maximum) /
                2,
                decimals
            ),
        ];
    }

    return Array.from(
        {
            length: count,
        },
        (
            _,
            index
        ) => {
            const ratio =
                (index + 0.5) /
                count;

            return round(
                minimum +
                ratio *
                (
                    maximum -
                    minimum
                ),
                decimals
            );
        }
    );
};

const calculateScore = (
    metrics: ReturnType<
        typeof calculateMetrics
    >
) => {
    const binding =
        clamp(
            metrics.bindingScore,
            0,
            100
        ) / 100;

    const specificity =
        clamp(
            metrics.specificity,
            0,
            100
        ) / 100;

    const release =
        clamp(
            metrics.releaseEfficiency,
            0,
            100
        ) / 100;

    const lowToxicity =
        1 -
        clamp(
            metrics.toxicityRisk,
            0,
            100
        ) /
        100;

    return (
        (
            binding *
            0.3 +
            specificity *
            0.3 +
            release *
            0.25 +
            lowToxicity *
            0.15
        ) *
        100
    );
};

function ExperimentDesign({
                              parameters,
                              onLoad,
                              onSavePlan,
                          }: Props) {
    const [
        designSize,
        setDesignSize,
    ] =
        useState<DesignSize>(
            12
        );

    const [
        experiments,
        setExperiments,
    ] =
        useState<
            DesignedExperiment[]
        >([]);

    const [
        selectedId,
        setSelectedId,
    ] =
        useState<
            string | null
        >(null);

    const [
        generated,
        setGenerated,
    ] =
        useState(false);

    const [
        saved,
        setSaved,
    ] =
        useState(false);

    const generateDesign = () => {
        const count =
            designSize;

        const sizeLevels =
            createLevels(
                count,
                30,
                180,
                0
            );

        const zetaLevels =
            createLevels(
                count,
                -35,
                20,
                1
            );

        const ligandLevels =
            createLevels(
                count,
                20,
                100,
                0
            );

        const doseLevels =
            createLevels(
                count,
                0.1,
                1.5,
                2
            );

        const shuffledSize =
            seededShuffle(
                sizeLevels,
                1103 +
                count
            );

        const shuffledZeta =
            seededShuffle(
                zetaLevels,
                2207 +
                count
            );

        const shuffledLigand =
            seededShuffle(
                ligandLevels,
                3301 +
                count
            );

        const shuffledDose =
            seededShuffle(
                doseLevels,
                4409 +
                count
            );

        const design =
            Array.from(
                {
                    length:
                    count,
                },
                (
                    _,
                    index
                ) => {
                    const experimentParameters:
                        SimulationParameters =
                        {
                            cellType:
                            parameters.cellType,

                            particleSize:
                                shuffledSize[
                                    index
                                    ],

                            zetaPotential:
                                shuffledZeta[
                                    index
                                    ],

                            ligandDensity:
                                shuffledLigand[
                                    index
                                    ],

                            drugDose:
                                shuffledDose[
                                    index
                                    ],
                        };

                    const metrics =
                        calculateMetrics(
                            experimentParameters
                        );

                    return {
                        id:
                            `doe-${Date.now()}-${index}`,

                        run:
                            index + 1,

                        parameters:
                        experimentParameters,

                        metrics,

                        score:
                            calculateScore(
                                metrics
                            ),
                    };
                }
            );

        setExperiments(
            design
        );

        setSelectedId(
            design[0]?.id ??
            null
        );

        setGenerated(true);
        setSaved(false);
    };

    const selectedExperiment =
        useMemo(() => {
            return (
                experiments.find(
                    (
                        experiment
                    ) =>
                        experiment.id ===
                        selectedId
                ) ?? null
            );
        }, [
            experiments,
            selectedId,
        ]);

    const statistics =
        useMemo(() => {
            if (
                experiments.length ===
                0
            ) {
                return {
                    averageBinding: 0,
                    averageSpecificity: 0,
                    averageRelease: 0,
                    averageToxicity: 0,
                    averageScore: 0,
                };
            }

            const totals =
                experiments.reduce(
                    (
                        accumulator,
                        experiment
                    ) => {
                        accumulator.binding +=
                            experiment.metrics
                                .bindingScore;

                        accumulator.specificity +=
                            experiment.metrics
                                .specificity;

                        accumulator.release +=
                            experiment.metrics
                                .releaseEfficiency;

                        accumulator.toxicity +=
                            experiment.metrics
                                .toxicityRisk;

                        accumulator.score +=
                            experiment.score;

                        return accumulator;
                    },
                    {
                        binding: 0,
                        specificity: 0,
                        release: 0,
                        toxicity: 0,
                        score: 0,
                    }
                );

            const count =
                experiments.length;

            return {
                averageBinding:
                    totals.binding /
                    count,

                averageSpecificity:
                    totals.specificity /
                    count,

                averageRelease:
                    totals.release /
                    count,

                averageToxicity:
                    totals.toxicity /
                    count,

                averageScore:
                    totals.score /
                    count,
            };
        }, [experiments]);

    const highestScore =
        useMemo(() => {
            if (
                experiments.length ===
                0
            ) {
                return null;
            }

            return [
                ...experiments,
            ].sort(
                (a, b) =>
                    b.score -
                    a.score
            )[0];
        }, [experiments]);

    const lowestToxicity =
        useMemo(() => {
            if (
                experiments.length ===
                0
            ) {
                return null;
            }

            return [
                ...experiments,
            ].sort(
                (a, b) =>
                    a.metrics
                        .toxicityRisk -
                    b.metrics
                        .toxicityRisk
            )[0];
        }, [experiments]);

    const highestBinding =
        useMemo(() => {
            if (
                experiments.length ===
                0
            ) {
                return null;
            }

            return [
                ...experiments,
            ].sort(
                (a, b) =>
                    b.metrics
                        .bindingScore -
                    a.metrics
                        .bindingScore
            )[0];
        }, [experiments]);

    const savePlan = () => {
        if (
            experiments.length ===
            0
        ) {
            return;
        }

        onSavePlan(
            experiments.map(
                (
                    experiment
                ) => ({
                    ...experiment.parameters,
                })
            )
        );

        setSaved(true);

        window.setTimeout(
            () => {
                setSaved(false);
            },
            2500
        );
    };

    return (
        <div className="doe-panel">
            <div className="doe-header">
                <div>
          <span className="doe-kicker">
            SYSTEMATIC EXPERIMENT DESIGN
          </span>

                    <h3>
                        Design of
                        Experiments
                    </h3>

                    <p>
                        Parametre uzayını
                        dengeli biçimde
                        örnekleyen sanal bir
                        deney matrisi
                        oluşturur ve her
                        koşulu BioTarget AI
                        simülasyon motoruyla
                        değerlendirir.
                    </p>
                </div>

                <div className="doe-status">
                    <span />

                    DOE ENGINE
                </div>
            </div>

            <div className="doe-method">
                <div className="doe-method-main">
          <span>
            TASARIM YÖNTEMİ
          </span>

                    <strong>
                        Stratified Latin
                        Hypercube
                    </strong>

                    <small>
                        Her parametrenin
                        aralığı eşit
                        katmanlara ayrılır
                        ve katmanlar
                        deterministik
                        permütasyonlarla
                        eşleştirilir.
                    </small>
                </div>

                <div className="doe-method-target">
          <span>
            AKTİF HEDEF
          </span>

                    <strong>
                        {
                            parameters.cellType
                        }
                    </strong>
                </div>
            </div>

            <div className="doe-config">
                <div>
          <span className="doe-config-label">
            DENEY SAYISI
          </span>

                    <div className="doe-size-buttons">
                        {(
                            [
                                8,
                                12,
                                16,
                                24,
                                32,
                            ] as DesignSize[]
                        ).map(
                            (size) => (
                                <button
                                    type="button"
                                    key={size}
                                    className={
                                        designSize ===
                                        size
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setDesignSize(
                                            size
                                        )
                                    }
                                >
                                    {size}
                                </button>
                            )
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    className="doe-generate-button"
                    onClick={
                        generateDesign
                    }
                >
                    ◈ Deney Planı
                    Oluştur
                </button>
            </div>

            <div className="doe-ranges">
                <article>
          <span>
            PARTICLE SIZE
          </span>

                    <strong>
                        30–180
                    </strong>

                    <small>
                        nm
                    </small>
                </article>

                <article>
          <span>
            ZETA POTENTIAL
          </span>

                    <strong>
                        -35 – +20
                    </strong>

                    <small>
                        mV
                    </small>
                </article>

                <article>
          <span>
            LIGAND DENSITY
          </span>

                    <strong>
                        20–100
                    </strong>

                    <small>
                        %
                    </small>
                </article>

                <article>
          <span>
            DRUG DOSE
          </span>

                    <strong>
                        0.1–1.5
                    </strong>

                    <small>
                        mg/mL
                    </small>
                </article>
            </div>

            {!generated && (
                <div className="doe-empty">
                    <div className="doe-empty-icon">
                        ◈
                    </div>

                    <strong>
                        Deney matrisi
                        oluşturulmadı
                    </strong>

                    <p>
                        Deney sayısını
                        seçtikten sonra DOE
                        motorunu çalıştır.
                        Sistem parametre
                        uzayını dengeli
                        biçimde örnekleyen
                        sanal koşullar
                        oluşturacak.
                    </p>
                </div>
            )}

            {generated &&
                experiments.length >
                0 && (
                    <>
                        <div className="doe-summary">
                            <article>
                <span>
                  RUNS
                </span>

                                <strong>
                                    {
                                        experiments.length
                                    }
                                </strong>

                                <small>
                                    designed
                                    experiments
                                </small>
                            </article>

                            <article>
                <span>
                  AVG SCORE
                </span>

                                <strong>
                                    {statistics.averageScore.toFixed(
                                        1
                                    )}
                                </strong>

                                <small>
                                    / 100
                                </small>
                            </article>

                            <article>
                <span>
                  AVG BINDING
                </span>

                                <strong>
                                    {statistics.averageBinding.toFixed(
                                        1
                                    )}
                                </strong>

                                <small>
                                    simulation
                                </small>
                            </article>

                            <article>
                <span>
                  AVG SPECIFICITY
                </span>

                                <strong>
                                    %
                                    {statistics.averageSpecificity.toFixed(
                                        1
                                    )}
                                </strong>

                                <small>
                                    simulation
                                </small>
                            </article>

                            <article>
                <span>
                  AVG RELEASE
                </span>

                                <strong>
                                    %
                                    {statistics.averageRelease.toFixed(
                                        1
                                    )}
                                </strong>

                                <small>
                                    simulation
                                </small>
                            </article>

                            <article>
                <span>
                  AVG TOXICITY
                </span>

                                <strong>
                                    {statistics.averageToxicity.toFixed(
                                        1
                                    )}
                                </strong>

                                <small>
                                    simulated risk
                                </small>
                            </article>
                        </div>

                        <div className="doe-highlights">
                            {highestScore && (
                                <article>
                  <span>
                    HIGHEST
                    COMPOSITE SCORE
                  </span>

                                    <strong>
                                        Run #
                                        {
                                            highestScore.run
                                        }
                                    </strong>

                                    <b>
                                        {highestScore.score.toFixed(
                                            1
                                        )}
                                    </b>
                                </article>
                            )}

                            {highestBinding && (
                                <article>
                  <span>
                    HIGHEST
                    BINDING
                  </span>

                                    <strong>
                                        Run #
                                        {
                                            highestBinding.run
                                        }
                                    </strong>

                                    <b>
                                        {
                                            highestBinding
                                                .metrics
                                                .bindingScore
                                        }
                                    </b>
                                </article>
                            )}

                            {lowestToxicity && (
                                <article>
                  <span>
                    LOWEST
                    SIMULATED
                    TOXICITY
                  </span>

                                    <strong>
                                        Run #
                                        {
                                            lowestToxicity.run
                                        }
                                    </strong>

                                    <b>
                                        {
                                            lowestToxicity
                                                .metrics
                                                .toxicityRisk
                                        }
                                    </b>
                                </article>
                            )}
                        </div>

                        <div className="doe-workspace">
                            <div className="doe-table-card">
                                <div className="doe-table-heading">
                                    <div>
                    <span>
                      DESIGN MATRIX
                    </span>

                                        <strong>
                                            Deney
                                            Koşulları
                                        </strong>
                                    </div>

                                    <small>
                                        {
                                            experiments.length
                                        }
                                        {" RUNS"}
                                    </small>
                                </div>

                                <div className="doe-table-wrapper">
                                    <table className="doe-table">
                                        <thead>
                                        <tr>
                                            <th>
                                                Run
                                            </th>

                                            <th>
                                                Size
                                            </th>

                                            <th>
                                                Zeta
                                            </th>

                                            <th>
                                                Ligand
                                            </th>

                                            <th>
                                                Dose
                                            </th>

                                            <th>
                                                Score
                                            </th>
                                        </tr>
                                        </thead>

                                        <tbody>
                                        {experiments.map(
                                            (
                                                experiment
                                            ) => (
                                                <tr
                                                    key={
                                                        experiment.id
                                                    }
                                                    className={
                                                        selectedId ===
                                                        experiment.id
                                                            ? "active"
                                                            : ""
                                                    }
                                                    onClick={() =>
                                                        setSelectedId(
                                                            experiment.id
                                                        )
                                                    }
                                                >
                                                    <td>
                                                        #
                                                        {
                                                            experiment.run
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            experiment
                                                                .parameters
                                                                .particleSize
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            experiment
                                                                .parameters
                                                                .zetaPotential
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            experiment
                                                                .parameters
                                                                .ligandDensity
                                                        }
                                                        %
                                                    </td>

                                                    <td>
                                                        {
                                                            experiment
                                                                .parameters
                                                                .drugDose
                                                        }
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {experiment.score.toFixed(
                                                                1
                                                            )}
                                                        </strong>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {selectedExperiment && (
                                <div className="doe-detail">
                                    <div className="doe-detail-heading">
                                        <div>
                      <span>
                        SELECTED RUN
                      </span>

                                            <h4>
                                                Run #
                                                {
                                                    selectedExperiment.run
                                                }
                                            </h4>

                                            <p>
                                                {
                                                    selectedExperiment
                                                        .parameters
                                                        .cellType
                                                }
                                            </p>
                                        </div>

                                        <div className="doe-score">
                      <span>
                        SCORE
                      </span>

                                            <strong>
                                                {selectedExperiment.score.toFixed(
                                                    1
                                                )}
                                            </strong>

                                            <small>
                                                /100
                                            </small>
                                        </div>
                                    </div>

                                    <div className="doe-subtitle">
                                        FORMÜLASYON
                                    </div>

                                    <div className="doe-detail-grid">
                                        <article>
                      <span>
                        Boyut
                      </span>

                                            <strong>
                                                {
                                                    selectedExperiment
                                                        .parameters
                                                        .particleSize
                                                }
                                            </strong>

                                            <small>
                                                nm
                                            </small>
                                        </article>

                                        <article>
                      <span>
                        Zeta
                      </span>

                                            <strong>
                                                {
                                                    selectedExperiment
                                                        .parameters
                                                        .zetaPotential
                                                }
                                            </strong>

                                            <small>
                                                mV
                                            </small>
                                        </article>

                                        <article>
                      <span>
                        Ligand
                      </span>

                                            <strong>
                                                %
                                                {
                                                    selectedExperiment
                                                        .parameters
                                                        .ligandDensity
                                                }
                                            </strong>
                                        </article>

                                        <article>
                      <span>
                        Doz
                      </span>

                                            <strong>
                                                {
                                                    selectedExperiment
                                                        .parameters
                                                        .drugDose
                                                }
                                            </strong>

                                            <small>
                                                mg/mL
                                            </small>
                                        </article>
                                    </div>

                                    <div className="doe-subtitle">
                                        SİMÜLASYON
                                        SONUÇLARI
                                    </div>

                                    <div className="doe-detail-grid doe-output-grid">
                                        <article>
                      <span>
                        Bağlanma
                      </span>

                                            <strong>
                                                {
                                                    selectedExperiment
                                                        .metrics
                                                        .bindingScore
                                                }
                                            </strong>
                                        </article>

                                        <article>
                      <span>
                        Özgüllük
                      </span>

                                            <strong>
                                                %
                                                {
                                                    selectedExperiment
                                                        .metrics
                                                        .specificity
                                                }
                                            </strong>
                                        </article>

                                        <article>
                      <span>
                        Salınım
                      </span>

                                            <strong>
                                                %
                                                {
                                                    selectedExperiment
                                                        .metrics
                                                        .releaseEfficiency
                                                }
                                            </strong>
                                        </article>

                                        <article>
                      <span>
                        Toksisite
                      </span>

                                            <strong>
                                                {
                                                    selectedExperiment
                                                        .metrics
                                                        .toxicityRisk
                                                }
                                            </strong>
                                        </article>
                                    </div>

                                    <button
                                        type="button"
                                        className="doe-load-button"
                                        onClick={() =>
                                            onLoad({
                                                ...selectedExperiment.parameters,
                                            })
                                        }
                                    >
                                        → Bu Run'ı
                                        Laboratuvara
                                        Aktar
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="doe-actions">
                            <div>
                <span>
                  EXPERIMENT PLAN
                </span>

                                <strong>
                                    {
                                        experiments.length
                                    }
                                    {" koşullu deney matrisi hazır"}
                                </strong>

                                <p>
                                    Tüm koşulları
                                    deney geçmişine
                                    ayrı kayıtlar
                                    olarak
                                    ekleyebilirsin.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="doe-save-button"
                                onClick={
                                    savePlan
                                }
                            >
                                {saved
                                    ? "✓ Plan Kaydedildi"
                                    : "＋ Tüm Planı Deney Geçmişine Kaydet"}
                            </button>
                        </div>
                    </>
                )}

            <div className="doe-footer-note">
        <span>
          i
        </span>

                <p>
                    DOE modülü gerçek
                    laboratuvar deneylerinin
                    yerine geçmez. Oluşturulan
                    tasarım matrisi ve çıktılar
                    BioTarget AI hesaplamalı
                    simülasyon modeline aittir.
                    Buradaki skorlar klinik
                    etkinlik veya güvenlilik
                    kanıtı değildir.
                </p>
            </div>
        </div>
    );
}

export default ExperimentDesign;