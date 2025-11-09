import { cn } from "@/lib/utils";
import { Button } from "./button";

export const RadioGroup = ({
  id,
  options,
  value,
  onChange,
}: {
  id: string;
  options: { label: string; value: string; color?: string }[];
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="flex flex-row" id={id}>
      {options.map((option, index) => (
        <Button
          key={option.value}
          variant="outline"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 -mx-px",
            value === option.value && option.color,
            index > 0 && "rounded-l-none border-l-0",
            index < options.length - 1 && "rounded-r-none border-r-0"
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};
