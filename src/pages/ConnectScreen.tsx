import { Radio, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const ConnectScreen = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 lg:pb-6">
      {/* Header */}
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-black text-foreground">Connect</h1>
        <p className="text-sm text-muted-foreground font-medium mt-0.5">Meet people around you</p>
      </div>

      {/* Coming Soon */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center -mt-12">
        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
          <Radio size={40} className="text-primary" />
        </div>

        <h2 className="text-2xl font-black text-foreground mb-3">Coming Soon</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
          We're building the Connect feature so students can find roommates, study partners, and campus communities near them.
        </p>

        <div className="mt-8 flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-bold">
          <Sparkles size={15} />
          Stay tuned — launching soon!
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ConnectScreen;
