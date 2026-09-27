import { useMemo, useState } from "react";
import type { ExperimentRecord } from "./ExperimentHistory";

import "./DatasetExplorer.css";

interface Props {
    experiments: ExperimentRecord[];
    onLoad: (parameters: ExperimentRecord["parameters"]) => void;
}

type SortKey =
    | "newest"
    | "binding"
    | "specificity"
    | "release"
    | "toxicity"
    | "particleSize"
    | "ligandDensity";

type MetricMode =
    | "all"
    | "binding"
    | "specificity"
    | "release"
    | "toxicity";

function DatasetExplorer({
                             experiments,
                             onLoad,
                         }: Props) {
    const [search, setSearch] = useState("");
    const [cellType, setCellType] = useState("all");
    const [sortKey, setSortKey] =
        useState<SortKey>("newest");
    const [metricMode, setMetricMode] =
        useState<MetricMode>("all");
    const [favoritesOnly, setFavoritesOnly] =
        useState(false);

    const cellTypes = useMemo(() => {
        return Array.from(
            new Set(
                experiments.map(
                    (experiment) =>
                        experiment.parameters.cellType
                )
            )
        ).sort();
    }, [experiments]);

    const filteredExperiments = useMemo(() => {
        const normalizedSearch = search
            .trim()
            .toLocaleLowerCase("tr-TR");

        const result = experiments.filter(
            (experiment) => {
                const experimentName =
                    experiment.name || "İsimsiz Deney";

                const matchesSearch =
                    normalizedSearch.length === 0 ||
                    experimentName
                        .toLocaleLowerCase("tr-TR")
                        .includes(normalizedSearch) ||
                    experiment.parameters.cellType
                        .toLocaleLowerCase("tr-TR")
                        .includes(normalizedSearch);

                const matchesCellType =
                    cellType === "all" ||
                    experiment.parameters.cellType ===
                    cellType;

                const matchesFavorite =
                    !favoritesOnly ||
                    experiment.favorite;

                return (
                    matchesSearch &&
                    matchesCellType &&
                    matchesFavorite
                );
            }
        );

        return [...result].sort((a, b) => {
            switch (sortKey) {
                case "binding":
                    return (
                        b.metrics.bindingScore -
                        a.metrics.bindingScore
                    );

                case "specificity":
                    return (
                        b.metrics.specificity -
                        a.metrics.specificity
                    );

                case "release":
                    return (
                        b.metrics.releaseEfficiency -
                        a.metrics.releaseEfficiency
                    );

                case "toxicity":
                    return (
                        a.metrics.toxicityRisk -
                        b.metrics.toxicityRisk
                    );

                case "particleSize":
                    return (
                        a.parameters.particleSize -
                        b.parameters.particleSize
                    );

                case "ligandDensity":
                    return (
                        b.parameters.ligandDensity -
                        a.parameters.ligandDensity
                    );

                case "newest":
                default:
                    return 0;
            }
        });
    }, [
        experiments,
        search,
        cellType,
        favoritesOnly,
        sortKey,
    ]);

    const highlights = useMemo(() => {
        if (experiments.length === 0) {
            return {
                highestBinding: null,
                highestSpecificity: null,
                highestRelease: null,
                lowestToxicity: null,
            };
        }

        const highestBinding = [...experiments].sort(
            (a, b) =>
                b.metrics.bindingScore -
                a.metrics.bindingScore
        )[0];

        const highestSpecificity = [...experiments].sort(
            (a, b) =>
                b.metrics.specificity -
                a.metrics.specificity
        )[0];

        const highestRelease = [...experiments].sort(
            (a, b) =>
                b.metrics.releaseEfficiency -
                a.metrics.releaseEfficiency
        )[0];

        const lowestToxicity = [...experiments].sort(
            (a, b) =>
                a.metrics.toxicityRisk -
                b.metrics.toxicityRisk
        )[0];

        return {
            highestBinding,
            highestSpecificity,
            highestRelease,
            lowestToxicity,
        };
    }, [experiments]);

    const getExperimentName = (
        experiment: ExperimentRecord | null
    ) => {
        if (!experiment) {
            return "—";
        }

        return experiment.name || "İsimsiz Deney";
    };

    const clearFilters = () => {
        setSearch("");
        setCellType("all");
        setSortKey("newest");
        setMetricMode("all");
        setFavoritesOnly(false);
    };

    const visibleMetricClass = (
        metric: Exclude<MetricMode, "all">
    ) => {
        if (
            metricMode === "all" ||
            metricMode === metric
        ) {
            return "";
        }

        return "dataset-metric-hidden";
    };

    return (
        <div className="dataset-explorer">
            <div className="dataset-explorer-header">
                <div>
                    <span className="dataset-kicker">
                        EXPERIMENT DATASET
                    </span>

                    <h3>Dataset Explorer</h3>

                    <p>
                        Kayıtlı simülasyon deneylerini
                        filtreleyin, sıralayın ve
                        parametre-metrik verilerini tek bir
                        araştırma tablosunda inceleyin.
                    </p>
                </div>

                <div className="dataset-count-badge">
                    <span>{experiments.length}</span>
                    DATA POINTS
                </div>
            </div>

            {experiments.length === 0 ? (
                <div className="dataset-empty">
                    <div className="dataset-empty-icon">
                        ▦
                    </div>

                    <strong>
                        Dataset henüz boş
                    </strong>

                    <p>
                        Deney kaydettiğinde tüm simülasyon
                        kayıtların burada tablo halinde
                        görüntülenecek.
                    </p>
                </div>
            ) : (
                <>
                    <div className="dataset-highlights">
                        <article className="dataset-highlight-card">
                            <span className="dataset-highlight-label">
                                EN YÜKSEK BAĞLANMA
                            </span>

                            <strong>
                                {highlights
                                    .highestBinding
                                    ?.metrics
                                    .bindingScore ?? "—"}
                            </strong>

                            <small>
                                {getExperimentName(
                                    highlights.highestBinding
                                )}
                            </small>
                        </article>

                        <article className="dataset-highlight-card">
                            <span className="dataset-highlight-label">
                                EN YÜKSEK ÖZGÜLLÜK
                            </span>

                            <strong>
                                {highlights.highestSpecificity
                                    ? `%${highlights.highestSpecificity.metrics.specificity}`
                                    : "—"}
                            </strong>

                            <small>
                                {getExperimentName(
                                    highlights.highestSpecificity
                                )}
                            </small>
                        </article>

                        <article className="dataset-highlight-card">
                            <span className="dataset-highlight-label">
                                EN YÜKSEK SALINIM
                            </span>

                            <strong>
                                {highlights.highestRelease
                                    ? `%${highlights.highestRelease.metrics.releaseEfficiency}`
                                    : "—"}
                            </strong>

                            <small>
                                {getExperimentName(
                                    highlights.highestRelease
                                )}
                            </small>
                        </article>

                        <article className="dataset-highlight-card">
                            <span className="dataset-highlight-label">
                                EN DÜŞÜK TOKSİSİTE
                            </span>

                            <strong>
                                {highlights
                                    .lowestToxicity
                                    ?.metrics
                                    .toxicityRisk ?? "—"}
                            </strong>

                            <small>
                                {getExperimentName(
                                    highlights.lowestToxicity
                                )}
                            </small>
                        </article>
                    </div>

                    <div className="dataset-toolbar">
                        <div className="dataset-search">
                            <span>⌕</span>

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Deney veya hücre ara..."
                            />
                        </div>

                        <select
                            value={cellType}
                            onChange={(event) =>
                                setCellType(
                                    event.target.value
                                )
                            }
                        >
                            <option value="all">
                                Tüm hücre tipleri
                            </option>

                            {cellTypes.map((type) => (
                                <option
                                    value={type}
                                    key={type}
                                >
                                    {type}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sortKey}
                            onChange={(event) =>
                                setSortKey(
                                    event.target
                                        .value as SortKey
                                )
                            }
                        >
                            <option value="newest">
                                Kayıt sırası
                            </option>

                            <option value="binding">
                                Bağlanma: yüksek → düşük
                            </option>

                            <option value="specificity">
                                Özgüllük: yüksek → düşük
                            </option>

                            <option value="release">
                                Salınım: yüksek → düşük
                            </option>

                            <option value="toxicity">
                                Toksisite: düşük → yüksek
                            </option>

                            <option value="particleSize">
                                Boyut: küçük → büyük
                            </option>

                            <option value="ligandDensity">
                                Ligand: yüksek → düşük
                            </option>
                        </select>

                        <button
                            type="button"
                            className={`dataset-favorite-filter ${
                                favoritesOnly
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                setFavoritesOnly(
                                    (previous) =>
                                        !previous
                                )
                            }
                        >
                            ★ Favoriler
                        </button>

                        <button
                            type="button"
                            className="dataset-reset-button"
                            onClick={clearFilters}
                        >
                            Sıfırla
                        </button>
                    </div>

                    <div className="dataset-metric-tabs">
                        <button
                            type="button"
                            className={
                                metricMode === "all"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setMetricMode("all")
                            }
                        >
                            Tüm Metrikler
                        </button>

                        <button
                            type="button"
                            className={
                                metricMode === "binding"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setMetricMode(
                                    "binding"
                                )
                            }
                        >
                            Bağlanma
                        </button>

                        <button
                            type="button"
                            className={
                                metricMode ===
                                "specificity"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setMetricMode(
                                    "specificity"
                                )
                            }
                        >
                            Özgüllük
                        </button>

                        <button
                            type="button"
                            className={
                                metricMode === "release"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setMetricMode(
                                    "release"
                                )
                            }
                        >
                            Salınım
                        </button>

                        <button
                            type="button"
                            className={
                                metricMode === "toxicity"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setMetricMode(
                                    "toxicity"
                                )
                            }
                        >
                            Toksisite
                        </button>
                    </div>

                    <div className="dataset-result-bar">
                        <span>
                            {filteredExperiments.length} /{" "}
                            {experiments.length} deney
                            gösteriliyor
                        </span>

                        {(search ||
                            cellType !== "all" ||
                            favoritesOnly) && (
                            <strong>
                                FİLTRE AKTİF
                            </strong>
                        )}
                    </div>

                    {filteredExperiments.length === 0 ? (
                        <div className="dataset-no-results">
                            <strong>
                                Eşleşen deney bulunamadı
                            </strong>

                            <p>
                                Arama veya filtreleri
                                değiştirerek tekrar deneyin.
                            </p>

                            <button
                                type="button"
                                onClick={clearFilters}
                            >
                                Filtreleri Temizle
                            </button>
                        </div>
                    ) : (
                        <div className="dataset-table-wrapper">
                            <table className="dataset-table">
                                <thead>
                                <tr>
                                    <th>Deney</th>
                                    <th>Hedef Hücre</th>
                                    <th>Boyut</th>
                                    <th>Zeta</th>
                                    <th>Ligand</th>
                                    <th>Doz</th>

                                    <th
                                        className={visibleMetricClass(
                                            "binding"
                                        )}
                                    >
                                        Bağlanma
                                    </th>

                                    <th
                                        className={visibleMetricClass(
                                            "specificity"
                                        )}
                                    >
                                        Özgüllük
                                    </th>

                                    <th
                                        className={visibleMetricClass(
                                            "release"
                                        )}
                                    >
                                        Salınım
                                    </th>

                                    <th
                                        className={visibleMetricClass(
                                            "toxicity"
                                        )}
                                    >
                                        Toksisite
                                    </th>

                                    <th>İşlem</th>
                                </tr>
                                </thead>

                                <tbody>
                                {filteredExperiments.map(
                                    (experiment) => (
                                        <tr
                                            key={
                                                experiment.id
                                            }
                                        >
                                            <td>
                                                <div className="dataset-experiment-name">
                                                    {experiment.favorite && (
                                                        <span>
                                                                ★
                                                            </span>
                                                    )}

                                                    <div>
                                                        <strong>
                                                            {experiment.name ||
                                                                "İsimsiz Deney"}
                                                        </strong>

                                                        <small>
                                                            {
                                                                experiment.createdAt
                                                            }
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                    <span className="dataset-cell-type">
                                                        {
                                                            experiment
                                                                .parameters
                                                                .cellType
                                                        }
                                                    </span>
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        experiment
                                                            .parameters
                                                            .particleSize
                                                    }
                                                </strong>

                                                <small>
                                                    {" "}
                                                    nm
                                                </small>
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        experiment
                                                            .parameters
                                                            .zetaPotential
                                                    }
                                                </strong>

                                                <small>
                                                    {" "}
                                                    mV
                                                </small>
                                            </td>

                                            <td>
                                                <strong>
                                                    %
                                                    {
                                                        experiment
                                                            .parameters
                                                            .ligandDensity
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        experiment
                                                            .parameters
                                                            .drugDose
                                                    }
                                                </strong>

                                                <small>
                                                    {" "}
                                                    mg/mL
                                                </small>
                                            </td>

                                            <td
                                                className={visibleMetricClass(
                                                    "binding"
                                                )}
                                            >
                                                    <span className="dataset-metric-value binding">
                                                        {
                                                            experiment
                                                                .metrics
                                                                .bindingScore
                                                        }
                                                    </span>
                                            </td>

                                            <td
                                                className={visibleMetricClass(
                                                    "specificity"
                                                )}
                                            >
                                                    <span className="dataset-metric-value specificity">
                                                        %
                                                        {
                                                            experiment
                                                                .metrics
                                                                .specificity
                                                        }
                                                    </span>
                                            </td>

                                            <td
                                                className={visibleMetricClass(
                                                    "release"
                                                )}
                                            >
                                                    <span className="dataset-metric-value release">
                                                        %
                                                        {
                                                            experiment
                                                                .metrics
                                                                .releaseEfficiency
                                                        }
                                                    </span>
                                            </td>

                                            <td
                                                className={visibleMetricClass(
                                                    "toxicity"
                                                )}
                                            >
                                                    <span className="dataset-metric-value toxicity">
                                                        {
                                                            experiment
                                                                .metrics
                                                                .toxicityRisk
                                                        }
                                                    </span>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="dataset-load-button"
                                                    onClick={() =>
                                                        onLoad(
                                                            experiment.parameters
                                                        )
                                                    }
                                                >
                                                    Yükle
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="dataset-footer-note">
                        <span>i</span>

                        <p>
                            Dataset Explorer yalnızca
                            kayıtlı simülasyon sonuçlarını
                            gösterir. Gösterilen metrikler
                            deneysel veya klinik ölçüm
                            değildir.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

export default DatasetExplorer;