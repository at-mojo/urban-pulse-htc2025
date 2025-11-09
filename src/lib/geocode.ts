"use client";

export async function getLocationString(lat: number, lon: number): Promise<string> {
  const response = await fetch(`https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lon}&latitude=${lat}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`);
  const data = await response.json();
  return data.features[0].properties.name;
}