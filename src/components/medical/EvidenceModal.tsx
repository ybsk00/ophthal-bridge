'use client';

import { Modal, Text, Button, Stack, Badge, Group, Anchor } from '@mantine/core';
import { FileText, ExternalLink, Users, Calendar } from 'lucide-react';

interface SciEvidence {
    journal: string;
    title: string;
    date: string;
    authors: string;
    link: string;
}

interface EvidenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    evidence: SciEvidence;
}

export default function EvidenceModal({
    isOpen,
    onClose,
    evidence
}: EvidenceModalProps) {
    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-lg">SCI 학술 논문 안내</span>
                </div>
            }
            size="md"
            radius="lg"
            overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        >
            <Stack gap="md">
                {/* 고지 문구 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    <Text size="xs">
                        아래 논문은 아이니의원 연구진이 참여한 SCI 국제학술지 게재 논문입니다.
                        치료 효과를 보장하거나 우월성을 주장하는 자료가 아님을 안내드립니다.
                    </Text>
                </div>

                {/* 논문 카드 */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    {/* 저널 뱃지 */}
                    <div className="mb-3">
                        <Badge color="blue" variant="light" size="lg">
                            {evidence.journal}
                        </Badge>
                        <Badge color="green" variant="outline" size="sm" ml="xs">
                            SCI 등재
                        </Badge>
                    </div>

                    {/* 논문 제목 */}
                    <Text fw={600} size="sm" className="mb-4 leading-relaxed">
                        {evidence.title}
                    </Text>

                    {/* 저자/일자 */}
                    <div className="space-y-2 text-sm text-gray-600">
                        <Group gap="xs">
                            <Users size={14} className="text-gray-400" />
                            <Text size="xs">{evidence.authors}</Text>
                        </Group>
                        <Group gap="xs">
                            <Calendar size={14} className="text-gray-400" />
                            <Text size="xs">게시일: {evidence.date}</Text>
                        </Group>
                    </div>
                </div>

                {/* 면책 */}
                <Text size="xs" c="dimmed" className="text-center">
                    본 논문은 학술적 연구 결과이며, 개인별 치료 효과는 다를 수 있습니다.
                </Text>

                {/* 버튼 */}
                <Group grow>
                    <Button
                        leftSection={<ExternalLink size={16} />}
                        variant="light"
                        color="blue"
                        component="a"
                        href={evidence.link}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        논문 원문 보기
                    </Button>
                    <Button
                        variant="default"
                        onClick={onClose}
                    >
                        닫기
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
