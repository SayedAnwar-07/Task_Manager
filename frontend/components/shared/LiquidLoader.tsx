"use client";

import { motion } from "framer-motion";

interface LiquidLoaderProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  speed?: number;
}

export default function LiquidLoader({
  size = "md",
  showText = true,
  speed = 1,
}: LiquidLoaderProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-5">

      {/* ============================== */}
      {/*      CIRCLE LIQUID LOADER      */}
      {/* ============================== */}
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-800">
          {/* Wave 1 */}
          <motion.div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2b564e] to-[#3a7c6f]"
            style={{ height: "70%" }}
            animate={{
              clipPath: [
                "polygon(0% 45%, 100% 45%, 100% 100%, 0% 100%)",
                "polygon(0% 15%, 100% 25%, 100% 100%, 0% 100%)",
                "polygon(0% 45%, 100% 35%, 100% 100%, 0% 100%)",
              ],
            }}
            transition={{
              duration: 2 / speed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Wave 2 */}
          <motion.div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3a7c6f] to-[#4da99a] opacity-80"
            style={{ height: "60%" }}
            animate={{
              clipPath: [
                "polygon(0% 25%, 100% 35%, 100% 100%, 0% 100%)",
                "polygon(0% 45%, 100% 55%, 100% 100%, 0% 100%)",
                "polygon(0% 25%, 100% 35%, 100% 100%, 0% 100%)",
              ],
            }}
            transition={{
              duration: 2.5 / speed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Bubbles */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/40"
              style={{
                width: i * 3,
                height: i * 3,
                left: `${20 + i * 15}%`,
                bottom: "10%",
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 1.5 / speed,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-[#2b564e] blur-md"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: 2 / speed,
            repeat: Infinity,
          }}
        />
      </div>

      {/* ============================== */}
      {/*   TEXT LIQUID FILL ANIMATION   */}
      {/* ============================== */}
      {showText && (
        <div className="relative flex flex-col items-center">
          
          {/* TEXT OUTLINE */}
          <div
            className={`${textSizes[size]} font-extrabold text-gray-400 dark:text-gray-600`}
          >
            Eventra BD
          </div>

          {/* TEXT FILL (MASKED GRADIENT) */}
          <motion.div
            className={`${textSizes[size]} font-extrabold text-transparent bg-gradient-to-t from-[#2b564e] to-[#4da99a] bg-clip-text absolute top-0`}
            animate={{
              backgroundPosition: ["0% 100%", "0% 0%"],
            }}
            transition={{
              duration: 2.2 / speed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              maskImage:
                "linear-gradient(to top, black 40%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to top, black 40%, transparent 100%)",
            }}
          >
            Eventra BD
          </motion.div>

          {/* Loading text */}
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.8 / speed,
              repeat: Infinity,
            }}
            className="text-sm text-gray-500 dark:text-gray-400 mt-1"
          >
            Loading...
          </motion.div>
        </div>
      )}
    </div>
  );
}
