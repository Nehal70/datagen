'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const handleScrollToHowItWorks = useCallback(() => {
    if (typeof document === 'undefined') return;
    const section = document.getElementById('how-it-works');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-dynamic">
      {/* Hero Section */}
      <section className="relative isolate flex min-h-[calc(100vh-5rem)] items-center px-6 pt-16 pb-24 sm:pt-20 sm:pb-28 lg:px-8 bg-gradient-to-b from-sky-50 via-white to-violet-100">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl"
        >
          <div className="relative left-1/2 aspect-[1108/632] w-[72rem] -translate-x-1/2 bg-gradient-to-tr from-sky-300 via-indigo-400 to-violet-500 opacity-40 animate-gradient" />
        </div>

        <div className="mx-auto max-w-5xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-xs sm:text-sm text-[#4b5563] shadow-sm ring-1 ring-gray-200 backdrop-blur-md animate-fade-in">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e0f2fe] text-[#2563eb] text-xs">
              ✨
            </span>
            <span className="font-medium tracking-wide">AI-Powered Dataset Generation</span>
          </div>

          <div className="space-y-5 sm:space-y-6 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-[#111827]">
              Generate Custom Datasets
              <span className="block text-[#7c3aed]">with AI</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-[#4b5563]">
              Help engineers and researchers acquire large amounts of quality data from the web.
              Train AI models with your feedback through intuitive swipe interactions.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row sm:gap-6">
            <Link
              href="/login"
              className="btn-primary inline-flex min-w-[190px] items-center justify-center rounded-lg px-8 py-3 text-sm sm:text-base font-semibold shadow-md hover-glow"
            >
              Start Generating Data
            </Link>
            <button
              type="button"
              onClick={handleScrollToHowItWorks}
              className="btn-secondary inline-flex min-w-[140px] items-center justify-center rounded-lg px-6 py-3 text-sm sm:text-base font-semibold"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* How DataGen Works */}
      <section
        id="how-it-works"
        className="bg-white/90 border-t border-gray-200 px-6 py-20 sm:py-24 lg:px-8"
      >
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="heading-font text-3xl sm:text-4xl lg:text-5xl tracking-wide text-[#111827]">
              How DataGen Works
            </h2>
            <p className="mx-auto max-w-3xl text-sm sm:text-lg text-[#4b5563]">
              From generating candidates to curating final datasets, DataGen keeps every step simple
              and intuitive.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div className="glass hover-glow flex min-h-[220px] flex-col gap-5 rounded-3xl p-7 sm:p-8">
              <div className="inline-flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl">
                <Image
                  src="/brain-outline.svg"
                  alt="AI Generation icon"
                  width={52}
                  height={52}
                  className="h-13 w-13 max-h-[52px] max-w-[52px]"
                  priority
                />
              </div>
              <h3 className="heading-font text-xl sm:text-2xl tracking-wide text-[#111827]">
                AI Generation
              </h3>
              <p className="text-sm sm:text-base text-[#6b7280]">
                Our AI model generates data based on your specific needs – images, text, or any
                custom format.
              </p>
            </div>

            <div className="glass hover-glow flex min-h-[220px] flex-col gap-5 rounded-3xl p-7 sm:p-8">
              <div className="inline-flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl">
                <Image
                  src="/swipe-lightning.svg"
                  alt="Swipe to Train icon"
                  width={52}
                  height={52}
                  className="h-13 w-13 max-h-[52px] max-w-[52px]"
                  priority
                />
              </div>
              <h3 className="heading-font text-xl sm:text-2xl tracking-wide text-[#111827]">
                Swipe to Train
              </h3>
              <p className="text-sm sm:text-base text-[#6b7280]">
                Review generated data with simple swipe gestures. Swipe right to keep, left to
                discard.
              </p>
            </div>

            <div className="glass hover-glow flex min-h-[220px] flex-col gap-5 rounded-3xl p-7 sm:p-8">
              <div className="inline-flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl">
                <Image
                  src="/build-datasets.svg"
                  alt="Build Datasets icon"
                  width={52}
                  height={52}
                  className="h-13 w-13 max-h-[52px] max-w-[52px]"
                  priority
                />
              </div>
              <h3 className="heading-font text-xl sm:text-2xl tracking-wide text-[#111827]">
                Build Datasets
              </h3>
              <p className="text-sm sm:text-base text-[#6b7280]">
                Your feedback trains the model in real time, creating customized datasets for your
                research.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose DataGen */}
      <section className="bg-gradient-to-b from-white via-sky-50 to-violet-50 px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-3">
            <h2 className="heading-font text-3xl sm:text-4xl lg:text-5xl tracking-wide text-[#111827]">
              Why Choose DataGen?
            </h2>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#8b5cf6] px-8 py-10 shadow-xl sm:px-12 sm:py-12">
            <div className="grid gap-10 text-white md:grid-cols-2">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/40">
                    <span className="text-base font-semibold text-white">✓</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-semibold">Save Time</h3>
                    <p className="text-sm sm:text-base text-slate-100">
                      Generate thousands of data points in minutes instead of days with automated
                      pipelines.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/40">
                    <span className="text-base font-semibold text-white">✓</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-semibold">Easy to Use</h3>
                    <p className="text-sm sm:text-base text-slate-100">
                      Intuitive swipe interface means no technical expertise required to curate
                      high-quality data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/40">
                    <span className="text-base font-semibold text-white">✓</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-semibold">Custom Quality</h3>
                    <p className="text-sm sm:text-base text-slate-100">
                      Train AI to match your exact quality standards with human-in-the-loop
                      feedback.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/40">
                    <span className="text-base font-semibold text-white">✓</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-semibold">Scale Effortlessly</h3>
                    <p className="text-sm sm:text-base text-slate-100">
                      Move seamlessly from small experiments to enterprise-scale datasets without
                      changing tools.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        id="get-started"
        className="bg-white border-t border-gray-200 px-6 py-16 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-4xl rounded-3xl bg-gray-50 px-6 py-10 text-center shadow-sm sm:px-10 sm:py-12">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#ede9fe] text-[#7c3aed]">
            <span className="text-xl">👥</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#111827]">
            Ready to Build Your Dataset?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6b7280]">
            Join engineers and researchers using DataGen to create high-quality custom datasets.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/register"
              className="btn-primary inline-flex items-center justify-center rounded-lg px-8 py-3 text-sm sm:text-base font-semibold shadow-md hover-glow"
            >
              Start Free Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
