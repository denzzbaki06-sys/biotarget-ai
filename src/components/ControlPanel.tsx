import type {
    Dispatch,
    SetStateAction,
} from "react";

import type {
    CellType,
    SimulationParameters,
} from "../types/simulation";

interface ControlPanelProps {
    parameters: SimulationParameters;

    setParameters: Dispatch<
        SetStateAction<SimulationParameters>
    >;
}

function ControlPanel({
                          parameters,
                          setParameters,
                      }: ControlPanelProps) {
    const updateParameter = <
        K extends keyof SimulationParameters
    >(
        key: K,
        value: SimulationParameters[K]
    ) => {
        setParameters((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    return (
        <div className="control-panel panel">
            <div className="panel-header">
                <div>
          <span className="panel-kicker">
            PARAMETRELER
          </span>

                    <h2>
                        AI Kontrol Paneli
                    </h2>

                    <p>
                        Nanopartikül simülasyon
                        parametrelerini gerçek zamanlı
                        değiştirin.
                    </p>
                </div>
            </div>

            <div className="control">
                <label>
                    Hedef Hücre Tipi
                </label>

                <select
                    value={parameters.cellType}
                    onChange={(event) =>
                        updateParameter(
                            "cellType",
                            event.target
                                .value as CellType
                        )
                    }
                >
                    <option>
                        Akciğer Kanseri (EGFR+)
                    </option>

                    <option>
                        Meme Kanseri (HER2+)
                    </option>

                    <option>
                        İmmüno-Onkoloji (PD-L1)
                    </option>

                    <option>
                        Sağlıklı Kontrol Hücresi
                    </option>
                </select>
            </div>

            <div className="control slider-control">
                <div className="control-top">
                    <label>
                        Partikül Boyutu
                    </label>

                    <strong>
                        {parameters.particleSize} nm
                    </strong>
                </div>

                <input
                    type="range"
                    min="20"
                    max="200"
                    step="1"
                    value={parameters.particleSize}
                    onChange={(event) =>
                        updateParameter(
                            "particleSize",
                            Number(
                                event.target.value
                            )
                        )
                    }
                />

                <div className="range-values">
                    <span>20 nm</span>
                    <span>200 nm</span>
                </div>
            </div>

            <div className="control slider-control">
                <div className="control-top">
                    <label>
                        Zeta Potansiyeli
                    </label>

                    <strong>
                        {parameters.zetaPotential} mV
                    </strong>
                </div>

                <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={
                        parameters.zetaPotential
                    }
                    onChange={(event) =>
                        updateParameter(
                            "zetaPotential",
                            Number(
                                event.target.value
                            )
                        )
                    }
                />

                <div className="range-values">
                    <span>-50 mV</span>
                    <span>0</span>
                    <span>+50 mV</span>
                </div>
            </div>

            <div className="control slider-control">
                <div className="control-top">
                    <label>
                        Ligand Yoğunluğu
                    </label>

                    <strong>
                        %{parameters.ligandDensity}
                    </strong>
                </div>

                <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={
                        parameters.ligandDensity
                    }
                    onChange={(event) =>
                        updateParameter(
                            "ligandDensity",
                            Number(
                                event.target.value
                            )
                        )
                    }
                />

                <div className="range-values">
                    <span>%10</span>
                    <span>%100</span>
                </div>
            </div>

            <div className="control slider-control">
                <div className="control-top">
                    <label>
                        İlaç Dozu
                    </label>

                    <strong>
                        {parameters.drugDose.toFixed(
                            1
                        )}{" "}
                        mg/mL
                    </strong>
                </div>

                <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={parameters.drugDose}
                    onChange={(event) =>
                        updateParameter(
                            "drugDose",
                            Number(
                                event.target.value
                            )
                        )
                    }
                />

                <div className="range-values">
                    <span>0.1</span>
                    <span>3.0 mg/mL</span>
                </div>
            </div>
        </div>
    );
}

export default ControlPanel;