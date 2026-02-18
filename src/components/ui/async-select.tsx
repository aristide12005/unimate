import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AsyncSelectProps<T> {
    value: string;
    onChange: (value: string) => void;
    onSelect: (item: T) => void;
    fetcher: (query: string) => Promise<T[]>;
    renderOption: (item: T) => React.ReactNode;
    getLabel: (item: T) => string;
    placeholder?: string;
    icon?: React.ElementType;
    className?: string;
    delay?: number;
}

export function AsyncSelect<T>({
    value,
    onChange,
    onSelect,
    fetcher,
    renderOption,
    getLabel,
    placeholder = "Search...",
    icon: Icon = Search,
    className,
    delay = 500,
}: AsyncSelectProps<T>) {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync internal query state with external value prop
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Debounced search
    useEffect(() => {
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }

        // Only search if the query is different from the currently selected value (avoid researching on selection)
        // But since we want to allow editing, we might need a flag.
        // For now, simple debounce is fine.

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await fetcher(query);
                setResults(data || []);
                setShowResults(true);
            } catch (error) {
                console.error("AsyncSelect fetch error:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [query, fetcher, delay]);

    // Handle outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (item: T) => {
        const label = getLabel(item);
        setQuery(label);
        onChange(label);
        onSelect(item);
        setShowResults(false);
    };

    const handleClear = () => {
        setQuery("");
        onChange("");
        setResults([]);
        setShowResults(false);
    };

    return (
        <div ref={wrapperRef} className={cn("relative", className)}>
            <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => {
                        if (results.length > 0) setShowResults(true);
                    }}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-gray-200 bg-white pl-11 pr-10 py-3.5 text-sm font-semibold text-foreground outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {loading ? (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-spin h-5 w-5" />
                ) : query ? (
                    <button onClick={handleClear} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                    </button>
                ) : null}
            </div>

            {/* Results Dropdown */}
            {showResults && results.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[300px] overflow-y-auto">
                    {results.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelect(item)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors"
                        >
                            {renderOption(item)}
                        </button>
                    ))}
                    <div className="bg-gray-50 px-4 py-1.5 text-[10px] text-gray-400 text-center font-medium uppercase tracking-wider">
                        Search Results
                    </div>
                </div>
            )}
        </div>
    );
}
