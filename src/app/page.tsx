import Link from "next/link";
import { ArrowRight, Activity, Moon, Sun, Heart, Baby, CheckCircle, BarChart2, Calendar } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-traditional-bg text-traditional-text font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-traditional-accent rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">L</span>
          </div>
          <span className="text-lg font-bold text-traditional-text">100년 한의학 AI 헬스케어</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-traditional-subtext">
          {/* Navigation links removed as per request */}
        </div>
        <Link
          href="/login"
          className="px-5 py-2 bg-traditional-accent text-white text-sm font-medium rounded-full hover:bg-opacity-90 transition-colors"
        >
          로그인
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="relative px-6 py-20 md:py-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-traditional-muted/30 to-traditional-bg z-0"></div>
        {/* Hero Video Background */}
        <div className="absolute inset-0 z-0 bg-[#C8B6A6]">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-50"
          >
            <source src="/grok-video-d2ce9230-c0a9-4bed-9097-3443b0c49cfd.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="absolute inset-0 opacity-10 bg-[url('/texture-hanji.png')] pointer-events-none mix-blend-multiply"></div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-md leading-tight">
            <span className="block text-2xl md:text-3xl mb-4 font-normal opacity-90">
              100년의 지혜와 AI가 만나
            </span>
            당신의 건강한 리듬을 찾습니다
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            AI로 찾는 나의 건강 리듬. 전통 한의학의 깊이와 현대 기술로 개인 맞춤형 건강 솔루션을 경험해보세요.
          </p>
          <div className="pt-4">
            <Link
              href="/healthcare/chat?topic=resilience"
              className="inline-flex items-center px-8 py-4 bg-traditional-accent text-white text-lg font-medium rounded-full hover:bg-opacity-90 transition-transform hover:scale-105 shadow-lg"
            >
              AI 상담 시작하기
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-traditional-text">
            AI가 당신의 건강 상태를 분석하고<br />
            맞춤 솔루션을 제안합니다
          </h2>
          <p className="text-traditional-subtext">
            언제 어디서든 AI 한방 헬스케어 챗봇을 통해 당신의 건강 리듬을 체크하고 개인화된 건강 관리법을 추천받으세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <BarChart2 className="w-6 h-6 text-traditional-accent" />,
              title: "실시간 건강 분석",
              desc: "현재 건강 상태와 증상을 입력하면 AI가 실시간으로 분석합니다."
            },
            {
              icon: <Activity className="w-6 h-6 text-traditional-primary" />,
              title: "맞춤형 솔루션 제안",
              desc: "분석 결과를 바탕으로 개인 체질에 맞는 음식, 차, 생활 가이드를 추천합니다."
            },
            {
              icon: <Calendar className="w-6 h-6 text-traditional-secondary" />,
              title: "생활 습관 관리",
              desc: "꾸준한 기록을 통해 건강한 생활 리듬을 유지하도록 돕습니다."
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-traditional-muted hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-traditional-bg rounded-lg flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-traditional-text mb-3">{feature.title}</h3>
              <p className="text-traditional-subtext text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules Grid */}
      <section className="px-6 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Module 1: Resilience */}
          <Link href="/healthcare/chat?topic=resilience" className="group">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-traditional-muted hover:shadow-lg transition-all duration-300 h-full flex flex-col">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                {/* Placeholder for Yoga Image */}
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                  <Sun size={48} />
                </div>
                <div className="absolute inset-0 bg-[url('/images/module-resilience.jpg')] bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-traditional-text mb-2">회복력·면역</h3>
                <p className="text-traditional-subtext text-sm mb-4 flex-1">
                  피로와 스트레스 관리, 면역력 증진을 위한 생활 습관을 점검합니다.
                </p>
                <div className="flex gap-2 mb-6">
                  <span className="text-xs px-2 py-1 bg-traditional-bg text-traditional-subtext rounded">#만성피로</span>
                  <span className="text-xs px-2 py-1 bg-traditional-bg text-traditional-subtext rounded">#면역력</span>
                </div>
                <div className="w-full py-3 bg-traditional-muted/30 text-traditional-text text-sm font-medium rounded-lg text-center group-hover:bg-traditional-accent group-hover:text-white transition-colors">
                  대화로 체크 시작
                </div>
              </div>
            </div>
          </Link>

          {/* Module 2: Women */}
          <Link href="/healthcare/chat?topic=women" className="group">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-traditional-muted hover:shadow-lg transition-all duration-300 h-full flex flex-col">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/module-women.jpg')] bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-traditional-text mb-2">여성 밸런스</h3>
                <p className="text-traditional-subtext text-sm mb-4 flex-1">
                  월경 주기, 호르몬 변화 등 여성 건강의 균형을 위한 생활 리듬을 살핍니다.
                </p>
                <div className="flex gap-2 mb-6">
                  <span className="text-xs px-2 py-1 bg-traditional-bg text-traditional-subtext rounded">#생리통</span>
                  <span className="text-xs px-2 py-1 bg-traditional-bg text-traditional-subtext rounded">#갱년기</span>
                </div>
                <div className="w-full py-3 bg-traditional-muted/30 text-traditional-text text-sm font-medium rounded-lg text-center group-hover:bg-traditional-secondary group-hover:text-white transition-colors">
                  대화로 체크 시작
                </div>
              </div>
            </div>
          </Link>

          {/* Module 3: Pain */}
          <Link href="/healthcare/chat?topic=pain" className="group">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-traditional-muted hover:shadow-lg transition-all duration-300 h-full flex flex-col">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/module-pain.png')] bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-traditional-text mb-2">통증 패턴</h3>
                <p className="text-traditional-subtext text-sm mb-4 flex-1">
                  일상 속 불편한 통증의 원인이 될 수 있는 생활 패턴을 분석합니다.
                </p>
                <div className="flex gap-2 mb-6">
                  <span className="text-xs px-2 py-1 bg-traditional-bg text-traditional-subtext rounded">#두통</span>
                  <span className="text-xs px-2 py-1 bg-traditional-bg text-traditional-subtext rounded">#허리통증</span>
                </div>
                <div className="w-full py-3 bg-traditional-muted/30 text-traditional-text text-sm font-medium rounded-lg text-center group-hover:bg-traditional-accent group-hover:text-white transition-colors">
                  대화로 체크 시작
                </div>
              </div>
            </div>
          </Link>

          {/* Module 4: Digestion */}
          <Link href="/healthcare/chat?topic=digestion" className="group">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-traditional-muted hover:shadow-lg transition-all duration-300 h-full flex flex-col">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/module-digestion.jpg')] bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-traditional-text mb-2">소화·수면 리듬</h3>
                <p className="text-traditional-subtext text-sm mb-4 flex-1">
                  규칙적인 소화와 깊은 수면을 위한 식습관과 생활 습관을 체크합니다.
                </p>
                <div className="flex gap-2 mb-6">
                  <span className="text-xs px-2 py-1 bg-traditional-bg text-traditional-subtext rounded">#소화불량</span>
                  <span className="text-xs px-2 py-1 bg-traditional-bg text-traditional-subtext rounded">#불면증</span>
                </div>
                <div className="w-full py-3 bg-traditional-muted/30 text-traditional-text text-sm font-medium rounded-lg text-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  대화로 체크 시작
                </div>
              </div>
            </div>
          </Link>

          {/* Module 5: Pregnancy */}
          <Link href="/healthcare/chat?topic=pregnancy" className="group">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-traditional-muted hover:shadow-lg transition-all duration-300 h-full flex flex-col">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/module-pregnancy.jpg')] bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-traditional-text mb-2">임신 준비 생활 체크</h3>
                <p className="text-traditional-subtext text-sm mb-4 flex-1">
                  건강한 임신을 준비하기 위한 생활 수칙과 영양 상태를 점검합니다.
                </p>
                <div className="flex gap-2 mb-6">
                  <span className="text-xs px-2 py-1 bg-traditional-bg text-traditional-subtext rounded">#임신준비</span>
                  <span className="text-xs px-2 py-1 bg-traditional-bg text-traditional-subtext rounded">#영양</span>
                </div>
                <div className="w-full py-3 bg-traditional-muted/30 text-traditional-text text-sm font-medium rounded-lg text-center group-hover:bg-pink-600 group-hover:text-white transition-colors">
                  대화로 체크 시작
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-traditional-bg border-t border-traditional-muted">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-traditional-accent rounded-sm flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">L</span>
              </div>
              <span className="text-base font-bold text-traditional-text">죽전한의원</span>
            </div>
            <div className="text-xs text-traditional-subtext space-y-1">
              <p>주소: 경기도 용인시 수지구 죽전로 123, 4층</p>
              <p>연락처: 031-123-4567 | 진료시간: 평일 09:00 - 18:00</p>
            </div>
          </div>
          <div className="flex gap-12 text-xs text-traditional-subtext">
            <div className="space-y-2">
              <h4 className="font-bold text-traditional-text">바로가기</h4>
              <p>한의원 소개</p>
              <p>AI 헬스케어</p>
              <p>라이프스타일</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-traditional-text">지원</h4>
              <p>이용약관</p>
              <p>개인정보처리방침</p>
              <p>문의하기</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-8 pt-8 border-t border-traditional-muted/50 text-center text-[10px] text-traditional-subtext/60">
          <p>© 2025 죽전한의원. All rights reserved.</p>
        </div>
      </footer>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="w-14 h-14 bg-traditional-accent rounded-full flex items-center justify-center text-white shadow-lg hover:bg-opacity-90 transition-all hover:scale-110">
          <span className="text-2xl">💬</span>
        </button>
      </div>
    </div>
  );
}
