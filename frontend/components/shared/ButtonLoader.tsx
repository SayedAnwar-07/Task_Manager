"use client";

import React from "react";

interface ButtonLoaderProps {
  text?: string;
  size?: "sm" | "md"; // small for inside buttons
}

export default function ButtonLoader({ text = "Loading", size = "md" }: ButtonLoaderProps) {
  const isSmall = size === "sm";

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        isSmall ? "scale-75 -my-1" : "gap-1"
      }`}
    >
      {/* Text (hidden for small version, to fit inside buttons) */}
      {!isSmall && (
        <div className="text-white text-sm font-semibold flex">
          {text}
          <span className="ml-1 animate-blink">.</span>
          <span className="animate-blink delay-300">.</span>
          <span className="animate-blink delay-600">.</span>
        </div>
      )}

      {/* Loading Bar Background */}
      <div
        className={`${
          isSmall ? "w-[100px] h-[20px]" : "w-[200px] h-[30px]"
        } bg-[#212121] shadow-inner rounded-full p-1 flex items-center`}
      >
        {/* Loading Bar */}
        <div
          className={`relative ${
            isSmall ? "h-[10px]" : "h-[20px]"
          } w-0 rounded-full overflow-hidden animate-loading bg-gradient-to-t from-[#de4a0f] to-[#f9c74f]`}
        >
          {/* White Bars */}
          <div className="absolute inset-0 flex items-center gap-4 pl-2">
            {Array.from({ length: isSmall ? 6 : 10 }).map((_, i) => (
              <div
                key={i}
                className="w-[8px] h-[25px] opacity-30 rotate-45 bg-gradient-to-tr from-white to-transparent"
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes loading {
          0% {
            width: 0%;
          }
          80% {
            width: 100%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-loading {
          animation: loading 4s ease-out infinite;
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-blink {
          animation: blink 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
