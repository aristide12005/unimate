import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Briefcase, ChevronDown } from "lucide-react";

type OccupationType = "student" | "professional" | null;

const LEVELS = [
    "High School",
    "Undergraduate (Year 1)",
    "Undergraduate (Year 2)",
    "Undergraduate (Year 3)",
    "Undergraduate (Year 4)",
    "Master's",
    "PhD",
    "Other",
];

const OccupationScreen = () => {
    const [occupation, setOccupation] = useState<OccupationType>(null);
    const [school, setSchool] = useState("");
    const [level, setLevel] = useState("");
    const [showLevels, setShowLevels] = useState(false);
    const navigate = useNavigate();

    const handleContinue = () => {
        navigate("/location");
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center px-5">
            {/* Step Indicator */}
            <div className="flex flex-col items-center mt-10 w-full max-w-xs">
                <p className="text-xs font-bold text-foreground tracking-wide">
                    Step 2 of 6
                </p>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div
                        className="h-full rounded-full gradient-primary-btn transition-all duration-500"
                        style={{ width: "33%" }}
                    />
                </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-black text-foreground mt-8 text-center leading-tight">
                What's your <span className="text-primary">status</span>?
            </h1>
            <p className="text-sm text-muted-foreground mt-2 text-center">
                I am a...
            </p>

            {/* Occupation Cards */}
            <div className="flex gap-4 mt-8 w-full max-w-sm">
                {/* Student Card */}
                <button
                    onClick={() => setOccupation("student")}
                    className={`
            flex-1 flex flex-col items-center gap-3 py-7 rounded-2xl border-2 transition-all duration-200 active:scale-[0.97]
            ${occupation === "student"
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                        }
          `}
                >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${occupation === "student" ? "bg-primary/10" : "bg-gray-100"}`}>
                        <GraduationCap size={28} className={occupation === "student" ? "text-primary" : "text-gray-500"} />
                    </div>
                    <span className={`text-base font-bold ${occupation === "student" ? "text-primary" : "text-foreground"}`}>
                        Student
                    </span>
                </button>

                {/* Professional Card */}
                <button
                    onClick={() => setOccupation("professional")}
                    className={`
            flex-1 flex flex-col items-center gap-3 py-7 rounded-2xl border-2 transition-all duration-200 active:scale-[0.97]
            ${occupation === "professional"
                            ? "border-secondary bg-secondary/5 shadow-lg shadow-secondary/10"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                        }
          `}
                >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${occupation === "professional" ? "bg-secondary/10" : "bg-gray-100"}`}>
                        <Briefcase size={28} className={occupation === "professional" ? "text-secondary" : "text-gray-500"} />
                    </div>
                    <span className={`text-base font-bold ${occupation === "professional" ? "text-secondary" : "text-foreground"}`}>
                        Professional
                    </span>
                </button>
            </div>

            {/* Details Section (shown when occupation selected) */}
            {occupation && (
                <div className="w-full max-w-sm mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* School / Company */}
                    <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            {occupation === "student" ? "School / University" : "Company / Organization"}
                        </label>
                        <input
                            placeholder={occupation === "student" ? "e.g. Groupe ISM, UCAD..." : "e.g. Google, Startup..."}
                            value={school}
                            onChange={(e) => setSchool(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-foreground outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Level (for students) / Role (for professionals) */}
                    <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            {occupation === "student" ? "Level (optional)" : "Role (optional)"}
                        </label>
                        {occupation === "student" ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowLevels(!showLevels)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-left outline-none transition-all hover:border-gray-300 flex items-center justify-between"
                                >
                                    <span className={level ? "text-foreground" : "text-gray-400"}>
                                        {level || "Select your level"}
                                    </span>
                                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${showLevels ? "rotate-180" : ""}`} />
                                </button>
                                {showLevels && (
                                    <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                                        {LEVELS.map((l) => (
                                            <button
                                                key={l}
                                                onClick={() => { setLevel(l); setShowLevels(false); }}
                                                className={`w-full px-4 py-3 text-sm font-semibold text-left hover:bg-gray-50 transition-colors ${level === l ? "text-primary bg-primary/5" : "text-foreground"}`}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <input
                                placeholder="e.g. Software Engineer, Designer..."
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-foreground outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bottom */}
            <div className="w-full max-w-sm pb-6 pt-2">
                <button
                    onClick={handleContinue}
                    disabled={!occupation}
                    className="w-full py-3.5 rounded-xl gradient-primary-btn text-white font-bold text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:shadow-none"
                >
                    Continue
                </button>
                <button
                    onClick={handleContinue}
                    className="w-full mt-3 text-sm font-semibold text-secondary hover:underline transition-colors text-center"
                >
                    Skip for now
                </button>
            </div>
        </div>
    );
};

export default OccupationScreen;
