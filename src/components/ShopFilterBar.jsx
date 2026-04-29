const SEAT_OPTIONS = ["All", "2 Seats", "4 Seats", "6 Seats", "8 Seats"];
const COLOR_OPTIONS = ["All", "Black", "White", "Red", "Grey", "Matte Grey", "Matte Black"];

function FilterGroup({ label, options, value, onChange, divider }) {
  return (
    <div className="flex items-start gap-4">
      {divider && <div className="hidden md:block w-px self-stretch bg-border mx-1" />}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className="flex flex-wrap gap-1.5">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                value === opt
                  ? "bg-accent text-white border-accent shadow-sm"
                  : "bg-background border-border text-foreground hover:border-accent hover:text-accent"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShopFilterBar({ brands, seatFilter, setSeatFilter, makeFilter, setMakeFilter, colorFilter, setColorFilter, count }) {
  const makeOptions = ["All", ...brands.filter((b) => b !== "All")];

  return (
    <div className="bg-card border border-border rounded-2xl px-5 py-4 mb-10 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-0">
        {/* Filter Groups */}
        <div className="flex flex-col gap-5 flex-1">
          {/* Row 1: Seats + Make */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-5">
            <FilterGroup
              label="Seats"
              options={SEAT_OPTIONS}
              value={seatFilter}
              onChange={setSeatFilter}
            />
            <FilterGroup
              label="Make"
              options={makeOptions}
              value={makeFilter}
              onChange={setMakeFilter}
              divider
            />
          </div>

          {/* Divider between rows */}
          <div className="w-full h-px bg-border" />

          {/* Row 2: Color */}
          <FilterGroup
            label="Color"
            options={COLOR_OPTIONS}
            value={colorFilter}
            onChange={setColorFilter}
          />
        </div>

        {/* Item Count */}
        <div className="hidden md:block w-px self-stretch bg-border mx-4" />
        <div className="flex items-center shrink-0">
          <span className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{count}</span> {count === 1 ? "item" : "items"}
          </span>
        </div>
      </div>
    </div>
  );
}