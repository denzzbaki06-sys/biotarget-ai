export type CellType =
    | "Akciğer Kanseri (EGFR+)"
    | "Meme Kanseri (HER2+)"
    | "İmmüno-Onkoloji (PD-L1)"
    | "Sağlıklı Kontrol Hücresi";

export interface SimulationParameters {
    cellType: CellType;
    particleSize: number;
    zetaPotential: number;
    ligandDensity: number;
    drugDose: number;
}

export type ToxicityLevel =
    | "Düşük"
    | "Orta"
    | "Yüksek";

export interface SimulationMetrics {
    bindingScore: number;
    specificity: number;
    releaseEfficiency: number;
    toxicityRisk: number;
    toxicityLevel: ToxicityLevel;
}