import { useMemo, useState } from "react";
import type { ExperimentRecord } from "./ExperimentHistory";

import "./ParetoOptimization.css";

interface Props {
    experiments: ExperimentRecord[];
    onLoad: (parameters: ExperimentRecord["parameters"]) => void;
}

type ObjectiveKey =
    | "binding"
    | "specificity"
    | "release"
    | "toxicity";

interface ObjectiveState {
    binding: boolean;
    specificity: boolean;
    release: boolean;
    toxicity: boolean;
}

interface ParetoResult {
    experiment: ExperimentRecord;
    isPareto: boolean;
    dominatedBy: number;
    dominates: number;
    compositeScore: number;
}

const normalize = (
    value: number,
    minimum: number,
    maximum: number
) => {
    if (maximum === minimum) {
        return 1;
    }

    return (
        (value - minimum) /
        (maximum - minimum)
    );
};

function ParetoOptimization({
                                experiments,
                                onLoad,
                            }: Props) {
    const [objectives, setObjectives] =
        useState<ObjectiveState>({
            binding: true,
            specificity: true,
            release: true,
            toxicity: true,
        });

    const [showAll, setShowAll] = useState(false);

    const activeObjectiveCount =
        Object.values(objectives).filter(Boolean).length;

    const toggleObjective = (
        key: ObjectiveKey
    ) => {
        setObjectives((previous) => {
            const activeCount =
                Object.values(previous).filter(Boolean).length;

            if (
                previous[key] &&
                activeCount === 2
            ) {
                return previous;
            }

            return {
                ...previous,
                [key]: !previous[key],
            };
        });
    };

    const results = useMemo<ParetoResult[]>(() => {
        if (experiments.length === 0) {
            return [];
        }

        const dominates = (
            a: ExperimentRecord,
            b: ExperimentRecord
        ) => {
            const comparisons: {
                a: number;
                b: number;
                maximize: boolean;
            }[] = [];

            if (objectives.binding) {
                comparisons.push({
                    a: a.metrics.bindingScore,
                    b: b.metrics.bindingScore,
                    maximize: true,
                });
            }

            if (objectives.specificity) {
                comparisons.push({
                    a: a.metrics.specificity,
                    b: b.metrics.specificity,
                    maximize: true,
                });
            }

            if (objectives.release) {
                comparisons.push({
                    a: a.metrics.releaseEfficiency,
                    b: b.metrics.releaseEfficiency,
                    maximize: true,
                });
            }

            if (objectives.toxicity) {
                comparisons.push({
                    a: a.metrics.toxicityRisk,
                    b: b.metrics.toxicityRisk,
                    maximize: false,
                });
            }

            const noWorse =
                comparisons.every((comparison) =>
                    comparison.maximize
                        ? comparison.a >= comparison.b
                        : comparison.a <= comparison.b
                );

            const strictlyBetter =
                comparisons.some((comparison) =>
                    comparison.maximize
                        ? comparison.a > comparison.b
                        : comparison.a < comparison.b
                );

            return noWorse && strictlyBetter;
        };

        const bindingValues =
            experiments.map(
                (experiment) =>
                    experiment.metrics.bindingScore
            );

        const specificityValues =
            experiments.map(
                (experiment) =>
                    experiment.metrics.specificity
            );

        const releaseValues =
            experiments.map(
                (experiment) =>
                    experiment.metrics.releaseEfficiency
            );

        const toxicityValues =
            experiments.map(
                (experiment) =>
                    experiment.metrics.toxicityRisk
            );

        const minBinding =
            Math.min(...bindingValues);

        const maxBinding =
            Math.max(...bindingValues);

        const minSpecificity =
            Math.min(...specificityValues);

        const maxSpecificity =
            Math.max(...specificityValues);

        const minRelease =
            Math.min(...releaseValues);

        const maxRelease =
            Math.max(...releaseValues);

        const minToxicity =
            Math.min(...toxicityValues);

        const maxToxicity =
            Math.max(...toxicityValues);

        const getCompositeScore = (
            experiment: ExperimentRecord
        ) => {
            const values: number[] = [];

            if (objectives.binding) {
                values.push(
                    normalize(
                        experiment.metrics.bindingScore,
                        minBinding,
                        maxBinding
                    )
                );
            }

            if (objectives.specificity) {
                values.push(
                    normalize(
                        experiment.metrics.specificity,
                        minSpecificity,
                        maxSpecificity
                    )
                );
            }

            if (objectives.release) {
                values.push(
                    normalize(
                        experiment.metrics.releaseEfficiency,
                        minRelease,
                        maxRelease
                    )
                );
            }

            if (objectives.toxicity) {
                const normalizedRisk =
                    normalize(
                        experiment.metrics.toxicityRisk,
                        minToxicity,
                        maxToxicity
                    );

                values.push(
                    1 - normalizedRisk
                );
            }

            if (values.length === 0) {
                return 0;
            }

            return (
                values.reduce(
                    (sum, value) =>
                        sum + value,
                    0
                ) / values.length
            );
        };

        return experiments
            .map((experiment) => {
                let dominatedBy = 0;
                let dominatesCount = 0;

                experiments.forEach(
                    (otherExperiment) => {
                        if (
                            experiment.id ===
                            otherExperiment.id
                        ) {
                            return;
                        }

                        if (
                            dominates(
                                otherExperiment,
                                experiment
                            )
                        ) {
                            dominatedBy++;
                        }

                        if (
                            dominates(
                                experiment,
                                otherExperiment
                            )
                        ) {
                            dominatesCount++;
                        }
                    }
                );

                return {
                    experiment,
                    isPareto:
                        dominatedBy === 0,
                    dominatedBy,
                    dominates:
                    dominatesCount,
                    compositeScore:
                        getCompositeScore(
                            experiment
                        ),
                };
            })
            .sort((a, b) => {
                if (
                    a.isPareto !==
                    b.isPareto
                ) {
                    return a.isPareto
                        ? -1
                        : 1;
                }

                return (
                    b.compositeScore -
                    a.compositeScore
                );
            });
    }, [experiments, objectives]);

    const paretoResults =
        useMemo(
            () =>
                results.filter(
                    (result) =>
                        result.isPareto
                ),
            [results]
        );

    const displayedResults =
        showAll
            ? results
            : paretoResults;

    const strongestBalanced =
        useMemo(() => {
            if (
                paretoResults.length ===
                0
            ) {
                return null;
            }

            return [...paretoResults].sort(
                (a, b) =>
                    b.compositeScore -
                    a.compositeScore
            )[0];
        }, [paretoResults]);

    const paretoPercentage =
        experiments.length === 0
            ? 0
            : Math.round(
                (paretoResults.length /
                    experiments.length) *
                100
            );

    return (
        <div className="pareto-panel">
            <div className="pareto-header">
                <div>
                    <span className="pareto-kicker">
                        MULTI-OBJECTIVE SEARCH
                    </span>

                    <h3>
                        Pareto Frontier
                    </h3>

                    <p>
                        Birden fazla simülasyon hedefini aynı
                        anda değerlendirerek başka bir kayıt
                        tarafından seçili hedeflerin tamamında
                        geçilemeyen formülasyonları belirler.
                    </p>
                </div>

                <div className="pareto-status">
                    <span />
                    OPTIMIZATION ACTIVE
                </div>
            </div>

            {experiments.length < 2 ? (
                <div className="pareto-empty">
                    <div className="pareto-empty-icon">
                        ◇
                    </div>

                    <strong>
                        Pareto analizi için en az 2 deney gerekiyor
                    </strong>

                    <p>
                        Farklı parametrelerle deneyler kaydet.
                        Kayıtlar oluştuğunda çok amaçlı
                        karşılaştırma otomatik başlayacak.
                    </p>

                    <div className="pareto-empty-progress">
                        <div>
                            <span>
                                Dataset
                            </span>

                            <strong>
                                {experiments.length}/2
                            </strong>
                        </div>

                        <div className="pareto-progress-track">
                            <div
                                style={{
                                    width: `${Math.min(
                                        100,
                                        (experiments.length / 2) *
                                        100
                                    )}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="pareto-objectives">
                        <div className="pareto-objective-heading">
                            <div>
                                <span>
                                    OPTİMİZASYON HEDEFLERİ
                                </span>

                                <small>
                                    En az iki hedef aktif kalmalıdır.
                                </small>
                            </div>

                            <strong>
                                {activeObjectiveCount}
                                /4 AKTİF
                            </strong>
                        </div>

                        <div className="pareto-objective-grid">
                            <button
                                type="button"
                                className={
                                    objectives.binding
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    toggleObjective(
                                        "binding"
                                    )
                                }
                            >
                                <span className="pareto-objective-icon">
                                    ◎
                                </span>

                                <div>
                                    <strong>
                                        Bağlanma
                                    </strong>

                                    <small>
                                        Maksimize et
                                    </small>
                                </div>

                                <span className="pareto-switch">
                                    <i />
                                </span>
                            </button>

                            <button
                                type="button"
                                className={
                                    objectives.specificity
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    toggleObjective(
                                        "specificity"
                                    )
                                }
                            >
                                <span className="pareto-objective-icon">
                                    ◉
                                </span>

                                <div>
                                    <strong>
                                        Özgüllük
                                    </strong>

                                    <small>
                                        Maksimize et
                                    </small>
                                </div>

                                <span className="pareto-switch">
                                    <i />
                                </span>
                            </button>

                            <button
                                type="button"
                                className={
                                    objectives.release
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    toggleObjective(
                                        "release"
                                    )
                                }
                            >
                                <span className="pareto-objective-icon">
                                    ↗
                                </span>

                                <div>
                                    <strong>
                                        Salınım
                                    </strong>

                                    <small>
                                        Maksimize et
                                    </small>
                                </div>

                                <span className="pareto-switch">
                                    <i />
                                </span>
                            </button>

                            <button
                                type="button"
                                className={
                                    objectives.toxicity
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    toggleObjective(
                                        "toxicity"
                                    )
                                }
                            >
                                <span className="pareto-objective-icon">
                                    ↓
                                </span>

                                <div>
                                    <strong>
                                        Toksisite
                                    </strong>

                                    <small>
                                        Minimize et
                                    </small>
                                </div>

                                <span className="pareto-switch">
                                    <i />
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="pareto-summary-grid">
                        <article>
                            <span>
                                TOPLAM DENEY
                            </span>

                            <strong>
                                {experiments.length}
                            </strong>

                            <small>
                                analiz edilen kayıt
                            </small>
                        </article>

                        <article>
                            <span>
                                PARETO SETİ
                            </span>

                            <strong>
                                {paretoResults.length}
                            </strong>

                            <small>
                                baskılanmayan kayıt
                            </small>
                        </article>

                        <article>
                            <span>
                                FRONTIER ORANI
                            </span>

                            <strong>
                                %{paretoPercentage}
                            </strong>

                            <small>
                                dataset içindeki pay
                            </small>
                        </article>

                        <article>
                            <span>
                                AKTİF HEDEF
                            </span>

                            <strong>
                                {activeObjectiveCount}
                            </strong>

                            <small>
                                eş zamanlı amaç
                            </small>
                        </article>
                    </div>

                    {strongestBalanced && (
                        <div className="pareto-featured">
                            <div className="pareto-featured-icon">
                                ✦
                            </div>

                            <div className="pareto-featured-copy">
                                <span>
                                    SEÇİLİ HEDEFLERDE EN YÜKSEK
                                    NORMALİZE KOMPOZİT SKOR
                                </span>

                                <h4>
                                    {strongestBalanced.experiment.name ||
                                        "İsimsiz Deney"}
                                </h4>

                                <p>
                                    {
                                        strongestBalanced.experiment
                                            .parameters.cellType
                                    }
                                </p>
                            </div>

                            <div className="pareto-featured-score">
                                <span>
                                    SKOR
                                </span>

                                <strong>
                                    {(
                                        strongestBalanced.compositeScore *
                                        100
                                    ).toFixed(1)}
                                </strong>

                                <small>
                                    / 100
                                </small>
                            </div>
                        </div>
                    )}

                    <div className="pareto-result-header">
                        <div>
                            <span>
                                FRONTIER RESULTS
                            </span>

                            <strong>
                                {showAll
                                    ? "Tüm deneyler"
                                    : "Pareto-optimal deneyler"}
                            </strong>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setShowAll(
                                    (previous) =>
                                        !previous
                                )
                            }
                        >
                            {showAll
                                ? "Sadece Frontier"
                                : "Tümünü Göster"}
                        </button>
                    </div>

                    <div className="pareto-results">
                        {displayedResults.map(
                            (
                                result,
                                index
                            ) => (
                                <article
                                    className={`pareto-result-card ${
                                        result.isPareto
                                            ? "frontier"
                                            : "dominated"
                                    }`}
                                    key={
                                        result.experiment.id
                                    }
                                >
                                    <div className="pareto-rank">
                                        <span>
                                            #
                                            {String(
                                                index + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                        </span>

                                        {result.isPareto ? (
                                            <strong>
                                                PARETO
                                            </strong>
                                        ) : (
                                            <small>
                                                DOMINATED
                                            </small>
                                        )}
                                    </div>

                                    <div className="pareto-result-main">
                                        <div className="pareto-result-title">
                                            <div>
                                                <h4>
                                                    {result.experiment
                                                            .favorite &&
                                                        "★ "}

                                                    {result.experiment
                                                            .name ||
                                                        "İsimsiz Deney"}
                                                </h4>

                                                <p>
                                                    {
                                                        result.experiment
                                                            .parameters
                                                            .cellType
                                                    }
                                                </p>
                                            </div>

                                            <div className="pareto-score">
                                                <span>
                                                    BALANCE SCORE
                                                </span>

                                                <strong>
                                                    {(
                                                        result.compositeScore *
                                                        100
                                                    ).toFixed(1)}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="pareto-metrics">
                                            <div
                                                className={
                                                    objectives.binding
                                                        ? "active"
                                                        : ""
                                                }
                                            >
                                                <span>
                                                    Bağlanma
                                                </span>

                                                <strong>
                                                    {
                                                        result.experiment
                                                            .metrics
                                                            .bindingScore
                                                    }
                                                </strong>
                                            </div>

                                            <div
                                                className={
                                                    objectives.specificity
                                                        ? "active"
                                                        : ""
                                                }
                                            >
                                                <span>
                                                    Özgüllük
                                                </span>

                                                <strong>
                                                    %
                                                    {
                                                        result.experiment
                                                            .metrics
                                                            .specificity
                                                    }
                                                </strong>
                                            </div>

                                            <div
                                                className={
                                                    objectives.release
                                                        ? "active"
                                                        : ""
                                                }
                                            >
                                                <span>
                                                    Salınım
                                                </span>

                                                <strong>
                                                    %
                                                    {
                                                        result.experiment
                                                            .metrics
                                                            .releaseEfficiency
                                                    }
                                                </strong>
                                            </div>

                                            <div
                                                className={
                                                    objectives.toxicity
                                                        ? "active"
                                                        : ""
                                                }
                                            >
                                                <span>
                                                    Toksisite
                                                </span>

                                                <strong>
                                                    {
                                                        result.experiment
                                                            .metrics
                                                            .toxicityRisk
                                                    }
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="pareto-result-footer">
                                            <div>
                                                <span>
                                                    Baskıladığı
                                                </span>

                                                <strong>
                                                    {
                                                        result.dominates
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Baskılayan
                                                </span>

                                                <strong>
                                                    {
                                                        result.dominatedBy
                                                    }
                                                </strong>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onLoad(
                                                        result.experiment
                                                            .parameters
                                                    )
                                                }
                                            >
                                                Formülasyonu Yükle
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            )
                        )}
                    </div>

                    <div className="pareto-explanation">
                        <div>
                            <strong>
                                Pareto-optimal ne demek?
                            </strong>

                            <p>
                                Seçili hedefler dikkate alındığında,
                                bir Pareto kaydını en az bir hedefte
                                kötüleştirmeden diğer hedeflerin
                                tamamında daha iyi hale getiren kayıt
                                bulunmadığı anlamına gelir.
                            </p>
                        </div>

                        <div>
                            <strong>
                                Balance Score ne?
                            </strong>

                            <p>
                                Aktif hedefler dataset içindeki
                                minimum ve maksimum değerlere göre
                                0–1 aralığına normalize edilir.
                                Toksisite ters çevrilir ve aktif
                                hedeflerin eşit ağırlıklı ortalaması
                                gösterilir.
                            </p>
                        </div>
                    </div>
                </>
            )}

            <div className="pareto-disclaimer">
                <span>
                    i
                </span>

                <p>
                    Pareto analizi yalnızca BioTarget AI
                    simülasyon kayıtları arasındaki hesaplamalı
                    karşılaştırmayı gösterir. Klinik etkinlik,
                    güvenlilik veya tedavi üstünlüğü anlamına
                    gelmez.
                </p>
            </div>
        </div>
    );
}

export default ParetoOptimization;