"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Sparkles, Droplet, Shield, ArrowUpRight, Heart, CheckCircle, BarChart2, Calendar, Search, ChevronRight } from "lucide-react";
import { TrackF1View } from "@/components/marketing/MarketingTracker";
import Footer from "@/components/common/Footer";
import ClinicSearchModule from "@/components/healthcare/ClinicSearchModule";
import { VALID_TOPICS, TOPIC_LABELS, TOPIC_DESCRIPTIONS, Topic } from "@/lib/constants/topics";

// 히어로 롤링 이미지 (A→B→C→D→E 순서)
const HERO_IMAGES = [
  "/NEON RIM.png",        // A: 네온 림라이트
  "/GLASS PRISM.png",     // B: 프리즘/라이트스트릭
  "/WATER CAUSTICS.png",  // C: 워터 라이트
  "/ROSE-GOLD BLOOM.png", // D: 로즈골드 블룸
  "/SILHOUETTE RIM.png",  // E: 로우키 실루엣
];

// 모듈 아이콘/컬러 매핑
const MODULE_CONFIG: Record<Topic, { icon: typeof Sparkles; color: string; gradient: string }> = {
  'glow-booster': { icon: Sparkles, color: 'pink', gradient: 'from-pink-500/20 to-pink-600/20' },
  'makeup-killer': { icon: Droplet, color: 'rose', gradient: 'from-rose-500/20 to-rose-600/20' },
  'barrier-reset': { icon: Shield, color: 'teal', gradient: 'from-teal-500/20 to-teal-600/20' },
  'lifting-check': { icon: ArrowUpRight, color: 'purple', gradient: 'from-purple-500/20 to-purple-600/20' },
  'skin-concierge': { icon: Heart, color: 'fuchsia', gradient: 'from-fuchsia-500/20 to-fuchsia-600/20' },
};

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  // 2초 후 자동 롤링 시작 (LCP 최적화)
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsAutoPlay(true);
    }, 2000);
    return () => clearTimeout(startTimer);
  }, []);

  // 자동 롤링
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  return (
    <TrackF1View>
      <div className="min-h-screen bg-skin-bg text-skin-text font-sans selection:bg-skin-primary selection:text-white">

        {/* Navigation - 반투명 바 (고정) */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-skin-bg/80 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <span className="text-2xl">✨</span>
              <span className="text-xl font-bold text-skin-text">리원피부과</span>
            </Link>
            <Link
              href="/login"
              className="px-6 py-2.5 bg-skin-primary text-white text-sm font-medium rounded-full hover:bg-skin-accent hover:shadow-lg hover:shadow-skin-primary/30 transition-all duration-300"
            >
              로그인
            </Link>
          </div>
        </nav>

        {/* ============================================ */}
        {/* Hero Section - 목적: 헬스케어 시작 */}
        {/* ============================================ */}
        <header className="relative px-6 pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden min-h-[85vh] flex flex-col justify-center">
          {/* Rolling Images Background */}
          <div className="absolute inset-0 z-0">
            {HERO_IMAGES.map((src, idx) => (
              <div
                key={src}
                className={`absolute inset-0 transition-opacity duration-500 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              >
                <Image
                  src={src}
                  alt={`Premium Skin Care ${idx + 1}`}
                  fill
                  className="object-cover"
                  priority={idx === 0}
                  sizes="100vw"
                />
              </div>
            ))}
            {/* 좌측 카피 영역 어두운 그라데이션 (45%) */}
            <div className="absolute inset-0 bg-gradient-to-r from-skin-bg/90 via-skin-bg/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-skin-bg/30 via-transparent to-skin-bg/70" />
          </div>

          {/* Hero Content - 하단 검색 섹션과 동일한 너비로 정렬 */}
          <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-8 animate-fade-in text-left">
            {/* Eyebrow - 작게, 간격 확보 */}
            <p className="text-skin-secondary font-semibold tracking-[0.2em] uppercase text-xs">
              Premium Skin Care
            </p>

            {/* H1 - 2줄 이내 */}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] font-serif">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-skin-primary via-pink-400 to-skin-accent">
                리원피부과
              </span>에서<br />
              프리미엄 스킨케어를
            </h1>

            {/* Body - 1~2줄, 부연 제거 */}
            <p className="text-base md:text-lg text-skin-subtext max-w-lg leading-relaxed">
              나만의 피부 습관을 체크하고, 맞춤 루틴을 설계해보세요.
            </p>

            {/* CTA Row - Primary 1개 + Secondary 링크 1개 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
              {/* Primary CTA - 핫핑크 + 글로우 허용 */}
              <Link
                href="/healthcare/chat?topic=glow-booster"
                className="px-8 py-4 bg-skin-primary text-white text-base font-bold rounded-2xl shadow-lg shadow-skin-primary/40 hover:bg-skin-accent hover:shadow-xl hover:shadow-skin-primary/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                D-7 광채 부스터 시작
              </Link>

              {/* Secondary - 텍스트 링크 */}
              <a
                href="#clinic-search"
                className="text-skin-subtext hover:text-skin-primary text-sm font-medium flex items-center gap-1 transition-colors"
              >
                지금 운영 피부과 찾기
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* 참고용 배지 - 배지로 이동 */}
            <div className="pt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-skin-muted/50 text-skin-subtext text-xs font-medium">
                ℹ️ 참고용 안내 · 진단·처방 아님
              </span>
            </div>
          </div>

          {/* Slide Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {HERO_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentSlide(idx); setIsAutoPlay(true); }}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-skin-primary w-6' : 'bg-white/40 hover:bg-white/60'}`}
                aria-label={`슬라이드 ${idx + 1}`}
              />
            ))}
          </div>
        </header>

        {/* ============================================ */}
        {/* Clinic Search Section - 히어로 아래 별도 섹션 */}
        {/* ============================================ */}
        <section id="clinic-search" className="relative py-16 px-6 bg-skin-bgSecondary">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-skin-text mb-2">
                지금 운영 중인 피부과 찾기
              </h2>
              <p className="text-skin-subtext text-sm">
                지역과 운영 시간을 선택해 가까운 피부과를 검색하세요.
              </p>
            </div>

            {/* Clinic Search Module Card */}
            <div className="bg-skin-surface rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl">
              <ClinicSearchModule />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 px-6 overflow-hidden z-10">
          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-skin-text font-sans tracking-tight">
                2분 스킨 패턴 체크
              </h2>
              <p className="text-skin-subtext max-w-lg mx-auto text-sm font-medium">
                간단한 질문으로 피부 관리 습관을 점검하고, 요약을 받아보세요.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  icon: <BarChart2 className="w-6 h-6" />,
                  title: "패턴 1장 요약",
                  desc: "스킨케어·수면·수분 습관을 5문답으로 정리합니다.",
                  label: "약 2분",
                  labelColor: "bg-skin-muted"
                },
                {
                  icon: <CheckCircle className="w-6 h-6" />,
                  title: "오늘부터 할 1가지",
                  desc: "현실적으로 가능한 '한 가지 조정'만 제안합니다.",
                  label: "실천 중심",
                  labelColor: "bg-skin-primary"
                },
                {
                  icon: <Calendar className="w-6 h-6" />,
                  title: "요약 저장 & 비교",
                  desc: "기록을 저장해 다음에 더 빠르게 이어서 확인합니다.",
                  label: "로그인 후",
                  labelColor: "bg-skin-secondary"
                }
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="group bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-skin-primary/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-10 h-10 bg-skin-surface rounded-xl flex items-center justify-center mb-4 border border-white/10">
                    <div className="text-skin-primary">{feature.icon}</div>
                  </div>
                  <h3 className="text-base font-bold text-skin-text mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-skin-subtext text-sm leading-relaxed mb-4">
                    {feature.desc}
                  </p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-semibold ${feature.labelColor} text-white`}>
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Modules Grid */}
        <section className="relative py-32 overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-skin-bg via-skin-bgSecondary to-skin-bg" />

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-skin-primary font-bold tracking-widest uppercase text-sm mb-2 block">Skin Health Check</span>
              <h2 className="text-4xl md:text-5xl font-bold text-skin-text font-serif">
                내 피부 건강 체크
              </h2>
              <p className="text-skin-subtext mt-4 max-w-2xl mx-auto">
                모듈을 선택해 2~3분 문답으로 패턴을 정리해보세요.
              </p>
              <span className="inline-flex items-center mt-4 px-3 py-1 rounded-full bg-skin-muted/50 text-skin-subtext text-xs font-medium">
                ℹ️ 참고용 안내이며, 진단·처방을 대신하지 않습니다.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {VALID_TOPICS.map((topic) => {
                const config = MODULE_CONFIG[topic];
                const IconComponent = config.icon;
                const colorMap: Record<string, { border: string; shadow: string; text: string }> = {
                  pink: { border: 'border-pink-500/30', shadow: 'group-hover:shadow-pink-500/30', text: 'text-pink-400' },
                  rose: { border: 'border-rose-500/30', shadow: 'group-hover:shadow-rose-500/30', text: 'text-rose-400' },
                  teal: { border: 'border-teal-500/30', shadow: 'group-hover:shadow-teal-500/30', text: 'text-teal-400' },
                  purple: { border: 'border-purple-500/30', shadow: 'group-hover:shadow-purple-500/30', text: 'text-purple-400' },
                  fuchsia: { border: 'border-fuchsia-500/30', shadow: 'group-hover:shadow-fuchsia-500/30', text: 'text-fuchsia-400' },
                };
                const colors = colorMap[config.color];

                return (
                  <Link key={topic} href={`/healthcare/chat?topic=${topic}`} className="group">
                    <div className="h-full bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-skin-primary/30 transition-all duration-300 hover:scale-105 flex flex-col items-center text-center">
                      <div className={`w-14 h-14 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center mb-6 ${colors.border}`}>
                        <IconComponent className={`w-7 h-7 ${colors.text} group-hover:scale-110 transition-transform`} />
                      </div>
                      <h3 className="text-lg font-bold text-skin-text mb-2 tracking-wide">{TOPIC_LABELS[topic]}</h3>
                      <p className="text-xs text-skin-subtext leading-relaxed font-light">
                        {TOPIC_DESCRIPTIONS[topic]}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />

        {/* Floating Chat Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Link href="/healthcare/chat?topic=glow-booster" className="w-16 h-16 bg-skin-primary rounded-full flex items-center justify-center text-white shadow-xl shadow-skin-primary/40 hover:bg-skin-accent transition-all duration-300 hover:scale-110 border-2 border-white/20">
            <span className="text-3xl">✨</span>
          </Link>
        </div>
      </div>
    </TrackF1View>
  );
}
