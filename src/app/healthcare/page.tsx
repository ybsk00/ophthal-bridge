import Link from "next/link";
import { Battery, Moon, CloudRain, Thermometer, Baby } from "lucide-react";
import {
    Container,
    Title,
    Text,
    SimpleGrid,
    Card,
    Group,
    ThemeIcon,
    Stack,
    Badge,
    rem
} from "@mantine/core";

const services = [
    {
        id: "recovery",
        title: "회복력·면역",
        subtitle: "기력 배터리 & 한방 기운 도장",
        description: "지금 내 몸 배터리는 몇 %일까? 한의사가 보는 오늘 기력 점수 확인하기",
        icon: Battery,
        color: "blue",
    },
    {
        id: "women",
        title: "여성 밸런스",
        subtitle: "월경 리듬 MBTI",
        description: "나의 한방 여성 리듬 MBTI는? PMS 때 나는 숨고 싶은 타입 vs 말 걸지 마 타입?",
        icon: Moon,
        color: "grape",
    },
    {
        id: "pain",
        title: "통증 패턴",
        subtitle: "통증 지도 & 몸 날씨 예보",
        description: "한의사가 보는 내 몸 통증 지도. 오늘 내 몸 날씨는 맑음일까 흐림일까?",
        icon: CloudRain,
        color: "gray",
    },
    {
        id: "digestion",
        title: "소화·수면",
        subtitle: "위장 온도계 & 수면 한방 MBTI",
        description: "내 위장은 지금 뜨거울까, 차가울까? 야식과 수면 패턴으로 보는 내 타입",
        icon: Thermometer,
        color: "orange",
    },
    {
        id: "pregnancy",
        title: "임신 준비",
        subtitle: "임신 체력 레벨 테스트",
        description: "임신을 준비하는 내 몸, 체력 레벨은? 성실 준비형 vs 휴식 필요형",
        icon: Baby,
        color: "pink",
    },
];

export default function HealthcarePage() {
    return (
        <Container size="sm" py="xl" pb={100}>
            <Stack gap="lg" mb={40} align="center">
                <Title order={1} c="sage-green.9" style={{ fontSize: '1.75rem' }}>
                    AI 한방 헬스케어
                </Title>
                <Text c="dimmed" size="sm" ta="center" style={{ lineHeight: 1.6 }}>
                    전통 한의학과 AI가 만나<br />
                    당신의 매일매일 건강 리듬을 챙겨드립니다.
                </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 1 }} spacing="md">
                {services.map((service) => (
                    <Card
                        key={service.id}
                        component={Link}
                        href={`/healthcare/${service.id}`}
                        padding="lg"
                        radius="md"
                        withBorder
                        style={{
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            cursor: 'pointer'
                        }}
                        className="hover:shadow-md active:scale-[0.99]"
                    >
                        <Group align="flex-start" wrap="nowrap">
                            <ThemeIcon
                                size={48}
                                radius="md"
                                variant="light"
                                color={service.color}
                            >
                                <service.icon size={24} />
                            </ThemeIcon>

                            <Stack gap={4} style={{ flex: 1 }}>
                                <Group>
                                    <Badge
                                        variant="light"
                                        color="sage-green"
                                        size="sm"
                                        radius="sm"
                                    >
                                        {service.title}
                                    </Badge>
                                </Group>
                                <Title order={3} size="h4" c="dark.8" mt={4}>
                                    {service.subtitle}
                                </Title>
                                <Text size="sm" c="dimmed" lh={1.5}>
                                    {service.description}
                                </Text>
                            </Stack>
                        </Group>
                    </Card>
                ))}
            </SimpleGrid>
        </Container>
    );
}
