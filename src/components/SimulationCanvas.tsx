import {
    useEffect,
    useRef,
    useState,
} from "react";

import type {
    SimulationParameters,
} from "../types/simulation";

interface SimulationCanvasProps {
    parameters: SimulationParameters;
    simulationRun: number;
}

type SimulationPhase =
    | "idle"
    | "circulation"
    | "approach"
    | "binding"
    | "endocytosis"
    | "release"
    | "completed";

const phases: {
    key: SimulationPhase;
    label: string;
}[] = [
    {
        key: "circulation",
        label: "Dolaşım",
    },
    {
        key: "approach",
        label: "Hedefe Yaklaşma",
    },
    {
        key: "binding",
        label: "Reseptöre Bağlanma",
    },
    {
        key: "endocytosis",
        label: "Endositoz",
    },
    {
        key: "release",
        label: "İlaç Salınımı",
    },
];

function SimulationCanvas({
                              parameters,
                              simulationRun,
                          }: SimulationCanvasProps) {
    const canvasRef =
        useRef<HTMLCanvasElement | null>(
            null
        );

    const animationRef =
        useRef<number | null>(null);

    const startTimeRef =
        useRef<number | null>(null);

    const [phase, setPhase] =
        useState<SimulationPhase>("idle");

    const [elapsed, setElapsed] =
        useState(0);

    const [internalRun, setInternalRun] =
        useState(0);

    const effectiveRun =
        simulationRun + internalRun;

    const resetSimulation = () => {
        if (
            animationRef.current !== null
        ) {
            cancelAnimationFrame(
                animationRef.current
            );
        }

        startTimeRef.current = null;

        setElapsed(0);
        setPhase("idle");

        const canvas =
            canvasRef.current;

        if (canvas) {
            const context =
                canvas.getContext("2d");

            context?.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );
        }
    };

    const startManually = () => {
        setInternalRun(
            (previous) => previous + 1
        );
    };

    useEffect(() => {
        if (effectiveRun === 0) {
            return;
        }

        const canvas =
            canvasRef.current;

        if (!canvas) {
            return;
        }

        const context =
            canvas.getContext("2d");

        if (!context) {
            return;
        }

        let running = true;

        startTimeRef.current = null;

        const resizeCanvas = () => {
            const rect =
                canvas.getBoundingClientRect();

            const dpr =
                window.devicePixelRatio || 1;

            canvas.width =
                rect.width * dpr;

            canvas.height =
                rect.height * dpr;

            context.setTransform(
                dpr,
                0,
                0,
                dpr,
                0,
                0
            );
        };

        resizeCanvas();

        window.addEventListener(
            "resize",
            resizeCanvas
        );

        const drawGlowCircle = (
            x: number,
            y: number,
            radius: number,
            color: string,
            glow: string
        ) => {
            context.save();

            context.shadowBlur = 30;
            context.shadowColor = glow;

            context.beginPath();

            context.arc(
                x,
                y,
                radius,
                0,
                Math.PI * 2
            );

            context.fillStyle = color;

            context.fill();

            context.restore();
        };

        const drawCell = (
            width: number,
            height: number
        ) => {
            const cellX =
                width * 0.76;

            const cellY =
                height * 0.52;

            const cellRadius =
                Math.min(
                    width,
                    height
                ) * 0.19;

            const membraneGradient =
                context.createRadialGradient(
                    cellX - cellRadius * 0.25,
                    cellY - cellRadius * 0.25,
                    cellRadius * 0.15,
                    cellX,
                    cellY,
                    cellRadius
                );

            membraneGradient.addColorStop(
                0,
                "rgba(43, 120, 255, 0.38)"
            );

            membraneGradient.addColorStop(
                0.55,
                "rgba(31, 72, 165, 0.32)"
            );

            membraneGradient.addColorStop(
                1,
                "rgba(6, 26, 65, 0.8)"
            );

            context.save();

            context.shadowBlur = 45;
            context.shadowColor =
                "rgba(34, 211, 238, 0.28)";

            context.beginPath();

            context.arc(
                cellX,
                cellY,
                cellRadius,
                0,
                Math.PI * 2
            );

            context.fillStyle =
                membraneGradient;

            context.fill();

            context.lineWidth = 3;

            context.strokeStyle =
                "rgba(80, 210, 255, 0.72)";

            context.stroke();

            context.restore();

            // nucleus

            const nucleusGradient =
                context.createRadialGradient(
                    cellX - 15,
                    cellY - 15,
                    5,
                    cellX,
                    cellY,
                    cellRadius * 0.48
                );

            nucleusGradient.addColorStop(
                0,
                "rgba(232, 121, 249, 0.82)"
            );

            nucleusGradient.addColorStop(
                1,
                "rgba(91, 33, 182, 0.22)"
            );

            context.beginPath();

            context.arc(
                cellX,
                cellY,
                cellRadius * 0.48,
                0,
                Math.PI * 2
            );

            context.fillStyle =
                nucleusGradient;

            context.fill();

            // receptors

            const receptorCount =
                parameters.cellType ===
                "Sağlıklı Kontrol Hücresi"
                    ? 5
                    : 12;

            for (
                let index = 0;
                index < receptorCount;
                index++
            ) {
                const angle =
                    (Math.PI * 2 * index) /
                    receptorCount;

                const receptorX =
                    cellX +
                    Math.cos(angle) *
                    (cellRadius + 9);

                const receptorY =
                    cellY +
                    Math.sin(angle) *
                    (cellRadius + 9);

                context.save();

                context.translate(
                    receptorX,
                    receptorY
                );

                context.rotate(
                    angle + Math.PI / 2
                );

                context.shadowBlur = 12;

                context.shadowColor =
                    "rgba(232, 121, 249, 0.9)";

                context.fillStyle =
                    "#d946ef";

                context.fillRect(
                    -3,
                    -11,
                    6,
                    20
                );

                context.restore();
            }

            return {
                x: cellX,
                y: cellY,
                radius: cellRadius,
            };
        };

        const drawNanoparticle = (
            x: number,
            y: number,
            radius: number,
            rotation: number,
            opacity = 1
        ) => {
            context.save();

            context.globalAlpha =
                opacity;

            const gradient =
                context.createRadialGradient(
                    x - radius * 0.3,
                    y - radius * 0.3,
                    2,
                    x,
                    y,
                    radius
                );

            gradient.addColorStop(
                0,
                "#f0abfc"
            );

            gradient.addColorStop(
                0.3,
                "#8b5cf6"
            );

            gradient.addColorStop(
                0.7,
                "#2563eb"
            );

            gradient.addColorStop(
                1,
                "#071a3b"
            );

            context.shadowBlur = 25;

            context.shadowColor =
                "rgba(139, 92, 246, 0.85)";

            context.beginPath();

            context.arc(
                x,
                y,
                radius,
                0,
                Math.PI * 2
            );

            context.fillStyle = gradient;

            context.fill();

            context.lineWidth = 2;

            context.strokeStyle =
                "rgba(103, 232, 249, 0.8)";

            context.stroke();

            // drug core

            drawGlowCircle(
                x,
                y,
                radius * 0.27,
                "#fb7185",
                "#fb7185"
            );

            // ligands

            const ligandCount =
                Math.max(
                    4,
                    Math.round(
                        parameters.ligandDensity /
                        12
                    )
                );

            for (
                let index = 0;
                index < ligandCount;
                index++
            ) {
                const angle =
                    rotation +
                    (index / ligandCount) *
                    Math.PI *
                    2;

                const startX =
                    x +
                    Math.cos(angle) *
                    radius;

                const startY =
                    y +
                    Math.sin(angle) *
                    radius;

                const endX =
                    x +
                    Math.cos(angle) *
                    (radius + 10);

                const endY =
                    y +
                    Math.sin(angle) *
                    (radius + 10);

                context.beginPath();

                context.moveTo(
                    startX,
                    startY
                );

                context.lineTo(
                    endX,
                    endY
                );

                context.lineWidth = 3;

                context.strokeStyle =
                    "#e879f9";

                context.stroke();
            }

            context.restore();
        };

        const drawDrugRelease = (
            centerX: number,
            centerY: number,
            progress: number
        ) => {
            const moleculeCount = 24;

            for (
                let index = 0;
                index < moleculeCount;
                index++
            ) {
                const angle =
                    (index / moleculeCount) *
                    Math.PI *
                    2 +
                    index * 0.31;

                const distance =
                    progress *
                    (30 +
                        (index % 7) * 11);

                const x =
                    centerX +
                    Math.cos(angle) *
                    distance;

                const y =
                    centerY +
                    Math.sin(angle) *
                    distance;

                const alpha =
                    Math.max(
                        0.2,
                        1 - progress * 0.55
                    );

                context.save();

                context.globalAlpha =
                    alpha;

                drawGlowCircle(
                    x,
                    y,
                    3 + (index % 3),
                    "#fb7185",
                    "#f43f5e"
                );

                context.restore();
            }
        };

        const drawBackground = (
            width: number,
            height: number,
            time: number
        ) => {
            const gradient =
                context.createLinearGradient(
                    0,
                    0,
                    width,
                    height
                );

            gradient.addColorStop(
                0,
                "#020b18"
            );

            gradient.addColorStop(
                0.55,
                "#06162e"
            );

            gradient.addColorStop(
                1,
                "#090d25"
            );

            context.fillStyle = gradient;

            context.fillRect(
                0,
                0,
                width,
                height
            );

            // microscopic particles

            for (
                let index = 0;
                index < 40;
                index++
            ) {
                const x =
                    (
                        index * 97 +
                        time * (3 + index % 4)
                    ) %
                    width;

                const y =
                    (
                        index * 53 +
                        Math.sin(
                            time * 0.001 +
                            index
                        ) *
                        30 +
                        height
                    ) %
                    height;

                context.beginPath();

                context.arc(
                    x,
                    y,
                    1 + (index % 2),
                    0,
                    Math.PI * 2
                );

                context.fillStyle =
                    "rgba(103,232,249,0.18)";

                context.fill();
            }
        };

        const animate = (
            timestamp: number
        ) => {
            if (!running) {
                return;
            }

            if (
                startTimeRef.current === null
            ) {
                startTimeRef.current =
                    timestamp;
            }

            const time =
                timestamp -
                startTimeRef.current;

            const seconds =
                time / 1000;

            setElapsed(seconds);

            const rect =
                canvas.getBoundingClientRect();

            const width = rect.width;
            const height = rect.height;

            context.clearRect(
                0,
                0,
                width,
                height
            );

            drawBackground(
                width,
                height,
                time
            );

            const cell =
                drawCell(
                    width,
                    height
                );

            const particleRadius =
                Math.max(
                    17,
                    Math.min(
                        37,
                        parameters.particleSize /
                        4.5
                    )
                );

            let particleX =
                width * 0.12;

            let particleY =
                height * 0.34;

            let currentPhase:
                SimulationPhase =
                "circulation";

            if (seconds < 3) {
                currentPhase =
                    "circulation";

                const progress =
                    seconds / 3;

                particleX =
                    width *
                    (0.1 +
                        progress * 0.22);

                particleY =
                    height *
                    (
                        0.35 +
                        Math.sin(
                            seconds * 3
                        ) *
                        0.1
                    );
            } else if (
                seconds < 6
            ) {
                currentPhase =
                    "approach";

                const progress =
                    (seconds - 3) / 3;

                const startX =
                    width * 0.32;

                const startY =
                    height * 0.42;

                const targetX =
                    cell.x -
                    cell.radius -
                    particleRadius -
                    10;

                particleX =
                    startX +
                    (targetX - startX) *
                    progress;

                particleY =
                    startY +
                    (cell.y - startY) *
                    progress;
            } else if (
                seconds < 8
            ) {
                currentPhase =
                    "binding";

                particleX =
                    cell.x -
                    cell.radius -
                    particleRadius -
                    6;

                particleY =
                    cell.y;

                context.save();

                context.shadowBlur = 30;

                context.shadowColor =
                    "#22d3ee";

                context.beginPath();

                context.moveTo(
                    particleX +
                    particleRadius,
                    particleY
                );

                context.lineTo(
                    cell.x -
                    cell.radius,
                    cell.y
                );

                context.lineWidth = 4;

                context.strokeStyle =
                    "#67e8f9";

                context.stroke();

                context.restore();
            } else if (
                seconds < 11
            ) {
                currentPhase =
                    "endocytosis";

                const progress =
                    (seconds - 8) / 3;

                const startX =
                    cell.x -
                    cell.radius -
                    particleRadius;

                particleX =
                    startX +
                    (cell.x - startX) *
                    progress;

                particleY =
                    cell.y;

                context.save();

                context.beginPath();

                context.arc(
                    particleX,
                    particleY,
                    particleRadius + 10,
                    0,
                    Math.PI * 2
                );

                context.strokeStyle =
                    `rgba(34,211,238,${
                        0.6 -
                        progress * 0.35
                    })`;

                context.lineWidth = 3;

                context.stroke();

                context.restore();
            } else if (
                seconds < 15
            ) {
                currentPhase =
                    "release";

                const progress =
                    Math.min(
                        1,
                        (seconds - 11) / 4
                    );

                particleX =
                    cell.x;

                particleY =
                    cell.y;

                drawDrugRelease(
                    cell.x,
                    cell.y,
                    progress
                );
            } else {
                currentPhase =
                    "completed";

                particleX =
                    cell.x;

                particleY =
                    cell.y;

                drawDrugRelease(
                    cell.x,
                    cell.y,
                    1
                );
            }

            drawNanoparticle(
                particleX,
                particleY,
                particleRadius,
                seconds,
                currentPhase ===
                "completed"
                    ? 0.45
                    : 1
            );

            setPhase(currentPhase);

            if (
                currentPhase !==
                "completed"
            ) {
                animationRef.current =
                    requestAnimationFrame(
                        animate
                    );
            }
        };

        animationRef.current =
            requestAnimationFrame(
                animate
            );

        return () => {
            running = false;

            window.removeEventListener(
                "resize",
                resizeCanvas
            );

            if (
                animationRef.current !== null
            ) {
                cancelAnimationFrame(
                    animationRef.current
                );
            }
        };
    }, [
        effectiveRun,
        parameters,
    ]);

    const currentPhaseIndex =
        phases.findIndex(
            (item) =>
                item.key === phase
        );

    return (
        <div className="simulation-panel panel">
            <div className="simulation-header">
                <div>
          <span className="panel-kicker">
            MOLEKÜLER GÖRÜNÜM
          </span>

                    <h2>
                        Canlı Simülasyon
                    </h2>

                    <p>
                        LNP dolaşımından hücresel
                        ilaç salınımına kadar süreci
                        gerçek zamanlı izleyin.
                    </p>
                </div>

                <div className="simulation-actions">
                    <button
                        className="primary-small"
                        onClick={
                            startManually
                        }
                    >
                        ▶ Başlat
                    </button>

                    <button
                        className="reset-button"
                        onClick={
                            resetSimulation
                        }
                    >
                        ↻ Sıfırla
                    </button>
                </div>
            </div>

            <div className="simulation-info">
                <div>
          <span>
            GEÇEN SÜRE
          </span>

                    <strong>
                        {elapsed.toFixed(1)} sn
                    </strong>
                </div>

                <div>
          <span>
            AKTİF AŞAMA
          </span>

                    <strong>
                        {phase === "idle"
                            ? "Hazır"
                            : phase ===
                            "completed"
                                ? "Tamamlandı"
                                : phases.find(
                                    (item) =>
                                        item.key ===
                                        phase
                                )?.label}
                    </strong>
                </div>

                <div>
          <span>
            HEDEF
          </span>

                    <strong>
                        {parameters.cellType}
                    </strong>
                </div>

                <div>
          <span>
            PARTİKÜL
          </span>

                    <strong>
                        {
                            parameters.particleSize
                        }{" "}
                        nm
                    </strong>
                </div>
            </div>

            <div className="canvas-container">
                <canvas
                    ref={canvasRef}
                    className="simulation-canvas"
                />

                <div className="simulation-steps">
                    {phases.map(
                        (item, index) => {
                            const isActive =
                                phase === item.key;

                            const isCompleted =
                                phase ===
                                "completed" ||
                                (currentPhaseIndex >
                                    index &&
                                    currentPhaseIndex !==
                                    -1);

                            return (
                                <div
                                    key={item.key}
                                    className={[
                                        "simulation-step",
                                        isActive
                                            ? "active"
                                            : "",
                                        isCompleted
                                            ? "completed"
                                            : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                >
                  <span>
                    {isCompleted
                        ? "✓"
                        : index + 1}
                  </span>

                                    <p>
                                        {item.label}
                                    </p>
                                </div>
                            );
                        }
                    )}
                </div>

                {phase === "idle" && (
                    <div className="canvas-start-message">
                        <span>◉</span>

                        <strong>
                            Simülasyon Hazır
                        </strong>

                        <p>
                            Moleküler akışı
                            görüntülemek için
                            simülasyonu başlatın.
                        </p>
                    </div>
                )}

                {phase ===
                    "completed" && (
                        <div className="canvas-start-message completed-message">
                            <span>✓</span>

                            <strong>
                                İlaç Salınımı
                                Tamamlandı
                            </strong>

                            <p>
                                LNP hedef hücreye ulaştı
                                ve simüle edilen ilaç
                                yükünü sitoplazmaya
                                bıraktı.
                            </p>
                        </div>
                    )}
            </div>
        </div>
    );
}

export default SimulationCanvas;