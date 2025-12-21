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

// 쿼리스트링 생성
function buildQueryString(params: Record<string, string>): string {
    return new URLSearchParams(params).toString();
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const q0 = searchParams.get("q0") ?? "경기도";
    const q1 = searchParams.get("q1") ?? "";
    const qt = searchParams.get("qt") ?? "1"; // 1~7 (월~일), 8 (공휴일)
    const keyword = searchParams.get("keyword") ?? "치과";

    const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY;
    if (!serviceKey) {
        return NextResponse.json(
            { error: "Missing ServiceKey - 공공 API 키가 설정되지 않았습니다." },
            { status: 500 }
        );
    }

    try {
        const queryParams: Record<string, string> = {
            ServiceKey: serviceKey,
            Q0: q0,
            QT: qt,
            QN: keyword,
            pageNo: "1",
            numOfRows: "50",
        };

        // q1 (시군구)가 있으면 추가
        if (q1) {
            queryParams.Q1 = q1;
        }

        const url = `${BASE_URL}?${buildQueryString(queryParams)}`;

        const response = await fetch(url, {
            cache: "no-store",
            headers: {
                Accept: "application/xml",
            },
        });

        if (!response.ok) {
            throw new Error(`API 호출 실패: ${response.status}`);
        }

        const xmlText = await response.text();

        // XML 파싱
        const parsed = parser.parse(xmlText);

        // 응답 구조 확인
        const items = parsed?.response?.body?.items?.item;

        if (!items) {
            return NextResponse.json({ clinics: [], total: 0 });
        }

        // 단일 항목일 경우 배열로 변환
        const itemArray = Array.isArray(items) ? items : [items];

        // 정규화된 클리닉 데이터 생성
        const clinics: Clinic[] = itemArray
            .filter((item: Record<string, unknown>) => {
                // 치과만 필터링 (기관명에 "치과" 포함)
                const name = String(item.dutyName || "");
                return name.includes("치과");
            })
            .map((item: Record<string, unknown>) => {
                // 현재 요일에 맞는 종료 시간 추출
                const qtNum = parseInt(qt, 10);
                let closeTimeKey = `dutyTime${qtNum}c`; // 종료 시간 키 (dutyTime1c ~ dutyTime8c)

                // 공휴일인 경우 dutyTime8c
                if (qtNum === 8) {
                    closeTimeKey = "dutyTime8c";
                }

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
            searchParams: { q0, q1, qt, keyword },
        });
    } catch (error) {
        console.error("Clinic search API error:", error);
        return NextResponse.json(
            {
                error: "일시적으로 조회가 어렵습니다. 잠시 후 다시 시도해 주세요.",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
