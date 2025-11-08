"use client";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useState } from "react";

export const TabButton = ({
  name,
  value,
  onChange,
  selected,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  selected: boolean;
}) => {
  return (
    <Button
      variant="ghost"
      size="lg"
      onClick={() => onChange(value)}
      className={cn(
        "transition-all duration-300",
        selected && "text-primary",
        !selected && "text-foreground/50 hover:text-foreground"
      )}
    >
      {name}
    </Button>
  );
};

export const TabView = ({
  onChange,
  children,
}: {
  onChange: (value: string) => void;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-row items-center justify-center gap-2 p-2 bg-background rounded-md">
      {(children as React.ReactElement<{ name: string; value: string; selected: boolean }>[]).map(
        (child) => (
          <TabButton
            key={child.props.value}
            name={child.props.name}
            value={child.props.value}
            onChange={onChange}
            selected={child.props.selected}
          />
        )
      )}
    </div>
  );
};
