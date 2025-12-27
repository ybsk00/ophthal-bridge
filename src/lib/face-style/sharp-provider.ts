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
            // 결·톤 정돈: 밝기+5%, 채도+3%, 콘트라스트+5%
            pipeline = pipeline
                .modulate({
                    brightness: 1.05,
                    saturation: 1.03,
                })
                .linear(1.05, 0); // 콘트라스트 약간 증가
            break;

        case 'wrinkle_soften':
            // 표정주름 완화 (폴백): 대비 살짝 완화
            pipeline = pipeline
                .modulate({
                    brightness: 1.02,
                    saturation: 1.0,
                })
                .linear(0.95, 5); // 콘트라스트 약간 감소 (부드럽게)
            break;

        case 'volume_expression':
            // 볼륨감 변화 (폴백): 명암 표현
            pipeline = pipeline
                .modulate({
                    brightness: 1.03,
                    saturation: 1.02,
                })
                .linear(1.02, 3); // 미드톤 살짝 조정
            break;

        case 'glow':
            // 광채/물광: 하이라이트 강화
            pipeline = pipeline
                .modulate({
                    brightness: 1.07,
                    saturation: 1.05,
                })
                .linear(1.08, -8); // 하이라이트 강조, 섀도우 유지
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
