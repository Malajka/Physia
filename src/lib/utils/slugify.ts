export function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-");
} 