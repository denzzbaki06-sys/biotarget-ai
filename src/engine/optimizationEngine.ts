import type {
    SimulationMetrics,
    SimulationParameters,
} from "../types/simulation";

import {
    calculateMetrics,
} from "./predictionEngine";

export interface OptimizationResult {
    id: number;
    parameters: SimulationParameters;
    metrics: SimulationMetrics;
    optimizationScore: number;
}

const particleSizes = [
    40,
    60,
    80,
    100,
    120,
    140,
];

const zetaPotentials = [
    -30,
    -20,
    -10,
    0,
    10,
    20,
];

const ligandDensities = [
    30,
    45,
    60,
    75,
    90,
];

const doses = [
    0.3,
    0.5,
    0.7,
    1,
    1.3,
];

export function runOptimization(
    baseParameters: SimulationParameters
): OptimizationResult[] {
    const results: OptimizationResult[] =
        [];

    let id = 1;

    particleSizes.forEach(
        (particleSize) => {
            zetaPotentials.forEach(
                (zetaPotential) => {
                    ligandDensities.forEach(
                        (ligandDensity) => {
                            doses.forEach(
                                (drugDose) => {
                                    const parameters: SimulationParameters =
                                        {
                                            cellType:
                                            baseParameters.cellType,

                                            particleSize,

                                            zetaPotential,

                                            ligandDensity,

                                            drugDose,
                                        };

                                    const metrics =
                                        calculateMetrics(
                                            parameters
                                        );

                                    const optimizationScore =
                                        Math.round(
                                            metrics.bindingScore *
                                            0.3 +
                                            metrics.specificity *
                                            0.35 +
                                            metrics.releaseEfficiency *
                                            0.25 +
                                            (100 -
                                                metrics.toxicityRisk) *
                                            0.1
                                        );

                                    results.push({
                                        id,
                                        parameters,
                                        metrics,
                                        optimizationScore,
                                    });

                                    id++;
                                }
                            );
                        }
                    );
                }
            );
        }
    );

    return results
        .sort(
            (a, b) =>
                b.optimizationScore -
                a.optimizationScore
        )
        .slice(0, 5);
}