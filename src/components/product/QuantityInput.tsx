"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type QuantityInputProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  "aria-label"?: string;
};

export function QuantityInput({
  value,
  min = 1,
  max = 99,
  step = 1,
  onChange,
  "aria-label": ariaLabel = "So luong",
}: QuantityInputProps) {
  const updateValue = (nextValue: number) => {
    onChange(Math.min(max, Math.max(min, nextValue)));
  };

  return (
    <div className="inline-grid grid-cols-[36px_48px_36px] overflow-hidden rounded-md border bg-card">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-none"
        aria-label="Giam so luong"
        onClick={() => updateValue(value - step)}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        aria-label={ariaLabel}
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(event) => updateValue(Number(event.target.value) || min)}
        className="h-9 rounded-none border-y-0 px-1 text-center"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-none"
        aria-label="Tang so luong"
        onClick={() => updateValue(value + step)}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
