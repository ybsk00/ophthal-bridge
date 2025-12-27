'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink, AlertCircle, Coffee, Globe, X, Loader2 } from 'lucide-react';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ReviewItem {
    title: string;
    link: string;
    description: string;
    author: string;
    postdate: string;
    origin: string;
}

interface ReviewResponse {
    source: string;
    query: string;
    items: ReviewItem[];
    meta: { total: number; start: number; display: number };
    isDummy?: boolean;
}

type TabType = 'blog' | 'cafearticle' | 'webkr';

export default function ReviewModal({ isOpen, onClose }: ReviewModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('blog');
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDummy, setIsDummy] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsAnimating(true);
                });
            });
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && activeTab) {
            fetchReviews(activeTab);
        }
    }, [isOpen, activeTab]);

    const fetchReviews = async (source: string) => {
        setLoading(true);
        try {
            // "의정부 세인트 의원"으로 명시적 검색
            const query = encodeURIComponent("의정부 세인트 의원");
            const response = await fetch(`/api/reviews/search?source=${source}&q=${query}`);
            const data: ReviewResponse = await response.json();
            setReviews(data.items || []);
            setIsDummy(data.isDummy || false);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewClick = (item: ReviewItem, index: number) => {
        console.log('review_click_out', {
            source: activeTab,
            rank: index + 1,
            link: item.link
        });
        window.open(item.link, '_blank', 'noopener,noreferrer');
    };

    const tabs = [
        { key: 'blog' as TabType, label: '블로그', icon: MessageSquare },
        { key: 'cafearticle' as TabType, label: '카페', icon: Coffee },
        { key: 'webkr' as TabType, label: '웹문서', icon: Globe },
    ];

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* 배경 오버레이 */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* 모달 */}
            <div
                className={`relative w-full max-w-lg max-h-[90vh] bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-700 overflow-hidden transition-all duration-300 flex flex-col ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-orange-400" />
                        </div>
                        <h3 className="font-bold text-white">후기 보기</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* 콘텐츠 */}
                <div className="p-4 space-y-4 flex-1 overflow-hidden flex flex-col">
                    {/* 안내 문구 */}
                    <div className="flex items-start gap-2 p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-xs text-gray-400">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>외부 페이지로 이동합니다. 후기는 당사에서 작성/편집하지 않습니다.</span>
                    </div>

                    {isDummy && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-xs text-yellow-400">
                            네이버 API 키가 설정되지 않아 샘플 데이터를 표시합니다.
                        </div>
                    )}

                    {/* 탭 */}
                    <div className="flex bg-gray-800 p-1 rounded-xl">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.key
                                        ? 'bg-orange-500 text-white'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* 후기 목록 */}
                    <div className="flex-1 overflow-y-auto space-y-2 min-h-[250px] max-h-[350px]">
                        {loading ? (
                            <div className="flex items-center justify-center h-48">
                                <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-gray-500">
                                검색 결과가 없습니다.
                            </div>
                        ) : (
                            <>
                                {reviews.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleReviewClick(item, index)}
                                        className="w-full text-left p-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 transition-colors group"
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className="text-sm font-medium text-white line-clamp-1"
                                                    dangerouslySetInnerHTML={{ __html: item.title }}
                                                />
                                                <p
                                                    className="text-xs text-gray-400 mt-1 line-clamp-2"
                                                    dangerouslySetInnerHTML={{ __html: item.description }}
                                                />
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded-full">
                                                        {item.author}
                                                    </span>
                                                    {item.postdate && (
                                                        <span className="text-xs text-gray-500">
                                                            {item.postdate}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-6 h-6 bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0 group-hover:bg-gray-600 transition-colors">
                                                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                {/* 하단 안내 */}
                <div className="p-3 border-t border-gray-700 bg-gray-800/50 flex-shrink-0">
                    <p className="text-xs text-gray-500 text-center">
                        클릭 시 외부 페이지로 이동합니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
