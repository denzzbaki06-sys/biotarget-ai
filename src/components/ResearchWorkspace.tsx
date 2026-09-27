import { useMemo, useState } from "react";
import type { ExperimentRecord } from "./ExperimentHistory";
import type { SimulationParameters } from "../types/simulation";
import "./ResearchWorkspace.css";

interface Props {
    experiments: ExperimentRecord[];
    parameters: SimulationParameters;
    onLoad: (parameters: SimulationParameters) => void;
}

type WorkspaceFilter =
    | "all"
    | "favorite"
    | "highBinding"
    | "lowToxicity";

const clamp = (
    value: number,
    min: number,
    max: number
) => Math.min(max, Math.max(min, value));

const compositeScore = (
    experiment: ExperimentRecord
) => {
    const binding =
        clamp(
            experiment.metrics.bindingScore,
            0,
            100
        ) / 100;

    const specificity =
        clamp(
            experiment.metrics.specificity,
            0,
            100
        ) / 100;

    const release =
        clamp(
            experiment.metrics.releaseEfficiency,
            0,
            100
        ) / 100;

    const inverseToxicity =
        1 -
        clamp(
            experiment.metrics.toxicityRisk,
            0,
            100
        ) /
        100;

    return (
        (
            binding * 0.3 +
            specificity * 0.3 +
            release * 0.25 +
            inverseToxicity * 0.15
        ) *
        100
    );
};

