import {
    useState,
} from "react";

import type {
    Dispatch,
    SetStateAction,
} from "react";

import type {
    SimulationParameters,
} from "../types/simulation";

import {
    runOptimization,
} from "../engine/optimizationEngine";

import type {
    OptimizationResult,
} from "../engine/optimizationEngine";

interface Props {
    parameters: SimulationParameters;

    setParameters: Dispatch<
        SetStateAction<SimulationParameters>
    >;

    startSimulation: () => void;
}

function OptimizationPanel({
                               parameters,
                               setParameters,
                               startSimulation,
                           }: Props) {
    const [
        results,
        setResults,
    ] =
        useState<
            OptimizationResult[]
        >([]);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const optimize = () => {
        setLoading(true);

        window.setTimeout(() => {
            const optimized =
                runOptimization(
                    parameters
                );

            setResults(optimized);

            setLoading(false);
        }, 700);
    };

    const applyResult = (
        result: OptimizationResult
    ) => {
        setParameters({
            ...result.parameters,
        });

        window.setTimeout(
            startSimulation,
            50
        );
    };

    return (
        <div className="optimization-panel panel">
            <div className="optimization-header">
                <div>
                    <span className="panel-kicker">
                        PARAMETRE TARAMASI
                    </span>

                    <h2>
                        AI Optimizasyon Motoru
                    </h2>

                    <p>
                        Formülasyon uzayını
                        tarayarak yüksek
                        simülasyon skoruna sahip
                        adayları sıralar.
                    </p>
                </div>

                <button
                    className="optimization-button"
                    onClick={optimize}
                    disabled={loading}
                >
                    {loading
                        ? "Taranıyor..."
                        : "✦ Optimizasyonu Başlat"}
                </button>
            </div>

            {results.length === 0 &&
                !loading && (
                    <div className="optimization-empty">
                        <div className="optimization-orb">
                            AI
                        </div>

                        <strong>
                            Optimizasyon Hazır
                        </strong>

                        <p>
                            Hedef hücre için
                            parametre kombinasyonlarını
                            tarayın.
                        </p>
                    </div>
                )}

            {loading && (
                <div className="optimization-loading">
                    <div className="scan-loader" />

                    <strong>
                        Formülasyon uzayı
                        taranıyor...
                    </strong>

                    <span>
                        900 kombinasyon analiz
                        ediliyor
                    </span>
                </div>
            )}

            {results.length > 0 &&
                !loading && (
                    <div className="optimization-results">
                        {results.map(
                            (result, index) => (
                                <div
                                    className={`optimization-result ${
                                        index === 0
                                            ? "best-result"
                                            : ""
                                    }`}
                                    key={result.id}
                                >
                                    <div className="optimization-rank">
                                        <span>
                                            #{index + 1}
                                        </span>

                                        {index === 0 && (
                                            <small>
                                                EN YÜKSEK
                                                SİMÜLASYON
                                                SKORU
                                            </small>
                                        )}
                                    </div>

                                    <div className="optimization-score">
                                        <strong>
                                            {
                                                result.optimizationScore
                                            }
                                        </strong>

                                        <span>
                                            /100
                                        </span>
                                    </div>

                                    <div className="optimization-parameters">
                                        <div>
                                            <span>
                                                Boyut
                                            </span>

                                            <strong>
                                                {
                                                    result
                                                        .parameters
                                                        .particleSize
                                                }{" "}
                                                nm
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Zeta
                                            </span>

                                            <strong>
                                                {
                                                    result
                                                        .parameters
                                                        .zetaPotential
                                                }{" "}
                                                mV
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Ligand
                                            </span>

                                            <strong>
                                                %
                                                {
                                                    result
                                                        .parameters
                                                        .ligandDensity
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Doz
                                            </span>

                                            <strong>
                                                {
                                                    result
                                                        .parameters
                                                        .drugDose
                                                }{" "}
                                                mg/mL
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="optimization-metrics">
                                        <span>
                                            Bağlanma{" "}
                                            <b>
                                                {
                                                    result
                                                        .metrics
                                                        .bindingScore
                                                }
                                            </b>
                                        </span>

                                        <span>
                                            Özgüllük{" "}
                                            <b>
                                                %
                                                {
                                                    result
                                                        .metrics
                                                        .specificity
                                                }
                                            </b>
                                        </span>

                                        <span>
                                            Salınım{" "}
                                            <b>
                                                %
                                                {
                                                    result
                                                        .metrics
                                                        .releaseEfficiency
                                                }
                                            </b>
                                        </span>

                                        <span>
                                            Risk{" "}
                                            <b>
                                                {
                                                    result
                                                        .metrics
                                                        .toxicityRisk
                                                }
                                            </b>
                                        </span>
                                    </div>

                                    <button
                                        className="apply-optimization"
                                        onClick={() =>
                                            applyResult(
                                                result
                                            )
                                        }
                                    >
                                        Bu Formülasyonu
                                        Simüle Et →
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                )}

            <div className="optimization-notice">
                Hesaplamalı eğitim
                simülasyonudur; klinik
                optimizasyon veya tedavi
                önerisi değildir.
            </div>
        </div>
    );
}

export default OptimizationPanel;