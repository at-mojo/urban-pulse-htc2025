import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function to concatenate class names conditionally
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
