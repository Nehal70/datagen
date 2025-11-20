import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t-2 border-gray-200 relative z-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
        <p className="text-center text-[#7c3aed] text-sm">
          © {new Date().getFullYear()} DataGen. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

