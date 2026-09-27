import { useMemo } from "react";
import type { ExperimentRecord } from "./ExperimentHistory";
import "./ResearchInsights.css";

interface Props {
    experiments: ExperimentRecord[];
}

interface Insight {
    title: string;
    description: string;
    coefficient: number;
    strength: string;
    direction: string;
}

const pearsonCorrelation = (
    x: number[],
    y: number[]
) => {
    if (
        x.length !== y.length ||
        x.length < 2
    ) {
        return 0;
    }

    const meanX =
        x.reduce((sum, value) => sum + value, 0) /
        x.length;

    const meanY =
        y.reduce((sum, value) => sum + value, 0) /
        y.length;

    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;

    for (let index = 0; index < x.length; index++) {
        const dx = x[index] - meanX;
        const dy = y[index] - meanY;

        numerator += dx * dy;
        denominatorX += dx * dx;
        denominatorY += dy * dy;
    }

    const denominator = Math.sqrt(
        denominatorX * denominatorY
    );

    if (denominator === 0) {
        return 0;
    }

    return numerator / denominator;
};

const correlationStrength = (value: number) => {
    const absolute = Math.abs(value);

    if (absolute >= 0.75) {
        return "Güçlü";
    }

    if (absolute >= 0.45) {
        return "Orta";
    }

    if (absolute >= 0.2) {
        return "Zayıf";
    }

    return "Belirgin değil";
};

const correlationDirection = (value: number) => {
    if (value > 0.15) {
        return "Pozitif";
    }

    if (value < -0.15) {
        return "Negatif";
    }

    return "Nötr";
};

function ResearchInsights({
                              experiments,
                          }: Props) {
    const insights = useMemo<Insight[]>(() => {
        if (experiments.length < 3) {
            return [];
        }

        const analyses = [
            {
                title: "Partikül Boyutu → Bağlanma",
                description:
                    "Partikül boyutu ile bağlanma skoru arasındaki doğrusal ilişki.",
                x: experiments.map(
                    (experiment) =>
                        experiment.parameters.particleSize
                ),
                y: experiments.map(
                    (experiment) =>
                        experiment.metrics.bindingScore
                ),
            },
            {
                title: "Ligand Yoğunluğu → Özgüllük",
                description:
                    "Ligand yoğunluğu ile özgüllük skoru arasındaki doğrusal ilişki.",
                x: experiments.map(
                    (experiment) =>
                        experiment.parameters.ligandDensity
                ),
                y: experiments.map(
                    (experiment) =>
                        experiment.metrics.specificity
                ),
            },
            {
                title: "İlaç Dozu → Salınım",
                description:
                    "İlaç dozu ile salınım verimliliği arasındaki doğrusal ilişki.",
                x: experiments.map(
                    (experiment) =>
                        experiment.parameters.drugDose
                ),
                y: experiments.map(
                    (experiment) =>
                        experiment.metrics.releaseEfficiency
                ),
            },
            {
                title: "İlaç Dozu → Toksisite",
                description:
                    "İlaç dozu ile hesaplanan toksisite riski arasındaki doğrusal ilişki.",
                x: experiments.map(
                    (experiment) =>
                        experiment.parameters.drugDose
                ),
                y: experiments.map(
                    (experiment) =>
                        experiment.metrics.toxicityRisk
                ),
            },
            {
                title: "Zeta Potansiyeli → Bağlanma",
                description:
                    "Zeta potansiyeli ile bağlanma skoru arasındaki doğrusal ilişki.",
                x: experiments.map(
                    (experiment) =>
                        experiment.parameters.zetaPotential
                ),
                y: experiments.map(
                    (experiment) =>
                        experiment.metrics.bindingScore
                ),
            },
        ];

        return analyses.map((analysis) => {
            const coefficient = pearsonCorrelation(
                analysis.x,
                analysis.y
            );

            return {
                title: analysis.title,
                description: analysis.description,
                coefficient,
                strength:
                    correlationStrength(coefficient),
                direction:
                    correlationDirection(coefficient),
            };
        });
    }, [experiments]);

    const progress = Math.min(
        (experiments.length / 3) * 100,
        100
    );

    return (
        <section className="ri-panel">
            <header className="ri-header">
                <div>
                    <span className="ri-kicker">
                        DATA INTELLIGENCE
                    </span>

                    <h3>Research Insights</h3>

                    <p>
                        Kayıtlı deneylerden parametre ve
                        simülasyon metrikleri arasındaki doğrusal
                        eğilimleri analiz eder.
                    </p>
                </div>

                <div className="ri-engine">
                    <span className="ri-engine-dot" />
                    ANALYSIS ENGINE
                </div>
            </header>

            {experiments.length < 3 ? (
                <div className="ri-empty">
                    <div className="ri-empty-icon">
                        ∿
                    </div>

                    <div className="ri-empty-content">
                        <span className="ri-empty-label">
                            VERİ HAZIRLIĞI
                        </span>

                        <h4>
                            Trend analizi için daha fazla veri
                            gerekiyor
                        </h4>

                        <p>
                            En az 3 farklı deney kaydet. Deney
                            sayısı arttıkça trend analizi daha
                            anlamlı hale gelir.
                        </p>

                        <div className="ri-progress-header">
                            <span>Veri Hazırlığı</span>

                            <strong>
                                {experiments.length}/3
                            </strong>
                        </div>

                        <div className="ri-progress-track">
                            <div
                                className="ri-progress-value"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="ri-grid">
                    {insights.map((insight) => (
                        <article
                            className="ri-card"
                            key={insight.title}
                        >
                            <div className="ri-card-top">
                                <span>
                                    {insight.direction}
                                </span>

                                <strong>
                                    r ={" "}
                                    {insight.coefficient.toFixed(2)}
                                </strong>
                            </div>

                            <h4>{insight.title}</h4>

                            <p>{insight.description}</p>

                            <div className="ri-card-footer">
                                <span>İlişki Gücü</span>

                                <strong>
                                    {insight.strength}
                                </strong>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <div className="ri-note">
                <span>i</span>

                <p>
                    <strong>Analiz Notu</strong>
                    Korelasyon nedensellik göstermez. Bu
                    analiz yalnızca kayıtlı simülasyon
                    deneyleri içindeki doğrusal ilişkileri
                    özetler ve klinik/biyolojik kanıt olarak
                    yorumlanmamalıdır.
                </p>
            </div>
        </section>
    );
}

export default ResearchInsights;