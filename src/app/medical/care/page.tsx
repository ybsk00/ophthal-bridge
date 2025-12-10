"use client";

import PatientHeader from "@/components/medical/PatientHeader";
import { Activity, Calendar, MessageSquare, CheckCircle, Circle, Clock, ChevronRight, Send } from "lucide-react";
import {
    Container,
    Grid,
    Paper,
    Text,
    Title,
    Group,
    Stack,
    Button,
    RingProgress,
    Badge,
    Timeline,
    ThemeIcon,
    TextInput,
    ActionIcon,
    Avatar,
    rem,
    Box
} from "@mantine/core";

export default function PatientDashboard() {
    return (
        <Box bg="gray.0" mih="100vh">
            <PatientHeader />

            <Container size="xl" py="xl">
                {/* Top Row: Condition & Appointment */}
                <Grid gutter="lg">
                    {/* Condition Card */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper
                            radius="xl"
                            p="xl"
                            withBorder
                            style={{ position: 'relative', overflow: 'hidden' }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    top: -20,
                                    right: -20,
                                    width: '200px',
                                    height: '200px',
                                    background: 'var(--mantine-color-sage-green-1)',
                                    borderRadius: '50%',
                                    filter: 'blur(40px)',
                                    zIndex: 0
                                }}
                            />

                            <Stack style={{ position: 'relative', zIndex: 1 }}>
                                <Title order={2} size="h3" c="sage-green.9" ff="heading">오늘의 컨디션</Title>

                                <Group align="flex-end" gap="xs">
                                    <Text c="sage-green.7" fw={500}>리듬 지표</Text>
                                </Group>

                                <Group align="baseline" gap={4}>
                                    <Text size={rem(60)} fw={900} c="sage-green.8" lh={1}>42</Text>
                                    <Text size="xl" c="dimmed">/100</Text>
                                </Group>

                                <Group gap="xs">
                                    <Badge variant="light" color="red" size="lg">회복력 저하</Badge>
                                    <Badge variant="light" color="orange" size="lg">수면 리듬 불안정</Badge>
                                    <Badge variant="light" color="yellow" size="lg">스트레스 과부하</Badge>
                                </Group>
                            </Stack>

                            <Box pos="absolute" top={30} right={30} c="sage-green.3">
                                <Activity size={48} />
                            </Box>
                        </Paper>
                    </Grid.Col>

                    {/* Appointment Card */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper
                            radius="xl"
                            p="xl"
                            withBorder
                            style={{ position: 'relative', overflow: 'hidden', height: '100%' }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '50%',
                                    height: '100%',
                                    backgroundImage: 'url(https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    opacity: 0.1,
                                    maskImage: 'linear-gradient(to left, black, transparent)'
                                }}
                            />

                            <Stack justify="space-between" h="100%" style={{ position: 'relative', zIndex: 1 }}>
                                <Stack gap="md">
                                    <Title order={2} size="h3" c="sage-green.9" ff="heading">다음 예약 안내</Title>
                                    <div>
                                        <Text size={rem(28)} fw={700} c="dark.8" ff="heading">12.08 (금) 오후 2:30</Text>
                                        <Text c="sage-green.7" fw={500} size="lg">정기 침구치료</Text>
                                    </div>
                                </Stack>

                                <Button variant="filled" color="sage-green" size="md" w="fit-content">
                                    예약 변경
                                </Button>
                            </Stack>
                        </Paper>
                    </Grid.Col>

                    {/* Middle Row: Chat & History */}
                    <Grid.Col span={{ base: 12, lg: 8 }}>
                        <Paper radius="xl" p="xl" withBorder h="100%">
                            <Stack h="100%">
                                <Group justify="space-between">
                                    <div>
                                        <Title order={3} size="h4" c="sage-green.9" ff="heading">오늘의 대화 · AI 헬스케어 챗</Title>
                                        <Text size="sm" c="dimmed">AI 헬스케어 상담 · 메디컬 모드</Text>
                                    </div>
                                </Group>

                                <Paper bg="gray.0" p="md" radius="lg" flex={1} style={{ border: '1px solid var(--mantine-color-gray-2)' }}>
                                    <Stack gap="md">
                                        {/* AI Bubble */}
                                        <Group align="flex-start" gap="sm">
                                            <Avatar color="sage-green" radius="xl">
                                                <Activity size={20} />
                                            </Avatar>
                                            <Paper p="md" radius="md" bg="white" shadow="xs" style={{ borderTopLeftRadius: 0 }}>
                                                <Text size="sm" c="dark.8">
                                                    지난번 처방을 드린 후 소화는 조금 나아지셨다고 하셨는데, 요즘은 식후 더부룩함과 속쓰림은 어떤가요?
                                                </Text>
                                            </Paper>
                                        </Group>

                                        {/* User Bubble */}
                                        <Group align="flex-start" justify="flex-end" gap="sm">
                                            <Paper p="md" radius="md" bg="sage-green.1" style={{ borderTopRightRadius: 0, border: '1px solid var(--mantine-color-sage-green-2)' }}>
                                                <Text size="sm" c="dark.8">
                                                    더부룩함은 줄었는데 매운 걸 먹으면 아직 쓰려요.
                                                </Text>
                                            </Paper>
                                            <Avatar color="gray" radius="xl">
                                                <Text size="xs" fw={700}>나</Text>
                                            </Avatar>
                                        </Group>

                                        {/* AI Bubble */}
                                        <Group align="flex-start" gap="sm">
                                            <Avatar color="sage-green" radius="xl">
                                                <Activity size={20} />
                                            </Avatar>
                                            <Paper p="md" radius="md" bg="white" shadow="xs" style={{ borderTopLeftRadius: 0 }}>
                                                <Text size="sm" c="dark.8">
                                                    회복 중인 시기라 자극적인 음식에 예민할 수 있어요. 오늘 점심은 부드러운 식단을 추천드리고, 통증이 계속되면 꼭 진료 때 말씀해 주세요.
                                                </Text>
                                            </Paper>
                                        </Group>
                                    </Stack>
                                </Paper>

                                <Group gap="xs">
                                    <TextInput
                                        placeholder="현재 상태나 궁금한 점을 적어주세요..."
                                        style={{ flex: 1 }}
                                        radius="md"
                                        size="md"
                                    />
                                    <ActionIcon size="xl" radius="md" color="sage-green" variant="filled">
                                        <Send size={20} />
                                    </ActionIcon>
                                </Group>
                                <Text size="xs" c="dimmed" ta="center">AI는 진단·치료를 대신하지 않으며, 진료 전 상태 정리와 생활 안내를 돕기 위한 도구입니다.</Text>
                            </Stack>
                        </Paper>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, lg: 4 }}>
                        <Paper radius="xl" p="xl" withBorder h="100%">
                            <Title order={3} size="h4" c="sage-green.9" ff="heading" mb="xl">최근 히스토리 타임라인</Title>
                            <Timeline active={0} bulletSize={24} lineWidth={2}>
                                <Timeline.Item bullet={<div style={{ width: 10, height: 10, background: 'var(--mantine-color-sage-green-6)', borderRadius: '50%' }} />} title="12.01 (금)">
                                    <Text c="dark.8" size="sm" fw={500}>초진 및 한약 처방 (15일분)</Text>
                                </Timeline.Item>
                                <Timeline.Item bullet={<div style={{ width: 10, height: 10, background: 'var(--mantine-color-gray-4)', borderRadius: '50%' }} />} title="11.28 (화)">
                                    <Text c="dimmed" size="sm">AI 헬스케어 자가진단 - 소화/수면</Text>
                                </Timeline.Item>
                                <Timeline.Item bullet={<div style={{ width: 10, height: 10, background: 'var(--mantine-color-gray-4)', borderRadius: '50%' }} />} title="11.20 (월)">
                                    <Text c="dimmed" size="sm">웹사이트 회원가입</Text>
                                </Timeline.Item>
                            </Timeline>
                        </Paper>
                    </Grid.Col>

                    {/* Bottom Row: Missions */}
                    <Grid.Col span={12}>
                        <Paper radius="xl" p="xl" withBorder>
                            <Group justify="space-between" mb="lg">
                                <Title order={3} size="h4" c="sage-green.9" ff="heading">오늘의 생활 미션</Title>
                                <Badge size="lg" variant="light" color="sage-green">1/3 달성</Badge>
                            </Group>

                            <Grid>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <Paper p="md" radius="lg" bg="sage-green.0" withBorder style={{ borderColor: 'var(--mantine-color-sage-green-2)' }}>
                                        <Group>
                                            <ThemeIcon color="sage-green" variant="filled" radius="xl" size="md">
                                                <CheckCircle size={16} />
                                            </ThemeIcon>
                                            <Text fw={700} c="dark.8">따뜻한 물 한 잔 마시기</Text>
                                        </Group>
                                    </Paper>
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <Paper p="md" radius="lg" bg="white" withBorder>
                                        <Group>
                                            <ThemeIcon color="gray" variant="outline" radius="xl" size="md" style={{ border: '2px solid var(--mantine-color-gray-4)' }}>
                                                <Box w={0} />
                                            </ThemeIcon>
                                            <Text c="dimmed" fw={500}>저녁 8시 이후 금식</Text>
                                        </Group>
                                    </Paper>
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <Paper p="md" radius="lg" bg="white" withBorder>
                                        <Group>
                                            <ThemeIcon color="gray" variant="outline" radius="xl" size="md" style={{ border: '2px solid var(--mantine-color-gray-4)' }}>
                                                <Box w={0} />
                                            </ThemeIcon>
                                            <Text c="dimmed" fw={500}>20분 가볍게 걷기</Text>
                                        </Group>
                                    </Paper>
                                </Grid.Col>
                            </Grid>
                        </Paper>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
}
