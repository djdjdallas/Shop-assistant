import './landing.css';
import BrowserChrome from '@/components/landing/BrowserChrome';
import HeroSection from '@/components/landing/HeroSection';
import ChangelogSection from '@/components/landing/ChangelogSection';
import WorkspaceSection from '@/components/landing/WorkspaceSection';
import ReadmeSection from '@/components/landing/ReadmeSection';
import FaqSection from '@/components/landing/FaqSection';
import FooterSection from '@/components/landing/FooterSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-cyan-100 selection:text-cyan-900">
      <BrowserChrome />
      <main className="flex-1 mt-[84px] relative">
        <div className="grid-bg" />
        <HeroSection />
        <ChangelogSection />
        <WorkspaceSection />
        <ReadmeSection />
        <FaqSection />
      </main>
      <FooterSection />
    </div>
  );
}
