
"use client";

import { useState, useEffect } from "react";
import { Search, X, MessageSquare, CheckCircle2, Clock, User, Calendar, Users, CalendarDays, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
    Title,
    Text,
    Group,
    Button,
    TextInput,
    Table,
    Badge,
    Modal,
    Stack,
    Paper,
    ActionIcon,
    Avatar,
    ScrollArea,
    ThemeIcon,
    Divider,
    Box,
    SimpleGrid,
    Card,
    rem
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export default function AdminDashboard() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("전체");
    const supabase = createClient();

    // Define Patient type
    type Patient = {
        id: number;
        time: string;
        name: string;
        type: string;
        complaint: string;
        keywords: string[];
        status: "completed" | "pending" | "cancelled";
    };

    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [openedChat, { open: openChat, close: closeChat }] = useDisclosure(false);
    const [openedReservation, { open: openReservation, close: closeReservation }] = useDisclosure(false);
    const [stats, setStats] = useState({ todayAppointments: 0, waitingPatients: 0, newPatients: 0 });

    const filters = ["전체", "대기", "완료"];

    useEffect(() => {
        fetchPatients();

        // Realtime subscription
        const channel = supabase
            .channel('patients-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'patients'
                },
                (payload) => {
                    console.log('Change received!', payload);
                    fetchPatients();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchPatients = async () => {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .order('time', { ascending: true });

        if (error) {
            console.error('Error fetching patients:', error);
        } else {
            const patientData = data || [];
            setPatients(patientData);

            // Calculate stats
            const today = new Date().toISOString().split('T')[0];
            const todayPatients = patientData.filter(p => p.time?.startsWith(today) || true); // assuming all are today for now
            setStats({
                todayAppointments: todayPatients.length,
                waitingPatients: patientData.filter(p => p.status === 'pending').length,
                newPatients: patientData.filter(p => p.type === '초진').length
            });
        }
    };

    const handleStatusClick = async (patient: Patient) => {
        if (patient.status === "completed") {
            setSelectedPatient(patient);
            openReservation();
        } else {
            const newStatus = "completed";
            const { error } = await supabase
                .from('patients')
                .update({ status: newStatus })
                .eq('id', patient.id);

            if (!error) {
                fetchPatients();
            }
        }
    };

    const handleComplaintClick = (patient: Patient) => {
        setSelectedPatient(patient);
        openChat();
    };

    return (
        <Stack gap="lg">
            {/* Stats Cards - Dark Theme */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                <Card radius="lg" p="lg" bg="dark.7" withBorder style={{ borderColor: 'var(--mantine-color-dark-5)' }}>
                    <Group justify="space-between">
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>오늘 예약</Text>
                            <Title order={2} c="white" mt={4}>{stats.todayAppointments}</Title>
                        </div>
                        <ThemeIcon size={48} radius="md" variant="light" color="blue">
                            <CalendarDays size={24} />
                        </ThemeIcon>
                    </Group>
                </Card>
                <Card radius="lg" p="lg" bg="dark.7" withBorder style={{ borderColor: 'var(--mantine-color-dark-5)' }}>
                    <Group justify="space-between">
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>대기 환자</Text>
                            <Title order={2} c="white" mt={4}>{stats.waitingPatients}</Title>
                        </div>
                        <ThemeIcon size={48} radius="md" variant="light" color="orange">
                            <Users size={24} />
                        </ThemeIcon>
                    </Group>
                </Card>
                <Card radius="lg" p="lg" bg="dark.7" withBorder style={{ borderColor: 'var(--mantine-color-dark-5)' }}>
                    <Group justify="space-between">
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>신규 환자</Text>
                            <Title order={2} c="white" mt={4}>{stats.newPatients}</Title>
                        </div>
                        <ThemeIcon size={48} radius="md" variant="light" color="teal">
                            <UserPlus size={24} />
                        </ThemeIcon>
                    </Group>
                </Card>
            </SimpleGrid>

            {/* Header */}
            <Group justify="space-between" align="flex-end">
                <div>
                    <Title order={2} c="white" ff="heading">대시보드</Title>
                    <Text c="dimmed" size="sm">오늘의 예약 환자 및 진료 현황을 관리합니다.</Text>
                </div>
            </Group>

            {/* Top Filters & Search - Dark Theme */}
            <Paper p="md" radius="lg" bg="dark.7" withBorder style={{ borderColor: 'var(--mantine-color-dark-5)' }}>
                <Group justify="space-between">
                    <Group gap="xs">
                        <Button variant="filled" color="orange" radius="xl" size="sm">오늘</Button>
                        <Divider orientation="vertical" color="dark.5" />
                        {filters.map((filter) => (
                            <Button
                                key={filter}
                                variant={activeFilter === filter ? "light" : "subtle"}
                                color={activeFilter === filter ? "orange" : "gray"}
                                radius="xl"
                                size="sm"
                                onClick={() => setActiveFilter(filter === activeFilter ? "" : filter)}
                                rightSection={activeFilter === filter && <X size={14} />}
                            >
                                {filter}
                            </Button>
                        ))}
                    </Group>
                    <TextInput
                        placeholder="환자 이름 또는 키워드 검색"
                        leftSection={<Search size={16} />}
                        radius="xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.currentTarget.value)}
                        w={300}
                        styles={{
                            input: {
                                backgroundColor: 'var(--mantine-color-dark-6)',
                                borderColor: 'var(--mantine-color-dark-4)',
                                color: 'white',
                                '&::placeholder': { color: 'var(--mantine-color-dimmed)' }
                            }
                        }}
                    />
                </Group>
            </Paper>

            {/* Patient Table - Dark Theme */}
            <Paper radius="lg" bg="dark.7" withBorder style={{ overflow: 'hidden', borderColor: 'var(--mantine-color-dark-5)' }}>
                <Table verticalSpacing="md" highlightOnHover highlightOnHoverColor="dark.6">
                    <Table.Thead bg="dark.8">
                        <Table.Tr>
                            <Table.Th c="dimmed">시간</Table.Th>
                            <Table.Th c="dimmed">환자 정보</Table.Th>
                            <Table.Th c="dimmed">주호소 (AI 요약)</Table.Th>
                            <Table.Th c="dimmed">분석 키워드</Table.Th>
                            <Table.Th c="dimmed">상태</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {(() => {
                            // 필터링 로직
                            let filteredPatients = patients

                            // 상태 필터링
                            if (activeFilter === "대기") {
                                filteredPatients = filteredPatients.filter(p => p.status === "pending")
                            } else if (activeFilter === "완료") {
                                filteredPatients = filteredPatients.filter(p => p.status === "completed")
                            }
                            // "전체"는 필터링 없이 모두 표시

                            // 검색어 필터링
                            if (searchTerm) {
                                filteredPatients = filteredPatients.filter(p =>
                                    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    p.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                    p.complaint?.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                            }

                            if (filteredPatients.length === 0) {
                                return (
                                    <Table.Tr>
                                        <Table.Td colSpan={5}>
                                            <Stack align="center" py={60} c="dimmed">
                                                <Calendar size={40} />
                                                <Text>
                                                    {activeFilter === "완료" ? "완료된 환자가 없습니다." :
                                                        activeFilter === "대기" ? "대기 중인 환자가 없습니다." :
                                                            "예약된 환자가 없습니다."}
                                                </Text>
                                            </Stack>
                                        </Table.Td>
                                    </Table.Tr>
                                )
                            }

                            return filteredPatients.map((patient) => (
                                <Table.Tr key={patient.id}>
                                    <Table.Td>
                                        <Text fw={500} ff="monospace" c="white">{patient.time}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="sm">
                                            <Avatar radius="xl" color="gray">
                                                <User size={18} />
                                            </Avatar>
                                            <div>
                                                <Group gap="xs">
                                                    <Text fw={700} c="white">{patient.name}</Text>
                                                    <Badge
                                                        size="sm"
                                                        variant="light"
                                                        color={patient.type === '초진' ? 'green' : patient.type === '온라인' ? 'blue' : 'gray'}
                                                    >
                                                        {patient.type}
                                                    </Badge>
                                                </Group>
                                            </div>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td>
                                        <Button
                                            variant="subtle"
                                            color="gray"
                                            size="sm"
                                            justify="flex-start"
                                            leftSection={<MessageSquare size={16} />}
                                            onClick={() => handleComplaintClick(patient)}
                                            styles={{ label: { fontWeight: 400, color: 'var(--mantine-color-gray-4)' } }}
                                        >
                                            {patient.complaint}
                                        </Button>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap={4}>
                                            {(patient.keywords || []).map((keyword, idx) => (
                                                <Badge key={idx} variant="outline" color="gray" size="sm" fw={500}>
                                                    #{keyword}
                                                </Badge>
                                            ))}
                                        </Group>
                                    </Table.Td>
                                    <Table.Td>
                                        <Button
                                            variant={patient.status === 'completed' ? 'light' : patient.status === 'cancelled' ? 'light' : 'default'}
                                            color={patient.status === 'completed' ? 'teal' : patient.status === 'cancelled' ? 'red' : 'gray'}
                                            radius="xl"
                                            size="xs"
                                            leftSection={
                                                patient.status === 'completed' ? <CheckCircle2 size={14} /> :
                                                    patient.status === 'cancelled' ? <X size={14} /> :
                                                        <Clock size={14} />
                                            }
                                            onClick={() => handleStatusClick(patient)}
                                        >
                                            {patient.status === 'completed' ? '진료 완료' :
                                                patient.status === 'cancelled' ? '예약 취소' :
                                                    '진료 대기'}
                                        </Button>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        )}
                    </Table.Tbody>
                </Table>
            </Paper>

            {/* Chat History Modal - Dark Theme */}
            <Modal
                opened={openedChat}
                onClose={closeChat}
                title={
                    <Group>
                        <ThemeIcon variant="light" color="orange" size="lg" radius="md">
                            <MessageSquare size={20} />
                        </ThemeIcon>
                        <div>
                            <Text fw={700} c="white">AI 사전 문진 내역</Text>
                            <Text size="xs" c="dimmed">환자: {selectedPatient?.name}</Text>
                        </div>
                    </Group>
                }
                size="lg"
                radius="lg"
                centered
                styles={{
                    header: { backgroundColor: 'var(--mantine-color-dark-7)' },
                    content: { backgroundColor: 'var(--mantine-color-dark-7)' }
                }}
            >
                <Paper bg="dark.8" p="md" radius="md" h={400} withBorder style={{ borderColor: 'var(--mantine-color-dark-5)' }}>
                    <ScrollArea h="100%">
                        <Stack gap="md">
                            <Group align="flex-start" gap="sm">
                                <Avatar color="orange" radius="xl">AI</Avatar>
                                <Paper p="sm" radius="md" bg="dark.6" style={{ borderTopLeftRadius: 0 }}>
                                    <Text size="sm" c="white">안녕하세요, {selectedPatient?.name}님. 오늘 어떤 불편함 때문에 내원하셨나요?</Text>
                                </Paper>
                            </Group>
                            <Group align="flex-start" justify="flex-end" gap="sm">
                                <Paper p="sm" radius="md" bg="orange.9" style={{ borderTopRightRadius: 0 }}>
                                    <Text size="sm" c="white">{selectedPatient?.complaint}</Text>
                                </Paper>
                                <Avatar color="gray" radius="xl">나</Avatar>
                            </Group>
                            <Group align="flex-start" gap="sm">
                                <Avatar color="orange" radius="xl">AI</Avatar>
                                <Paper p="sm" radius="md" bg="dark.6" style={{ borderTopLeftRadius: 0 }}>
                                    <Text size="sm" c="white">증상이 언제부터 시작되었나요? 통증의 정도는 어떠신가요?</Text>
                                </Paper>
                            </Group>
                        </Stack>
                    </ScrollArea>
                </Paper>
                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={closeChat}>닫기</Button>
                </Group>
            </Modal>

            {/* Reservation Confirmation Modal - Dark Theme */}
            <Modal
                opened={openedReservation}
                onClose={closeReservation}
                title={<Text fw={700} c="white">예약 상세 정보</Text>}
                centered
                radius="lg"
                styles={{
                    header: { backgroundColor: 'var(--mantine-color-dark-7)' },
                    content: { backgroundColor: 'var(--mantine-color-dark-7)' }
                }}
            >
                <Stack align="center" gap="md" py="lg">
                    <ThemeIcon size={80} radius="xl" color="teal" variant="light">
                        <CheckCircle2 size={40} />
                    </ThemeIcon>
                    <div style={{ textAlign: 'center' }}>
                        <Title order={3} c="white">{selectedPatient?.name}님</Title>
                        <Text c="dimmed" size="sm">진료 예약이 확정되었습니다.</Text>
                    </div>

                    <Paper p="md" radius="md" w="100%" bg="dark.8" withBorder style={{ borderColor: 'var(--mantine-color-dark-5)' }}>
                        <Stack gap="sm">
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">날짜</Text>
                                <Text fw={500} c="white">2025년 12월 08일 (금)</Text>
                            </Group>
                            <Divider color="dark.5" />
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">시간</Text>
                                <Text fw={700} c="orange" size="lg">{selectedPatient?.time}</Text>
                            </Group>
                            <Divider color="dark.5" />
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">진료 유형</Text>
                                <Badge variant="light" color="gray">{selectedPatient?.type}</Badge>
                            </Group>
                        </Stack>
                    </Paper>

                    <Button fullWidth color="orange" size="lg" onClick={closeReservation}>
                        확인 완료
                    </Button>
                </Stack>
            </Modal>
        </Stack>
    );
}
