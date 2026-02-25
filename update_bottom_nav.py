import os

target_file = "src/components/BottomNav.tsx"
with open(target_file, "r", encoding="utf-8") as f:
    content = f.read()

new_content = content.replace(
    'className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pt-3 pb-3 safe-bottom flex justify-between items-center z-50"',
    'className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100/50 px-6 pt-4 pb-4 safe-bottom flex justify-between items-center z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.06)]"'
)

with open(target_file, "w", encoding="utf-8") as f:
    f.write(new_content)

print("BottomNav updated!")
