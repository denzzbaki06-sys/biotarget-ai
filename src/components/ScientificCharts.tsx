import type {
    SimulationMetrics,
    SimulationParameters,
} from "../types/simulation";

interface Props {
    parameters: SimulationParameters;
    metrics: SimulationMetrics;
}

interface ChartBarProps {
    label: string;
    value: number;
    suffix?: string;
    description: string;
}

function ChartBar({
                      label,
                      value,
                      suffix = "%",
                      description,
                  }: ChartBarProps) {
    const safeValue = Math.max(
        0,
        Math.min(100, value)
    );

    return (
        <div className="science-chart-row">
            <div className="science-chart-label">
                <div>
                    <strong>{label}</strong>
                    <span>{description}</span>
                </div>

                <b>
                    {value}
                    {suffix}
                </b>
            </div>

            <div className="science-chart-track">
                <div
                    className="science-chart-fill"
                    style={{
                        width: `${safeValue}%`,
                    }}
                />
            </div>
        </div>
    );
}

function ScientificCharts({
                              parameters,
                              metrics,
                          }: Props) {
    const sizeOptimization =
        Math.max(
            0,
            Math.round(
                100 -
                Math.abs(
                    parameters.particleSize -
                    85
                ) *
                0.7
            )
        );

    const chargeStability =
        Math.max(
            0,
            Math.round(
                100 -
                Math.abs(
                    parameters.zetaPotential
                ) *
                1.15
            )
        );

    return (
        <div className="science-panel panel">
            <div className="science-panel-header">
                <div>
          <span className="panel-kicker">
            CANLI VERİ ANALİZİ
          </span>

                    <h2>
                        Formülasyon Profili
                    </h2>

                    <p>
                        Simülasyon parametrelerinin
                        hesaplanan çıktılarla
                        ilişkisini anlık inceleyin.
                    </p>
                </div>

                <div className="live-indicator">
                    <span />
                    LIVE
                </div>
            </div>

            <div className="science-chart-content">
                <ChartBar
                    label="Bağlanma Eğilimi"
                    value={
                        metrics.bindingScore
                    }
                    suffix="/100"
                    description="Reseptör etkileşim skoru"
                />

                <ChartBar
                    label="Hedef Özgüllüğü"
                    value={metrics.specificity}
                    description="Hedef / kontrol seçiciliği"
                />

                <ChartBar
                    label="Salınım Verimi"
                    value={
                        metrics.releaseEfficiency
                    }
                    description="Simüle ilaç salınımı"
                />

                <ChartBar
                    label="Boyut Uygunluğu"
                    value={sizeOptimization}
                    description={`${parameters.particleSize} nm partikül profili`}
                />

                <ChartBar
                    label="Yüzey Stabilitesi"
                    value={chargeStability}
                    description={`${parameters.zetaPotential} mV zeta potansiyeli`}
                />

                <div className="toxicity-chart">
                    <div className="toxicity-chart-top">
                        <div>
                            <strong>
                                Toksisite Risk İndeksi
                            </strong>

                            <span>
                Doz + yüzey yükü
                modellemesi
              </span>
                        </div>

                        <b>
                            {metrics.toxicityRisk}
                            /100
                        </b>
                    </div>

                    <div className="toxicity-scale">
                        <div
                            className="toxicity-marker"
                            style={{
                                left: `${Math.min(
                                    98,
                                    metrics.toxicityRisk
                                )}%`,
                            }}
                        />

                        <div className="toxicity-low">
                            Düşük
                        </div>

                        <div className="toxicity-medium">
                            Orta
                        </div>

                        <div className="toxicity-high">
                            Yüksek
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ScientificCharts;