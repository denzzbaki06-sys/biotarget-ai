import { useMemo, useState } from "react";
import type { SimulationParameters } from "../types/simulation";
import { calculateMetrics } from "../engine/predictionEngine";
import "./VirtualScreening.css";

interface Props {
    currentParameters: SimulationParameters;
    onLoad: (parameters: SimulationParameters) => void;
}

interface Candidate {
    id: string;
    parameters: SimulationParameters;
    metrics: ReturnType<typeof calculateMetrics>;
    score: number;
}

type ScreeningSize = 25 | 50 | 100 | 200;

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

const randomBetween = (
    minimum: number,
    maximum: number
) => {
    return (
        minimum +
        Math.random() *
        (maximum - minimum)
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

function VirtualScreening({
                              currentParameters,
                              onLoad,
                          }: Props) {
    const [screeningSize, setScreeningSize] =
        useState<ScreeningSize>(50);

    const [candidates, setCandidates] =
        useState<Candidate[]>([]);

    const [isRunning, setIsRunning] =
        useState(false);

    const [progress, setProgress] =
        useState(0);

    const [selectedId, setSelectedId] =
        useState<string | null>(null);

    const calculateCandidateScore = (
        metrics: ReturnType<typeof calculateMetrics>
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

        const toxicity =
            1 -
            clamp(
                metrics.toxicityRisk,
                0,
                100
            ) /
            100;

        return (
            (
                binding * 0.3 +
                specificity * 0.3 +
                release * 0.25 +
                toxicity * 0.15
            ) *
            100
        );
    };

    const generateCandidate = (
        index: number
    ): Candidate => {
        const parameters: SimulationParameters = {
            cellType:
            currentParameters.cellType,

            particleSize:
                round(
                    randomBetween(
                        30,
                        180
                    )
                ),

            zetaPotential:
                round(
                    randomBetween(
                        -35,
                        20
                    )
                ),

            ligandDensity:
                round(
                    randomBetween(
                        20,
                        100
                    )
                ),

            drugDose:
                round(
                    randomBetween(
                        0.1,
                        1.5
                    ),
                    2
                ),
        };

        const metrics =
            calculateMetrics(
                parameters
            );

        return {
            id: `virtual-${Date.now()}-${index}-${Math.random()}`,

            parameters,

            metrics,

            score:
                calculateCandidateScore(
                    metrics
                ),
        };
    };

    const runScreening = () => {
        if (isRunning) {
            return;
        }

        setIsRunning(true);
        setProgress(0);
        setCandidates([]);
        setSelectedId(null);

        const generated:
            Candidate[] = [];

        let completed = 0;

        const batchSize =
            Math.max(
                1,
                Math.ceil(
                    screeningSize / 20
                )
            );

        const runBatch = () => {
            const remaining =
                screeningSize -
                completed;

            const amount =
                Math.min(
                    batchSize,
                    remaining
                );

            for (
                let i = 0;
                i < amount;
                i++
            ) {
                generated.push(
                    generateCandidate(
                        completed + i
                    )
                );
            }

            completed += amount;

            setProgress(
                Math.round(
                    (completed /
                        screeningSize) *
                    100
                )
            );

            if (
                completed <
                screeningSize
            ) {
                window.setTimeout(
                    runBatch,
                    30
                );

                return;
            }

            const sorted =
                [...generated].sort(
                    (a, b) =>
                        b.score -
                        a.score
                );

            setCandidates(
                sorted
            );

            if (
                sorted.length >
                0
            ) {
                setSelectedId(
                    sorted[0].id
                );
            }

            setProgress(100);

            window.setTimeout(
                () => {
                    setIsRunning(
                        false
                    );
                },
                200
            );
        };

        runBatch();
    };

    const selectedCandidate =
        useMemo(() => {
            return (
                candidates.find(
                    (candidate) =>
                        candidate.id ===
                        selectedId
                ) ?? null
            );
        }, [
            candidates,
            selectedId,
        ]);

    const statistics =
        useMemo(() => {
            if (
                candidates.length ===
                0
            ) {
                return {
                    averageScore: 0,
                    averageBinding: 0,
                    averageSpecificity: 0,
                    averageRelease: 0,
                    averageToxicity: 0,
                };
            }

            const total =
                candidates.reduce(
                    (
                        accumulator,
                        candidate
                    ) => {
                        accumulator.score +=
                            candidate.score;

                        accumulator.binding +=
                            candidate.metrics.bindingScore;

                        accumulator.specificity +=
                            candidate.metrics.specificity;

                        accumulator.release +=
                            candidate.metrics.releaseEfficiency;

                        accumulator.toxicity +=
                            candidate.metrics.toxicityRisk;

                        return accumulator;
                    },
                    {
                        score: 0,
                        binding: 0,
                        specificity: 0,
                        release: 0,
                        toxicity: 0,
                    }
                );

            return {
                averageScore:
                    total.score /
                    candidates.length,

                averageBinding:
                    total.binding /
                    candidates.length,

                averageSpecificity:
                    total.specificity /
                    candidates.length,

                averageRelease:
                    total.release /
                    candidates.length,

                averageToxicity:
                    total.toxicity /
                    candidates.length,
            };
        }, [candidates]);

    const topCandidates =
        candidates.slice(
            0,
            10
        );

    return (
        <div className="screening-panel">
            <div className="screening-header">
                <div>
          <span className="screening-kicker">
            IN-SILICO CANDIDATE SEARCH
          </span>

                    <h3>
                        Virtual Screening
                    </h3>

                    <p>
                        Seçili hedef hücre için farklı nanopartikül
                        parametre kombinasyonları oluşturur,
                        simülasyon motoruyla değerlendirir ve
                        hesaplanan kompozit skora göre sıralar.
                    </p>
                </div>

                <div className="screening-engine-status">
                    <span />

                    SCREENING ENGINE
                </div>
            </div>

            <div className="screening-config">
                <div className="screening-target">
          <span>
            AKTİF HEDEF
          </span>

                    <strong>
                        {
                            currentParameters.cellType
                        }
                    </strong>

                    <small>
                        Sanal adayların tamamı bu hedef hücre
                        üzerinde hesaplanır.
                    </small>
                </div>

                <div className="screening-size">
          <span>
            ADAY SAYISI
          </span>

                    <div className="screening-size-buttons">
                        {(
                            [
                                25,
                                50,
                                100,
                                200,
                            ] as ScreeningSize[]
                        ).map(
                            (size) => (
                                <button
                                    type="button"
                                    key={size}
                                    className={
                                        screeningSize ===
                                        size
                                            ? "active"
                                            : ""
                                    }
                                    disabled={
                                        isRunning
                                    }
                                    onClick={() =>
                                        setScreeningSize(
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
                    className="screening-run-button"
                    disabled={isRunning}
                    onClick={runScreening}
                >
                    {isRunning
                        ? "◌ Screening..."
                        : "▶ Screening Başlat"}
                </button>
            </div>

            <div className="screening-range-grid">
                <article>
          <span>
            PARTİKÜL BOYUTU
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
            ZETA POTANSİYELİ
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
            LİGAND YOĞUNLUĞU
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
            İLAÇ DOZU
          </span>

                    <strong>
                        0.1–1.5
                    </strong>

                    <small>
                        mg/mL
                    </small>
                </article>
            </div>

            {isRunning && (
                <div className="screening-progress">
                    <div className="screening-progress-top">
                        <div>
                            <span className="screening-pulse" />

                            <strong>
                                Sanal formülasyonlar değerlendiriliyor
                            </strong>
                        </div>

                        <span>
              %{progress}
            </span>
                    </div>

                    <div className="screening-progress-track">
                        <div
                            style={{
                                width:
                                    `${progress}%`,
                            }}
                        />
                    </div>

                    <small>
                        {Math.round(
                            screeningSize *
                            (progress / 100)
                        )}
                        {" / "}
                        {screeningSize}
                        {" aday"}
                    </small>
                </div>
            )}

            {!isRunning &&
                candidates.length ===
                0 && (
                    <div className="screening-empty">
                        <div className="screening-empty-icon">
                            ✦
                        </div>

                        <strong>
                            Screening henüz çalıştırılmadı
                        </strong>

                        <p>
                            Aday sayısını seçip screening motorunu
                            başlattığında farklı parametre
                            kombinasyonları otomatik oluşturulacak.
                        </p>
                    </div>
                )}

            {!isRunning &&
                candidates.length >
                0 && (
                    <>
                        <div className="screening-summary">
                            <article>
                <span>
                  TARAMA
                </span>

                                <strong>
                                    {
                                        candidates.length
                                    }
                                </strong>

                                <small>
                                    sanal aday
                                </small>
                            </article>

                            <article>
                <span>
                  ORT. SKOR
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
                  ORT. BAĞLANMA
                </span>

                                <strong>
                                    {statistics.averageBinding.toFixed(
                                        1
                                    )}
                                </strong>

                                <small>
                                    simulation score
                                </small>
                            </article>

                            <article>
                <span>
                  ORT. ÖZGÜLLÜK
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
                  ORT. SALINIM
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
                  ORT. TOKSİSİTE
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

                        <div className="screening-workspace">
                            <div className="screening-ranking">
                                <div className="screening-ranking-header">
                                    <div>
                    <span>
                      TOP CANDIDATES
                    </span>

                                        <strong>
                                            İlk 10 Formülasyon
                                        </strong>
                                    </div>

                                    <small>
                                        COMPOSITE SCORE
                                    </small>
                                </div>

                                <div className="screening-ranking-list">
                                    {topCandidates.map(
                                        (
                                            candidate,
                                            index
                                        ) => (
                                            <button
                                                type="button"
                                                key={
                                                    candidate.id
                                                }
                                                className={
                                                    selectedId ===
                                                    candidate.id
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    setSelectedId(
                                                        candidate.id
                                                    )
                                                }
                                            >
                        <span className="screening-rank">
                          #
                            {String(
                                index + 1
                            ).padStart(
                                2,
                                "0"
                            )}
                        </span>

                                                <div className="screening-candidate-name">
                                                    <strong>
                                                        Candidate{" "}
                                                        {String(
                                                            index + 1
                                                        ).padStart(
                                                            2,
                                                            "0"
                                                        )}
                                                    </strong>

                                                    <small>
                                                        {
                                                            candidate
                                                                .parameters
                                                                .particleSize
                                                        }
                                                        {" nm • "}
                                                        {
                                                            candidate
                                                                .parameters
                                                                .zetaPotential
                                                        }
                                                        {" mV"}
                                                    </small>
                                                </div>

                                                <div className="screening-candidate-score">
                                                    <strong>
                                                        {candidate.score.toFixed(
                                                            1
                                                        )}
                                                    </strong>

                                                    <small>
                                                        /100
                                                    </small>
                                                </div>
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            {selectedCandidate && (
                                <div className="screening-detail">
                                    <div className="screening-detail-header">
                                        <div>
                      <span>
                        SELECTED CANDIDATE
                      </span>

                                            <h4>
                                                Virtual Formulation
                                            </h4>

                                            <p>
                                                {
                                                    selectedCandidate
                                                        .parameters
                                                        .cellType
                                                }
                                            </p>
                                        </div>

                                        <div className="screening-main-score">
                      <span>
                        SCORE
                      </span>

                                            <strong>
                                                {selectedCandidate.score.toFixed(
                                                    1
                                                )}
                                            </strong>

                                            <small>
                                                / 100
                                            </small>
                                        </div>
                                    </div>

                                    <div className="screening-detail-title">
                                        FORMÜLASYON
                                    </div>

                                    <div className="screening-parameter-grid">
                                        <article>
                      <span>
                        Boyut
                      </span>

                                            <strong>
                                                {
                                                    selectedCandidate
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
                                                    selectedCandidate
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
                                                    selectedCandidate
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
                                                    selectedCandidate
                                                        .parameters
                                                        .drugDose
                                                }
                                            </strong>

                                            <small>
                                                mg/mL
                                            </small>
                                        </article>
                                    </div>

                                    <div className="screening-detail-title">
                                        SİMÜLASYON ÇIKTILARI
                                    </div>

                                    <div className="screening-metric-grid">
                                        <article>
                      <span>
                        Bağlanma
                      </span>

                                            <strong>
                                                {
                                                    selectedCandidate
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
                                                    selectedCandidate
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
                                                    selectedCandidate
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
                                                    selectedCandidate
                                                        .metrics
                                                        .toxicityRisk
                                                }
                                            </strong>
                                        </article>
                                    </div>

                                    <button
                                        type="button"
                                        className="screening-load-button"
                                        onClick={() =>
                                            onLoad({
                                                ...selectedCandidate.parameters,
                                            })
                                        }
                                    >
                                        → Formülasyonu Laboratuvara Aktar
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="screening-formula">
                            <div>
                <span>
                  COMPOSITE SCORE MODEL
                </span>

                                <strong>
                                    30% Bağlanma + 30% Özgüllük +
                                    25% Salınım + 15% Düşük Toksisite
                                </strong>
                            </div>

                            <p>
                                Skor, simülasyon adaylarını araştırma
                                arayüzünde sıralamak için kullanılan
                                hesaplamalı bir özet metriktir.
                            </p>
                        </div>
                    </>
                )}

            <div className="screening-disclaimer">
        <span>
          i
        </span>

                <p>
                    Virtual Screening gerçek laboratuvar
                    taraması değildir. Adaylar BioTarget AI
                    simülasyon modeli tarafından oluşturulan
                    hesaplamalı formülasyonlardır ve klinik
                    etkinlik veya güvenlilik sonucu olarak
                    yorumlanmamalıdır.
                </p>
            </div>
        </div>
    );
}

export default VirtualScreening;