import Link from "next/link";
import { ArrowRight, Activity, Moon, Sun, Heart, Baby } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-traditional-bg text-traditional-text font-sans">
      {/* Hero Section */}
      <header className="relative px-6 py-12 md:py-20 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/texture-hanji.png')] pointer-events-none mix-blend-multiply"></div>
        <div className="relative z-10 max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div className="inline-block px-3 py-1 mb-4 text-sm font-medium tracking-widest text-traditional-secondary border border-traditional-secondary/30 rounded-full bg-traditional-bg/50 backdrop-blur-sm">
            100년 전통 · AI 기술의 만남
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-traditional-text leading-tight">
            <span className="block text-traditional-primary text-2xl md:text-3xl mb-2 font-normal">
              당신의 체질과 리듬을 읽습니다
            </span>
            100년 한의학 <br className="md:hidden" />
            AI 헬스케어
          </h1>
          <p className="text-lg md:text-xl text-traditional-subtext max-w-2xl mx-auto leading-relaxed break-keep">
            죽전한의원의 100년 노하우를 담았습니다.<br />
            병원에 가기 전, 내 몸의 상태를 먼저 체크해보세요.
          </p>
        </div>
      </header>

      {/* Module Selection Grid */}
      <main className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Module 1: Resilience (Active for MVP) */}
          <Link href="/healthcare/chat?topic=resilience" className="group">
            <div className="h-full p-8 rounded-2xl bg-white border border-traditional-muted shadow-sm hover:shadow-md hover:border-traditional-primary/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sun size={80} className="text-traditional-primary" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-traditional-primary/10 flex items-center justify-center text-traditional-primary mb-4">
                  <Sun size={24} />
                </div>
                <h3 className="text-2xl font-bold text-traditional-text">회복력·면역</h3>
                <p className="text-traditional-subtext text-sm leading-relaxed">
                  "자도 자도 피곤해요"<br />
                  만성 피로와 면역력 저하가 걱정되시나요?
                </p>
                <div className="pt-4 flex items-center text-traditional-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                  체크 시작하기 <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* Module 2: Women */}
          <Link href="/healthcare/chat?topic=women" className="group">
            <div className="h-full p-8 rounded-2xl bg-white border border-traditional-muted shadow-sm hover:shadow-md hover:border-traditional-secondary/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Moon size={80} className="text-traditional-secondary" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-traditional-secondary/10 flex items-center justify-center text-traditional-secondary mb-4">
                  <Moon size={24} />
                </div>
                <h3 className="text-2xl font-bold text-traditional-text">여성 밸런스</h3>
                <p className="text-traditional-subtext text-sm leading-relaxed">
                  생리통, 갱년기, 호르몬 변화.<br />
                  여성만의 리듬을 케어합니다.
                </p>
                <div className="pt-4 flex items-center text-traditional-secondary font-medium text-sm group-hover:translate-x-1 transition-transform">
                  체크 시작하기 <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* Module 3: Pain */}
          <Link href="/healthcare/chat?topic=pain" className="group">
            <div className="h-full p-8 rounded-2xl bg-white border border-traditional-muted shadow-sm hover:shadow-md hover:border-traditional-accent/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={80} className="text-traditional-accent" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-traditional-accent/10 flex items-center justify-center text-traditional-accent mb-4">
                  <Activity size={24} />
                </div>
                <h3 className="text-2xl font-bold text-traditional-text">통증 패턴</h3>
                <p className="text-traditional-subtext text-sm leading-relaxed">
                  허리, 어깨, 무릎 통증.<br />
                  반복되는 통증의 원인을 찾습니다.
                </p>
                <div className="pt-4 flex items-center text-traditional-accent font-medium text-sm group-hover:translate-x-1 transition-transform">
                  체크 시작하기 <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* Module 4: Digestion */}
          <Link href="/healthcare/chat?topic=digestion" className="group">
            <div className="h-full p-8 rounded-2xl bg-white border border-traditional-muted shadow-sm hover:shadow-md hover:border-orange-400/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Heart size={80} className="text-orange-600" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-4">
                  <Heart size={24} />
                </div>
                <h3 className="text-2xl font-bold text-traditional-text">소화·수면</h3>
                <p className="text-traditional-subtext text-sm leading-relaxed">
                  속이 더부룩하고 잠들기 힘든가요?<br />
                  순환의 문제를 짚어드립니다.
                </p>
                <div className="pt-4 flex items-center text-orange-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  체크 시작하기 <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* Module 5: Pregnancy */}
          <Link href="/healthcare/chat?topic=pregnancy" className="group">
            <div className="h-full p-8 rounded-2xl bg-white border border-traditional-muted shadow-sm hover:shadow-md hover:border-pink-400/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Baby size={80} className="text-pink-600" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mb-4">
                  <Baby size={24} />
                </div>
                <h3 className="text-2xl font-bold text-traditional-text">임신 준비</h3>
                <p className="text-traditional-subtext text-sm leading-relaxed">
                  건강한 아기를 만나는 준비.<br />
                  부부의 몸 상태를 함께 봅니다.
                </p>
                <div className="pt-4 flex items-center text-pink-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  체크 시작하기 <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
            </div>
          </Link>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-traditional-subtext/60 text-xs border-t border-traditional-muted/50">
        <p className="mb-2">본 서비스는 건강 정보 제공을 목적으로 하며, 의학적 진단을 대체하지 않습니다.</p>
        <p>© 2025 죽전한의원 AI 헬스케어</p>
      </footer>
    </div>
  );
}