const average = (values: number[]) => {
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

export default function ResearchWorkspace({
                                              experiments,
                                              parameters,
                                              onLoad,
                                          }: Props) {
    const [filter, setFilter] =
        useState<WorkspaceFilter>("all");

    const [search, setSearch] =
        useState("");

    const analytics = useMemo(() => {
        const total = experiments.length;

        const favorites =
            experiments.filter(
                (experiment) =>
                    experiment.favorite
            );

        const averageBinding =
            average(
                experiments.map(
                    (experiment) =>
                        experiment.metrics.bindingScore
                )
            );

        const averageSpecificity =
            average(
                experiments.map(
                    (experiment) =>
                        experiment.metrics.specificity
                )
            );

        const averageRelease =
            average(
                experiments.map(
                    (experiment) =>
                        experiment.metrics
                            .releaseEfficiency
                )
            );

        const averageToxicity =
            average(
                experiments.map(
                    (experiment) =>
                        experiment.metrics.toxicityRisk
                )
            );

        const ranked =
            experiments
                .map((experiment) => ({
                    experiment,
                    score:
                        compositeScore(experiment),
                }))
                .sort(
                    (a, b) =>
                        b.score - a.score
                );

        const best =
            ranked[0] ?? null;

        const lowestToxicity =
            [...experiments].sort(
                (a, b) =>
                    a.metrics.toxicityRisk -
                    b.metrics.toxicityRisk
            )[0] ?? null;

        const highestBinding =
            [...experiments].sort(
                (a, b) =>
                    b.metrics.bindingScore -
                    a.metrics.bindingScore
            )[0] ?? null;

        const cellTypes =
            Array.from(
                new Set(
                    experiments.map(
                        (experiment) =>
                            experiment.parameters.cellType
                    )
                )
            );

        return {
            total,
            favorites,
            averageBinding,
            averageSpecificity,
            averageRelease,
            averageToxicity,
            ranked,
            best,
            lowestToxicity,
            highestBinding,
            cellTypes,
        };
    }, [experiments]);

    const visibleExperiments =
        useMemo(() => {
            const query =
                search.trim().toLowerCase();

            return experiments
                .filter((experiment) => {
                    const name =
                        experiment.name ??
                        "İsimsiz Deney";

                    const matchesSearch =
                        !query ||
                        name
                            .toLowerCase()
                            .includes(query) ||
                        experiment.parameters.cellType
                            .toLowerCase()
                            .includes(query);

                    if (!matchesSearch) {
                        return false;
                    }

                    if (
                        filter === "favorite"
                    ) {
                        return Boolean(
                            experiment.favorite
                        );
                    }

                    if (
                        filter ===
                        "highBinding"
                    ) {
                        return (
                            experiment.metrics
                                .bindingScore >= 75
                        );
                    }

                    if (
                        filter ===
                        "lowToxicity"
                    ) {
                        return (
                            experiment.metrics
                                .toxicityRisk <= 25
                        );
                    }

                    return true;
                })
                .sort(
                    (a, b) =>
                        compositeScore(b) -
                        compositeScore(a)
                );
        }, [
            experiments,
            filter,
            search,
        ]);

    return (
        <div className="research-workspace">
            <div className="workspace-hero">
                <div>
                    <span className="workspace-kicker">
                        RESEARCH COMMAND CENTER
                    </span>

                    <h3>
                        Research
                        <span> Workspace</span>
                    </h3>

                    <p>
                        Kayıtlı deneyleri,
                        formülasyonları ve
                        hesaplamalı araştırma
                        sonuçlarını tek çalışma
                        alanından incele.
                    </p>
                </div>

                <div className="workspace-system">
                    <div>
                        <span />
                        SYSTEM ONLINE
                    </div>

                    <strong>
                        {analytics.total}
                    </strong>

                    <small>
                        SAVED EXPERIMENTS
                    </small>
                </div>
            </div>

            <div className="workspace-overview">
                <article>
                    <div className="workspace-stat-icon">
                        ◇
                    </div>

                    <div>
                        <span>
                            TOTAL EXPERIMENTS
                        </span>

                        <strong>
                            {analytics.total}
                        </strong>

                        <p>
                            Kayıtlı simülasyon
                            koşulları
                        </p>
                    </div>
                </article>

                <article>
                    <div className="workspace-stat-icon cyan">
                        ◎
                    </div>

                    <div>
                        <span>
                            AVG BINDING
                        </span>

                        <strong>
                            {analytics.averageBinding.toFixed(
                                1
                            )}
                            <small>%</small>
                        </strong>

                        <p>
                            Ortalama bağlanma
                            skoru
                        </p>
                    </div>
                </article>

                <article>
                    <div className="workspace-stat-icon purple">
                        ⬡
                    </div>

                    <div>
                        <span>
                            AVG SPECIFICITY
                        </span>

                        <strong>
                            {analytics.averageSpecificity.toFixed(
                                1
                            )}
                            <small>%</small>
                        </strong>

                        <p>
                            Ortalama hedef
                            özgüllüğü
                        </p>
                    </div>
                </article>

                <article>
                    <div className="workspace-stat-icon green">
                        ★
                    </div>

                    <div>
                        <span>
                            FAVORITES
                        </span>

                        <strong>
                            {
                                analytics.favorites
                                    .length
                            }
                        </strong>

                        <p>
                            Favori deney
                            kayıtları
                        </p>
                    </div>
                </article>
            </div>

            <div className="workspace-command-grid">
                <section className="workspace-active-panel">
                    <div className="workspace-panel-title">
                        <div>
                            <span>
                                ACTIVE LABORATORY
                            </span>

                            <strong>
                                Aktif Formülasyon
                            </strong>
                        </div>

                        <div className="workspace-live">
                            <span />
                            LIVE
                        </div>
                    </div>

                    <div className="workspace-target">
                        <span>
                            TARGET CELL
                        </span>

                        <strong>
                            {parameters.cellType}
                        </strong>
                    </div>

                    <div className="workspace-active-grid">
                        <article>
                            <span>
                                Partikül Boyutu
                            </span>

                            <strong>
                                {parameters.particleSize}
                                <small> nm</small>
                            </strong>
                        </article>

                        <article>
                            <span>
                                Zeta Potansiyeli
                            </span>

                            <strong>
                                {parameters.zetaPotential}
                                <small> mV</small>
                            </strong>
                        </article>

                        <article>
                            <span>
                                Ligand Yoğunluğu
                            </span>

                            <strong>
                                {parameters.ligandDensity}
                                <small>%</small>
                            </strong>
                        </article>

                        <article>
                            <span>
                                İlaç Dozu
                            </span>

                            <strong>
                                {parameters.drugDose}
                                <small>
                                    {" "}
                                    mg/mL
                                </small>
                            </strong>
                        </article>
                    </div>

                    <div className="workspace-module-map">
                        <span>
                            RESEARCH PIPELINE
                        </span>

                        <div>
                            <b>LAB</b>
                            <i>→</i>
                            <b>SCREEN</b>
                            <i>→</i>
                            <b>DOE</b>
                            <i>→</i>
                            <b>VALIDATE</b>
                            <i>→</i>
                            <b>REPORT</b>
                        </div>
                    </div>
                </section>

                <section className="workspace-ranking-panel">
                    <div className="workspace-panel-title">
                        <div>
                            <span>
                                TOP CANDIDATES
                            </span>

                            <strong>
                                Research Ranking
                            </strong>
                        </div>

                        <small>
                            COMPOSITE SCORE
                        </small>
                    </div>

                    {analytics.ranked.length >
                    0 ? (
                        <div className="workspace-ranking-list">
                            {analytics.ranked
                                .slice(0, 5)
                                .map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <button
                                            key={
                                                item
                                                    .experiment
                                                    .id
                                            }
                                            type="button"
                                            onClick={() =>
                                                onLoad(
                                                    item
                                                        .experiment
                                                        .parameters
                                                )
                                            }
                                        >
                                            <span className="workspace-rank">
                                                #
                                                {index + 1}
                                            </span>

                                            <div>
                                                <strong>
                                                    {item
                                                            .experiment
                                                            .name ??
                                                        `Deney ${
                                                            index +
                                                            1
                                                        }`}
                                                </strong>

                                                <small>
                                                    {
                                                        item
                                                            .experiment
                                                            .parameters
                                                            .cellType
                                                    }
                                                </small>
                                            </div>

                                            <em>
                                                {item.score.toFixed(
                                                    1
                                                )}
                                            </em>
                                        </button>
                                    )
                                )}
                        </div>
                    ) : (
                        <div className="workspace-mini-empty">
                            Henüz sıralanacak deney
                            bulunmuyor.
                        </div>
                    )}
                </section>
            </div>

            <div className="workspace-highlight-grid">
                <article>
                    <span className="workspace-highlight-label">
                        BEST BALANCED
                    </span>

                    <div className="workspace-highlight-symbol">
                        ★
                    </div>

                    {analytics.best ? (
                        <>
                            <strong>
                                {analytics.best
                                        .experiment.name ??
                                    "İsimsiz Deney"}
                            </strong>

                            <p>
                                Kompozit skor{" "}
                                <b>
                                    {analytics.best.score.toFixed(
                                        1
                                    )}
                                </b>
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    onLoad(
                                        analytics.best!
                                            .experiment
                                            .parameters
                                    )
                                }
                            >
                                Laboratuvara Aktar
                            </button>
                        </>
                    ) : (
                        <p>
                            Henüz deney yok.
                        </p>
                    )}
                </article>

                <article>
                    <span className="workspace-highlight-label">
                        HIGHEST BINDING
                    </span>

                    <div className="workspace-highlight-symbol cyan">
                        ◎
                    </div>

                    {analytics.highestBinding ? (
                        <>
                            <strong>
                                {analytics
                                        .highestBinding
                                        .name ??
                                    "İsimsiz Deney"}
                            </strong>

                            <p>
                                Bağlanma{" "}
                                <b>
                                    {analytics.highestBinding.metrics.bindingScore.toFixed(
                                        1
                                    )}
                                    %
                                </b>
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    onLoad(
                                        analytics
                                            .highestBinding!
                                            .parameters
                                    )
                                }
                            >
                                Laboratuvara Aktar
                            </button>
                        </>
                    ) : (
                        <p>
                            Henüz deney yok.
                        </p>
                    )}
                </article>

                <article>
                    <span className="workspace-highlight-label">
                        LOWEST TOXICITY
                    </span>

                    <div className="workspace-highlight-symbol green">
                        ↓
                    </div>

                    {analytics.lowestToxicity ? (
                        <>
                            <strong>
                                {analytics
                                        .lowestToxicity
                                        .name ??
                                    "İsimsiz Deney"}
                            </strong>

                            <p>
                                Toksisite{" "}
                                <b>
                                    {analytics.lowestToxicity.metrics.toxicityRisk.toFixed(
                                        1
                                    )}
                                    %
                                </b>
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    onLoad(
                                        analytics
                                            .lowestToxicity!
                                            .parameters
                                    )
                                }
                            >
                                Laboratuvara Aktar
                            </button>
                        </>
                    ) : (
                        <p>
                            Henüz deney yok.
                        </p>
                    )}
                </article>

                <article>
                    <span className="workspace-highlight-label">
                        TARGET COVERAGE
                    </span>

                    <div className="workspace-highlight-symbol purple">
                        ⬡
                    </div>

                    <strong>
                        {
                            analytics.cellTypes
                                .length
                        }{" "}
                        Target
                    </strong>

                    <p>
                        Kayıtlı deneylerdeki
                        farklı hedef hücre
                        grupları.
                    </p>
                </article>
            </div>

            <div className="workspace-explorer">
                <div className="workspace-explorer-header">
                    <div>
                        <span>
                            EXPERIMENT LIBRARY
                        </span>

                        <strong>
                            Research Records
                        </strong>
                    </div>

                    <div className="workspace-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Deney veya hedef hücre ara..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />
                    </div>
                </div>

                <div className="workspace-filter-bar">
                    <button
                        type="button"
                        className={
                            filter === "all"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setFilter("all")
                        }
                    >
                        Tümü
                    </button>

                    <button
                        type="button"
                        className={
                            filter === "favorite"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setFilter(
                                "favorite"
                            )
                        }
                    >
                        ★ Favoriler
                    </button>

                    <button
                        type="button"
                        className={
                            filter ===
                            "highBinding"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setFilter(
                                "highBinding"
                            )
                        }
                    >
                        Binding ≥ 75
                    </button>

                    <button
                        type="button"
                        className={
                            filter ===
                            "lowToxicity"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setFilter(
                                "lowToxicity"
                            )
                        }
                    >
                        Toxicity ≤ 25
                    </button>

                    <span>
                        {
                            visibleExperiments.length
                        }{" "}
                        kayıt
                    </span>
                </div>

                {visibleExperiments.length >
                0 ? (
                    <div className="workspace-experiment-list">
                        {visibleExperiments.map(
                            (
                                experiment,
                                index
                            ) => (
                                <div
                                    key={
                                        experiment.id
                                    }
                                    className="workspace-experiment-row"
                                >
                                    <div className="workspace-experiment-index">
                                        {String(
                                            index + 1
                                        ).padStart(
                                            2,
                                            "0"
                                        )}
                                    </div>

                                    <div className="workspace-experiment-name">
                                        <strong>
                                            {experiment.name ??
                                                "İsimsiz Deney"}
                                        </strong>

                                        <span>
                                            {
                                                experiment
                                                    .parameters
                                                    .cellType
                                            }
                                        </span>
                                    </div>

                                    <div className="workspace-mini-metric">
                                        <span>BIND</span>
                                        <strong>
                                            {experiment.metrics.bindingScore.toFixed(
                                                1
                                            )}
                                        </strong>
                                    </div>

                                    <div className="workspace-mini-metric">
                                        <span>SPEC</span>
                                        <strong>
                                            {experiment.metrics.specificity.toFixed(
                                                1
                                            )}
                                        </strong>
                                    </div>

                                    <div className="workspace-mini-metric">
                                        <span>REL</span>
                                        <strong>
                                            {experiment.metrics.releaseEfficiency.toFixed(
                                                1
                                            )}
                                        </strong>
                                    </div>

                                    <div className="workspace-mini-metric toxicity">
                                        <span>TOX</span>
                                        <strong>
                                            {experiment.metrics.toxicityRisk.toFixed(
                                                1
                                            )}
                                        </strong>
                                    </div>

                                    <div className="workspace-composite">
                                        <span>
                                            SCORE
                                        </span>

                                        <strong>
                                            {compositeScore(
                                                experiment
                                            ).toFixed(
                                                1
                                            )}
                                        </strong>
                                    </div>

                                    <button
                                        type="button"
                                        className="workspace-load"
                                        onClick={() =>
                                            onLoad(
                                                experiment.parameters
                                            )
                                        }
                                    >
                                        ↗ Yükle
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <div className="workspace-empty">
                        <div>◇</div>

                        <strong>
                            Deney bulunamadı
                        </strong>

                        <p>
                            Seçilen filtreye uygun
                            kayıtlı simülasyon
                            bulunmuyor.
                        </p>
                    </div>
                )}
            </div>

            <div className="workspace-footer-note">
                <div>∑</div>

                <section>
                    <strong>
                        Research Workspace
                    </strong>

                    <p>
                        Bu çalışma alanındaki
                        sıralamalar BioTarget AI
                        simülasyon kayıtlarından
                        hesaplanır. Kompozit skor;
                        bağlanma %30, özgüllük %30,
                        salınım %25 ve ters toksisite
                        %15 ağırlıklarıyla oluşturulur.
                        Bu skor biyolojik veya klinik
                        etkinlik sıralaması değildir.
                    </p>
                </section>
            </div>
        </div>
    );
}