import { useMemo, useState } from "react";
import type {
    SimulationMetrics,
    SimulationParameters,
} from "../types/simulation";

import "./ExperimentHistory.css";

export interface ExperimentRecord {
    id: string;
    createdAt: string;
    parameters: SimulationParameters;
    metrics: SimulationMetrics;
    name?: string;
    favorite?: boolean;
}

interface Props {
    experiments: ExperimentRecord[];
    onClear: () => void;
    onLoad: (parameters: SimulationParameters) => void;
    onDelete: (id: string) => void;
    onToggleFavorite: (id: string) => void;
    onRename: (id: string, name: string) => void;
}

function ExperimentHistory({
                               experiments,
                               onClear,
                               onLoad,
                               onDelete,
                               onToggleFavorite,
                               onRename,
                           }: Props) {
    const [search, setSearch] = useState("");
    const [favoritesOnly, setFavoritesOnly] =
        useState(false);

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [editingName, setEditingName] =
        useState("");

    const filteredExperiments = useMemo(() => {
        const query = search
            .trim()
            .toLocaleLowerCase("tr-TR");

        return experiments.filter((experiment) => {
            const name =
                experiment.name?.trim() || "İsimsiz Deney";

            const target =
                experiment.parameters.cellType || "";

            const matchesSearch =
                !query ||
                name
                    .toLocaleLowerCase("tr-TR")
                    .includes(query) ||
                target
                    .toLocaleLowerCase("tr-TR")
                    .includes(query);

            const matchesFavorite =
                !favoritesOnly || experiment.favorite;

            return matchesSearch && matchesFavorite;
        });
    }, [
        experiments,
        search,
        favoritesOnly,
    ]);

    const favoriteCount = useMemo(
        () =>
            experiments.filter(
                (experiment) => experiment.favorite
            ).length,
        [experiments]
    );

    const beginRename = (
        experiment: ExperimentRecord,
        index: number
    ) => {
        setEditingId(experiment.id);

        setEditingName(
            experiment.name?.trim() ||
            `Deney ${index + 1}`
        );
    };

    const saveRename = (id: string) => {
        const cleanName = editingName.trim();

        if (cleanName) {
            onRename(id, cleanName);
        }

        setEditingId(null);
        setEditingName("");
    };

    const cancelRename = () => {
        setEditingId(null);
        setEditingName("");
    };

    return (
        <section className="eh-panel">
            <header className="eh-header">
                <div>
          <span className="eh-kicker">
            DENEY KAYITLARI
          </span>

                    <h3>Simülasyon Geçmişi</h3>

                    <p>
                        Deneylerinizi isimlendirin,
                        favorileyin, arayın ve istediğiniz
                        formülasyonu yeniden laboratuvara
                        yükleyin.
                    </p>
                </div>

                <div className="eh-header-stats">
                    <div>
                        <strong>{experiments.length}</strong>
                        <span>TOPLAM</span>
                    </div>

                    <div>
                        <strong>{favoriteCount}</strong>
                        <span>FAVORİ</span>
                    </div>
                </div>
            </header>

            <div className="eh-toolbar">
                <div className="eh-search">
                    <span>⌕</span>

                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Deney veya hedef hücre ara..."
                    />
                </div>

                <button
                    type="button"
                    className={`eh-filter-button ${
                        favoritesOnly
                            ? "eh-filter-button-active"
                            : ""
                    }`}
                    onClick={() =>
                        setFavoritesOnly(
                            (previous) => !previous
                        )
                    }
                >
                    <span>★</span>
                    Favoriler
                </button>

                <div className="eh-toolbar-spacer" />

                <span className="eh-result-count">
          {filteredExperiments.length} kayıt
        </span>

                <button
                    type="button"
                    className="eh-clear-button"
                    onClick={onClear}
                    disabled={experiments.length === 0}
                >
                    Geçmişi Temizle
                </button>
            </div>

            {experiments.length === 0 ? (
                <div className="eh-empty">
                    <div className="eh-empty-icon">
                        ◇
                    </div>

                    <div>
            <span className="eh-empty-label">
              EXPERIMENT STORAGE
            </span>

                        <h4>
                            Henüz kayıtlı deney bulunmuyor
                        </h4>

                        <p>
                            Laboratuvar bölümünden bir
                            formülasyon oluşturup “Deneyi
                            Kaydet” seçeneğini kullandığınızda
                            kayıtlar burada görüntülenir.
                        </p>
                    </div>
                </div>
            ) : filteredExperiments.length === 0 ? (
                <div className="eh-empty">
                    <div className="eh-empty-icon">
                        ⌕
                    </div>

                    <div>
                        <h4>
                            Aramanızla eşleşen deney yok
                        </h4>

                        <p>
                            Arama metnini veya favori
                            filtresini değiştirin.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="eh-list">
                    {filteredExperiments.map(
                        (experiment, index) => {
                            const displayName =
                                experiment.name?.trim() ||
                                `Deney ${index + 1}`;

                            return (
                                <article
                                    className="eh-card"
                                    key={experiment.id}
                                >
                                    <div className="eh-card-accent" />

                                    <div className="eh-card-header">
                                        <div className="eh-card-title-area">
                                            <div className="eh-card-index">
                                                {String(index + 1).padStart(
                                                    2,
                                                    "0"
                                                )}
                                            </div>

                                            <div className="eh-card-title-copy">
                                                {editingId ===
                                                experiment.id ? (
                                                    <div className="eh-rename">
                                                        <input
                                                            autoFocus
                                                            value={editingName}
                                                            onChange={(event) =>
                                                                setEditingName(
                                                                    event.target.value
                                                                )
                                                            }
                                                            onKeyDown={(event) => {
                                                                if (
                                                                    event.key ===
                                                                    "Enter"
                                                                ) {
                                                                    saveRename(
                                                                        experiment.id
                                                                    );
                                                                }

                                                                if (
                                                                    event.key ===
                                                                    "Escape"
                                                                ) {
                                                                    cancelRename();
                                                                }
                                                            }}
                                                        />

                                                        <button
                                                            type="button"
                                                            className="eh-mini-button eh-confirm"
                                                            onClick={() =>
                                                                saveRename(
                                                                    experiment.id
                                                                )
                                                            }
                                                            aria-label="İsmi kaydet"
                                                        >
                                                            ✓
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="eh-mini-button"
                                                            onClick={
                                                                cancelRename
                                                            }
                                                            aria-label="İptal"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h4>
                                                            {displayName}
                                                        </h4>

                                                        <div className="eh-meta">
                              <span>
                                {
                                    experiment
                                        .parameters
                                        .cellType
                                }
                              </span>

                                                            <i />

                                                            <span>
                                {
                                    experiment.createdAt
                                }
                              </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="eh-card-actions">
                                            <button
                                                type="button"
                                                className={`eh-icon-button ${
                                                    experiment.favorite
                                                        ? "eh-favorite-active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    onToggleFavorite(
                                                        experiment.id
                                                    )
                                                }
                                                title={
                                                    experiment.favorite
                                                        ? "Favoriden çıkar"
                                                        : "Favoriye ekle"
                                                }
                                                aria-label="Favori"
                                            >
                                                ★
                                            </button>

                                            <button
                                                type="button"
                                                className="eh-icon-button"
                                                onClick={() =>
                                                    beginRename(
                                                        experiment,
                                                        index
                                                    )
                                                }
                                                title="Deneyi yeniden adlandır"
                                                aria-label="Yeniden adlandır"
                                            >
                                                ✎
                                            </button>

                                            <button
                                                type="button"
                                                className="eh-icon-button eh-delete"
                                                onClick={() =>
                                                    onDelete(experiment.id)
                                                }
                                                title="Deneyi sil"
                                                aria-label="Sil"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>

                                    <div className="eh-content">
                                        <div className="eh-block">
                      <span className="eh-block-label">
                        FORMÜLASYON
                      </span>

                                            <div className="eh-parameter-grid">
                                                <MetricBox
                                                    label="Partikül Boyutu"
                                                    value={`${experiment.parameters.particleSize}`}
                                                    unit="nm"
                                                />

                                                <MetricBox
                                                    label="Zeta Potansiyeli"
                                                    value={`${experiment.parameters.zetaPotential}`}
                                                    unit="mV"
                                                />

                                                <MetricBox
                                                    label="Ligand Yoğunluğu"
                                                    value={`%${experiment.parameters.ligandDensity}`}
                                                />

                                                <MetricBox
                                                    label="İlaç Dozu"
                                                    value={`${experiment.parameters.drugDose}`}
                                                    unit="mg/mL"
                                                />
                                            </div>
                                        </div>

                                        <div className="eh-divider" />

                                        <div className="eh-block">
                      <span className="eh-block-label">
                        SİMÜLASYON SONUÇLARI
                      </span>

                                            <div className="eh-metric-grid">
                                                <ResultBox
                                                    label="Bağlanma"
                                                    value={
                                                        experiment.metrics
                                                            .bindingScore
                                                    }
                                                />

                                                <ResultBox
                                                    label="Özgüllük"
                                                    value={
                                                        experiment.metrics
                                                            .specificity
                                                    }
                                                    suffix="%"
                                                />

                                                <ResultBox
                                                    label="Salınım"
                                                    value={
                                                        experiment.metrics
                                                            .releaseEfficiency
                                                    }
                                                    suffix="%"
                                                />

                                                <ResultBox
                                                    label="Risk"
                                                    value={
                                                        experiment.metrics
                                                            .toxicityRisk
                                                    }
                                                    risk
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <footer className="eh-card-footer">
                                        <div className="eh-status">
                                            <span className="eh-status-dot" />

                                            COMPUTATIONAL RECORD
                                        </div>

                                        <button
                                            type="button"
                                            className="eh-load-button"
                                            onClick={() =>
                                                onLoad({
                                                    ...experiment.parameters,
                                                })
                                            }
                                        >
                                            Bu Formülasyonu Yükle
                                            <span>→</span>
                                        </button>
                                    </footer>
                                </article>
                            );
                        }
                    )}
                </div>
            )}

            <div className="eh-note">
                <span>i</span>

                <p>
                    <strong>Deney Kayıtları</strong>
                    Bu bölüm BioTarget AI içerisinde
                    oluşturulan hesaplamalı simülasyon
                    kayıtlarını saklar. Sonuçlar deneysel
                    veya klinik doğrulama anlamına gelmez.
                </p>
            </div>
        </section>
    );
}

interface MetricBoxProps {
    label: string;
    value: string;
    unit?: string;
}

function MetricBox({
                       label,
                       value,
                       unit,
                   }: MetricBoxProps) {
    return (
        <div className="eh-value-box">
            <span>{label}</span>

            <div>
                <strong>{value}</strong>

                {unit && <small>{unit}</small>}
            </div>
        </div>
    );
}

interface ResultBoxProps {
    label: string;
    value: number;
    suffix?: string;
    risk?: boolean;
}

function ResultBox({
                       label,
                       value,
                       suffix = "",
                       risk = false,
                   }: ResultBoxProps) {
    return (
        <div
            className={`eh-result-box ${
                risk ? "eh-result-risk" : ""
            }`}
        >
            <span>{label}</span>

            <strong>
                {value}
                {suffix}
            </strong>

            <div className="eh-result-track">
                <div
                    className="eh-result-progress"
                    style={{
                        width: `${Math.max(
                            0,
                            Math.min(100, value)
                        )}%`,
                    }}
                />
            </div>
        </div>
    );
}

export default ExperimentHistory;