'use client';

import { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Paper,
    Tabs,
    TextInput,
    PasswordInput,
    Button,
    Group,
    Stack,
    Text,
    Table,
    Badge,
    ActionIcon,
    Modal,
    Alert,
    LoadingOverlay,
    Select,
    Switch,
    Card,
    Accordion,
    ThemeIcon,
    Divider,
    Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    UserPlus,
    Edit,
    Trash2,
    Shield,
    CheckCircle,
    AlertCircle,
    MessageSquare,
    Calendar,
    Pill,
    Stethoscope,
    ClipboardCheck,
    Bell,
    Send
} from 'lucide-react';

// Message template types (inline)
type MessageRuleType = 'appointment_reminder' | 'medication_refill' | 'follow_up_needed' | 'regular_checkup';

interface MessageRule {
    type: MessageRuleType;
    enabled: boolean;
    pushEnabled?: boolean;
    kakaoEnabled?: boolean;
}

interface MessageTemplate {
    type: MessageRuleType;
    name: string;
    description: string;
    push: { title: string; body: string };
    kakao: { title: string; body: string; buttons: { label: string; link: string }[] };
}

const MESSAGE_TEMPLATES: MessageTemplate[] = [
    {
        type: 'appointment_reminder',
        name: '예약 리마인더',
        description: '예약 1일 전 알림',
        push: { title: '{hospital_name} 예약 알림', body: '내일 예약이 있습니다.' },
        kakao: {
            title: '{hospital_name} 예약 알림',
            body: '안녕하세요, {hospital_name}입니다.\n\n내일 {appointment_datetime}에 예약이 있습니다.\n{department}에서 뵙겠습니다.',
            buttons: [{ label: '예약 확인', link: '{link}' }]
        }
    },
    {
        type: 'medication_refill',
        name: '복약 리마인더',
        description: '복약 시간 알림',
        push: { title: '복약 시간입니다', body: '처방받은 약을 복용해 주세요.' },
        kakao: {
            title: '복약 알림',
            body: '복약 시간입니다. 처방받은 약을 복용해 주세요.',
            buttons: []
        }
    },
    {
        type: 'follow_up_needed',
        name: '재방문 알림',
        description: '재진 권유 알림',
        push: { title: '{hospital_name}', body: '재방문 시기가 되었습니다.' },
        kakao: {
            title: '재방문 안내',
            body: '안녕하세요, {hospital_name}입니다.\n\n지난 진료 이후 재방문 시기가 되었습니다.\n\n{link}',
            buttons: [{ label: '예약하기', link: '{link}' }]
        }
    },
    {
        type: 'regular_checkup',
        name: '정기검진 알림',
        description: '정기 검진 안내',
        push: { title: '정기 검진 안내', body: '정기 검진을 받으실 시기입니다.' },
        kakao: {
            title: '정기 검진 안내',
            body: '안녕하세요, {hospital_name}입니다.\n\n정기 검진을 받으실 시기입니다.',
            buttons: [{ label: '예약하기', link: '{link}' }]
        }
    },
];

const DEFAULT_MESSAGE_RULES: MessageRule[] = [
    { type: 'appointment_reminder', enabled: true, pushEnabled: true, kakaoEnabled: true },
    { type: 'medication_refill', enabled: true, pushEnabled: true, kakaoEnabled: false },
    { type: 'follow_up_needed', enabled: false, pushEnabled: false, kakaoEnabled: false },
    { type: 'regular_checkup', enabled: false, pushEnabled: false, kakaoEnabled: false },
];

function getTemplateByType(type: MessageRuleType): MessageTemplate | undefined {
    return MESSAGE_TEMPLATES.find(t => t.type === type);
}

interface AdminUser {
    id: string;
    email: string;
    name?: string;
    role: string;
    created_at: string;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<string | null>('accounts');
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 계정 추가 모달
    const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState<string | null>('staff');
    const [addLoading, setAddLoading] = useState(false);

    // 삭제 확인 모달
    const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
    const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // 메세지 규칙 상태
    const [messageRules, setMessageRules] = useState<MessageRule[]>(DEFAULT_MESSAGE_RULES);
    const [previewModalOpened, { open: openPreviewModal, close: closePreviewModal }] = useDisclosure(false);
    const [previewType, setPreviewType] = useState<MessageRuleType | null>(null);

