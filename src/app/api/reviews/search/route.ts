import { NextRequest, NextResponse } from 'next/server';

// 네이버 검색 API 사용
// 환경변수: NAVER_SEARCH_CLIENT_ID, NAVER_SEARCH_CLIENT_SECRET
// 문서: https://developers.naver.com/docs/serviceapi/search/

const NAVER_CLIENT_ID = process.env.NAVER_SEARCH_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_SEARCH_CLIENT_SECRET;
const HOSPITAL_NAME = process.env.HOSPITAL_REVIEW_QUERY_BASE || '세인트의원';

// 제외 키워드 (잡상인 필터링)
const EXCLUDE_KEYWORDS = [
    '대출', '아파트', '분양', '투자', '코인', '플랫폼', '솔루션',
    '마케팅', '업체', '제휴', '쿠폰', '모집', '총판', '대행',
    '전문성', '채널', '광고', '협찬', '체험단', '원고료'
];

// 후기성 키워드 (최소 1개 포함 필요)
const REVIEW_KEYWORDS = [
    '후기', '방문', '내원', '리뷰', '진료', '접수', '대기', '상담', '치료'
];

interface NaverSearchItem {
    title: string;
    link: string;
    description: string;
    bloggername?: string;
    bloggerlink?: string;
    postdate?: string;
    cafename?: string;
    cafeurl?: string;
}

interface NaverSearchResponse {
    lastBuildDate: string;
    total: number;
    start: number;
    display: number;
    items: NaverSearchItem[];
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source') || 'blog';
    const customQuery = searchParams.get('q');
    const start = parseInt(searchParams.get('start') || '1');
    const display = parseInt(searchParams.get('display') || '20'); // 필터링 후 줄어들 수 있어서 20개 요청

    // API 키 확인
    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
        return NextResponse.json({
            source,
            query: `${HOSPITAL_NAME} 후기`,
            items: getDummyItems(source),
            meta: { total: 100, start: 1, display: 10 },
            cached: false,
            isDummy: true,
            message: 'NAVER_SEARCH_CLIENT_ID/SECRET not configured. Using dummy data.'
        });
    }

    // 검색 쿼리 강화 (정확 일치 + 제외어)
    const excludeString = EXCLUDE_KEYWORDS.map(k => `-${k}`).join(' ');
    const baseQuery = customQuery || `"${HOSPITAL_NAME}" +후기 ${excludeString}`;
    const encodedQuery = encodeURIComponent(baseQuery);

    // 네이버 API 엔드포인트
    const apiEndpoint = getApiEndpoint(source);
    const url = `${apiEndpoint}?query=${encodedQuery}&display=${display}&start=${start}&sort=sim`; // 관련도순

    try {
        const response = await fetch(url, {
            headers: {
                'X-Naver-Client-Id': NAVER_CLIENT_ID,
                'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
            },
            next: { revalidate: 43200 } // 12시간 캐시
        });

        if (!response.ok) {
            throw new Error(`Naver API error: ${response.status}`);
        }

        const data: NaverSearchResponse = await response.json();

        // HTML 태그 제거 및 정제
        const cleanedItems = data.items.map(item => ({
            title: stripHtml(item.title),
            link: item.link,
            description: stripHtml(item.description),
            author: item.bloggername || item.cafename || '익명',
            postdate: formatDate(item.postdate),
            origin: 'naver'
        }));

        // 2차 필터링: 서버에서 잡상인 제거
        const filteredItems = cleanedItems.filter(item => {
            const text = `${item.title} ${item.description}`.toLowerCase();

            // 1. 병원명 포함 여부 (필수)
            // "의정부"가 반드시 포함되어야 하며, "세인트의원" 또는 "세인트 의원"이 포함되어야 함
            const hasLocation = text.includes('의정부');
            const hasName = text.includes('세인트의원') || text.includes('세인트 의원');

            if (!hasLocation || !hasName) {
                return false;
            }

            // 2. 제외 키워드 포함 시 제거
            for (const keyword of EXCLUDE_KEYWORDS) {
                if (text.includes(keyword.toLowerCase())) {
                    return false;
                }
            }

            // 3. 후기성 키워드 최소 1개 포함 (권장)
            const hasReviewKeyword = REVIEW_KEYWORDS.some(keyword =>
                text.includes(keyword.toLowerCase())
            );

            // 후기성 키워드 없어도 병원명 있으면 일단 통과 (너무 엄격하면 결과 없음)
            return true;
        });

        // 최대 10개만 반환
        const finalItems = filteredItems.slice(0, 10);

        return NextResponse.json({
            source,
            query: baseQuery,
            items: finalItems,
            meta: {
                total: data.total,
                start: data.start,
                display: finalItems.length,
                originalCount: data.items.length,
                filteredCount: filteredItems.length
            },
            cached: false
        });

    } catch (error) {
        console.error('Review search error:', error);

        return NextResponse.json({
            source,
            query: `${HOSPITAL_NAME} 후기`,
            items: getDummyItems(source),
            meta: { total: 10, start: 1, display: 10 },
            cached: false,
            isDummy: true,
            error: 'API error, using dummy data'
        });
    }
}

function getApiEndpoint(source: string): string {
    switch (source) {
        case 'blog':
            return 'https://openapi.naver.com/v1/search/blog.json';
        case 'cafearticle':
            return 'https://openapi.naver.com/v1/search/cafearticle.json';
        case 'webkr':
            return 'https://openapi.naver.com/v1/search/webkr.json';
        default:
            return 'https://openapi.naver.com/v1/search/blog.json';
    }
}

function stripHtml(str: string): string {
    return str.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    if (dateStr.length === 8) {
        return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
    }
    return dateStr;
}

function getDummyItems(source: string) {
    const items = [
        {
            title: '강남 세인트의원 방문 후기 - 친절한 진료',
            link: 'https://blog.naver.com/example1',
            description: '지인 추천으로 방문했는데 정말 만족스러웠습니다...',
            author: '건강맘',
            postdate: '2024.12.15',
            origin: 'naver'
        },
        {
            title: '삼성역 피부과 추천 - 세인트의원',
            link: 'https://blog.naver.com/example2',
            description: '소화가 안되서 방문했는데 꼼꼼하게 봐주셨어요...',
            author: '강남직장인',
            postdate: '2024.12.10',
            origin: 'naver'
        },
        {
            title: '세인트의원 진료 경험 공유',
            link: 'https://blog.naver.com/example3',
            description: '다이어트 한약 처방받고 효과 좋았습니다...',
            author: '다이어터',
            postdate: '2024.12.05',
            origin: 'naver'
        },
        {
            title: '강남구 피부과 비교 후기',
            link: 'https://blog.naver.com/example4',
            description: '여러 곳 다녀보고 여기로 정착했어요...',
            author: '비교왕',
            postdate: '2024.11.28',
            origin: 'naver'
        },
        {
            title: '세인트의원 첫 방문기',
            link: 'https://blog.naver.com/example5',
            description: '처음 피부과 가봤는데 생각보다 좋았어요...',
            author: '피부과초보',
            postdate: '2024.11.20',
            origin: 'naver'
        },
    ];

    return items;
}


