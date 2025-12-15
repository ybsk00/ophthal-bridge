'use client';

import { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Paper,
    Table,
    Badge,
    Button,
    Group,
    Text,
    Loader,
    Center,
    Modal,
    TextInput,
    Select,
    Stack,
    Checkbox,
    Divider,
    Card,
    Alert,
    ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { UserPlus, Calendar, Pill, Stethoscope, ClipboardCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Message template types (inline for now, can be moved to shared lib later)
type MessageRuleType = 'appointment_reminder' | 'medication_refill' | 'follow_up_needed' | 'regular_checkup';

interface MessageRule {
    type: MessageRuleType;
    enabled: boolean;
}

interface MessageTemplate {
    type: MessageRuleType;
    name: string;
    description: string;
}

const MESSAGE_TEMPLATES: MessageTemplate[] = [
    { type: 'appointment_reminder', name: '예약 리마인더', description: '예약 1일 전 알림' },
    { type: 'medication_refill', name: '복약 리마인더', description: '복약 시간 알림' },
    { type: 'follow_up_needed', name: '재방문 알림', description: '재진 권유 알림' },
    { type: 'regular_checkup', name: '정기검진 알림', description: '정기 검진 안내' },
];

const DEFAULT_MESSAGE_RULES: MessageRule[] = [
    { type: 'appointment_reminder', enabled: true },
    { type: 'medication_refill', enabled: true },
    { type: 'follow_up_needed', enabled: false },
    { type: 'regular_checkup', enabled: false },
];

interface Patient {
    id: string;
    name: string;
    phone: string | null;
    lifecycle_stage: string;
    created_at: string;
}

// Badge 색상 매핑
const lifecycleColors: Record<string, string> = {
    lead: 'gray',
    new: 'blue',
    returning: 'green',
    vip: 'violet',
};

const lifecycleLabels: Record<string, string> = {
    lead: '리드',
    new: '신규',
    returning: '재방문',
    vip: 'VIP',
};

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // 환자 등록 모달
    const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);
    const [addLoading, setAddLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 환자 등록 폼 데이터
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        birthDate: '',
        gender: null as string | null,
        lifecycleStage: 'new' as string | null,
    });

    // 메세지 규칙 설정
    const [messageRules, setMessageRules] = useState<MessageRule[]>(DEFAULT_MESSAGE_RULES);

    useEffect(() => {
        fetchPatients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchPatients() {
        const { data } = await supabase
            .from('patients')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            setPatients(data);
        }
        setLoading(false);
    }

    // 메세지 규칙 아이콘
    function getRuleIcon(type: MessageRuleType) {
        switch (type) {
            case 'appointment_reminder':
                return <Calendar size={16} />;
            case 'medication_refill':
                return <Pill size={16} />;
            case 'follow_up_needed':
                return <Stethoscope size={16} />;
            case 'regular_checkup':
                return <ClipboardCheck size={16} />;
            default:
                return null;
        }
    }

    // 규칙 토글
    function toggleRule(type: MessageRuleType) {
        setMessageRules(prev => prev.map(rule =>
            rule.type === type
                ? { ...rule, enabled: !rule.enabled }
                : rule
        ));
    }

    // 폼 리셋
    function resetForm() {
        setFormData({
            name: '',
            phone: '',
            birthDate: '',
            gender: null,
            lifecycleStage: 'new',
        });
        setMessageRules(DEFAULT_MESSAGE_RULES);
        setError(null);
    }

    // 환자 등록 처리
    async function handleAddPatient() {
        if (!formData.name.trim()) {
            setError('이름은 필수 입력 항목입니다.');
            return;
        }

        setAddLoading(true);
        setError(null);

        try {
            // 전화번호 정규화
            const phoneNormalized = formData.phone ? formData.phone.replace(/-/g, '') : null;

            const { data, error: insertError } = await supabase
                .from('patients')
                .insert({
                    name: formData.name.trim(),
                    phone: formData.phone || null,
                    phone_normalized: phoneNormalized,
                    birth_date: formData.birthDate || null,
                    gender: formData.gender,
                    lifecycle_stage: formData.lifecycleStage || 'new',
                })
                .select()
                .single();

            if (insertError) {
                throw insertError;
            }

            // 메세지 규칙 저장 (추후 API 연동)
            console.log('등록된 환자 메세지 규칙:', {
                patientId: data.id,
                rules: messageRules.filter(r => r.enabled),
            });

            setSuccess(`${formData.name}님이 환자로 등록되었습니다.`);
            closeAddModal();
            resetForm();
            fetchPatients();
        } catch (err: unknown) {
            console.error('Patient registration error:', err);
            const errorMessage = err instanceof Error ? err.message : '환자 등록에 실패했습니다.';
            setError(errorMessage);
        } finally {
            setAddLoading(false);
        }
    }

    if (loading) {
        return (
            <Center h={300}>
                <Loader color="blue" />
            </Center>
        );
    }

    return (
        <Container size="lg" py="lg">
            {success && (
                <Alert color="green" icon={<CheckCircle size={16} />} mb="md" withCloseButton onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <Group justify="space-between" mb="lg">
                <Title order={2} c="white">환자 관리</Title>
                <Button leftSection={<UserPlus size={16} />} onClick={openAddModal}>
                    환자 등록
                </Button>
            </Group>

            <Paper shadow="sm" radius="md" withBorder bg="dark.6">
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>이름</Table.Th>
                            <Table.Th>연락처</Table.Th>
                            <Table.Th>상태</Table.Th>
                            <Table.Th>등록일</Table.Th>
                            <Table.Th>관리</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {patients.map((patient) => (
                            <Table.Tr key={patient.id}>
                                <Table.Td>
                                    <Text size="sm" fw={500}>{patient.name}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm" c="dimmed">{patient.phone || '-'}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Badge color={lifecycleColors[patient.lifecycle_stage] || 'gray'}>
                                        {lifecycleLabels[patient.lifecycle_stage] || patient.lifecycle_stage}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm" c="dimmed">
                                        {new Date(patient.created_at).toLocaleDateString('ko-KR')}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    <Button variant="light" size="xs">
                                        상세보기
                                    </Button>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                        {patients.length === 0 && (
                            <Table.Tr>
                                <Table.Td colSpan={5}>
                                    <Text ta="center" c="dimmed" py="lg">등록된 환자가 없습니다.</Text>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </Paper>

            {/* 환자 등록 모달 */}
            <Modal
                opened={addModalOpened}
                onClose={() => {
                    closeAddModal();
                    resetForm();
                }}
                title="환자 등록"
                centered
                size="lg"
            >
                <Stack gap="md">
                    {error && (
                        <Alert color="red" icon={<AlertCircle size={16} />} withCloseButton onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {/* 기본 정보 섹션 */}
                    <Text fw={500}>기본 정보</Text>
                    <Group grow>
                        <TextInput
                            label="이름"
                            placeholder="환자 이름"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <TextInput
                            label="연락처"
                            placeholder="010-0000-0000"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                    </Group>
                    <Group grow>
                        <TextInput
                            label="생년월일"
                            placeholder="YYYY-MM-DD"
                            value={formData.birthDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                        />
                        <Select
                            label="성별"
                            placeholder="선택"
                            data={[
                                { value: 'male', label: '남성' },
                                { value: 'female', label: '여성' },
                            ]}
                            value={formData.gender}
                            onChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                        />
                    </Group>
                    <Select
                        label="환자 상태"
                        data={[
                            { value: 'lead', label: '리드' },
                            { value: 'new', label: '신규' },
                            { value: 'returning', label: '재방문' },
                            { value: 'vip', label: 'VIP' },
                        ]}
                        value={formData.lifecycleStage}
                        onChange={(value) => setFormData(prev => ({ ...prev, lifecycleStage: value }))}
                    />

                    <Divider my="sm" />

                    {/* 메세지 규칙 섹션 */}
                    <Text fw={500}>메세지 규칙 설정</Text>
                    <Text size="sm" c="dimmed">이 환자에게 적용할 자동 메세지 규칙을 선택하세요.</Text>

                    <Card withBorder radius="md" p="md" bg="dark.7">
                        <Stack gap="sm">
                            {MESSAGE_TEMPLATES.map((template) => {
                                const rule = messageRules.find(r => r.type === template.type);
                                if (!rule) return null;

                                return (
                                    <Group key={template.type} justify="space-between">
                                        <Group gap="sm">
                                            <ThemeIcon
                                                size="sm"
                                                radius="sm"
                                                variant="light"
                                                color={rule.enabled ? 'blue' : 'gray'}
                                            >
                                                {getRuleIcon(template.type)}
                                            </ThemeIcon>
                                            <div>
                                                <Text size="sm">{template.name}</Text>
                                                <Text size="xs" c="dimmed">{template.description}</Text>
                                            </div>
                                        </Group>
                                        <Checkbox
                                            checked={rule.enabled}
                                            onChange={() => toggleRule(template.type)}
                                        />
                                    </Group>
                                );
                            })}
                        </Stack>
                    </Card>

                    <Alert color="blue" mt="sm">
                        <Text size="xs">
                            메세지 발송은 API 연동 후 활성화됩니다. 규칙 설정은 저장됩니다.
                        </Text>
                    </Alert>

                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={() => {
                            closeAddModal();
                            resetForm();
                        }}>
                            취소
                        </Button>
                        <Button onClick={handleAddPatient} loading={addLoading}>
                            환자 등록
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}

