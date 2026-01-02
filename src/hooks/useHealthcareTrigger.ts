'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// 트리거 상태 인터페이스
interface TriggerState {
    presetChanges: number;      // 프리셋 변경 횟수
    sliderAdjustments: number;  // 슬라이더 조정 횟수
    sampleTabChanges: number;   // 샘플 탭 변경 횟수
    chatTurns: number;          // 채팅 턴 수
    dwellTimeMs: number;        // 체류 시간 (ms)
}

// 트리거 조건 상수
const TRIGGER_THRESHOLDS = {
    presetChanges: 2,       // ≥ 2회
    sliderAdjustments: 3,   // ≥ 3회
    sampleTabChanges: 2,    // ≥ 2회
    chatTurns: 3,           // ≥ 3턴
    dwellTimeMs: 12000,     // ≥ 12초
};

interface UseHealthcareTriggerOptions {
    onTrigger?: () => void;  // 트리거 발동 시 콜백
    autoStartDwellTimer?: boolean;  // 자동으로 체류 시간 타이머 시작
}

interface UseHealthcareTriggerReturn {
    triggerState: TriggerState;
    shouldShowCTA: boolean;
    incrementPresetChange: () => void;
    incrementSliderAdjustment: () => void;
    incrementSampleTabChange: () => void;
    incrementChatTurn: () => void;
    resetTrigger: () => void;
}

const initialState: TriggerState = {
    presetChanges: 0,
    sliderAdjustments: 0,
    sampleTabChanges: 0,
    chatTurns: 0,
    dwellTimeMs: 0,
};

export function useHealthcareTrigger(
    options: UseHealthcareTriggerOptions = {}
): UseHealthcareTriggerReturn {
    const { onTrigger, autoStartDwellTimer = true } = options;

    const [triggerState, setTriggerState] = useState<TriggerState>(initialState);
    const startTimeRef = useRef<number>(Date.now());
    const hasTriggeredRef = useRef<boolean>(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // CTA 노출 여부 계산
    const shouldShowCTA =
        triggerState.presetChanges >= TRIGGER_THRESHOLDS.presetChanges ||
        triggerState.sliderAdjustments >= TRIGGER_THRESHOLDS.sliderAdjustments ||
        triggerState.sampleTabChanges >= TRIGGER_THRESHOLDS.sampleTabChanges ||
        triggerState.chatTurns >= TRIGGER_THRESHOLDS.chatTurns ||
        triggerState.dwellTimeMs >= TRIGGER_THRESHOLDS.dwellTimeMs;

    // 트리거 발동 시 콜백 호출
    useEffect(() => {
        if (shouldShowCTA && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            onTrigger?.();
        }
    }, [shouldShowCTA, onTrigger]);

    // 체류 시간 타이머
    useEffect(() => {
        if (!autoStartDwellTimer) return;

        startTimeRef.current = Date.now();

        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            setTriggerState(prev => ({ ...prev, dwellTimeMs: elapsed }));
        }, 1000);  // 1초마다 업데이트

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoStartDwellTimer]);

    // 카운터 증가 함수들
    const incrementPresetChange = useCallback(() => {
        setTriggerState(prev => ({
            ...prev,
            presetChanges: prev.presetChanges + 1,
        }));
    }, []);

    const incrementSliderAdjustment = useCallback(() => {
        setTriggerState(prev => ({
            ...prev,
            sliderAdjustments: prev.sliderAdjustments + 1,
        }));
    }, []);

    const incrementSampleTabChange = useCallback(() => {
        setTriggerState(prev => ({
            ...prev,
            sampleTabChanges: prev.sampleTabChanges + 1,
        }));
    }, []);

    const incrementChatTurn = useCallback(() => {
        setTriggerState(prev => ({
            ...prev,
            chatTurns: prev.chatTurns + 1,
        }));
    }, []);

    const resetTrigger = useCallback(() => {
        setTriggerState(initialState);
        startTimeRef.current = Date.now();
        hasTriggeredRef.current = false;
    }, []);

    return {
        triggerState,
        shouldShowCTA,
        incrementPresetChange,
        incrementSliderAdjustment,
        incrementSampleTabChange,
        incrementChatTurn,
        resetTrigger,
    };
}

export default useHealthcareTrigger;
