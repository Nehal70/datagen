import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="h-[calc(100vh-8rem)] bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-6xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-7xl sm:text-8xl lg:text-9xl font-normal heading-font text-[#8b5cf6]">
            DATAGEN
          </h1>
          <p className="text-xl sm:text-2xl text-[#7c3aed]">
            Manage your data generation projects with ease
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="btn-primary inline-flex items-center justify-center px-10 py-3 text-base font-semibold rounded-lg text-white min-w-[180px]"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn-secondary inline-flex items-center justify-center px-10 py-3 text-base font-semibold rounded-lg min-w-[180px]"
            >
              Create Account
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-[#d8b4fe] aspect-square p-8 rounded-xl text-white flex flex-col justify-center items-center">
            <h3 className="text-3xl font-bold mb-3 heading-font">
              Projects
            </h3>
            <p className="text-sm opacity-90 text-center">
              Organize and manage your data generation projects
            </p>
          </div>
          <div className="bg-[#d8b4fe] aspect-square p-8 rounded-xl text-white flex flex-col justify-center items-center">
            <h3 className="text-3xl font-bold mb-3 heading-font">
              Images
            </h3>
            <p className="text-sm opacity-90 text-center">
              Upload and manage images for your datasets
            </p>
          </div>
          <div className="bg-[#d8b4fe] aspect-square p-8 rounded-xl text-white flex flex-col justify-center items-center">
            <h3 className="text-3xl font-bold mb-3 heading-font">
              Analytics
            </h3>
            <p className="text-sm opacity-90 text-center">
              Track and analyze your data generation progress
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
