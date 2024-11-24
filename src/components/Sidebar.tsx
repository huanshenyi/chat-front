"use client";

import Image from "next/image";

export default function Sidebar() {
  return (
    <div className="w-64 bg-secondary p-4">
      <div className="flex items-center w-full">
        <Image
          src="/bedrock.png"
          width={30}
          height={20}
          alt="icon"
          className="mr-2"
        />
        <div className="font-semibold">Chat App</div>
      </div>
    </div>
  );
}
