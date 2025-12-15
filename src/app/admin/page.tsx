
"use client";

import { useState, useEffect } from "react";
import { Search, X, MessageSquare, CheckCircle2, Clock, User, Calendar } from "lucide-react";
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
    rem
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export default function DoctorDashboard() {
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
            setPatients(data || []);
        }
    };

    const handleStatusClick = async (patient: Patient) => {
        if (patient.status === "completed") {
            setSelectedPatient(patient);
            openReservation();
        } else {
            // Toggle status logic (optional, or just for demo)
            // For now, let's just mark as completed if pending
            const newStatus = "completed";
            const { error } = await supabase
                .from('patients')
                .update({ status: newStatus })
                .eq('id', patient.id);

            if (!error) {
                fetchPatients(); // Refresh data
            }
        }
    };

    const handleComplaintClick = (patient: Patient) => {
        setSelectedPatient(patient);
        openChat();
    };

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="flex-end">
                <div>
                    <Title order={1} size="h2" c="sage-green.9" ff="heading">진료 대시보드</Title>
                    <Text c="dimmed" size="sm">오늘의 예약 환자 및 진료 현황을 관리합니다.</Text>
                </div>
                <Badge
                    variant="light"
                    color="green"
                    size="lg"
                    leftSection={<Box w={8} h={8} bg="green" style={{ borderRadius: '50%' }} />}
                >
                    실시간 연동 중
                </Badge>
            </Group>

            {/* Top Filters & Search */}
            <Paper p="md" radius="lg" withBorder bg="white">
                <Group justify="space-between">
                    <Group gap="xs">
                        <Button variant="filled" color="sage-green" radius="xl" size="sm">오늘</Button>
                        <Divider orientation="vertical" />
                        {filters.map((filter) => (
                            <Button
                                key={filter}
                                variant={activeFilter === filter ? "light" : "subtle"}
                                color="sage-green"
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
                    />
                </Group>
            </Paper>

            {/* Patient Table */}
            <Paper radius="xl" withBorder style={{ overflow: 'hidden' }} shadow="sm">
                <Table verticalSpacing="md" highlightOnHover>
                    <Table.Thead bg="gray.0">
                        <Table.Tr>
                            <Table.Th>시간</Table.Th>
                            <Table.Th>환자 정보</Table.Th>
                            <Table.Th>주호소 (AI 요약)</Table.Th>
                            <Table.Th>분석 키워드</Table.Th>
                            <Table.Th>상태</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {patients.length === 0 ? (
                            <Table.Tr>
                                <Table.Td colSpan={5}>
                                    <Stack align="center" py={60} c="dimmed">
                                        <Calendar size={40} />
                                        <Text>예약된 환자가 없습니다.</Text>
                                    </Stack>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            patients.map((patient) => (
                                <Table.Tr key={patient.id}>
                                    <Table.Td>
                                        <Text fw={500} ff="monospace">{patient.time}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="sm">
                                            <Avatar radius="xl" color="gray">
                                                <User size={18} />
                                            </Avatar>
                                            <div>
                                                <Group gap="xs">
                                                    <Text fw={700}>{patient.name}</Text>
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
                                            color="dark"
                                            size="sm"
                                            justify="flex-start"
                                            leftSection={<MessageSquare size={16} className="mantine-rotate-rtl" />}
                                            onClick={() => handleComplaintClick(patient)}
                                            styles={{ label: { fontWeight: 400 } }}
                                        >
                                            {patient.complaint}
                                        </Button>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap={4}>
                                            {patient.keywords.map((keyword, idx) => (
                                                <Badge key={idx} variant="outline" color="gray" size="sm" fw={500}>
                                                    #{keyword}
                                                </Badge>
                                            ))}
                                        </Group>
                                    </Table.Td>
                                    <Table.Td>
                                        <Button
                                            variant={patient.status === 'completed' ? 'light' : patient.status === 'cancelled' ? 'light' : 'default'}
                                            color={patient.status === 'completed' ? 'sage-green' : patient.status === 'cancelled' ? 'red' : 'gray'}
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

            {/* Chat History Modal */}
            <Modal
                opened={openedChat}
                onClose={closeChat}
                title={
                    <Group>
                        <ThemeIcon variant="light" color="sage-green" size="lg" radius="md">
                            <MessageSquare size={20} />
                        </ThemeIcon>
                        <div>
                            <Text fw={700}>AI 사전 문진 내역</Text>
                            <Text size="xs" c="dimmed">환자: {selectedPatient?.name}</Text>
                        </div>
                    </Group>
                }
                size="lg"
                radius="lg"
                centered
            >
                <Paper bg="gray.0" p="md" radius="md" h={400} withBorder>
                    <ScrollArea h="100%">
                        <Stack gap="md">
                            <Group align="flex-start" gap="sm">
                                <Avatar color="sage-green" radius="xl">AI</Avatar>
                                <Paper p="sm" radius="md" bg="white" shadow="xs" style={{ borderTopLeftRadius: 0 }}>
                                    <Text size="sm">안녕하세요, {selectedPatient?.name}님. 오늘 어떤 불편함 때문에 내원하셨나요?</Text>
                                </Paper>
                            </Group>
                            <Group align="flex-start" justify="flex-end" gap="sm">
                                <Paper p="sm" radius="md" bg="sage-green.1" style={{ borderTopRightRadius: 0 }}>
                                    <Text size="sm">{selectedPatient?.complaint}</Text>
                                </Paper>
                                <Avatar color="gray" radius="xl">나</Avatar>
                            </Group>
                            <Group align="flex-start" gap="sm">
                                <Avatar color="sage-green" radius="xl">AI</Avatar>
                                <Paper p="sm" radius="md" bg="white" shadow="xs" style={{ borderTopLeftRadius: 0 }}>
                                    <Text size="sm">증상이 언제부터 시작되었나요? 통증의 정도는 어떠신가요?</Text>
                                </Paper>
                            </Group>
                        </Stack>
                    </ScrollArea>
                </Paper>
                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={closeChat}>닫기</Button>
                </Group>
            </Modal>

            {/* Reservation Confirmation Modal */}
            <Modal
                opened={openedReservation}
                onClose={closeReservation}
                title={<Text fw={700}>예약 상세 정보</Text>}
                centered
                radius="lg"
            >
                <Stack align="center" gap="md" py="lg">
                    <ThemeIcon size={80} radius="xl" color="green" variant="light">
                        <CheckCircle2 size={40} />
                    </ThemeIcon>
                    <div style={{ textAlign: 'center' }}>
                        <Title order={3}>{selectedPatient?.name}님</Title>
                        <Text c="dimmed" size="sm">진료 예약이 확정되었습니다.</Text>
                    </div>

                    <Paper withBorder p="md" radius="md" w="100%" bg="gray.0">
                        <Stack gap="sm">
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">날짜</Text>
                                <Text fw={500}>2025년 12월 08일 (금)</Text>
                            </Group>
                            <Divider />
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">시간</Text>
                                <Text fw={700} c="sage-green.9" size="lg">{selectedPatient?.time}</Text>
                            </Group>
                            <Divider />
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">진료 유형</Text>
                                <Badge variant="default">{selectedPatient?.type}</Badge>
                            </Group>
                        </Stack>
                    </Paper>

                    <Button fullWidth color="sage-green" size="lg" onClick={closeReservation}>
                        확인 완료
                    </Button>
                </Stack>
            </Modal>
        </Stack>
    );
}
