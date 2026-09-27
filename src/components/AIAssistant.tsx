import type {
    SimulationMetrics,
    SimulationParameters,
} from "../types/simulation";

interface AIAssistantProps {
    parameters: SimulationParameters;
    metrics: SimulationMetrics;
}

function AIAssistant({
                         parameters,
                         metrics,
                     }: AIAssistantProps) {
    const recommendations: string[] =
        [];

    if (
        parameters.particleSize >
        140
    ) {
        recommendations.push(
            "Partikül boyutu yüksek. Daha küçük bir formülasyon simülasyonda hedef hücre erişimini artırabilir."
        );
    } else if (
        parameters.particleSize <
        40
    ) {
        recommendations.push(
            "Partikül boyutu oldukça düşük. Dağılım avantajı artarken modelde stabilite ve toksisite dengesi izlenmelidir."
        );
    } else {
        recommendations.push(
            "Partikül boyutu simülasyonun hedefleme açısından dengeli kabul ettiği aralıkta."
        );
    }

    if (
        parameters.ligandDensity <
        45
    ) {
        recommendations.push(
            "Ligand yoğunluğunun artırılması modelde reseptör bağlanma eğilimini yükseltebilir."
        );
    } else if (
        parameters.ligandDensity >
        85
    ) {
        recommendations.push(
            "Ligand yoğunluğu oldukça yüksek. Hedefleme güçlü olsa da daha düşük yoğunluklarla karşılaştırmalı simülasyon yapılabilir."
        );
    }

    if (
        Math.abs(
            parameters.zetaPotential
        ) > 30
    ) {
        recommendations.push(
            "Mutlak zeta potansiyeli yüksek. Model, yüzey yükü arttıkça toksisite riskini yükseltiyor."
        );
    }

    if (
        metrics.toxicityRisk >= 65
    ) {
        recommendations.push(
            "Mevcut kombinasyon yüksek simüle toksisite riski üretiyor. Doz ve yüzey yükünü azaltarak alternatif senaryo oluşturabilirsiniz."
        );
    }

    if (
        metrics.specificity >= 80
    ) {
        recommendations.push(
            "Bu parametre kombinasyonu modelde yüksek hedef özgüllüğü üretiyor."
        );
    }

    if (
        parameters.cellType ===
        "Sağlıklı Kontrol Hücresi"
    ) {
        recommendations.push(
            "Sağlıklı kontrol seçildi. Bu senaryoyu kanser hedefleriyle karşılaştırmak seçicilik davranışını incelemek için kullanılabilir."
        );
    }

    if (
        recommendations.length < 3
    ) {
        recommendations.push(
            "Farklı partikül boyutu ve ligand yoğunluğu kombinasyonlarını deneyerek bağlanma–toksisite dengesini karşılaştırabilirsiniz."
        );
    }

    return (
        <div className="assistant-panel panel">
            <div className="assistant-title">
                <div className="ai-orb">
                    AI
                </div>

                <div>
          <span className="panel-kicker">
            ANLIK YORUMLAMA
          </span>

                    <h2>
                        Biyoinformatik Asistan
                    </h2>
                </div>
            </div>

            <div className="assistant-content">
                <p>
                    <strong>
                        {
                            parameters.cellType
                        }
                    </strong>{" "}
                    hedefi için mevcut
                    formülasyon analiz edildi.
                    Modelin bağlanma skoru{" "}
                    <strong>
                        {
                            metrics.bindingScore
                        }
                        /100
                    </strong>
                    , hedef özgüllüğü ise{" "}
                    <strong>
                        %{metrics.specificity}
                    </strong>{" "}
                    olarak hesaplandı.
                </p>

                <div className="recommendations">
                    {recommendations.map(
                        (
                            recommendation,
                            index
                        ) => (
                            <div
                                className="recommendation"
                                key={index}
                            >
                                <span>✦</span>

                                {recommendation}
                            </div>
                        )
                    )}
                </div>

                <div className="disclaimer">
                    BioTarget AI tahminleri
                    eğitim ve araştırma amaçlı
                    simülasyon çıktılarıdır.
                    Klinik karar veya tedavi
                    önerisi değildir.
                </div>
            </div>
        </div>
    );
}

export default AIAssistant;