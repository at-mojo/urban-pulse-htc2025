type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

export default function coolifyLoader({ src, width, quality }: ImageLoaderProps): string {
  const baseUrl = "https://htc2025cdn.alahdal.ca";
  const params = [
    `width=${width}`,
    quality ? `quality=${quality}` : null,
  ]
    .filter(Boolean)
    .join("&");

  // Coolify's Docker image proxy expects URL in the format:
  return `${baseUrl}/image/${src}?${params}`;
}
