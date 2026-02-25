import os

target_file = "src/pages/HomeScreen.tsx"
with open(target_file, "r", encoding="utf-8") as f:
    content = f.read()

search_str = 'import { useListings } from "@/hooks/useListings";'
replacement_str = '''import { useListings } from "@/hooks/useListings";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useUnread } from "@/contexts/UnreadContext";
import logo from "@/assets/logo.png";
import bgVideo1 from "@/assets/background.webm";
import bgVideo2 from "@/assets/background2.webm";
import bgVideo3 from "@/assets/background3.webm";

const MEDIA_SLIDES = [bgVideo1, bgVideo2, bgVideo3];
const CATEGORIES = ["All", "Single Room", "Shared Room", "Studio", "Apartment", "En-suite"];

// ─────────────────────────────────────────────────────────────────────────────'''

if search_str in content:
    content = content.replace(search_str, replacement_str)
    with open(target_file, "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed!")
else:
    print("Could not find search string.")
