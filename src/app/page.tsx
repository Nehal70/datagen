import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-white py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">AI-Powered Dataset Generation</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Generate Custom Datasets
            </span>
            <span className="text-purple-600"> with AI</span>
          </h1>

          {/* Sub-text */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Help engineers and researchers acquire large amounts of quality data from the web. Train AI models with your feedback through intuitive swipe interactions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center px-8 py-3 text-base font-semibold rounded-lg text-white bg-gray-900 hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
            >
              Start Generating Data
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold rounded-lg text-gray-900 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* How DataGen Works Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center text-gray-900 mb-16">
            How DataGen Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: AI Generation */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Generation</h3>
              <p className="text-gray-600">
                Our AI model generates data based on your specific needs - images, text, or any custom format.
              </p>
            </div>

            {/* Card 2: Swipe to Train */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Swipe to Train</h3>
              <p className="text-gray-600">
                Review generated data with simple swipe gestures. Swipe right to keep, left to discard.
              </p>
            </div>

            {/* Card 3: Build Datasets */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Build Datasets</h3>
              <p className="text-gray-600">
                Your feedback trains the model in real-time, creating customized datasets for your research.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose DataGen Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center text-white mb-16">
            Why Choose DataGen?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Benefit 1: Save Time */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Save Time</h3>
                <p className="text-white/90">
                  Generate thousands of data points in minutes instead of days
                </p>
              </div>
            </div>

            {/* Benefit 2: Custom Quality */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Custom Quality</h3>
                <p className="text-white/90">
                  Train AI to match your exact quality standards
                </p>
              </div>
            </div>

            {/* Benefit 3: Easy to Use */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Easy to Use</h3>
                <p className="text-white/90">
                  Intuitive swipe interface requires no technical expertise
                </p>
              </div>
            </div>

            {/* Benefit 4: Scale Effortlessly */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Scale Effortlessly</h3>
                <p className="text-white/90">
                  From small experiments to enterprise datasets
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Build Your Dataset Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Ready to Build Your Dataset?
          </h2>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Join engineers and researchers using DataGen to create high-quality custom datasets.
          </p>

          <div className="pt-4">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center px-8 py-3 text-base font-semibold rounded-lg text-white bg-gray-900 hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
            >
              Start Free Today
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
