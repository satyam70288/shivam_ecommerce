import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronDown,
  SlidersHorizontal,
  IndianRupee,
  Percent,
  Star,
  Baby,
  Palette,
  Layers,
  PackageCheck,
  Tag,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import {
  SORT_OPTIONS,
  PRICE_RANGES,
  DISCOUNT_OPTIONS,
  RATING_OPTIONS,
  AGE_GROUP_OPTIONS,
  MATERIAL_OPTIONS,
  COLOR_OPTIONS,
  AVAILABILITY_OPTIONS,
  OFFER_OPTIONS,
  BADGE_OPTIONS,
  countActiveFilters,
} from "@/constants/filtersConfig";

const SECTION_ICONS = {
  sort: ArrowUpDown,
  price: IndianRupee,
  discount: Percent,
  ratings: Star,
  age: Baby,
  colors: Palette,
  material: Layers,
  availability: PackageCheck,
  offers: Tag,
  badges: Sparkles,
};

export default function FiltersSidebar({
  selectedFilters = {},
  updateFilter,
  setSort,
  onClearAll,
  compact = false,
}) {
  const safe = {
    priceRange: selectedFilters.priceRange || [],
    discount: selectedFilters.discount || [],
    ratings: selectedFilters.ratings || [],
    ageGroup: selectedFilters.ageGroup || [],
    colors: selectedFilters.colors || [],
    material: selectedFilters.material || [],
    availability: selectedFilters.availability || [],
    offers: selectedFilters.offers || [],
    badges: selectedFilters.badges || [],
    sort: selectedFilters.sort || "newest",
  };

  const activeCount = countActiveFilters(safe);

  return (
    <div className={compact ? "space-y-1" : "space-y-0"}>
      {/* Header */}
      <div
        className={`sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border ${
          compact ? "pb-3 mb-2" : "px-4 py-4 mb-1 -mx-0"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg brand-gradient-bg text-primary-foreground shrink-0">
              <SlidersHorizontal size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-foreground text-sm leading-tight">
                Filters
              </h2>
              {!compact && (
                <p className="text-[11px] text-muted-foreground truncate">
                  Refine your search
                </p>
              )}
            </div>
          </div>
          {activeCount > 0 && (
            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <RotateCcw size={12} />
            Clear all filters
          </button>
        )}
      </div>

      <div className={compact ? "px-0" : "px-3 pb-4"}>
        {/* Sort */}
        <FilterSection title="Sort by" iconKey="sort" defaultOpen>
          <div className="space-y-1">
            {SORT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-2.5 cursor-pointer rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  safe.sort === opt.value
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-muted/80"
                }`}
              >
                <input
                  type="radio"
                  name="sort"
                  checked={safe.sort === opt.value}
                  onChange={() => setSort?.(opt.value)}
                  className="accent-primary h-3.5 w-3.5"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Price" iconKey="price">
          <CheckboxList
            filterKey="priceRange"
            selectedFilters={safe}
            updateFilter={updateFilter}
            options={PRICE_RANGES}
          />
        </FilterSection>

        <FilterSection title="Discount" iconKey="discount">
          <CheckboxList
            filterKey="discount"
            selectedFilters={safe}
            updateFilter={updateFilter}
            options={DISCOUNT_OPTIONS}
          />
        </FilterSection>

        <FilterSection title="Customer rating" iconKey="ratings">
          <CheckboxList
            filterKey="ratings"
            selectedFilters={safe}
            updateFilter={updateFilter}
            options={RATING_OPTIONS}
          />
        </FilterSection>

        <FilterSection title="Offers & delivery" iconKey="offers">
          <CheckboxList
            filterKey="offers"
            selectedFilters={safe}
            updateFilter={updateFilter}
            options={OFFER_OPTIONS}
          />
        </FilterSection>

        <FilterSection title="Highlights" iconKey="badges">
          <CheckboxList
            filterKey="badges"
            selectedFilters={safe}
            updateFilter={updateFilter}
            options={BADGE_OPTIONS}
          />
        </FilterSection>

        <FilterSection title="Color" iconKey="colors">
          <ColorSwatches
            options={COLOR_OPTIONS}
            selected={safe.colors}
            onToggle={(value) => updateFilter("colors", value)}
          />
        </FilterSection>

        <FilterSection title="Age group" iconKey="age">
          <CheckboxList
            filterKey="ageGroup"
            selectedFilters={safe}
            updateFilter={updateFilter}
            options={AGE_GROUP_OPTIONS}
          />
        </FilterSection>

        <FilterSection title="Material" iconKey="material">
          <CheckboxList
            filterKey="material"
            selectedFilters={safe}
            updateFilter={updateFilter}
            options={MATERIAL_OPTIONS}
          />
        </FilterSection>

        <FilterSection title="Availability" iconKey="availability" defaultOpen={false}>
          <CheckboxList
            filterKey="availability"
            selectedFilters={safe}
            updateFilter={updateFilter}
            options={AVAILABILITY_OPTIONS}
          />
        </FilterSection>
      </div>
    </div>
  );
}

function FilterSection({ title, iconKey, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = SECTION_ICONS[iconKey] || SlidersHorizontal;

  return (
    <div className="border-b border-border/60 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 px-1 group"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon
            size={15}
            className="text-primary/80 group-hover:text-primary transition-colors"
          />
          {title}
        </span>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="pb-3 px-1">{children}</div>}
    </div>
  );
}

function CheckboxList({ options, filterKey, selectedFilters, updateFilter }) {
  const selected = selectedFilters[filterKey] || [];

  return (
    <div className="space-y-0.5">
      {options.map((opt) => {
        const checked = selected.includes(opt.value);
        return (
          <label
            key={opt.value}
            className={`flex items-center gap-2.5 cursor-pointer rounded-lg px-2 py-1.5 text-sm transition-colors ${
              checked
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <Checkbox
              checked={checked}
              onCheckedChange={() => updateFilter(filterKey, opt.value)}
              className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="leading-tight">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

function ColorSwatches({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2 px-1">
      {options.map((c) => {
        const active = selected.includes(c.value);
        return (
          <button
            key={c.value}
            type="button"
            title={c.label}
            onClick={() => onToggle(c.value)}
            className={`relative w-8 h-8 rounded-full ${c.swatch} transition-all ring-offset-2 ring-offset-card ${
              active
                ? "ring-2 ring-primary scale-110"
                : "ring-1 ring-border/80 hover:scale-105"
            }`}
            aria-label={c.label}
            aria-pressed={active}
          />
        );
      })}
    </div>
  );
}