    useEffect(() => {
        fetchAdminUsers();
    }, []);

    async function fetchAdminUsers() {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/list');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }

            setAdminUsers(result.users || []);
        } catch (err: any) {
            console.error('Failed to fetch admin users:', err);
            setError(err.message || '관리자 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }

    async function handleAddAdmin() {
        if (!newEmail || !newPassword || !newName || !newRole) {
            setError('모든 필드를 입력해주세요.');
            return;
        }

        if (newPassword.length < 8) {
            setError('비밀번호는 최소 8자 이상이어야 합니다.');
            return;
        }

        setAddLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/admin/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: newEmail,
                    password: newPassword,
                    name: newName,
                    role: newRole,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '계정 생성에 실패했습니다.');
            }

            setSuccess(`${newName}님의 계정이 생성되었습니다.`);
            closeAddModal();
            setNewEmail('');
            setNewPassword('');
            setNewName('');
            setNewRole('staff');
            fetchAdminUsers();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAddLoading(false);
        }
    }

    function confirmDelete(user: AdminUser) {
        setUserToDelete(user);
        openDeleteModal();
    }

    async function handleDeleteAdmin() {
        if (!userToDelete) return;

        setDeleteLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/admin/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userToDelete.id }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '계정 삭제에 실패했습니다.');
            }

            setSuccess(`${userToDelete.name || userToDelete.email}님의 계정이 삭제되었습니다.`);
            closeDeleteModal();
            setUserToDelete(null);
            fetchAdminUsers();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setDeleteLoading(false);
        }
    }

    function getRoleBadge(role: string) {
        switch (role) {
            case 'admin':
                return <Badge color="red" leftSection={<Shield size={12} />}>관리자</Badge>;
            case 'staff':
                return <Badge color="blue">직원</Badge>;
            default:
                return <Badge color="gray">{role}</Badge>;
        }
    }

    // 메세지 규칙 아이콘 가져오기
    function getRuleIcon(type: MessageRuleType) {
        switch (type) {
            case 'appointment_reminder':
                return <Calendar size={20} />;
            case 'medication_refill':
                return <Pill size={20} />;
            case 'follow_up_needed':
                return <Stethoscope size={20} />;
            case 'regular_checkup':
                return <ClipboardCheck size={20} />;
            default:
                return <MessageSquare size={20} />;
        }
    }

    // 메세지 규칙 토글
    function toggleRule(type: MessageRuleType) {
        setMessageRules(prev => prev.map(rule =>
            rule.type === type
                ? { ...rule, enabled: !rule.enabled }
                : rule
        ));
    }

    // 푸시 활성화 토글
    function togglePush(type: MessageRuleType) {
        setMessageRules(prev => prev.map(rule =>
            rule.type === type
                ? { ...rule, pushEnabled: !rule.pushEnabled }
                : rule
        ));
    }

    // 카카오 활성화 토글
    function toggleKakao(type: MessageRuleType) {
        setMessageRules(prev => prev.map(rule =>
            rule.type === type
                ? { ...rule, kakaoEnabled: !rule.kakaoEnabled }
                : rule
        ));
    }

    // 미리보기 열기
    function showPreview(type: MessageRuleType) {
        setPreviewType(type);
        openPreviewModal();
    }

    return (
        <Container size="lg" py="lg">
            <Title order={2} mb="lg" c="white">설정</Title>

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
                    <Tabs.Tab value="accounts" leftSection={<Shield size={16} />}>
                        관리자 계정
                    </Tabs.Tab>
                    <Tabs.Tab value="messages" leftSection={<MessageSquare size={16} />}>
                        메세지 규칙
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="accounts">
                    <Paper shadow="sm" p="lg" radius="md" pos="relative" bg="dark.6">
                        <LoadingOverlay visible={loading} />

                        <Group justify="space-between" mb="lg">
                            <Text size="lg" fw={500} c="white">관리자 계정 목록</Text>
                            <Button
                                leftSection={<UserPlus size={16} />}
                                onClick={openAddModal}
                            >
                                계정 추가
                            </Button>
                        </Group>

                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>이름</Table.Th>
                                    <Table.Th>이메일</Table.Th>
                                    <Table.Th>권한</Table.Th>
                                    <Table.Th>등록일</Table.Th>
                                    <Table.Th>관리</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {adminUsers.length === 0 ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={5}>
                                            <Text ta="center" c="dimmed" py="lg">등록된 관리자가 없습니다.</Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    adminUsers.map((user) => (
                                        <Table.Tr key={user.id}>
                                            <Table.Td>{user.name || '-'}</Table.Td>
                                            <Table.Td>{user.email}</Table.Td>
                                            <Table.Td>{getRoleBadge(user.role)}</Table.Td>
                                            <Table.Td>
                                                {new Date(user.created_at).toLocaleDateString('ko-KR')}
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <ActionIcon
                                                        variant="light"
                                                        color="red"
                                                        size="sm"
                                                        onClick={() => confirmDelete(user)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </ActionIcon>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))
                                )}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                </Tabs.Panel>

                {/* 메세지 규칙 탭 */}
                <Tabs.Panel value="messages">
                    <Paper shadow="sm" p="lg" radius="md" bg="dark.6">
                        <Group justify="space-between" mb="lg">
                            <div>
                                <Text size="lg" fw={500} c="white">자동 메세지 규칙</Text>
                                <Text size="sm" c="dimmed">환자 등록 시 적용할 메세지 발송 규칙을 설정합니다.</Text>
                            </div>
                        </Group>

                        <Stack gap="md">
                            {MESSAGE_TEMPLATES.map((template) => {
                                const rule = messageRules.find(r => r.type === template.type);
                                if (!rule) return null;

                                return (
                                    <Card key={template.type} padding="lg" radius="md" withBorder bg={rule.enabled ? 'dark.5' : 'dark.7'}>
                                        <Group justify="space-between" wrap="nowrap">
                                            <Group gap="md" wrap="nowrap">
                                                <ThemeIcon
                                                    size="xl"
                                                    radius="md"
                                                    variant={rule.enabled ? 'filled' : 'light'}
                                                    color={rule.enabled ? 'blue' : 'gray'}
                                                >
                                                    {getRuleIcon(template.type)}
                                                </ThemeIcon>
                                                <div>
                                                    <Text fw={500} c="white">{template.name}</Text>
                                                    <Text size="sm" c="dimmed">{template.description}</Text>
                                                </div>
                                            </Group>
                                            <Switch
                                                checked={rule.enabled}
                                                onChange={() => toggleRule(template.type)}
                                                size="md"
                                            />
                                        </Group>

                                        {rule.enabled && (
                                            <>
                                                <Divider my="md" />
                                                <Group justify="space-between">
                                                    <Group gap="xl">
                                                        <Group gap="xs">
                                                            <Switch
                                                                checked={rule.pushEnabled}
                                                                onChange={() => togglePush(template.type)}
                                                                size="sm"
                                                            />
                                                            <Group gap={4}>
                                                                <Bell size={14} />
                                                                <Text size="sm" c="white">앱 푸시</Text>
                                                            </Group>
                                                        </Group>
                                                        <Group gap="xs">
                                                            <Switch
                                                                checked={rule.kakaoEnabled}
                                                                onChange={() => toggleKakao(template.type)}
                                                                size="sm"
                                                            />
                                                            <Group gap={4}>
                                                                <Send size={14} />
                                                                <Text size="sm" c="white">카카오 알림톡</Text>
                                                            </Group>
                                                        </Group>
                                                    </Group>
                                                    <Button
                                                        variant="light"
                                                        size="xs"
                                                        onClick={() => showPreview(template.type)}
                                                    >
                                                        미리보기
                                                    </Button>
                                                </Group>
                                            </>
                                        )}
                                    </Card>
                                );
                            })}
                        </Stack>

                        <Alert color="blue" mt="lg" icon={<AlertCircle size={16} />}>
                            <Text size="sm">
                                메세지 발송은 API 연동 후 활성화됩니다. 현재는 규칙 설정만 가능합니다.
                            </Text>
                        </Alert>
                    </Paper>
                </Tabs.Panel>
            </Tabs>

            {/* 계정 추가 모달 */}
            <Modal
                opened={addModalOpened}
                onClose={closeAddModal}
                title="관리자 계정 추가"
                centered
            >
                <Stack gap="md">
                    <TextInput
                        label="이름"
                        placeholder="관리자 이름"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                    />
                    <TextInput
                        label="이메일"
                        placeholder="admin@example.com"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                    />
                    <PasswordInput
                        label="비밀번호"
                        placeholder="최소 8자 이상"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <Select
                        label="권한"
                        data={[
                            { value: 'admin', label: '관리자' },
                            { value: 'staff', label: '직원' },
                        ]}
                        value={newRole}
                        onChange={setNewRole}
                        required
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={closeAddModal}>취소</Button>
                        <Button onClick={handleAddAdmin} loading={addLoading}>추가</Button>
                    </Group>
                </Stack>
            </Modal>

            {/* 삭제 확인 모달 */}
            <Modal
                opened={deleteModalOpened}
                onClose={closeDeleteModal}
                title="계정 삭제 확인"
                centered
                size="sm"
            >
                <Stack gap="md">
                    <Text>
                        정말로 <strong>{userToDelete?.name || userToDelete?.email}</strong> 계정을 삭제하시겠습니까?
                    </Text>
                    <Text size="sm" c="red">
                        이 작업은 되돌릴 수 없습니다.
                    </Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={closeDeleteModal}>취소</Button>
                        <Button color="red" onClick={handleDeleteAdmin} loading={deleteLoading}>삭제</Button>
                    </Group>
                </Stack>
            </Modal>

            {/* 메세지 미리보기 모달 */}
            <Modal
                opened={previewModalOpened}
                onClose={closePreviewModal}
                title={previewType ? `${getTemplateByType(previewType)?.name} 미리보기` : '메세지 미리보기'}
                centered
                size="lg"
            >
                {previewType && (() => {
                    const template = getTemplateByType(previewType);
                    if (!template) return null;

                    return (
                        <Stack gap="lg">
                            {/* 앱 푸시 미리보기 */}
                            <div>
                                <Group gap="xs" mb="sm">
                                    <Bell size={16} />
                                    <Text fw={500}>앱 푸시</Text>
                                    <Badge size="sm" color="gray">짧은 형식</Badge>
                                </Group>
                                <Card withBorder radius="md" p="md" bg="gray.9">
                                    <Text size="sm" fw={600} c="white">{template.push.title.replace('{hospital_name}', '○○병원')}</Text>
                                    <Text size="sm" c="dimmed" mt={4}>{template.push.body}</Text>
                                </Card>
                            </div>

                            <Divider />

                            {/* 카카오 알림톡 미리보기 */}
                            <div>
                                <Group gap="xs" mb="sm">
                                    <Send size={16} />
                                    <Text fw={500}>카카오 알림톡</Text>
                                    <Badge size="sm" color="yellow">긴 형식</Badge>
                                </Group>
                                <Card withBorder radius="md" p="md" style={{ backgroundColor: '#FEE500', color: '#000' }}>
                                    <Text size="sm" fw={600}>{template.kakao.title.replace('{hospital_name}', '○○병원')}</Text>
                                    <Text size="sm" mt="md" style={{ whiteSpace: 'pre-line' }}>
                                        {template.kakao.body
                                            .replace('{hospital_name}', '○○병원')
                                            .replace('{appointment_datetime}', '2024년 1월 15일 오후 2:00')
                                            .replace('{department}', '내과')
                                            .replace('{link}', 'https://example.com')
                                        }
                                    </Text>
                                    <Divider my="md" color="dark" />
                                    <Stack gap="xs">
                                        {template.kakao.buttons.map((btn, idx) => (
                                            <Button
                                                key={idx}
                                                variant="filled"
                                                color="dark"
                                                size="sm"
                                                fullWidth
                                            >
                                                {btn.label}
                                            </Button>
                                        ))}
                                    </Stack>
                                </Card>
                            </div>

                            <Alert color="gray" mt="sm">
                                <Text size="xs" c="dimmed">
                                    실제 발송 시 {'{환자명}'}, {'{예약일시}'} 등의 변수가 실제 정보로 치환됩니다.
                                </Text>
                            </Alert>
                        </Stack>
                    );
                })()}
            </Modal>
        </Container>
    );
}
