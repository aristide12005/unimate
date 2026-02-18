import { Search, TrendingUp, Users, BookOpen, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const categories = [
  { icon: TrendingUp, label: "Trending", color: "bg-primary/15 text-primary" },
  { icon: Users, label: "People", color: "bg-secondary/15 text-secondary" },
  { icon: BookOpen, label: "Study Groups", color: "bg-accent/15 text-accent" },
  { icon: Sparkles, label: "Events", color: "bg-gold/15 text-gold" },
];

const trendingTopics = [
  { title: "Final Exam Prep 📚", members: 234, tag: "Study" },
  { title: "Campus Food Reviews 🍕", members: 189, tag: "Social" },
  { title: "Hackathon 2026 💻", members: 156, tag: "Event" },
  { title: "Fitness Challenge 💪", members: 120, tag: "Wellness" },
  { title: "Photography Club 📷", members: 98, tag: "Creative" },
  { title: "Music Jam Sessions 🎵", members: 87, tag: "Social" },
];

const ConnectScreen = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Header */}
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-black text-foreground">Connect</h1>
        <p className="text-sm text-muted-foreground font-medium mt-0.5">Find people nearby</p>
      </div>

      {/* Search */}
      <div className="px-5 mt-4">
        <div className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3.5 shadow-sm">
          <Search size={18} className="text-muted-foreground" />
          <input
            placeholder="Search people, groups, topics..."
            className="flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-3 px-5 mt-5 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.label}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap ${cat.color}`}
          >
            <cat.icon size={16} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Trending */}
      <div className="px-5 mt-6">
        <h2 className="text-lg font-black text-foreground flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          Trending Now
        </h2>
        <div className="mt-3 space-y-3">
          {trendingTopics.map((topic) => (
            <button
              key={topic.title}
              className="w-full flex items-center justify-between bg-card rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform"
            >
              <div className="text-left">
                <h3 className="text-sm font-bold text-foreground">{topic.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{topic.members} members</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                {topic.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ConnectScreen;
