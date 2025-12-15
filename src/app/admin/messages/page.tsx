'use client';

import { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Tabs,
    Paper,
    TextInput,
    Textarea,
    Button,
    Group,
    Select,
    MultiSelect,
    Table,
    Badge,
    Stack,
    Text,
    Switch,
    LoadingOverlay,
    Alert,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { Smartphone, MessageCircle, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Patient {
    id: string;
    name: string;
    phone?: string;
}

interface MessageJob {
    id: string;
    channel: string;
    template_code: string;
    payload: any;
    scheduled_for: string;
    status: string;
    created_at: string;
    patients?: { name: string };
}

export default function MessagesPage() {
    const [activeTab, setActiveTab] = useState<string | null>('push');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [messageHistory, setMessageHistory] = useState<MessageJob[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 앱푸쉬 폼 상태
    const [pushTitle, setPushTitle] = useState('');
    const [pushBody, setPushBody] = useState('');
    const [pushTargetType, setPushTargetType] = useState<string | null>('all');
    const [pushTargetPatients, setPushTargetPatients] = useState<string[]>([]);
    const [pushScheduled, setPushScheduled] = useState(false);
    const [pushScheduledTime, setPushScheduledTime] = useState<Date | null>(null);

    // 알림톡 폼 상태
    const [alimtalkTemplate, setAlimtalkTemplate] = useState<string | null>(null);
    const [alimtalkVariables, setAlimtalkVariables] = useState<Record<string, string>>({});
    const [alimtalkTargetType, setAlimtalkTargetType] = useState<string | null>('all');
    const [alimtalkTargetPatients, setAlimtalkTargetPatients] = useState<string[]>([]);

    const supabase = createClient();

    // 알림톡 템플릿 목록 (추후 실제 템플릿으로 교체)
    const alimtalkTemplates = [
        { value: 'appointment_reminder', label: '예약 알림', variables: ['name', 'date', 'time'] },
        { value: 'appointment_confirm', label: '예약 확정', variables: ['name', 'date', 'time', 'doctor'] },
        { value: 'medication_reminder', label: '복약 알림', variables: ['name', 'medication'] },
        { value: 'checkup_notice', label: '검진 안내', variables: ['name', 'checkup_type'] },
    ];

    useEffect(() => {
        fetchPatients();
        fetchMessageHistory();
    }, []);

    useEffect(() => {
        // 템플릿 변경 시 변수 초기화
        if (alimtalkTemplate) {
            const template = alimtalkTemplates.find(t => t.value === alimtalkTemplate);
            if (template) {
                const vars: Record<string, string> = {};
                template.variables.forEach(v => vars[v] = '');
                setAlimtalkVariables(vars);
            }
        }
    }, [alimtalkTemplate]);

    async function fetchPatients() {
        const { data } = await supabase
            .from('patients')
            .select('id, name, phone')
            .order('name');
        if (data) setPatients(data);
    }

    async function fetchMessageHistory() {
        const { data } = await supabase
            .from('message_jobs')
            .select('*, patients(name)')
            .order('created_at', { ascending: false })
            .limit(20);
        if (data) setMessageHistory(data);
    }

    async function handlePushSubmit() {
        if (!pushTitle || !pushBody) {
            setError('제목과 본문을 입력해주세요.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const targetPatientIds = pushTargetType === 'all'
                ? patients.map(p => p.id)
                : pushTargetPatients;

            const response = await fetch('/api/push/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: pushTitle,
                    body: pushBody,
                    patient_ids: targetPatientIds,
                    scheduled_for: pushScheduled && pushScheduledTime
                        ? pushScheduledTime.toISOString()
                        : undefined,
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            setSuccess(pushScheduled
                ? `${targetPatientIds.length}명에게 예약 발송이 설정되었습니다.`
                : `${targetPatientIds.length}명에게 푸쉬 알림이 발송되었습니다.`);

            // 폼 초기화
            setPushTitle('');
            setPushBody('');
            setPushTargetPatients([]);
            setPushScheduled(false);
            setPushScheduledTime(null);

            fetchMessageHistory();
        } catch (err: any) {
            setError(err.message || '발송 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }

    async function handleAlimtalkSubmit() {
        if (!alimtalkTemplate) {
            setError('템플릿을 선택해주세요.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const targetPatientIds = alimtalkTargetType === 'all'
                ? patients.map(p => p.id)
                : alimtalkTargetPatients;

            const response = await fetch('/api/alimtalk/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template_code: alimtalkTemplate,
                    variables: alimtalkVariables,
                    patient_ids: targetPatientIds,
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            setSuccess(`${targetPatientIds.length}명에게 알림톡 발송이 요청되었습니다.`);

            // 폼 초기화
            setAlimtalkTemplate(null);
            setAlimtalkVariables({});
            setAlimtalkTargetPatients([]);

            fetchMessageHistory();
        } catch (err: any) {
            setError(err.message || '발송 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }

    function getStatusBadge(status: string) {
        switch (status) {
            case 'sent':
                return <Badge color="green" leftSection={<CheckCircle size={12} />}>발송완료</Badge>;
            case 'failed':
                return <Badge color="red" leftSection={<XCircle size={12} />}>실패</Badge>;
            case 'processing':
                return <Badge color="yellow" leftSection={<Clock size={12} />}>처리중</Badge>;
            case 'queued':
                return <Badge color="blue" leftSection={<Clock size={12} />}>대기중</Badge>;
            default:
                return <Badge color="gray">{status}</Badge>;
        }
    }

    function getChannelBadge(channel: string) {
        switch (channel) {
            case 'push':
                return <Badge variant="light" color="violet" leftSection={<Smartphone size={12} />}>앱푸쉬</Badge>;
            case 'alimtalk':
                return <Badge variant="light" color="yellow" leftSection={<MessageCircle size={12} />}>알림톡</Badge>;
            default:
                return <Badge variant="light">{channel}</Badge>;
        }
    }

    const patientOptions = patients.map(p => ({
        value: p.id,
        label: `${p.name}${p.phone ? ` (${p.phone})` : ''}`,
    }));

    return (
        <Container size="lg" py="lg">
            <Title order={2} mb="lg" c="white">메시지 전송</Title>

            {success && (
                <Alert color="green" icon={<CheckCircle size={16} />} mb="md" withCloseButton onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}
            {error && (
                <Alert color="red" icon={<AlertCircle size={16} />} mb="md" withCloseButton onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List mb="lg">
                    <Tabs.Tab value="push" leftSection={<Smartphone size={16} />}>
                        앱 푸쉬
                    </Tabs.Tab>
                    <Tabs.Tab value="alimtalk" leftSection={<MessageCircle size={16} />}>
                        카카오톡 알림톡
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="push">
                    <Paper shadow="sm" p="lg" radius="md" pos="relative" bg="dark.6">
                        <LoadingOverlay visible={loading} />
                        <Stack gap="md">
                            <TextInput
                                label="푸쉬 제목"
                                placeholder="알림 제목을 입력하세요"
                                maxLength={50}
                                value={pushTitle}
                                onChange={(e) => setPushTitle(e.target.value)}
                                required
                            />
                            <Textarea
                                label="푸쉬 내용"
                                placeholder="알림 내용을 입력하세요"
                                maxLength={200}
                                minRows={3}
                                value={pushBody}
                                onChange={(e) => setPushBody(e.target.value)}
                                required
                            />
                            <Select
                                label="발송 대상"
                                data={[
                                    { value: 'all', label: '전체 환자' },
                                    { value: 'selected', label: '특정 환자 선택' },
                                ]}
                                value={pushTargetType}
                                onChange={setPushTargetType}
                            />
                            {pushTargetType === 'selected' && (
                                <MultiSelect
                                    label="환자 선택"
                                    placeholder="환자를 검색하세요"
                                    data={patientOptions}
                                    value={pushTargetPatients}
                                    onChange={setPushTargetPatients}
                                    searchable
                                    clearable
                                />
                            )}
                            <Group>
                                <Switch
                                    label="예약 발송"
                                    checked={pushScheduled}
                                    onChange={(e) => setPushScheduled(e.currentTarget.checked)}
                                />
                            </Group>
                            {pushScheduled && (
                                <DateTimePicker
                                    label="예약 시간"
                                    placeholder="발송 시간을 선택하세요"
                                    value={pushScheduledTime}
                                    onChange={(value) => setPushScheduledTime(value ? new Date(value) : null)}
                                    minDate={new Date()}
                                />
                            )}
                            <Group justify="flex-end" mt="md">
                                <Button
                                    leftSection={<Send size={16} />}
                                    onClick={handlePushSubmit}
                                    disabled={!pushTitle || !pushBody}
                                >
                                    {pushScheduled ? '예약 발송' : '즉시 발송'}
                                </Button>
                            </Group>
                        </Stack>
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="alimtalk">
                    <Paper shadow="sm" p="lg" radius="md" pos="relative" bg="dark.6">
                        <LoadingOverlay visible={loading} />
                        <Stack gap="md">
                            <Select
                                label="템플릿 선택"
                                placeholder="알림톡 템플릿을 선택하세요"
                                data={alimtalkTemplates.map(t => ({ value: t.value, label: t.label }))}
                                value={alimtalkTemplate}
                                onChange={setAlimtalkTemplate}
                                required
                            />
                            {alimtalkTemplate && (
                                <>
                                    <Text size="sm" fw={500}>템플릿 변수</Text>
                                    {Object.keys(alimtalkVariables).map((key) => (
                                        <TextInput
                                            key={key}
                                            label={`#{${key}}`}
                                            placeholder={`${key} 값을 입력하세요`}
                                            value={alimtalkVariables[key]}
                                            onChange={(e) => setAlimtalkVariables({
                                                ...alimtalkVariables,
                                                [key]: e.target.value
                                            })}
                                        />
                                    ))}
                                </>
                            )}
                            <Select
                                label="발송 대상"
                                data={[
                                    { value: 'all', label: '전체 환자' },
                                    { value: 'selected', label: '특정 환자 선택' },
                                ]}
                                value={alimtalkTargetType}
                                onChange={setAlimtalkTargetType}
                            />
                            {alimtalkTargetType === 'selected' && (
                                <MultiSelect
                                    label="환자 선택"
                                    placeholder="환자를 검색하세요"
                                    data={patientOptions}
                                    value={alimtalkTargetPatients}
                                    onChange={setAlimtalkTargetPatients}
                                    searchable
                                    clearable
                                />
                            )}
                            <Alert color="blue" icon={<AlertCircle size={16} />}>
                                알림톡은 카카오톡 채널과 연동된 사용자에게만 발송됩니다.
                                실제 발송을 위해서는 NHN Cloud 알림톡 서비스 설정이 필요합니다.
                            </Alert>
                            <Group justify="flex-end" mt="md">
                                <Button
                                    leftSection={<Send size={16} />}
                                    onClick={handleAlimtalkSubmit}
                                    disabled={!alimtalkTemplate}
                                    color="yellow"
                                >
                                    알림톡 발송
                                </Button>
                            </Group>
                        </Stack>
                    </Paper>
                </Tabs.Panel>
            </Tabs>

            {/* 발송 기록 */}
            <Title order={3} mt="xl" mb="md" c="white">발송 기록</Title>
            <Paper shadow="sm" radius="md" withBorder bg="dark.6">
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>발송 시간</Table.Th>
                            <Table.Th>채널</Table.Th>
                            <Table.Th>내용</Table.Th>
                            <Table.Th>상태</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {messageHistory.length === 0 ? (
                            <Table.Tr>
                                <Table.Td colSpan={4}>
                                    <Text ta="center" c="dimmed" py="lg">발송 기록이 없습니다.</Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            messageHistory.map((job) => (
                                <Table.Tr key={job.id}>
                                    <Table.Td>
                                        {new Date(job.created_at).toLocaleString('ko-KR')}
                                    </Table.Td>
                                    <Table.Td>{getChannelBadge(job.channel)}</Table.Td>
                                    <Table.Td>
                                        {job.channel === 'push'
                                            ? job.payload?.title
                                            : job.template_code}
                                    </Table.Td>
                                    <Table.Td>{getStatusBadge(job.status)}</Table.Td>
                                </Table.Tr>
                            ))
                        )}
                    </Table.Tbody>
                </Table>
            </Paper>
        </Container>
    );
}
