import type {
    Dispatch,
    SetStateAction,
} from "react";

import type {
    SimulationParameters,
} from "../types/simulation";

interface Props {
    setParameters: Dispatch<
        SetStateAction<SimulationParameters>
    >;
}

const presets: {
    title: string;
    subtitle: string;
    icon: string;
    parameters: SimulationParameters;
}[] = [
    {
        title: "EGFR Hedefleme",
        subtitle: "Akciğer kanseri modeli",
        icon: "◉",

        parameters: {
            cellType:
                "Akciğer Kanseri (EGFR+)",
            particleSize: 80,
            zetaPotential: -15,
            ligandDensity: 75,
            drugDose: 0.6,
        },
    },

    {
        title: "HER2 Hedefleme",
        subtitle: "Meme kanseri modeli",
        icon: "✦",

        parameters: {
            cellType:
                "Meme Kanseri (HER2+)",
            particleSize: 95,
            zetaPotential: -10,
            ligandDensity: 82,
            drugDose: 0.7,
        },
    },

    {
        title: "PD-L1 Modeli",
        subtitle: "İmmüno-onkoloji",
        icon: "◎",

        parameters: {
            cellType:
                "İmmüno-Onkoloji (PD-L1)",
            particleSize: 110,
            zetaPotential: -8,
            ligandDensity: 68,
            drugDose: 0.5,
        },
    },

    {
        title: "Sağlıklı Kontrol",
        subtitle: "Kontrol senaryosu",
        icon: "◇",

        parameters: {
            cellType:
                "Sağlıklı Kontrol Hücresi",
            particleSize: 80,
            zetaPotential: -15,
            ligandDensity: 40,
            drugDose: 0.4,
        },
    },
];

function PresetScenarios({
                             setParameters,
                         }: Props) {
    return (
        <div className="preset-panel">
            <div className="preset-heading">
                <div>
          <span className="panel-kicker">
            HAZIR DENEYLER
          </span>

                    <h3>
                        Formülasyon Presetleri
                    </h3>
                </div>

                <p>
                    Tek tıkla örnek bir deney
                    konfigürasyonu yükleyin.
                </p>
            </div>

            <div className="preset-grid">
                {presets.map((preset) => (
                    <button
                        key={preset.title}
                        className="preset-card"
                        onClick={() =>
                            setParameters({
                                ...preset.parameters,
                            })
                        }
                    >
            <span className="preset-icon">
              {preset.icon}
            </span>

                        <div>
                            <strong>
                                {preset.title}
                            </strong>

                            <small>
                                {preset.subtitle}
                            </small>
                        </div>

                        <span className="preset-arrow">
              →
            </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default PresetScenarios;