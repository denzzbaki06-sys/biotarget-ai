import { useMemo, useState } from "react";

import type { ExperimentRecord } from "./ExperimentHistory";
import type { SimulationParameters } from "../types/simulation";

import "./StudyManager.css";

export type StudyStatus =
    | "planning"
    | "active"
    | "completed";

export interface ResearchStudy {
    id: string;
    name: string;
    hypothesis: string;
    objective: string;
    cellType: string;
    status: StudyStatus;
    createdAt: string;
    experimentIds: string[];
}

interface Props {
    experiments: ExperimentRecord[];
    parameters: SimulationParameters;

    studies: ResearchStudy[];

    setStudies: React.Dispatch<
        React.SetStateAction<
            ResearchStudy[]
        >
    >;

    onLoad: (
        parameters: SimulationParameters
    ) => void;
}

function StudyManager({
                          experiments,
                          parameters,
                          studies,
                          setStudies,
                          onLoad,
                      }: Props) {
    const [
        selectedStudyId,
        setSelectedStudyId,
    ] =
        useState<string | null>(
            studies[0]?.id ??
            null
        );

    const [
        name,
        setName,
    ] = useState("");

    const [
        hypothesis,
        setHypothesis,
    ] = useState("");

    const [
        objective,
        setObjective,
    ] = useState("");

    const selectedStudy =
        useMemo(() => {
            return (
                studies.find(
                    (study) =>
                        study.id ===
                        selectedStudyId
                ) ?? null
            );
        }, [
            studies,
            selectedStudyId,
        ]);

    const studyExperiments =
        useMemo(() => {
            if (
                !selectedStudy
            ) {
                return [];
            }

            return experiments.filter(
                (experiment) =>
                    selectedStudy.experimentIds.includes(
                        experiment.id
                    )
            );
        }, [
            experiments,
            selectedStudy,
        ]);

    const averages =
        useMemo(() => {
            if (
                studyExperiments.length ===
                0
            ) {
                return {
                    binding: 0,
                    specificity: 0,
                    release: 0,
                    toxicity: 0,
                };
            }

            const totals =
                studyExperiments.reduce(
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

                        return accumulator;
                    },
                    {
                        binding: 0,
                        specificity: 0,
                        release: 0,
                        toxicity: 0,
                    }
                );

            const count =
                studyExperiments.length;

            return {
                binding:
                    totals.binding /
                    count,

                specificity:
                    totals.specificity /
                    count,

                release:
                    totals.release /
                    count,

                toxicity:
                    totals.toxicity /
                    count,
            };
        }, [studyExperiments]);

    const createStudy =
        () => {
            if (
                !name.trim()
            ) {
                return;
            }

            const study:
                ResearchStudy =
                {
                    id:
                        `study-${Date.now()}`,

                    name:
                        name.trim(),

                    hypothesis:
                        hypothesis.trim() ||
                        "Henüz hipotez girilmedi.",

                    objective:
                        objective.trim() ||
                        "Henüz araştırma amacı girilmedi.",

                    cellType:
                    parameters.cellType,

                    status:
                        "planning",

                    createdAt:
                        new Date()
                            .toLocaleString(
                                "tr-TR"
                            ),

                    experimentIds:
                        [],
                };

            setStudies(
                (previous) => [
                    study,
                    ...previous,
                ]
            );

            setSelectedStudyId(
                study.id
            );

            setName("");
            setHypothesis("");
            setObjective("");
        };

    const deleteStudy =
        (
            id: string
        ) => {
            setStudies(
                (previous) =>
                    previous.filter(
                        (study) =>
                            study.id !==
                            id
                    )
            );

            if (
                selectedStudyId ===
                id
            ) {
                setSelectedStudyId(
                    null
                );
            }
        };

    const updateStatus =
        (
            status:
            StudyStatus
        ) => {
            if (
                !selectedStudy
            ) {
                return;
            }

            setStudies(
                (previous) =>
                    previous.map(
                        (study) =>
                            study.id ===
                            selectedStudy.id
                                ? {
                                    ...study,
                                    status,
                                }
                                : study
                    )
            );
        };

    const toggleExperiment =
        (
            experimentId:
            string
        ) => {
            if (
                !selectedStudy
            ) {
                return;
            }

            setStudies(
                (previous) =>
                    previous.map(
                        (study) => {
                            if (
                                study.id !==
                                selectedStudy.id
                            ) {
                                return study;
                            }

                            const exists =
                                study.experimentIds.includes(
                                    experimentId
                                );

                            return {
                                ...study,

                                experimentIds:
                                    exists
                                        ? study.experimentIds.filter(
                                            (id) =>
                                                id !==
                                                experimentId
                                        )
                                        : [
                                            ...study.experimentIds,
                                            experimentId,
                                        ],
                            };
                        }
                    )
            );
        };

    const bestBinding =
        useMemo(() => {
            if (
                !studyExperiments.length
            ) {
                return null;
            }

            return [
                ...studyExperiments,
            ].sort(
                (a, b) =>
                    b.metrics
                        .bindingScore -
                    a.metrics
                        .bindingScore
            )[0];
        }, [studyExperiments]);

    const lowestToxicity =
        useMemo(() => {
            if (
                !studyExperiments.length
            ) {
                return null;
            }

            return [
                ...studyExperiments,
            ].sort(
                (a, b) =>
                    a.metrics
                        .toxicityRisk -
                    b.metrics
                        .toxicityRisk
            )[0];
        }, [studyExperiments]);

    return (
        <div className="study-manager">
            <div className="study-top">
                <div>
                    <span className="study-kicker">
                        RESEARCH WORKSPACE
                    </span>

                    <h3>
                        Research Study
                        Manager
                    </h3>

                    <p>
                        Araştırma
                        hipotezlerini,
                        hedefleri ve kayıtlı
                        simülasyon
                        deneylerini tek
                        çalışma altında
                        organize edin.
                    </p>
                </div>

                <div className="study-engine-status">
                    <span />
                    WORKSPACE ACTIVE
                </div>
            </div>

            <div className="study-create">
                <div className="study-create-header">
                    <span>
                        NEW RESEARCH STUDY
                    </span>

                    <strong>
                        Yeni Çalışma
                        Oluştur
                    </strong>
                </div>

                <div className="study-form">
                    <label>
                        <span>
                            PROJE ADI
                        </span>

                        <input
                            value={
                                name
                            }
                            onChange={(
                                event
                            ) =>
                                setName(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Örn. EGFR Nanoparticle Study"
                        />
                    </label>

                    <label>
                        <span>
                            ARAŞTIRMA AMACI
                        </span>

                        <textarea
                            value={
                                objective
                            }
                            onChange={(
                                event
                            ) =>
                                setObjective(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Bu çalışmanın temel amacı..."
                        />
                    </label>

                    <label>
                        <span>
                            HİPOTEZ
                        </span>

                        <textarea
                            value={
                                hypothesis
                            }
                            onChange={(
                                event
                            ) =>
                                setHypothesis(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Örn. Ligand yoğunluğunun artırılması..."
                        />
                    </label>
                </div>

                <div className="study-create-footer">
                    <div>
                        <span>
                            AKTİF HEDEF
                        </span>

                        <strong>
                            {
                                parameters.cellType
                            }
                        </strong>
                    </div>

                    <button
                        type="button"
                        onClick={
                            createStudy
                        }
                    >
                        ＋ Araştırma
                        Projesi Oluştur
                    </button>
                </div>
            </div>

            <div className="study-layout">
                <aside className="study-list">
                    <div className="study-list-title">
                        <div>
                            <span>
                                PROJECT LIBRARY
                            </span>

                            <strong>
                                Araştırmalar
                            </strong>
                        </div>

                        <b>
                            {
                                studies.length
                            }
                        </b>
                    </div>

                    {studies.length ===
                        0 && (
                            <div className="study-empty-small">
                                Henüz araştırma
                                projesi yok.
                            </div>
                        )}

                    {studies.map(
                        (study) => (
                            <button
                                type="button"
                                key={
                                    study.id
                                }
                                className={
                                    selectedStudyId ===
                                    study.id
                                        ? "study-list-item active"
                                        : "study-list-item"
                                }
                                onClick={() =>
                                    setSelectedStudyId(
                                        study.id
                                    )
                                }
                            >
                                <div>
                                    <strong>
                                        {
                                            study.name
                                        }
                                    </strong>

                                    <small>
                                        {
                                            study.cellType
                                        }
                                    </small>
                                </div>

                                <span
                                    className={`study-status-dot ${study.status}`}
                                />
                            </button>
                        )
                    )}
                </aside>

                <div className="study-workspace">
                    {!selectedStudy && (
                        <div className="study-empty">
                            <div>
                                ⌬
                            </div>

                            <strong>
                                Bir araştırma
                                projesi seç
                            </strong>

                            <p>
                                Yeni çalışma
                                oluşturduğunda
                                hipotez, deneyler
                                ve sonuçlar burada
                                birleşecek.
                            </p>
                        </div>
                    )}

                    {selectedStudy && (
                        <>
                            <div className="study-detail-header">
                                <div>
                                    <span>
                                        ACTIVE STUDY
                                    </span>

                                    <h3>
                                        {
                                            selectedStudy.name
                                        }
                                    </h3>

                                    <p>
                                        {
                                            selectedStudy.createdAt
                                        }
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="study-delete"
                                    onClick={() =>
                                        deleteStudy(
                                            selectedStudy.id
                                        )
                                    }
                                >
                                    Sil
                                </button>
                            </div>

                            <div className="study-status-selector">
                                <button
                                    type="button"
                                    className={
                                        selectedStudy.status ===
                                        "planning"
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        updateStatus(
                                            "planning"
                                        )
                                    }
                                >
                                    Planning
                                </button>

                                <button
                                    type="button"
                                    className={
                                        selectedStudy.status ===
                                        "active"
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        updateStatus(
                                            "active"
                                        )
                                    }
                                >
                                    Active
                                </button>

                                <button
                                    type="button"
                                    className={
                                        selectedStudy.status ===
                                        "completed"
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        updateStatus(
                                            "completed"
                                        )
                                    }
                                >
                                    Completed
                                </button>
                            </div>

                            <div className="study-info-grid">
                                <article>
                                    <span>
                                        HEDEF HÜCRE
                                    </span>

                                    <strong>
                                        {
                                            selectedStudy.cellType
                                        }
                                    </strong>
                                </article>

                                <article>
                                    <span>
                                        DENEY SAYISI
                                    </span>

                                    <strong>
                                        {
                                            studyExperiments.length
                                        }
                                    </strong>
                                </article>

                                <article>
                                    <span>
                                        DURUM
                                    </span>

                                    <strong>
                                        {selectedStudy.status.toUpperCase()}
                                    </strong>
                                </article>

                                <article>
                                    <span>
                                        TOPLAM KAYIT
                                    </span>

                                    <strong>
                                        {
                                            experiments.length
                                        }
                                    </strong>
                                </article>
                            </div>

                            <div className="study-text-card">
                                <span>
                                    ARAŞTIRMA AMACI
                                </span>

                                <p>
                                    {
                                        selectedStudy.objective
                                    }
                                </p>
                            </div>

                            <div className="study-text-card">
                                <span>
                                    HİPOTEZ
                                </span>

                                <p>
                                    {
                                        selectedStudy.hypothesis
                                    }
                                </p>
                            </div>

                            <div className="study-section-title">
                                <div>
                                    <span>
                                        EXPERIMENT
                                        SELECTION
                                    </span>

                                    <strong>
                                        Çalışmaya Deney
                                        Ekle
                                    </strong>
                                </div>

                                <b>
                                    {
                                        studyExperiments.length
                                    }
                                    /
                                    {
                                        experiments.length
                                    }
                                </b>
                            </div>

                            {experiments.length ===
                            0 ? (
                                <div className="study-no-experiments">
                                    Önce en az bir
                                    simülasyon deneyi
                                    kaydetmelisin.
                                </div>
                            ) : (
                                <div className="study-experiment-list">
                                    {experiments.map(
                                        (
                                            experiment,
                                            index
                                        ) => {
                                            const selected =
                                                selectedStudy.experimentIds.includes(
                                                    experiment.id
                                                );

                                            return (
                                                <div
                                                    key={
                                                        experiment.id
                                                    }
                                                    className={
                                                        selected
                                                            ? "study-experiment selected"
                                                            : "study-experiment"
                                                    }
                                                >
                                                    <button
                                                        type="button"
                                                        className="study-check"
                                                        onClick={() =>
                                                            toggleExperiment(
                                                                experiment.id
                                                            )
                                                        }
                                                    >
                                                        {selected
                                                            ? "✓"
                                                            : ""}
                                                    </button>

                                                    <div className="study-experiment-copy">
                                                        <strong>
                                                            {experiment.name ||
                                                                `Deney ${
                                                                    index +
                                                                    1
                                                                }`}
                                                        </strong>

                                                        <span>
                                                            {
                                                                experiment
                                                                    .parameters
                                                                    .cellType
                                                            }
                                                        </span>
                                                    </div>

                                                    <div className="study-experiment-metrics">
                                                        <span>
                                                            B{" "}
                                                            {
                                                                experiment
                                                                    .metrics
                                                                    .bindingScore
                                                            }
                                                        </span>

                                                        <span>
                                                            S %
                                                            {
                                                                experiment
                                                                    .metrics
                                                                    .specificity
                                                            }
                                                        </span>

                                                        <span>
                                                            T{" "}
                                                            {
                                                                experiment
                                                                    .metrics
                                                                    .toxicityRisk
                                                            }
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="study-load"
                                                        onClick={() =>
                                                            onLoad({
                                                                ...experiment.parameters,
                                                            })
                                                        }
                                                    >
                                                        Yükle
                                                    </button>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            )}

                            {studyExperiments.length >
                                0 && (
                                    <>
                                        <div className="study-section-title">
                                            <div>
                                                <span>
                                                    STUDY RESULTS
                                                </span>

                                                <strong>
                                                    Araştırma
                                                    Özeti
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="study-results">
                                            <article>
                                                <span>
                                                    AVG BINDING
                                                </span>

                                                <strong>
                                                    {averages.binding.toFixed(
                                                        1
                                                    )}
                                                </strong>
                                            </article>

                                            <article>
                                                <span>
                                                    AVG SPECIFICITY
                                                </span>

                                                <strong>
                                                    %
                                                    {averages.specificity.toFixed(
                                                        1
                                                    )}
                                                </strong>
                                            </article>

                                            <article>
                                                <span>
                                                    AVG RELEASE
                                                </span>

                                                <strong>
                                                    %
                                                    {averages.release.toFixed(
                                                        1
                                                    )}
                                                </strong>
                                            </article>

                                            <article>
                                                <span>
                                                    AVG TOXICITY
                                                </span>

                                                <strong>
                                                    {averages.toxicity.toFixed(
                                                        1
                                                    )}
                                                </strong>
                                            </article>
                                        </div>

                                        <div className="study-auto-summary">
                                            <div className="study-auto-title">
                                                <span>
                                                    ✦
                                                </span>

                                                <div>
                                                    <small>
                                                        COMPUTATIONAL
                                                        SUMMARY
                                                    </small>

                                                    <strong>
                                                        Otomatik
                                                        Çalışma Özeti
                                                    </strong>
                                                </div>
                                            </div>

                                            <p>
                                                Bu çalışma{" "}
                                                <b>
                                                    {
                                                        studyExperiments.length
                                                    }
                                                </b>{" "}
                                                kayıtlı
                                                simülasyon
                                                deneyini
                                                içeriyor.
                                                Ortalama
                                                bağlanma skoru{" "}
                                                <b>
                                                    {averages.binding.toFixed(
                                                        1
                                                    )}
                                                </b>
                                                , ortalama
                                                özgüllük{" "}
                                                <b>
                                                    %
                                                    {averages.specificity.toFixed(
                                                        1
                                                    )}
                                                </b>{" "}
                                                ve ortalama
                                                salınım
                                                verimliliği{" "}
                                                <b>
                                                    %
                                                    {averages.release.toFixed(
                                                        1
                                                    )}
                                                </b>{" "}
                                                olarak
                                                hesaplandı.
                                            </p>

                                            {bestBinding && (
                                                <p>
                                                    En yüksek
                                                    hesaplanan
                                                    bağlanma
                                                    skoru{" "}
                                                    <b>
                                                        {bestBinding.name ||
                                                            "İsimsiz deney"}
                                                    </b>{" "}
                                                    deneyinde{" "}
                                                    <b>
                                                        {
                                                            bestBinding
                                                                .metrics
                                                                .bindingScore
                                                        }
                                                    </b>{" "}
                                                    olarak
                                                    gözlendi.
                                                </p>
                                            )}

                                            {lowestToxicity && (
                                                <p>
                                                    En düşük
                                                    simüle edilmiş
                                                    toksisite
                                                    değeri{" "}
                                                    <b>
                                                        {lowestToxicity.name ||
                                                            "İsimsiz deney"}
                                                    </b>{" "}
                                                    kaydında{" "}
                                                    <b>
                                                        {
                                                            lowestToxicity
                                                                .metrics
                                                                .toxicityRisk
                                                        }
                                                    </b>{" "}
                                                    olarak
                                                    hesaplandı.
                                                </p>
                                            )}

                                            <div className="study-warning">
                                                Bu özet
                                                yalnızca
                                                BioTarget AI
                                                simülasyon
                                                kayıtlarını
                                                tanımlar.
                                                Hipotezin
                                                biyolojik veya
                                                klinik olarak
                                                doğrulandığı
                                                anlamına gelmez.
                                            </div>
                                        </div>
                                    </>
                                )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudyManager;