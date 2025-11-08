"use client";

import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center relative">
      <Image
        src="https://images.unsplash.com/photo-1727239122674-879c3157d491"
        alt="Urban Pulse"
        width={1000}
        height={1000}
      />
    </main>
  );
}
