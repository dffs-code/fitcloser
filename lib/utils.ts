import { clsx, type ClassValue } from "clsx";
import type { Route } from "next";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function asRoute(href: string): Route {
  return href as Route;
}
