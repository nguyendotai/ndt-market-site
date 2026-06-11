export const sortOptions = [
  { value: "newest", label: "Moi nhat" },
  { value: "price_asc", label: "Gia tang dan" },
  { value: "price_desc", label: "Gia giam dan" },
  { value: "best_selling", label: "Ban chay" },
  { value: "rating", label: "Danh gia cao" },
];

type ProductSortProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ProductSort({ value, onChange }: ProductSortProps) {
  return (
    <select
      aria-label="Sap xep san pham"
      value={value}
      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      onChange={(event) => onChange(event.target.value)}
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
