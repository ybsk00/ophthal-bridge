"use client";

import { motion } from "framer-motion";
import { Activity, Tag, FileText, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { SummaryResult } from "@/lib/ai/summary";
import {
    Paper,
    Text,
    Title,
    Badge,
    Button,
    Group,
    Stack,
    ThemeIcon,
    Container,
    Alert,
    rem
} from "@mantine/core";

interface ConditionReportProps {
    result: SummaryResult;
    onRetry: () => void;
}

export default function ConditionReport({ result, onRetry }: ConditionReportProps) {
    // Determine color based on score
    const getScoreColor = (score: number) => {
        if (score >= 90) return "green";
        if (score >= 70) return "blue";
        if (score >= 50) return "orange";
        return "red";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return "매우 양호";
        if (score >= 70) return "양호";
        if (score >= 50) return "주의 필요";
        return "관리 필요";
    };

    const scoreColor = getScoreColor(result.rhythm_score);

    return (
        <Container size="sm" py="xl" pb={100}>
            <Stack gap="xl">
                {/* Header */}
                <Stack gap="xs" align="center" ta="center">
                    <Title order={2} c="sage-green.9">나의 건강 리듬 리포트</Title>
                    <Text c="dimmed" size="sm">AI가 분석한 현재 컨디션입니다.</Text>
                </Stack>

                {/* Score Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Paper
                        radius="xl"
                        p="xl"
                        withBorder
                        style={{
                            textAlign: 'center',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '8px',
                                background: 'linear-gradient(90deg, var(--mantine-color-sage-green-3), var(--mantine-color-sage-green-6))',
                                opacity: 0.5
                            }}
                        />
                        <Stack gap="md" align="center">
                            <Text c="dimmed" fw={500}>종합 리듬 점수</Text>
                            <Group align="baseline" gap={4}>
                                <Text size={rem(60)} fw={900} c={`${scoreColor}.7`} style={{ lineHeight: 1 }}>
                                    {result.rhythm_score}
                                </Text>
                                <Text size="xl" c="dimmed">점</Text>
                            </Group>
                            <Badge size="lg" variant="light" color={scoreColor}>
                                {getScoreLabel(result.rhythm_score)}
                            </Badge>
                        </Stack>
                    </Paper>
                </motion.div>

                {/* Key Patterns */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Stack gap="sm">
                        <Group gap="xs">
                            <ThemeIcon variant="light" color="sage-green" size="md">
                                <Tag size={16} />
                            </ThemeIcon>
                            <Title order={3} size="h4" c="sage-green.9">핵심 패턴 태그</Title>
                        </Group>
                        <Group gap="xs">
                            {result.pattern_tags.map((tag, i) => (
                                <Badge key={i} size="lg" variant="outline" color="gray" radius="md" py="md" tt="none">
                                    #{tag}
                                </Badge>
                            ))}
                        </Group>
                    </Stack>
                </motion.div>

                {/* Summary Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Stack gap="sm">
                        <Group gap="xs">
                            <ThemeIcon variant="light" color="sage-green" size="md">
                                <FileText size={16} />
                            </ThemeIcon>
                            <Title order={3} size="h4" c="sage-green.9">AI 분석 요약</Title>
                        </Group>
                        <Paper p="lg" radius="md" withBorder bg="gray.0">
                            <Text c="dark.8" lh={1.6}>
                                {result.summary_text}
                            </Text>
                        </Paper>
                    </Stack>
                </motion.div>

                {/* Main Concern */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Alert
                        variant="light"
                        color="red"
                        title={
                            <Group gap="xs">
                                <Activity size={18} />
                                <Text fw={700}>주요 관리 포인트</Text>
                            </Group>
                        }
                        radius="md"
                    >
                        <Text c="red.8" fw={500} mt="xs">
                            {result.main_concern}
                        </Text>
                    </Alert>
                </motion.div>

                {/* CTA Actions */}
                <Stack gap="md" pt="md">
                    <Button
                        component={Link}
                        href="/login"
                        size="xl"
                        color="sage-green"
                        fullWidth
                        radius="md"
                        rightSection={<ArrowRight size={18} />}
                    >
                        로그인하고 전체 리포트 저장하기
                    </Button>
                    <Button
                        onClick={onRetry}
                        variant="default"
                        size="xl"
                        fullWidth
                        radius="md"
                        leftSection={<RefreshCw size={18} />}
                    >
                        다시 상담하기
                    </Button>
                </Stack>
            </Stack>
        </Container>
    );
}
