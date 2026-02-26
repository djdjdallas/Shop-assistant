import { Zap, Twitter, Github } from 'lucide-react';

export default function FooterSection() {
  return (
    <footer className="bg-white border-t border-[#e5e7eb] py-8 px-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-cyan-500 text-white p-2 rounded">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">Product Admin Sidekick</div>
            <div className="text-[10px] font-mono text-gray-400">
              &copy; 2024 Sidekick DevSystems Inc.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <a href="#" className="text-xs text-gray-500 hover:text-cyan-500 transition-colors">
            Documentation
          </a>
          <a href="#" className="text-xs text-gray-500 hover:text-cyan-500 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-xs text-gray-500 hover:text-cyan-500 transition-colors">
            Support Terminal
          </a>
          <div className="flex gap-4 border-l border-gray-100 pl-8">
            <Twitter className="w-4 h-4 text-gray-400 hover:text-cyan-500 cursor-pointer" />
            <Github className="w-4 h-4 text-gray-400 hover:text-cyan-500 cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
