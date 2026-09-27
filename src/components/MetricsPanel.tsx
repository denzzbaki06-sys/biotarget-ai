import type {
    SimulationMetrics,
} from "../types/simulation";

interface MetricsPanelProps {
    metrics: SimulationMetrics;
}

function MetricsPanel({
                          metrics,
                      }: MetricsPanelProps) {
    return (
        <div className="metrics-panel panel">
            <div className="panel-header">
                <div>
          <span className="panel-kicker">
            AI TAHMİN MOTORU
          </span>

                    <h2>
                        Canlı Analiz
                    </h2>

                    <p>
                        Parametre değişikliklerine
                        göre tahmini biyofiziksel
                        göstergeler.
                    </p>
                </div>
            </div>

            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon">
                        ◎
                    </div>

                    <span>
            Bağlanma Eğilimi
          </span>

                    <strong>
                        {metrics.bindingScore}/100
                    </strong>

                    <div className="metric-bar">
                        <div
                            className="metric-progress"
                            style={{
                                width: `${metrics.bindingScore}%`,
                            }}
                        />
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">
                        ◈
                    </div>

                    <span>
            Hedef Özgüllüğü
          </span>

                    <strong>
                        %{metrics.specificity}
                    </strong>

                    <div className="metric-bar">
                        <div
                            className="metric-progress"
                            style={{
                                width: `${metrics.specificity}%`,
                            }}
                        />
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">
                        ✦
                    </div>

                    <span>
            Salınım Verimi
          </span>

                    <strong>
                        %
                        {
                            metrics.releaseEfficiency
                        }
                    </strong>

                    <div className="metric-bar">
                        <div
                            className="metric-progress"
                            style={{
                                width: `${metrics.releaseEfficiency}%`,
                            }}
                        />
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">
                        △
                    </div>

                    <span>
            Toksisite Riski
          </span>

                    <strong
                        className={
                            metrics.toxicityRisk >= 35
                                ? "danger-value"
                                : ""
                        }
                    >
                        {metrics.toxicityLevel}
                    </strong>

                    <div className="metric-bar">
                        <div
                            className="metric-progress danger"
                            style={{
                                width: `${metrics.toxicityRisk}%`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MetricsPanel;