import Link from "next/link";
import { ArrowRight, Activity, Moon, Sun, Heart, Baby, CheckCircle, BarChart2, Calendar } from "lucide-react";
import { TrackF1View } from "@/components/marketing/MarketingTracker";
import Footer from "@/components/common/Footer";

export default function LandingPage() {
  return (
    <TrackF1View>
      <div className="min-h-screen bg-traditional-bg text-traditional-text font-sans selection:bg-traditional-accent selection:text-white">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-traditional-muted/50 transition-all duration-300">
          <div className="flex items-center justify-between px-6 py-1 max-w-7xl mx-auto">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <img src="/logo_new.png" alt="위담 건강가이드 챗" className="h-[72px] w-auto object-contain" />
            </Link>
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
                <source src="/3.mp4" type="video/mp4" />
              </video>
            </div>
            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-20 bg-[url('/texture-hanji.png')] pointer-events-none mix-blend-overlay"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto space-y-8 animate-fade-in">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold mb-4 shadow-sm animate-slide-up">
              위담 건강가이드 챗(참고용)
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg leading-tight font-serif">
              <span className="block text-2xl md:text-3xl mb-6 font-sans font-light text-white/80 tracking-widest uppercase">
                Check Your Rhythm
              </span>
              더부룩함·속 불편,<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-traditional-primary via-traditional-secondary to-traditional-accent">
                생활 리듬부터
              </span> 점검해보세요
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-light drop-shadow-md">
              짧은 채팅 체크로 식사·수면·스트레스 패턴을 정리하고,<br className="hidden md:block" />
              상담 준비용 요약을 제공합니다. (진단/치료 아님)
            </p>
            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/healthcare/chat?topic=digestion"
                className="group relative inline-flex items-center px-8 py-4 bg-traditional-primary text-white text-lg font-medium rounded-full overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
                <span className="relative flex items-center gap-2">
                  소화 리듬 체크 시작 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white/50 backdrop-blur-sm text-traditional-primary border border-traditional-primary/20 text-lg font-medium rounded-full hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                로그인
              </Link>
            </div>
            <p className="text-xs text-white/60 font-light mt-4">
              본 서비스는 건강 정보 제공 및 생활 습관 점검을 위한 참고용입니다. 증상이 지속되면 의료진 상담이 필요합니다.
            </p>
          </div>
        </header>

        {/* Features Section - Glassmorphism Cards */}
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-traditional-bg to-white z-0"></div>

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="text-center mb-20 space-y-6">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-sans tracking-tight">
                AI 건강가이드(참고용)
              </h2>
              <p className="text-gray-700 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                간단한 질문으로 생활 습관을 점검하고,<br />
                상담에 도움이 되는 요약을 제공합니다. (진단/처방 아님)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <BarChart2 className="w-8 h-8 text-traditional-accent" />,
                  title: "생활 패턴 체크",
                  desc: "식사·수면·활동 리듬을 간단히 점검해 현재 습관을 정리합니다. (참고용)",
                  bg: "bg-orange-50/50"
                },
                {
                  icon: <Activity className="w-8 h-8 text-traditional-primary" />,
                  title: "관리 팁 안내",
                  desc: "답변을 바탕으로 일상에서 실천 가능한 관리 포인트를 안내합니다. (참고용)",
                  bg: "bg-green-50/50"
                },
                {
                  icon: <Calendar className="w-8 h-8 text-traditional-secondary" />,
                  title: "요약 저장(로그인)",
                  desc: "결과를 저장해 상담 시 참고 자료로 활용할 수 있습니다. (로그인 후)",
                  bg: "bg-brown-50/50"
                }
              ].map((feature, idx) => (
                <div key={idx} className={`group relative p-8 rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden`}>
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/80 to-transparent`}></div>
                  <div className="relative z-10">
                    <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-4 font-sans tracking-tight">{feature.title}</h3>
                    <p className="text-gray-600 text-base font-medium leading-relaxed">{feature.desc}</p>
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
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-90 grayscale-[20%] sepia-[10%]"
            >
              <source src="/4.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-traditional-primary/30 mix-blend-multiply"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-traditional-accent font-bold tracking-widest uppercase text-sm mb-2 block">My Health Rhythm</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg font-serif">
                내 컨디션 리듬 체크(참고용)
              </h2>
              <p className="text-white/80 mt-4 max-w-2xl mx-auto">
                모듈을 선택해 2~3분 문답으로 패턴을 정리해보세요.<br />
                결과는 요약으로 저장할 수 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {/* Module 1: 소화 리듬 */}
              <Link href="/healthcare/chat?topic=digestion" className="group">
                <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex flex-col items-center text-center group-hover:backdrop-blur-lg">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:shadow-green-500/30 transition-all duration-300">
                    <Heart className="w-7 h-7 text-green-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 tracking-wide">소화 리듬</h3>
                  <p className="text-xs text-white/70 leading-relaxed font-light">
                    식후 불편·더부룩함<br />생활 패턴 점검 (참고용)
                  </p>
                </div>
              </Link>

              {/* Module 2: 인지 리듬 */}
              <Link href="/healthcare/chat?topic=cognitive" className="group">
                <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex flex-col items-center text-center group-hover:backdrop-blur-lg">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300">
                    <Activity className="w-7 h-7 text-purple-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 tracking-wide">인지 리듬</h3>
                  <p className="text-xs text-white/70 leading-relaxed font-light">
                    집중·기억 관련<br />습관 점검 (참고용)
                  </p>
                </div>
              </Link>

              {/* Module 3: 스트레스·수면 */}
              <Link href="/healthcare/chat?topic=stress-sleep" className="group">
                <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex flex-col items-center text-center group-hover:backdrop-blur-lg">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
                    <Moon className="w-7 h-7 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 tracking-wide">스트레스·수면</h3>
                  <p className="text-xs text-white/70 leading-relaxed font-light">
                    수면·피로 패턴<br />관리 포인트 (참고용)
                  </p>
                </div>
              </Link>

              {/* Module 4: 혈관·생활습관 */}
              <Link href="/healthcare/chat?topic=vascular" className="group">
                <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex flex-col items-center text-center group-hover:backdrop-blur-lg">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:shadow-orange-500/30 transition-all duration-300">
                    <Sun className="w-7 h-7 text-orange-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 tracking-wide">혈관·생활습관</h3>
                  <p className="text-xs text-white/70 leading-relaxed font-light">
                    운동·식사·수면<br />생활 리듬 정리 (참고용)
                  </p>
                </div>
              </Link>

              {/* Module 5: 여성 컨디션 */}
              <Link href="/healthcare/chat?topic=women" className="group">
                <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex flex-col items-center text-center group-hover:backdrop-blur-lg">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:shadow-pink-500/30 transition-all duration-300">
                    <Baby className="w-7 h-7 text-pink-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 tracking-wide">여성 컨디션</h3>
                  <p className="text-xs text-white/70 leading-relaxed font-light">
                    주기·컨디션 변화<br />패턴 요약 (참고용)
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />

        {/* Floating Chat Button */}
        <div className="fixed bottom-8 right-8 z-50 animate-bounce-slow">
          <Link href="/healthcare/chat" className="w-16 h-16 bg-traditional-primary rounded-full flex items-center justify-center text-white shadow-2xl hover:bg-traditional-accent transition-all duration-300 hover:scale-110 border-4 border-white/20 backdrop-blur-sm">
            <span className="text-3xl">💬</span>
          </Link>
        </div>
      </div>
    </TrackF1View>
  );
}
