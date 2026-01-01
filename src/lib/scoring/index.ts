// 점수 계산 유틸리티 모음
export { calculateConditionScore, type ConditionResult } from './condition';
export { calculateDrynessScore, type DrynessResult } from './dryness';
export { calculatePatternScore, type PatternResult } from './pattern';
export { calculateStrainScore, type StrainResult } from './strain';
export { calculateLifestyleScore, type LifestyleResult, type LifestyleType } from './lifestyle';

import { Topic } from '@/lib/constants/topics';
import { calculateConditionScore } from './condition';
import { calculateDrynessScore } from './dryness';
import { calculatePatternScore } from './pattern';
import { calculateStrainScore } from './strain';
import { calculateLifestyleScore } from './lifestyle';

export type ScoringResult = {
    score: number;
    level: 'LOW' | 'MID' | 'HIGH' | 'VERY_HIGH';
    summary: {
        mainFactors?: string[];
        characteristics?: string[];
        tips: string[];
    };
};

// 토픽별 점수 계산 통합 함수
export function calculateScore(topic: Topic, answers: Record<string, number>): ScoringResult {
    switch (topic) {
        case 'condition':
            return calculateConditionScore(answers);
        case 'dryness':
            return calculateDrynessScore(answers);
        case 'pattern':
            return calculatePatternScore(answers);
        case 'strain':
            return calculateStrainScore(answers);
        case 'lifestyle':
            return calculateLifestyleScore(answers);
        default:
            throw new Error(`Unknown topic: ${topic}`);
    }
}
