"use client";

import { notFound } from "next/navigation";
import HealthcareChat from "@/components/healthcare/HealthcareChat";
import { Container } from "@mantine/core";

interface PageProps {
    params: {
        service: string;
    };
}

const serviceConfig = {
    recovery: {
        name: "기력 배터리 장인",
        initialMessage: "반갑네! 자네의 기력 배터리를 점검해줄 '기력 장인'일세. \n\n오늘 하루, 가장 피곤했던 시간은 언제였나? (아침/오후/저녁/하루 종일)",
    },
    women: {
        name: "달의 리듬 관찰자",
        initialMessage: "안녕하세요, 당신의 '달의 리듬'을 함께 읽어볼게요. \n\n평소 월경 주기는 규칙적인 편인가요? (대체로 규칙적/가끔 달라짐/자주 들쭉날쭉)",
    },
    pain: {
        name: "몸 날씨 예보관",
        initialMessage: "안녕하세요! 오늘 당신의 몸 날씨를 알려드릴게요. \n\n가장 자주 불편하거나 뻐근한 부위는 어디인가요? (목·어깨/허리/무릎·다리/그 외)",
    },
    digestion: {
        name: "위장 온도계 & 수면 지킴이",
        initialMessage: "반갑습니다. 위장과 수면의 균형을 봐드릴게요. \n\n평소 식사 속도는 어떠신가요? (천천히/보통/빨리 먹는 편)",
    },
    pregnancy: {
        name: "준비 체력 코치",
        initialMessage: "안녕하세요, 건강한 임신 준비를 돕는 체력 코치입니다. \n\n하루 중 피로감은 어느 정도 느끼시나요? (대부분 괜찮음/오후에 피곤/하루 종일 피곤)",
    },
};

export default function HealthcareServicePage({ params }: PageProps) {
    const service = serviceConfig[params.service as keyof typeof serviceConfig];

    if (!service) {
        notFound();
    }

    return (
        <Container size="md" py="xl" pb={100} bg="gray.0" style={{ minHeight: '100vh' }}>
            <HealthcareChat
                serviceType={params.service}
                serviceName={service.name}
                initialMessage={service.initialMessage}
            />
        </Container>
    );
}
