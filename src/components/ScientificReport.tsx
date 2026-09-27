import { useMemo, useState } from "react";

import type { ExperimentRecord } from "./ExperimentHistory";
import type { ResearchStudy } from "./StudyManager";

import "./ScientificReport.css";

interface Props {
    studies: ResearchStudy[];
    experiments: ExperimentRecord[];
}

const average = (
    values: number[]
) => {
    if (values.length === 0) {
        return 0;
    }

    return (
        values.reduce(
            (total, value) =>
                total + value,
            0
        ) / values.length
    );
};

const range = (
    values: number[]
) => {
    if (values.length === 0) {
        return {
            minimum: 0,
            maximum: 0,
        };
    }

    return {
        minimum:
            Math.min(...values),

        maximum:
            Math.max(...values),
    };
};

function ScientificReport({
                              studies,
                              experiments,
                          }: Props) {
    const [
        selectedStudyId,
        setSelectedStudyId,
    ] = useState<string>(
        studies[0]?.id ?? ""
    );

    const [
        copied,
        setCopied,
    ] = useState(false);

    const selectedStudy =
        useMemo(() => {
            if (
                studies.length === 0
            ) {
                return null;
            }

            return (
                studies.find(
                    (study) =>
                        study.id ===
                        selectedStudyId
                ) ??
                studies[0]
            );
        }, [
            studies,
            selectedStudyId,
        ]);

    const studyExperiments =
        useMemo(() => {
            if (!selectedStudy) {
                return [];
            }

            return experiments.filter(
                (experiment) =>
                    selectedStudy.experimentIds.includes(
                        experiment.id
                    )
            );
        }, [
            selectedStudy,
            experiments,
        ]);

    const analysis =
        useMemo(() => {
            if (
                studyExperiments.length ===
                0
            ) {
                return null;
            }

            const binding =
                studyExperiments.map(
                    (experiment) =>
                        experiment.metrics
                            .bindingScore
                );

            const specificity =
                studyExperiments.map(
                    (experiment) =>
                        experiment.metrics
                            .specificity
                );

            const release =
                studyExperiments.map(
                    (experiment) =>
                        experiment.metrics
                            .releaseEfficiency
                );

            const toxicity =
                studyExperiments.map(
                    (experiment) =>
                        experiment.metrics
                            .toxicityRisk
                );

            const sizes =
                studyExperiments.map(
                    (experiment) =>
                        experiment.parameters
                            .particleSize
                );

            const zetas =
                studyExperiments.map(
                    (experiment) =>
                        experiment.parameters
                            .zetaPotential
                );

            const ligands =
                studyExperiments.map(
                    (experiment) =>
                        experiment.parameters
                            .ligandDensity
                );

            const doses =
                studyExperiments.map(
                    (experiment) =>
                        experiment.parameters
                            .drugDose
                );

            const highestBinding =
                [...studyExperiments]
                    .sort(
                        (a, b) =>
                            b.metrics
                                .bindingScore -
                            a.metrics
                                .bindingScore
                    )[0];

            const highestSpecificity =
                [...studyExperiments]
                    .sort(
                        (a, b) =>
                            b.metrics
                                .specificity -
                            a.metrics
                                .specificity
                    )[0];

            const highestRelease =
                [...studyExperiments]
                    .sort(
                        (a, b) =>
                            b.metrics
                                .releaseEfficiency -
                            a.metrics
                                .releaseEfficiency
                    )[0];

            const lowestToxicity =
                [...studyExperiments]
                    .sort(
                        (a, b) =>
                            a.metrics
                                .toxicityRisk -
                            b.metrics
                                .toxicityRisk
                    )[0];

            return {
                averageBinding:
                    average(binding),

                averageSpecificity:
                    average(specificity),

                averageRelease:
                    average(release),

                averageToxicity:
                    average(toxicity),

                sizeRange:
                    range(sizes),

                zetaRange:
                    range(zetas),

                ligandRange:
                    range(ligands),

                doseRange:
                    range(doses),

                highestBinding,

                highestSpecificity,

                highestRelease,

                lowestToxicity,
            };
        }, [studyExperiments]);

    const report =
        useMemo(() => {
            if (
                !selectedStudy ||
                !analysis
            ) {
                return null;
            }

            const abstract =
                `This computational study evaluated ${studyExperiments.length} simulated nanoparticle formulations targeting ${selectedStudy.cellType}. ` +
                `The BioTarget AI simulation engine was used to compare formulation parameters including particle size, zeta potential, ligand density, and drug dose. ` +
                `Across the selected simulations, mean binding score was ${analysis.averageBinding.toFixed(
                    1
                )}, mean specificity was ${analysis.averageSpecificity.toFixed(
                    1
                )}%, mean release efficiency was ${analysis.averageRelease.toFixed(
                    1
                )}%, and mean simulated toxicity risk was ${analysis.averageToxicity.toFixed(
                    1
                )}.`;

            const methods =
                `A total of ${studyExperiments.length} computational nanoparticle formulations were included in the study. ` +
                `Particle size ranged from ${analysis.sizeRange.minimum} to ${analysis.sizeRange.maximum} nm. ` +
                `Zeta potential ranged from ${analysis.zetaRange.minimum} to ${analysis.zetaRange.maximum} mV. ` +
                `Ligand density ranged from ${analysis.ligandRange.minimum}% to ${analysis.ligandRange.maximum}%, while drug dose ranged from ${analysis.doseRange.minimum} to ${analysis.doseRange.maximum} mg/mL. ` +
                `Each formulation was evaluated using the BioTarget AI prediction engine for binding score, specificity, release efficiency, and simulated toxicity risk.`;

            const results =
                `The mean binding score across the study was ${analysis.averageBinding.toFixed(
                    1
                )}. ` +
                `Mean specificity was ${analysis.averageSpecificity.toFixed(
                    1
                )}%, mean release efficiency was ${analysis.averageRelease.toFixed(
                    1
                )}%, and mean simulated toxicity risk was ${analysis.averageToxicity.toFixed(
                    1
                )}. ` +
                `The highest calculated binding score was ${analysis.highestBinding.metrics.bindingScore} in ${
                    analysis.highestBinding.name ||
                    "an unnamed experiment"
                }. ` +
                `The highest calculated specificity was ${analysis.highestSpecificity.metrics.specificity}% in ${
                    analysis.highestSpecificity.name ||
                    "an unnamed experiment"
                }. ` +
                `The highest calculated release efficiency was ${analysis.highestRelease.metrics.releaseEfficiency}% in ${
                    analysis.highestRelease.name ||
                    "an unnamed experiment"
                }. ` +
                `The lowest simulated toxicity risk was ${analysis.lowestToxicity.metrics.toxicityRisk} in ${
                    analysis.lowestToxicity.name ||
                    "an unnamed experiment"
                }.`;

            const conclusion =
                `The BioTarget AI simulations demonstrate measurable variation in calculated formulation performance across the evaluated parameter space. ` +
                `These results can be used to compare simulated formulations and identify computational candidates for further investigation. ` +
                `The findings do not establish biological efficacy, experimental validation, clinical safety, or therapeutic effectiveness.`;

            return {
                abstract,
                methods,
                results,
                conclusion,
            };
        }, [
            selectedStudy,
            analysis,
            studyExperiments,
        ]);

    const createPlainTextReport =
        () => {
            if (
                !selectedStudy ||
                !report
            ) {
                return "";
            }

            return `
BIOTARGET AI
SCIENTIFIC COMPUTATIONAL REPORT

STUDY
${selectedStudy.name}

TARGET
${selectedStudy.cellType}

STATUS
${selectedStudy.status.toUpperCase()}

RESEARCH OBJECTIVE
${selectedStudy.objective}

HYPOTHESIS
${selectedStudy.hypothesis}

ABSTRACT
${report.abstract}

METHODS
${report.methods}

RESULTS
${report.results}

CONCLUSION
${report.conclusion}

DISCLAIMER
This report was generated from BioTarget AI computational simulation data. It does not represent experimental validation, clinical evidence, diagnosis, treatment guidance, or medical advice.
`.trim();
        };

    const copyReport =
        async () => {
            const text =
                createPlainTextReport();

            if (!text) {
                return;
            }

            try {
                await navigator.clipboard.writeText(
                    text
                );

                setCopied(true);

                window.setTimeout(
                    () =>
                        setCopied(false),
                    2200
                );
            } catch {
                window.alert(
                    "Rapor panoya kopyalanamadı."
                );
            }
        };

    if (
        studies.length === 0
    ) {
        return (
            <div className="scientific-report">
                <div className="report-generator-empty">
                    <div className="report-generator-empty-icon">
                        ▤
                    </div>

                    <strong>
                        Rapor oluşturmak için
                        araştırma projesi gerekli
                    </strong>

                    <p>
                        Önce Study Manager
                        bölümünden bir araştırma
                        projesi oluştur.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="scientific-report">
            <div className="scientific-report-header">
                <div>
                    <span className="scientific-report-kicker">
                        AUTOMATED RESEARCH DOCUMENTATION
                    </span>

                    <h3>
                        Scientific Report
                        Generator
                    </h3>

                    <p>
                        Kayıtlı araştırma
                        çalışmasını ve bağlı
                        simülasyon deneylerini
                        yapılandırılmış bilimsel
                        rapora dönüştürür.
                    </p>
                </div>

                <div className="scientific-report-badge">
                    <span />
                    REPORT ENGINE
                </div>
            </div>

            <div className="report-generator-toolbar">
                <label>
                    <span>
                        RESEARCH STUDY
                    </span>

                    <select
                        value={
                            selectedStudy?.id ??
                            ""
                        }
                        onChange={(
                            event
                        ) =>
                            setSelectedStudyId(
                                event.target
                                    .value
                            )
                        }
                    >
                        {studies.map(
                            (study) => (
                                <option
                                    key={
                                        study.id
                                    }
                                    value={
                                        study.id
                                    }
                                >
                                    {
                                        study.name
                                    }
                                </option>
                            )
                        )}
                    </select>
                </label>

                <div className="report-generator-actions">
                    <button
                        type="button"
                        className="report-copy-button"
                        onClick={
                            copyReport
                        }
                        disabled={
                            !report
                        }
                    >
                        {copied
                            ? "✓ Kopyalandı"
                            : "⧉ Copy Report"}
                    </button>

                    <button
                        type="button"
                        className="report-print-button"
                        onClick={() =>
                            window.print()
                        }
                        disabled={
                            !report
                        }
                    >
                        ↓ Print / PDF
                    </button>
                </div>
            </div>

            {selectedStudy &&
                studyExperiments.length ===
                0 && (
                    <div className="report-generator-empty">
                        <div className="report-generator-empty-icon">
                            ∑
                        </div>

                        <strong>
                            Bu çalışmada henüz
                            deney yok
                        </strong>

                        <p>
                            Study Manager
                            bölümünden kayıtlı
                            deneyleri bu
                            araştırmaya ekledikten
                            sonra rapor otomatik
                            oluşturulacak.
                        </p>
                    </div>
                )}

            {selectedStudy &&
                analysis &&
                report && (
                    <div className="scientific-paper">
                        <div className="scientific-paper-cover">
                            <span>
                                BIOTARGET AI
                            </span>

                            <h2>
                                {
                                    selectedStudy.name
                                }
                            </h2>

                            <p>
                                Computational
                                Nanomedicine
                                Simulation Study
                            </p>

                            <div className="scientific-paper-meta">
                                <div>
                                    <span>
                                        TARGET
                                    </span>

                                    <strong>
                                        {
                                            selectedStudy.cellType
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        EXPERIMENTS
                                    </span>

                                    <strong>
                                        {
                                            studyExperiments.length
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        STATUS
                                    </span>

                                    <strong>
                                        {selectedStudy.status.toUpperCase()}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        CREATED
                                    </span>

                                    <strong>
                                        {
                                            selectedStudy.createdAt
                                        }
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div className="scientific-paper-body">
                            <section className="scientific-paper-section">
                                <span className="paper-section-number">
                                    01
                                </span>

                                <div>
                                    <h3>
                                        Abstract
                                    </h3>

                                    <p>
                                        {
                                            report.abstract
                                        }
                                    </p>
                                </div>
                            </section>

                            <section className="scientific-paper-section">
                                <span className="paper-section-number">
                                    02
                                </span>

                                <div>
                                    <h3>
                                        Research
                                        Objective
                                    </h3>

                                    <p>
                                        {
                                            selectedStudy.objective
                                        }
                                    </p>
                                </div>
                            </section>

                            <section className="scientific-paper-section">
                                <span className="paper-section-number">
                                    03
                                </span>

                                <div>
                                    <h3>
                                        Hypothesis
                                    </h3>

                                    <p>
                                        {
                                            selectedStudy.hypothesis
                                        }
                                    </p>
                                </div>
                            </section>

                            <section className="scientific-paper-section">
                                <span className="paper-section-number">
                                    04
                                </span>

                                <div>
                                    <h3>
                                        Methods
                                    </h3>

                                    <p>
                                        {
                                            report.methods
                                        }
                                    </p>

                                    <div className="paper-method-grid">
                                        <article>
                                            <span>
                                                PARTICLE SIZE
                                            </span>

                                            <strong>
                                                {
                                                    analysis.sizeRange.minimum
                                                }
                                                {" – "}
                                                {
                                                    analysis.sizeRange.maximum
                                                }
                                            </strong>

                                            <small>
                                                nm
                                            </small>
                                        </article>

                                        <article>
                                            <span>
                                                ZETA
                                            </span>

                                            <strong>
                                                {
                                                    analysis.zetaRange.minimum
                                                }
                                                {" – "}
                                                {
                                                    analysis.zetaRange.maximum
                                                }
                                            </strong>

                                            <small>
                                                mV
                                            </small>
                                        </article>

                                        <article>
                                            <span>
                                                LIGAND
                                            </span>

                                            <strong>
                                                {
                                                    analysis.ligandRange.minimum
                                                }
                                                {" – "}
                                                {
                                                    analysis.ligandRange.maximum
                                                }
                                            </strong>

                                            <small>
                                                %
                                            </small>
                                        </article>

                                        <article>
                                            <span>
                                                DOSE
                                            </span>

                                            <strong>
                                                {
                                                    analysis.doseRange.minimum
                                                }
                                                {" – "}
                                                {
                                                    analysis.doseRange.maximum
                                                }
                                            </strong>

                                            <small>
                                                mg/mL
                                            </small>
                                        </article>
                                    </div>
                                </div>
                            </section>

                            <section className="scientific-paper-section">
                                <span className="paper-section-number">
                                    05
                                </span>

                                <div>
                                    <h3>
                                        Results
                                    </h3>

                                    <p>
                                        {
                                            report.results
                                        }
                                    </p>

                                    <div className="paper-result-grid">
                                        <article>
                                            <span>
                                                MEAN BINDING
                                            </span>

                                            <strong>
                                                {analysis.averageBinding.toFixed(
                                                    1
                                                )}
                                            </strong>
                                        </article>

                                        <article>
                                            <span>
                                                MEAN SPECIFICITY
                                            </span>

                                            <strong>
                                                %
                                                {analysis.averageSpecificity.toFixed(
                                                    1
                                                )}
                                            </strong>
                                        </article>

                                        <article>
                                            <span>
                                                MEAN RELEASE
                                            </span>

                                            <strong>
                                                %
                                                {analysis.averageRelease.toFixed(
                                                    1
                                                )}
                                            </strong>
                                        </article>

                                        <article>
                                            <span>
                                                MEAN TOXICITY
                                            </span>

                                            <strong>
                                                {analysis.averageToxicity.toFixed(
                                                    1
                                                )}
                                            </strong>
                                        </article>
                                    </div>
                                </div>
                            </section>

                            <section className="scientific-paper-section">
                                <span className="paper-section-number">
                                    06
                                </span>

                                <div>
                                    <h3>
                                        Conclusion
                                    </h3>

                                    <p>
                                        {
                                            report.conclusion
                                        }
                                    </p>
                                </div>
                            </section>

                            <div className="scientific-paper-disclaimer">
                                <strong>
                                    Computational
                                    Research Notice
                                </strong>

                                <p>
                                    This report was
                                    generated entirely
                                    from BioTarget AI
                                    computational
                                    simulation data.
                                    Results have not been
                                    experimentally or
                                    clinically validated
                                    and must not be
                                    interpreted as
                                    diagnosis, treatment
                                    guidance, clinical
                                    safety evidence or
                                    therapeutic efficacy.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default ScientificReport;