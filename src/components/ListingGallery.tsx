import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface GalleryImage {
    url: string;
    category: string;
}

interface ListingGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    images: GalleryImage[];
    initialCategory?: string;
}

export const ListingGallery = ({ isOpen, onClose, images, initialCategory = "All" }: ListingGalleryProps) => {
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!isOpen) return null;

    const categories = ["All", ...Array.from(new Set(images.map(img => img.category)))];
    const filteredImages = activeCategory === "All" ? images : images.filter(img => img.category === activeCategory);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col md:flex-row backdrop-blur-sm transition-opacity">
            {/* Mobile Header / Desktop Left Panel for Categories */}
            <div className="w-full md:w-64 bg-black/50 md:bg-black md:border-r border-white/10 flex flex-col pt-safe-top">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <button onClick={onClose} className="p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                        <X size={24} />
                    </button>
                    <span className="text-white font-medium text-sm md:hidden">
                        {currentIndex + 1} / {filteredImages.length}
                    </span>
                    <div className="w-10 md:hidden"></div> {/* Balancer */}
                </div>

                {/* Categories */}
                <div className="flex-1 overflow-y-auto hidden md:block px-4 py-6 space-y-2">
                    <h3 className="text-white/40 uppercase text-[10px] font-black tracking-widest mb-4 px-2">Spaces & Views</h3>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setActiveCategory(cat);
                                setCurrentIndex(0);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeCategory === cat
                                ? "bg-white text-black shadow-lg scale-[1.02]"
                                : "text-white/60 hover:text-white hover:bg-white/10"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Mobile Categories (Horizontal) */}
                <div className="md:hidden overflow-x-auto flex gap-2 p-4 border-b border-white/5 scrollbar-hide bg-black/80 backdrop-blur-xl">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setActiveCategory(cat);
                                setCurrentIndex(0);
                            }}
                            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeCategory === cat
                                ? "bg-white text-black shadow-lg"
                                : "text-white/60 bg-white/5 hover:bg-white/10"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Image Viewer */}
            <div className="flex-1 relative flex items-center justify-center p-4 md:p-8">
                {filteredImages.length > 0 ? (
                    <>
                        <img
                            src={filteredImages[currentIndex].url}
                            alt={filteredImages[currentIndex].category}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-300"
                        />

                        {/* Navigation Arrows (Desktop) */}
                        {filteredImages.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-md transition-all border border-white/10 hover:scale-110"
                                >
                                    <ChevronLeft size={28} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-md transition-all border border-white/10 hover:scale-110"
                                >
                                    <ChevronRight size={28} />
                                </button>
                            </>
                        )}

                        {/* Image Counter & Caption */}
                        <div className="absolute bottom-8 left-0 right-0 text-center">
                            <span className="inline-block px-5 py-2.5 bg-black/60 backdrop-blur-xl text-white rounded-full text-sm font-bold border border-white/10 shadow-xl">
                                {filteredImages[currentIndex].category} <span className="text-white/50 mx-2">•</span> {currentIndex + 1} / {filteredImages.length}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="text-white/50 text-center">
                        <p>No images available for this room</p>
                    </div>
                )}
            </div>
        </div>
    );
};
