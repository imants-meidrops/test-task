import { cookies, headers } from "next/headers";
import Image from "next/image";
import DrillsVideoSection from "./video-section";

// Define the search params interface
interface SearchParams {
  goal?: string;
}

// Define the HomeProps interface
interface HomeProps {
  readonly searchParams?: Promise<SearchParams>;
}

export default async function Home({ searchParams }: HomeProps) {
  // Get the goal from the search params
  const params = await searchParams;
  const goal = params?.goal ?? "Break 80";

  // Get the userId from the cookies
  const userId = (await cookies()).get("userId")?.value ?? "No userId?";

  // Get the headers
  const hdr = await headers();
  // Construct the URL
  const url =
    hdr.get("x-forwarded-proto") +
    "://" +
    hdr.get("x-forwarded-host") +
    "/?goal=" +
    goal.replace(" ", "+");
  // Get the User-Agent
  const userAgent = hdr.get("user-agent") ?? "Unknown UA";

  // Send page_view analytics
  try {
    const analyticsUrl =
      process.env.ANALYTICS_SERVICE_URL ?? "http://localhost:4000";
    await fetch(`${analyticsUrl}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "page_view",
        userId,
        url,
        userAgent,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error("Failed to send page_view:", err);
  }

  // Render the page
  return (
    <main className="min-h-screen">
      <section className="hidden md:block max-w-6xl mx-auto mt-10 mb-10 px-4">
        <div>
          <Image
            src="/logo.png"
            alt="HackMotion Logo"
            width={214}
            height={32}
            priority
          />
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-4 md:py-4 mt-5 md:mt-10">
        <div className="flex flex-col md:flex-row md:items-start md:gap-8">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-xl md:text-3xl font-semibold mb-6 md:mb-10 leading-snug md:mt-20">
              We have put together an improvement solution to help you{" "}
              <span className="text-[#4e70fa]">{goal.toLowerCase()}</span>
            </h1>

            <div className="mb-6">
              <p className="mb-2 pb-3 font-medium text-xl border-b-2 border-solid border-[#d6d6d6]">
                Pack includes:
              </p>
              <div className="font-semibold border-l-4 border-[#4e70fa] pl-3 text-xl space-y-4">
                <p>Swing Analyzer – HackMotion Core</p>
                <p>Drills by coach Tyler Ferrell</p>
                <p>Game improvement plan by HackMotion</p>
              </div>
            </div>

            <button className="inline-block px-6 py-2 rounded-md text-white font-medium bg-[#4e70fa] mt-2 md:mt-10">
              Start Now →
            </button>
          </div>

          <div className="md:w-1/2 flex flex-col items-center md:items-start gap-4">
            <div className="w-full flex justify-center">
              <Image
                className="rounded shadow-md"
                src="/improvement-graph.png"
                alt="Improvement Graph"
                width={567}
                height={439}
              />
            </div>

            <div className="flex flex-col md:flex-row items-stretch gap-4 w-full">
              <div className="hidden md:block">
                <Image
                  src="/desktop-club-and-progress-bar.png"
                  alt="Desktop Single Image"
                  width={800}
                  height={400}
                  className="mx-auto rounded shadow-md"
                />
              </div>
              <div className="block md:hidden flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Image
                  src="/mobile-progress-bar.png"
                  alt="Mobile Progress Bar"
                  width={567}
                  height={405}
                  className="rounded shadow-md"
                />
                <Image
                  src="/mobile-clubface.png"
                  alt="Mobile Clubface"
                  width={567}
                  height={405}
                  className="rounded shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        <h2 className="text-3xl mb-6 text-[#4e70fa] pb-2 border-b-2 border-solid border-[#d6d6d6]">
          The best solution for you: Impact Training Program
        </h2>
        <DrillsVideoSection />
      </section>
      <footer className="w-full py-6 text-center border-t mt-6 bg-black">
        <p className="text-xs text-gray-600 text-white">
          Copyright 2023 © HackMotion | All Rights Reserved
        </p>
      </footer>
    </main>
  );
}
