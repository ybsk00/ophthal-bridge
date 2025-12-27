/**
 * Sharp Provider - 이미지 변환 로직
 * 
 * 시각화.md 기반:
 * - texture_tone (결·톤 정돈): 밝기, 채도, 콘트라스트 조절
 * - wrinkle_soften (표정주름 완화): 대비 완화 (폴백)
 * - volume_expression (볼륨감 변화): 명암 표현 (폴백)
 * - glow (광채/물광): 하이라이트 강화
 */

import sharp from 'sharp';

export type VariantKey =
    | 'texture_tone'
    | 'wrinkle_soften'
    | 'volume_expression'
    | 'glow'
    // 호환 키
    | 'laser'
    | 'botox'
    | 'filler'
    | 'booster'
    | 'natural'
    | 'makeup'
    | 'bright';

// 키 매핑 (기존 키 → 새 키)
const KEY_MAPPING: Record<string, VariantKey> = {
    laser: 'texture_tone',
    botox: 'wrinkle_soften',
    filler: 'volume_expression',
    booster: 'glow',
    natural: 'texture_tone',
    makeup: 'volume_expression',
    bright: 'glow',
};

/**
 * Sharp 기반 이미지 변환
 * 
 * 핵심 원칙: 각 variant의 "변화 축(axis)"을 완전히 분리
 * - Brightness를 5% 이상 올리지 않음 (4개가 다 비슷해지는 주범)
 * - 각 variant는 서로 다른 처리 방식 사용
 */
export async function processWithSharp(
    inputBuffer: Buffer,
    variantKey: VariantKey
): Promise<Buffer> {
    // 키 정규화
    const normalizedKey = KEY_MAPPING[variantKey] || variantKey;

    let pipeline = sharp(inputBuffer)
        .rotate() // EXIF orientation 정리
        .resize(1536, 1536, { fit: 'inside', withoutEnlargement: true }); // 긴 변 1536px 제한

    switch (normalizedKey) {
        case 'texture_tone':
            // 결·톤 정돈: "정돈/클린" 룩
            // Clarity+14%, Contrast+14%, Saturation-8%, 색온도 쿨톤
            pipeline = pipeline
                .modulate({
                    brightness: 1.03, // +3% (최소한)
                    saturation: 0.92, // -8%
                    hue: -6, // 색온도: 쿨톤 (블루 쉬프트)
                })
                .linear(1.14, -10) // Contrast +14%, 섀도우 살짝 조정
                .sharpen({ // Clarity 대체: Unsharp Mask
                    sigma: 1.2,
                    m1: 1.4,  // flat areas sharpening
                    m2: 0.6,  // jagged areas sharpening
                });
            break;

        case 'wrinkle_soften':
            // 표정주름 완화: "라인 대비 완화" 룩
            // Contrast-14%, Clarity-16%, Shadows+18%, 미세 블러
            pipeline = pipeline
                .modulate({
                    brightness: 1.0, // 0% (밝기 변화 없음!)
                    saturation: 0.94, // -6%
                    hue: 1, // 색온도: 미세 웜톤
                })
                .linear(0.86, 20) // Contrast -14%, 미드톤 밝게 (Shadow +18% 효과)
                .blur(0.5) // Clarity 음수 대체: 미세 소프트닝
                .sharpen({ sigma: 0.3, m1: 0.2, m2: 0.1 }); // 과도한 블러 방지
            break;

        case 'volume_expression':
            // 볼륨감 변화: "입체감/라이팅" 룩
            // Contrast+8%, Highlights+6%, Shadows+6%, 색온도 웜톤
            pipeline = pipeline
                .modulate({
                    brightness: 1.0, // 0% (밝기 변화 없음!)
                    saturation: 1.0, // 유지
                    hue: 4, // 색온도: 웜톤
                })
                .linear(1.08, 6) // Contrast +8%, 미드톤 살짝 밝게
                .sharpen({ // Clarity +4%
                    sigma: 0.8,
                    m1: 0.4,
                    m2: 0.3,
                })
                .normalise({ lower: 2, upper: 98 }); // 히스토그램 정규화로 입체감
            break;

        case 'glow':
            // 광채/물광: "크리스피 하이라이트" 룩
            // Highlights+26%, Contrast+12%, Saturation-6%, 색온도 쿨톤
            pipeline = pipeline
                .modulate({
                    brightness: 1.03, // +3% (최소한)
                    saturation: 0.94, // -6%
                    hue: -3, // 색온도: 미세 쿨톤
                })
                .linear(1.12, -2) // Contrast +12%
                // Highlights 강조: gamma로 하이라이트 부스트
                .gamma(0.85, 1.0) // 밝은 영역 부스트 (0.85 = 밝아짐)
                .sharpen({ // Clarity +8%
                    sigma: 1.0,
                    m1: 0.8,
                    m2: 0.4,
                });
            break;

        default:
            // 기본: 원본 유지
            break;
    }

    // JPEG 출력 (품질 90, 4:4:4 chroma subsampling)
    return pipeline
        .jpeg({
            quality: 90,
            chromaSubsampling: '4:4:4',
        })
        .toBuffer();
}

/**
 * variant_key 라벨 가져오기
 */
export function getVariantLabel(variantKey: string): string {
    const labels: Record<string, string> = {
        texture_tone: '결·톤 정돈',
        wrinkle_soften: '표정주름 완화',
        volume_expression: '볼륨감 변화',
        glow: '광채/물광',
        laser: '결·톤 정돈',
        botox: '표정주름 완화',
        filler: '볼륨감 변화',
        booster: '광채/물광',
        natural: '내추럴',
        makeup: '메이크업',
        bright: '밝은 톤',
    };
    return labels[variantKey] || variantKey;
}
