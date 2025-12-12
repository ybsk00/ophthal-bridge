import Link from "next/link";
import { ArrowRight, Activity, Moon, Sun, Heart, Baby, CheckCircle, BarChart2, Calendar } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-traditional-bg text-traditional-text font-sans selection:bg-traditional-accent selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-traditional-muted/50 transition-all duration-300">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 bg-traditional-primary rounded-lg flex items-center justify-center shadow-md group-hover:bg-traditional-accent transition-colors duration-300">
              <span className="text-white text-sm font-bold font-serif">JK</span>
            </div>
            <span className="text-xl font-bold text-traditional-text tracking-tight group-hover:text-traditional-primary transition-colors">100년 한의학 AI 헬스케어</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-traditional-subtext">
            {/* Navigation links removed as per request */}
          </div>
          <Link
            href="/login"
            className="px-6 py-2.5 bg-traditional-primary text-white text-sm font-medium rounded-full hover:bg-traditional-accent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            로그인
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative px-6 pt-32 pb-20 md:pt-48 md:pb-32 text-center overflow-hidden min-h-[90vh] flex flex-col justify-center items-center">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          {/* Hero Video Background */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/2.mp4" type="video/mp4" />
            </video>
          </div>
          {/* Texture Overlay */}
          <div className="absolute inset-0 opacity-20 bg-[url('/texture-hanji.png')] pointer-events-none mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-8 animate-fade-in">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold mb-4 shadow-sm animate-slide-up">
            AI 기반 맞춤형 한방 헬스케어
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg leading-tight font-serif">
            <span className="block text-2xl md:text-3xl mb-6 font-sans font-light text-white/80 tracking-widest uppercase">
              Tradition Meets Intelligence
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-traditional-primary via-traditional-secondary to-traditional-accent">
              100년의 지혜
            </span>와<br />
            <span className="text-white">AI의 만남</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-light drop-shadow-md">
            당신의 맥박, 체질, 생활 습관을 AI가 분석하여<br className="hidden md:block" />
            가장 현대적인 한방 솔루션을 제안합니다.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/healthcare/chat?topic=resilience"
              className="group relative inline-flex items-center px-8 py-4 bg-traditional-primary text-white text-lg font-medium rounded-full overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
              <span className="relative flex items-center gap-2">
                AI 건강 분석 시작하기 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white/50 backdrop-blur-sm text-traditional-primary border border-traditional-primary/20 text-lg font-medium rounded-full hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              로그인
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section - Glassmorphism Cards */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-traditional-bg to-white z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-traditional-text font-serif">
              AI 헬스케어 솔루션
            </h2>
            <p className="text-traditional-subtext max-w-2xl mx-auto">
              전통 한의학의 정밀함과 인공지능의 분석력이 만나<br />
              당신만을 위한 최적의 건강 리듬을 찾아드립니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart2 className="w-8 h-8 text-traditional-accent" />,
                title: "실시간 데이터 분석",
                desc: "사용자의 건강 데이터를 실시간으로 수집하고 분석하여 현재 상태를 정확하게 진단합니다.",
                bg: "bg-orange-50/50"
              },
              {
                icon: <Activity className="w-8 h-8 text-traditional-primary" />,
                title: "체질 맞춤 처방",
                desc: "사상체질과 유전적 요인을 고려하여 개인에게 최적화된 한방 처방과 생활 가이드를 제공합니다.",
                bg: "bg-green-50/50"
              },
              {
                icon: <Calendar className="w-8 h-8 text-traditional-secondary" />,
                title: "지속적 건강 관리",
                desc: "일회성 진료가 아닌, 지속적인 모니터링과 피드백을 통해 건강한 생활 습관을 형성합니다.",
                bg: "bg-brown-50/50"
              }
            ].map((feature, idx) => (
              <div key={idx} className={`group relative p-8 rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden`}>
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/80 to-transparent`}></div>
                <div className="relative z-10">
                  <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-traditional-text mb-4 font-serif">{feature.title}</h3>
                  <p className="text-traditional-subtext text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Grid - "My Health" Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/images/herbal-bg.png')] bg-cover bg-center opacity-90 grayscale-[20%] sepia-[10%]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-traditional-primary/30 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-traditional-accent font-bold tracking-widest uppercase text-sm mb-2 block">My Health Rhythm</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg font-serif">
              AI 헬스케어로 알아보는 나의 건강
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* Module 1: Resilience */}
            <Link href="/healthcare/chat?topic=resilience" className="group">
              <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex flex-col items-center text-center group-hover:backdrop-blur-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:shadow-orange-500/30 transition-all duration-300">
                  <Sun className="w-7 h-7 text-orange-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 tracking-wide">회복력·면역</h3>
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  만성 피로와 잦은 감기,<br />면역력 저하 케어
                </p>
              </div>
            </Link>

            {/* Module 2: Women */}
            <Link href="/healthcare/chat?topic=women" className="group">
              <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex flex-col items-center text-center group-hover:backdrop-blur-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:shadow-pink-500/30 transition-all duration-300">
                  <Moon className="w-7 h-7 text-pink-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 tracking-wide">여성 밸런스</h3>
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  월경 불순부터 갱년기까지<br />여성 생애주기 관리
                </p>
              </div>
            </Link>

            {/* Module 3: Pain */}
            <Link href="/healthcare/chat?topic=pain" className="group">
              <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex flex-col items-center text-center group-hover:backdrop-blur-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
                  <Activity className="w-7 h-7 text-blue-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 tracking-wide">통증 패턴</h3>
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  반복되는 두통, 관절통,<br />근골격계 통증 분석
                </p>
              </div>
            </Link>

            {/* Module 4: Digestion */}
            <Link href="/healthcare/chat?topic=digestion" className="group">
              <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex flex-col items-center text-center group-hover:backdrop-blur-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:shadow-green-500/30 transition-all duration-300">
                  <Heart className="w-7 h-7 text-green-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 tracking-wide">소화·수면</h3>
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  위장 장애와 불면증,<br />생활 리듬 회복
                </p>
              </div>
            </Link>

            {/* Module 5: Pregnancy */}
            <Link href="/healthcare/chat?topic=pregnancy" className="group">
              <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex flex-col items-center text-center group-hover:backdrop-blur-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300">
                  <Baby className="w-7 h-7 text-purple-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 tracking-wide">임신 준비</h3>
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  난임 극복과 건강한<br />임신을 위한 준비
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-traditional-bg border-t border-traditional-muted/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-traditional-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold font-serif">JK</span>
              </div>
              <span className="text-xl font-bold text-traditional-text font-serif">한의원</span>
            </div>
            <div className="text-sm text-traditional-subtext space-y-2 font-light">
              <p className="flex items-center gap-2"><span className="w-16 font-medium text-traditional-text/80">주소</span> 경기도 하남시 미사강변서로 22, 에코큐브지식산업센터 1005호</p>
              <p className="flex items-center gap-2"><span className="w-16 font-medium text-traditional-text/80">연락처</span> 0507-1390-5121</p>
              <p className="flex items-center gap-2"><span className="w-16 font-medium text-traditional-text/80">진료시간</span> 9시부터 18시까지 근무 (일요일 휴무)</p>
            </div>
          </div>

          <div className="flex gap-16 text-sm text-traditional-subtext">
            <div className="space-y-4">
              <h4 className="font-bold text-traditional-text text-base">지원</h4>
              <ul className="space-y-3">
                <li><span className="cursor-not-allowed opacity-70 hover:text-traditional-primary transition-colors">이용약관</span></li>
                <li><span className="cursor-not-allowed opacity-70 hover:text-traditional-primary transition-colors">개인정보처리방침</span></li>
                <li><Link href="/login" className="hover:text-traditional-primary transition-colors">문의하기</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-traditional-muted/50 text-center text-xs text-traditional-subtext/60 font-light">
          <p>© 2025 한의원. All rights reserved. 본 사이트의 콘텐츠는 저작권법의 보호를 받습니다.</p>
        </div>
      </footer>

      {/* Floating Chat Button */}
      <div className="fixed bottom-8 right-8 z-50 animate-bounce-slow">
        <Link href="/healthcare/chat" className="w-16 h-16 bg-traditional-primary rounded-full flex items-center justify-center text-white shadow-2xl hover:bg-traditional-accent transition-all duration-300 hover:scale-110 border-4 border-white/20 backdrop-blur-sm">
          <span className="text-3xl">💬</span>
        </Link>
      </div>
    </div>
  );
}
