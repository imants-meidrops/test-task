// Use client-side JavaScript to track video progress and send analytics events
"use client";

import { useEffect, useRef, useState } from "react";

// Adjust to match your actual Analytics URL
const ANALYTICS_URL =
  process.env.ANALYTICS_SERVICE_URL ?? "http://localhost:4000";

// Get the cookie value by name
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const regex = new RegExp(`(^| )${name}=([^;]+)`);
  const match = regex.exec(document.cookie);
  return match ? decodeURIComponent(match[2]) : undefined;
}

// Define the segments of the video with labels, start, and end times
const SEGMENTS = [
  { label: "Static top drill", start: 5, end: 14 },
  { label: "Dynamic top drill", start: 14, end: 24 },
  { label: "Top full swing challenge", start: 24, end: 34 },
];

export default function DrillsVideoSection() {
  // Ref to the video element
  const videoRef = useRef<HTMLVideoElement>(null);
  // Current time in the video
  const [currentTime, setCurrentTime] = useState(0);
  // Window width for responsive design
  const [windowWidth, setWindowWidth] = useState<number>(0);

  // Collapsible states for 3 drills
  const [openStates, setOpenStates] = useState<boolean[]>([
    false,
    false,
    false,
  ]);

  // Track window size
  useEffect(() => {
    // Track window size for horizontal or vertical progress bar
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
    }
    // Update window width on resize
    const handleResize = () => setWindowWidth(window.innerWidth);
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [windowWidth]);

  // Update the progress bar and collapsible drills
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    // Figure out which segment we are in
    let activeIndex = -1;
    for (let i = 0; i < SEGMENTS.length; i++) {
      if (t >= SEGMENTS[i].start && t < SEGMENTS[i].end) {
        activeIndex = i;
        break;
      }
    }

    // Open the active segment and close others
    if (activeIndex !== -1) {
      const updated = SEGMENTS.map((_, i) => i === activeIndex);
      setOpenStates(updated);
    } else {
      // No segment matched (e.g., before 5s or after 34s)
      setOpenStates(SEGMENTS.map(() => false));
    }
  };

  // This fires when the user watches the entire video (video ends)
  const handleVideoEnded = async () => {
    try {
      const userId = getCookie("userId") || "unknown-user";
      await fetch(`${ANALYTICS_URL}/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "full_video_watch",
          userId,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });
      console.log("Full video watch event sent!");
    } catch (err) {
      console.error("Failed to send video_watch event:", err);
    }
  };

  // For each segment, how much is filled? (vertical or horizontal)
  const getSegmentFill = (index: number) => {
    const seg = SEGMENTS[index];
    if (currentTime < seg.start) return 0;
    if (currentTime >= seg.end) return 100;
    return ((currentTime - seg.start) / (seg.end - seg.start)) * 100;
  };

  // Render the video section
  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-4 lg:gap-2">
      <div>
        <video
          ref={videoRef}
          className="w-full max-w-xl rounded-md border"
          controls
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
        >
          <source src="/impact-drill.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-4">
        <div
          className="progress-bar flex rounded bg-white overflow-hidden"
          style={{
            flexDirection: windowWidth < 768 ? "row" : "column",
            width: windowWidth < 768 ? "100%" : "8px",
            height: windowWidth < 768 ? "12px" : "100%",
          }}
        >
          {SEGMENTS.map((seg, i) => {
            const totalRange =
              SEGMENTS[SEGMENTS.length - 1].end - SEGMENTS[0].start;
            const segmentRatio = (seg.end - seg.start) / totalRange;
            const segmentHeight = segmentRatio * 100; // each segment's portion of bar
            const fillPercent = getSegmentFill(i);

            return (
              <div
                key={i}
                className="progress-segment bg-white relative"
                style={{
                  height: windowWidth < 768 ? "100%" : `${segmentHeight}%`,
                  width: windowWidth < 768 ? `${segmentHeight}%` : "100%",
                }}
              >
                <div
                  className="absolute top-0 left-0 bg-blue-500 transition-all duration-500"
                  style={{
                    height: windowWidth < 768 ? "100%" : `${fillPercent}%`,
                    width: windowWidth < 768 ? `${fillPercent}%` : "100%",
                  }}
                />
              </div>
            );
          })}
        </div>

        <div className="space-y-2 w-full md:w-64">
          {SEGMENTS.map((seg, i) => (
            <details
              key={i}
              open={openStates[i]}
              className="rounded p-2 border-b-2 border-solid border-[#d6d6d6]"
            >
              <summary className="flex items-center cursor-pointer font-semibold text-[#4e70fa] gap-2 text-xl">
                <span>{openStates[i] ? "⋀" : "⋁"}</span>
                <span>{seg.label}</span>
              </summary>
              <div className="mt-1 text-base text-gray-700">
                {i === 0 && (
                  <p>
                    Get a feel for the optimal wrist position at the top of your
                    swing.
                  </p>
                )}
                {i === 1 && (
                  <p>
                    Dynamically train your wrist position at the top of your
                    swing.
                  </p>
                )}
                {i === 2 && (
                  <p>
                    Train your maximum power swing with a full top swing
                    challenge.
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
