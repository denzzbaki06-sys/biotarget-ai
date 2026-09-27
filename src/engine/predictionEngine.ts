import type {
    SimulationMetrics,
    SimulationParameters,
    ToxicityLevel,
} from "../types/simulation";

const clamp = (
    value: number,
    min = 0,
    max = 100
) => Math.min(max, Math.max(min, value));

export function calculateMetrics(
    parameters: SimulationParameters
): SimulationMetrics {
    const {
        cellType,
        particleSize,
        zetaPotential,
        ligandDensity,
        drugDose,
    } = parameters;

    const sizeDistance =
        Math.abs(particleSize - 85);

    const sizeScore =
        clamp(100 - sizeDistance * 0.65);

    const chargePenalty =
        Math.abs(zetaPotential) * 0.42;

    let receptorFactor = 1;

    switch (cellType) {
        case "Akciğer Kanseri (EGFR+)":
            receptorFactor = 1.08;
            break;

        case "Meme Kanseri (HER2+)":
            receptorFactor = 1.05;
            break;

        case "İmmüno-Onkoloji (PD-L1)":
            receptorFactor = 1.02;
            break;

        case "Sağlıklı Kontrol Hücresi":
            receptorFactor = 0.48;
            break;
    }

    const bindingScore = clamp(
        (
            sizeScore * 0.35 +
            ligandDensity * 0.5 +
            (100 - chargePenalty) * 0.15
        ) * receptorFactor
    );

    const cancerTargetBonus =
        cellType ===
        "Sağlıklı Kontrol Hücresi"
            ? -32
            : 14;

    const specificity = clamp(
        ligandDensity * 0.72 +
        sizeScore * 0.22 +
        cancerTargetBonus -
        Math.max(
            0,
            Math.abs(zetaPotential) - 25
        ) *
        0.25
    );

    const releaseEfficiency = clamp(
        50 +
        drugDose * 22 +
        (100 - sizeDistance) * 0.18 +
        ligandDensity * 0.12
    );

    const chargeRisk =
        Math.max(
            0,
            Math.abs(zetaPotential) - 15
        ) * 1.05;

    const doseRisk =
        drugDose * 22;

    const sizeRisk =
        particleSize < 40
            ? (40 - particleSize) * 0.45
            : particleSize > 150
                ? (particleSize - 150) * 0.35
                : 0;

    const toxicityRisk = clamp(
        chargeRisk +
        doseRisk +
        sizeRisk
    );

    let toxicityLevel: ToxicityLevel =
        "Düşük";

    if (toxicityRisk >= 65) {
        toxicityLevel = "Yüksek";
    } else if (toxicityRisk >= 35) {
        toxicityLevel = "Orta";
    }

    return {
        bindingScore:
            Math.round(bindingScore),

        specificity:
            Math.round(specificity),

        releaseEfficiency:
            Math.round(releaseEfficiency),

        toxicityRisk:
            Math.round(toxicityRisk),

        toxicityLevel,
    };
}