import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

// 공공 API 엔드포인트
const BASE_URL =
    "http://apis.data.go.kr/B552657/HsptlAsembySearchService/getHsptlMdcncListInfoInqire";

// 클리닉 타입 정의
export interface Clinic {
    name: string;
    addr: string;
    tel: string;
    lat?: number;
    lng?: number;
    closeTime?: string;
    openToday?: boolean;
    night?: boolean;
    holiday?: boolean;
}

// XML 파서 설정
const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
});

// 야간 진료 판정 (19:00 이상)
function isNightClinic(closeTime: string): boolean {
    if (!closeTime) return false;
    const hour = parseInt(closeTime.substring(0, 2), 10);
    return hour >= 19;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const q0 = searchParams.get("q0") ?? "서울";
    const q1 = searchParams.get("q1") ?? "강남구";
    const qt = searchParams.get("qt"); // 1~7 (월~일), 8 (공휴일) - 옵션
    const qn = searchParams.get("qn") ?? "안과"; // 기관명 키워드
    const debug = searchParams.get("debug") === "true";

    const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY;
    if (!serviceKey) {
        return NextResponse.json(
            { error: "Missing ServiceKey - 공공 API 키가 설정되지 않았습니다." },
            { status: 500 }
        );
    }

    try {
        // 기본 파라미터 (최소한으로 시작)
        const params = new URLSearchParams();

        // ServiceKey는 이미 인코딩되어 있을 수 있으므로 그대로 사용
        params.append("ServiceKey", serviceKey);
        params.append("pageNo", "1");
        params.append("numOfRows", "100");

        // 필수 파라미터
        params.append("Q0", q0);

        // 선택 파라미터
        if (q1) {
            params.append("Q1", q1);
        }

        // QT: 진료요일 (옵션 - 먼저 없이 테스트)
        if (qt) {
            params.append("QT", qt);
        }

        // QN: 기관명 키워드
        if (qn) {
            params.append("QN", qn);
        }

        const url = `${BASE_URL}?${params.toString()}`;

        console.log("[Clinic Search API] Request URL:", url.replace(serviceKey, "***KEY***"));

        const response = await fetch(url, {
            cache: "no-store",
        });

        if (!response.ok) {
            throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
        }

        const xmlText = await response.text();

        console.log("[Clinic Search API] Response length:", xmlText.length);
        console.log("[Clinic Search API] Response preview:", xmlText.substring(0, 500));

        // XML 파싱
        const parsed = parser.parse(xmlText);

        // 에러 코드 확인
        const resultCode = parsed?.response?.header?.resultCode;
        const resultMsg = parsed?.response?.header?.resultMsg;

        console.log("[Clinic Search API] resultCode:", resultCode, "resultMsg:", resultMsg);

        if (resultCode && resultCode !== "00") {
            return NextResponse.json({
                error: `API 오류: ${resultMsg}`,
                resultCode,
                resultMsg,
                debug: debug ? { url: url.replace(serviceKey, "***KEY***"), xmlPreview: xmlText.substring(0, 1000) } : undefined
            }, { status: 400 });
        }

        // 응답 구조 확인
        const items = parsed?.response?.body?.items?.item;
        const totalCount = parsed?.response?.body?.totalCount;

        console.log("[Clinic Search API] totalCount:", totalCount, "items:", items ? (Array.isArray(items) ? items.length : 1) : 0);

        // 디버그 모드면 원본 데이터 반환
        if (debug) {
            return NextResponse.json({
                debug: true,
                url: url.replace(serviceKey, "***KEY***"),
                resultCode,
                resultMsg,
                totalCount,
                itemCount: items ? (Array.isArray(items) ? items.length : 1) : 0,
                rawItems: items ? (Array.isArray(items) ? items.slice(0, 5) : [items]) : [],
                xmlPreview: xmlText.substring(0, 2000)
            });
        }

        if (!items) {
            return NextResponse.json({
                clinics: [],
                total: 0,
                message: "검색 결과가 없습니다.",
                searchParams: { q0, q1, qt, qn }
            });
        }

        // 단일 항목일 경우 배열로 변환
        const itemArray = Array.isArray(items) ? items : [items];

        // 안과 검색 키워드
        const EYE_KEYWORDS = ["안과", "안과의원", "안과클리닉", "eye", "안의원"];

        // 정규화된 클리닉 데이터 생성
        const clinics: Clinic[] = itemArray
            .filter((item: Record<string, unknown>) => {
                // 안과 관련 키워드 필터링
                const name = String(item.dutyName || "").toLowerCase();
                return EYE_KEYWORDS.some(kw => name.includes(kw.toLowerCase()));
            })
            .map((item: Record<string, unknown>) => {
                // 현재 요일에 맞는 종료 시간 추출
                const qtNum = qt ? parseInt(qt, 10) : new Date().getDay() || 7; // 일요일 = 0 -> 7
                let closeTimeKey = `dutyTime${qtNum}c`; // 종료 시간 키 (dutyTime1c ~ dutyTime8c)

                const closeTime = String(item[closeTimeKey] || "");

                return {
                    name: String(item.dutyName || ""),
                    addr: String(item.dutyAddr || ""),
                    tel: String(item.dutyTel1 || ""),
                    lat: item.wgs84Lat ? parseFloat(String(item.wgs84Lat)) : undefined,
                    lng: item.wgs84Lon ? parseFloat(String(item.wgs84Lon)) : undefined,
                    closeTime: closeTime,
                    openToday: !!closeTime,
                    night: isNightClinic(closeTime),
                    holiday: qtNum === 8,
                };
            });

        return NextResponse.json({
            clinics,
            total: clinics.length,
            totalFromApi: totalCount,
            searchParams: { q0, q1, qt, qn },
        });
    } catch (error) {
        console.error("[Clinic Search API] Error:", error);
        return NextResponse.json(
            {
                error: "일시적으로 조회가 어렵습니다. 잠시 후 다시 시도해 주세요.",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
