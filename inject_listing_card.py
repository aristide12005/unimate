import os

target_file = "src/pages/HomeScreen.tsx"
with open(target_file, "r", encoding="utf-8") as f:
    content = f.read()

listing_card_code = """const ListingCard = ({ listing, onClick }: { listing: any; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="group cursor-pointer rounded-[1.5rem] overflow-hidden bg-white/95 backdrop-blur-md border border-white/40 shadow-soft hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 relative z-10"
  >
    <div className="relative h-56 overflow-hidden bg-gray-50">
      <img
        src={listing.image}
        alt={listing.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />
      <span className="absolute top-4 left-4 bg-primary/90 backdrop-blur-md text-white text-[11px] font-bold uppercase px-3 py-1.5 rounded-full shadow-lg z-20">
        {listing.type}
      </span>
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <h3 className="font-extrabold text-white text-[17px] mb-1 line-clamp-1 drop-shadow-md">{listing.title}</h3>
        <div className="flex items-center gap-1.5 text-white/90 text-[13px] drop-shadow-sm">
          <MapPin size={13} className="text-white/80" />
          <span className="line-clamp-1">{listing.location}</span>
        </div>
      </div>
    </div>
    <div className="p-5 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Monthly</span>
        <span className="text-secondary font-black text-[19px]">{listing.price}</span>
      </div>
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
        <ArrowRight size={18} />
      </div>
    </div>
  </div>
);"""

parts = content.split("// ─────────────────────────────────────────────────────────────────────────────")

# Parts[0] is imports and top level constants
# Parts[1] should be the ListingCard. Right now it's empty space.
# Parts[2] is Desktop Home View

new_content = parts[0] + "// ─────────────────────────────────────────────────────────────────────────────\n\n" + listing_card_code + "\n\n// ─────────────────────────────────────────────────────────────────────────────" + parts[2]

with open(target_file, "w", encoding="utf-8") as f:
    f.write(new_content)

print("ListingCard successfully injected.")
