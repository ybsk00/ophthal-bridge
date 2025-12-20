import { NextRequest, NextResponse } from 'next/server';

// 네이버 검색 API 사용
// 환경변수: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET
// 문서: https://developers.naver.com/docs/serviceapi/search/

const NAVER_CLIENT_ID = process.env.NAVER_SEARCH_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_SEARCH_CLIENT_SECRET;
const HOSPITAL_NAME = process.env.HOSPITAL_REVIEW_QUERY_BASE || '위담한방병원';

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
    const source = searchParams.get('source') || 'blog'; // blog, cafearticle, webkr
    const customQuery = searchParams.get('q');
    const start = parseInt(searchParams.get('start') || '1');
    const display = parseInt(searchParams.get('display') || '10');

    // API 키 확인
    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
        // 더미 데이터 반환 (개발용)
        return NextResponse.json({
            source,
            query: `${HOSPITAL_NAME} 후기`,
            items: getDummyItems(source),
            meta: { total: 100, start: 1, display: 10 },
            cached: false,
            isDummy: true,
            message: 'NAVER_CLIENT_ID/SECRET not configured. Using dummy data.'
        });
    }

    // 검색 쿼리 생성
    const query = customQuery || `${HOSPITAL_NAME} 방문 후기`;
    const encodedQuery = encodeURIComponent(query);

    // 네이버 API 엔드포인트
    const apiEndpoint = getApiEndpoint(source);
    const url = `${apiEndpoint}?query=${encodedQuery}&display=${display}&start=${start}&sort=date`;

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

        return NextResponse.json({
            source,
            query,
            items: cleanedItems,
            meta: {
                total: data.total,
                start: data.start,
                display: data.display
            },
            cached: false
        });

    } catch (error) {
        console.error('Review search error:', error);

        // 에러 시 더미 데이터 반환
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
    // YYYYMMDD -> YYYY.MM.DD
    if (dateStr.length === 8) {
        return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
    }
    return dateStr;
}

function getDummyItems(source: string) {
    const items = [
        {
            title: '강남 위담한방병원 방문 후기 - 친절한 진료',
            link: 'https://blog.naver.com/example1',
            description: '지인 추천으로 방문했는데 정말 만족스러웠습니다...',
            author: '건강맘',
            postdate: '2024.12.15',
            origin: 'naver'
        },
        {
            title: '삼성역 한의원 추천 - 위담한방병원',
            link: 'https://blog.naver.com/example2',
            description: '소화가 안되서 방문했는데 꼼꼼하게 봐주셨어요...',
            author: '강남직장인',
            postdate: '2024.12.10',
            origin: 'naver'
        },
        {
            title: '위담한방병원 진료 경험 공유',
            link: 'https://blog.naver.com/example3',
            description: '다이어트 한약 처방받고 효과 좋았습니다...',
            author: '다이어터',
            postdate: '2024.12.05',
            origin: 'naver'
        },
        {
            title: '강남구 한의원 비교 후기',
            link: 'https://blog.naver.com/example4',
            description: '여러 곳 다녀보고 여기로 정착했어요...',
            author: '비교왕',
            postdate: '2024.11.28',
            origin: 'naver'
        },
        {
            title: '위담한방병원 첫 방문기',
            link: 'https://blog.naver.com/example5',
            description: '처음 한의원 가봤는데 생각보다 좋았어요...',
            author: '한의원초보',
            postdate: '2024.11.20',
            origin: 'naver'
        },
    ];

    return items;
}
