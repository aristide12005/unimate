
import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideToAcceptProps {
    onConfirm: () => void;
    label?: string;
    confirmedLabel?: string;
    isConfirmed?: boolean;
    isLoading?: boolean;
}

export default function SlideToAccept({
    onConfirm,
    label = "Slide to Accept",
    confirmedLabel = "Accepted",
    isConfirmed = false,
    isLoading = false,
}: SlideToAcceptProps) {
    const [dragWidth, setDragWidth] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    const handleDrag = (clientX: number) => {
        if (isConfirmed || isLoading || !containerRef.current || !sliderRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const sliderWidth = sliderRef.current.offsetWidth;
        const maxDrag = containerRect.width - sliderWidth;

        let newWidth = clientX - containerRect.left - sliderWidth / 2;
        newWidth = Math.max(0, Math.min(maxDrag, newWidth));

        setDragWidth(newWidth);

        if (newWidth >= maxDrag - 5) {
            setIsDragging(false);
            onConfirm();
        }
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (isConfirmed || isLoading) return;
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        handleDrag(e.clientX);
    };

    const handlePointerUp = () => {
        if (!isDragging) return;
        setIsDragging(false);
        if (!isConfirmed) setDragWidth(0); // Reset if not confirmed
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        handleDrag(e.touches[0].clientX);
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full h-16 rounded-full overflow-hidden select-none touch-none transition-colors duration-300",
                isConfirmed ? "bg-green-500" : "bg-gray-100 border border-gray-200"
            )}
        >
            {/* Background Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span
                    className={cn(
                        "font-bold text-lg transition-opacity duration-300",
                        isConfirmed ? "text-white" : "text-gray-400"
                    )}
                    style={{
                        opacity: isDragging ? Math.max(0, 1 - dragWidth / 150) : 1,
                    }}
                >
                    {isConfirmed ? confirmedLabel : label}
                </span>
            </div>

            {/* Progress Track (visual fill behind slider) */}
            {!isConfirmed && (
                <div
                    className="absolute left-0 top-0 bottom-0 bg-primary/20 transition-all duration-75 ease-linear"
                    style={{ width: dragWidth + 48 }} // 48 is approx slider width/offset
                />
            )}

            {/* Slider Button */}
            <div
                ref={sliderRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onTouchStart={() => setIsDragging(true)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handlePointerUp}
                className={cn(
                    "absolute top-1 bottom-1 w-14 rounded-full flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing transition-transform duration-75 ease-linear z-10",
                    isConfirmed ? "bg-white text-green-500 right-1" : "bg-white text-primary left-1"
                )}
                style={{
                    transform: isConfirmed ? "none" : `translateX(${dragWidth}px)`,
                    transition: isDragging ? "none" : "transform 0.3s ease-out",
                }}
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : isConfirmed ? (
                    <Check size={24} strokeWidth={3} />
                ) : (
                    <ChevronRight size={28} strokeWidth={3} />
                )}
            </div>
        </div>
    );
}
