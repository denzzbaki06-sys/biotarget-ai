import {
    useMemo,
} from "react";

import type {
    ExperimentRecord,
} from "./ExperimentHistory";

interface Props {
    experiments: ExperimentRecord[];
}

function ResearchDashboard({
                               experiments,
                           }: Props) {
    const statistics =
        useMemo(() => {
            if (
                experiments.length ===
                0
            ) {
                return {
                    total: 0,
                    favorites: 0,
                    averageBinding: 0,
                    averageSpecificity: 0,
                    averageRelease: 0,
                    lowestToxicity: 0,
                    bestExperiment: null as ExperimentRecord | null,
                };
            }

            const total =
                experiments.length;

            const favorites =
                experiments.filter(
                    (experiment) =>
                        experiment.favorite
                ).length;

            const averageBinding =
                experiments.reduce(
                    (
                        totalValue,
                        experiment
                    ) =>
                        totalValue +
                        experiment.metrics
                            .bindingScore,
                    0
                ) / total;

            const averageSpecificity =
                experiments.reduce(
                    (
                        totalValue,
                        experiment
                    ) =>
                        totalValue +
                        experiment.metrics
                            .specificity,
                    0
                ) / total;

            const averageRelease =
                experiments.reduce(
                    (
                        totalValue,
                        experiment
                    ) =>
                        totalValue +
                        experiment.metrics
                            .releaseEfficiency,
                    0
                ) / total;

            const lowestToxicity =
                Math.min(
                    ...experiments.map(
                        (experiment) =>
                            experiment.metrics
                                .toxicityRisk
                    )
                );

            const experimentScore = (
                experiment:
                ExperimentRecord
            ) => {
                const {
                    bindingScore,
                    specificity,
                    releaseEfficiency,
                    toxicityRisk,
                } =
                    experiment.metrics;

                return (
                    bindingScore * 0.3 +
                    specificity * 0.3 +
                    releaseEfficiency *
                    0.25 +
                    (100 -
                        toxicityRisk) *
                    0.15
                );
            };

            const bestExperiment =
                [...experiments].sort(
                    (a, b) =>
                        experimentScore(b) -
                        experimentScore(a)
                )[0];

            return {
                total,
                favorites,

                averageBinding:
                    Number(
                        averageBinding.toFixed(
                            1
                        )
                    ),

                averageSpecificity:
                    Number(
                        averageSpecificity.toFixed(
                            1
                        )
                    ),

                averageRelease:
                    Number(
                        averageRelease.toFixed(
                            1
                        )
                    ),

                lowestToxicity:
                    Number(
                        lowestToxicity.toFixed(
                            1
                        )
                    ),

                bestExperiment,
            };
        }, [experiments]);

    const hasExperiments =
        statistics.total > 0;

    return (
        <div className="research-dashboard">
            <div className="research-dashboard-header">
                <div>
                    <span className="panel-kicker">
                        RESEARCH OVERVIEW
                    </span>

                    <h3>
                        Deney İstatistikleri
                    </h3>

                    <p>
                        Kayıtlı
                        simülasyonlardan
                        otomatik hesaplanan
                        araştırma özeti.
                    </p>
                </div>

                <div className="research-live-badge">
                    <span />
                    LIVE DATA
                </div>
            </div>

            <div className="research-stat-grid">
                <article className="research-stat-card">
                    <div className="research-stat-top">
                        <span>
                            TOPLAM DENEY
                        </span>

                        <div className="research-stat-icon">
                            ◈
                        </div>
                    </div>

                    <strong>
                        {statistics.total}
                    </strong>

                    <small>
                        kayıtlı simülasyon
                    </small>
                </article>

                <article className="research-stat-card">
                    <div className="research-stat-top">
                        <span>
                            FAVORİ
                        </span>

                        <div className="research-stat-icon">
                            ★
                        </div>
                    </div>

                    <strong>
                        {statistics.favorites}
                    </strong>

                    <small>
                        işaretlenen deney
                    </small>
                </article>

                <article className="research-stat-card">
                    <div className="research-stat-top">
                        <span>
                            ORT. BAĞLANMA
                        </span>

                        <div className="research-stat-icon">
                            ⌁
                        </div>
                    </div>

                    <strong>
                        {hasExperiments
                            ? statistics.averageBinding
                            : "—"}
                    </strong>

                    <small>
                        ortalama skor
                    </small>
                </article>

                <article className="research-stat-card">
                    <div className="research-stat-top">
                        <span>
                            ORT. ÖZGÜLLÜK
                        </span>

                        <div className="research-stat-icon">
                            ◎
                        </div>
                    </div>

                    <strong>
                        {hasExperiments
                            ? `%${statistics.averageSpecificity}`
                            : "—"}
                    </strong>

                    <small>
                        ortalama özgüllük
                    </small>
                </article>

                <article className="research-stat-card">
                    <div className="research-stat-top">
                        <span>
                            ORT. SALINIM
                        </span>

                        <div className="research-stat-icon">
                            ∿
                        </div>
                    </div>

                    <strong>
                        {hasExperiments
                            ? `%${statistics.averageRelease}`
                            : "—"}
                    </strong>

                    <small>
                        ortalama verim
                    </small>
                </article>

                <article className="research-stat-card">
                    <div className="research-stat-top">
                        <span>
                            MİN. TOKSİSİTE
                        </span>

                        <div className="research-stat-icon">
                            ↓
                        </div>
                    </div>

                    <strong>
                        {hasExperiments
                            ? statistics.lowestToxicity
                            : "—"}
                    </strong>

                    <small>
                        en düşük risk skoru
                    </small>
                </article>
            </div>

            {statistics.bestExperiment ? (
                <div className="research-best">
                    <div className="research-best-left">
                        <div className="research-best-icon">
                            ✦
                        </div>

                        <div>
                            <span>
                                KOMPOZİT SKORA GÖRE
                                ÖNE ÇIKAN KAYIT
                            </span>

                            <h4>
                                {statistics
                                        .bestExperiment
                                        .name ||
                                    "İsimsiz Deney"}
                            </h4>

                            <p>
                                {
                                    statistics
                                        .bestExperiment
                                        .parameters
                                        .cellType
                                }
                            </p>
                        </div>
                    </div>

                    <div className="research-best-metrics">
                        <div>
                            <span>
                                Bağlanma
                            </span>

                            <strong>
                                {
                                    statistics
                                        .bestExperiment
                                        .metrics
                                        .bindingScore
                                }
                            </strong>
                        </div>

                        <div>
                            <span>
                                Özgüllük
                            </span>

                            <strong>
                                %
                                {
                                    statistics
                                        .bestExperiment
                                        .metrics
                                        .specificity
                                }
                            </strong>
                        </div>

                        <div>
                            <span>
                                Salınım
                            </span>

                            <strong>
                                %
                                {
                                    statistics
                                        .bestExperiment
                                        .metrics
                                        .releaseEfficiency
                                }
                            </strong>
                        </div>

                        <div>
                            <span>
                                Risk
                            </span>

                            <strong>
                                {
                                    statistics
                                        .bestExperiment
                                        .metrics
                                        .toxicityRisk
                                }
                            </strong>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="research-empty">
                    <div>
                        ◇
                    </div>

                    <strong>
                        Henüz araştırma verisi yok
                    </strong>

                    <p>
                        Deney kaydettikçe
                        dashboard otomatik
                        olarak güncellenecek.
                    </p>
                </div>
            )}

            <div className="research-method-note">
                <span>
                    i
                </span>

                <p>
                    Öne çıkan kayıt;
                    bağlanma %30,
                    özgüllük %30,
                    salınım %25 ve
                    ters toksisite skoru
                    %15 ağırlıklı
                    kompozit puanla
                    belirlenir. Bu sıralama
                    yalnızca simülasyon
                    karşılaştırması içindir.
                </p>
            </div>
        </div>
    );
}

export default ResearchDashboard;