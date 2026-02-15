import { Heart, UserPlus, MessageCircle, Star, Award } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const activities = [
  {
    id: 1,
    icon: Heart,
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10",
    title: "Mary liked your post",
    subtitle: '"Just aced my midterm! 🎉"',
    time: "2m ago",
  },
  {
    id: 2,
    icon: UserPlus,
    iconColor: "text-secondary",
    iconBg: "bg-secondary/10",
    title: "Alex Chen wants to connect",
    subtitle: "Computer Science • 2nd year",
    time: "15m ago",
    action: true,
  },
  {
    id: 3,
    icon: Star,
    iconColor: "text-gold",
    iconBg: "bg-gold/10",
    title: "You moved up to #4!",
    subtitle: "Keep going to reach Top 3",
    time: "1h ago",
  },
  {
    id: 4,
    icon: MessageCircle,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    title: "Kevin replied to your story",
    subtitle: '"No way! That\'s amazing 😂"',
    time: "2h ago",
  },
  {
    id: 5,
    icon: Award,
    iconColor: "text-accent",
    iconBg: "bg-accent/10",
    title: "You earned a new badge!",
    subtitle: "🏅 Social Butterfly — 10 connections",
    time: "5h ago",
  },
  {
    id: 6,
    icon: UserPlus,
    iconColor: "text-secondary",
    iconBg: "bg-secondary/10",
    title: "Lisa Park accepted your request",
    subtitle: "You're now connected!",
    time: "1d ago",
  },
  {
    id: 7,
    icon: Heart,
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10",
    title: "3 people liked your photo",
    subtitle: "Campus sunset 🌅",
    time: "1d ago",
  },
];

const ActivityScreen = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Header */}
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-black text-foreground">Activity</h1>
        <p className="text-sm text-muted-foreground font-medium mt-0.5">Your recent notifications</p>
      </div>

      {/* Activity List */}
      <div className="mt-4 px-5 space-y-2">
        {activities.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-card shadow-sm"
          >
            <div className={`w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}>
              <item.icon size={18} className={item.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.subtitle}</p>
              <span className="text-[10px] text-muted-foreground/70 font-semibold mt-1 block">{item.time}</span>
            </div>
            {item.action && (
              <button className="px-3 py-1.5 rounded-xl gradient-primary-btn text-primary-foreground text-xs font-bold shrink-0">
                Accept
              </button>
            )}
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default ActivityScreen;
