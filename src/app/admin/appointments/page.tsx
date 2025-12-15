'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
    Container,
    Title,
    Paper,
    Table,
    Badge,
    Button,
    Group,
    Text,
    Modal,
    Stack,
    Loader,
    Center,
    Box,
    ScrollArea,
    ActionIcon,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { X, MessageSquare, User, Bot, CalendarPlus } from 'lucide-react'

type Appointment = {
    id: string
    scheduled_at: string
    status: string
    patient_id: string
    patient: {
        id: string
        name: string
        phone: string
    } | null
    slot: {
        department: string
    } | null
}

type IntakeMessage = {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    created_at: string
}

type IntakeSession = {
    id: string
    status: string
    created_at: string
    messages: IntakeMessage[]
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null)
    const [chatSessions, setChatSessions] = useState<IntakeSession[]>([])
    const [loadingChat, setLoadingChat] = useState(false)
    const [opened, { open, close }] = useDisclosure(false)

    const supabase = createClient()

    useEffect(() => {
        fetchAppointments()
    }, [])

    const fetchAppointments = async () => {
        const { data } = await supabase
            .from('appointments')
            .select(`
                *,
                patient:patients(id, name, phone),
                slot:appointment_slots(department)
            `)
            .order('scheduled_at', { ascending: true })

        if (data) {
            setAppointments(data as Appointment[])
        }
        setLoading(false)
    }

    const handleViewChat = async (patientId: string, patientName: string) => {
        setSelectedPatient({ id: patientId, name: patientName })
        open()
        setLoadingChat(true)

        const { data: sessions } = await supabase
            .from('intake_sessions')
            .select(`
                id,
                status,
                created_at
            `)
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false })

        if (sessions && sessions.length > 0) {
            const sessionsWithMessages: IntakeSession[] = []
            for (const session of sessions) {
                const { data: messages } = await supabase
                    .from('intake_messages')
                    .select('*')
                    .eq('session_id', session.id)
                    .order('created_at', { ascending: true })

                sessionsWithMessages.push({
                    ...session,
                    messages: messages || []
                })
            }
            setChatSessions(sessionsWithMessages)
        } else {
            setChatSessions([])
        }

        setLoadingChat(false)
    }

    const closeModal = () => {
        close()
        setSelectedPatient(null)
        setChatSessions([])
    }

    function getStatusBadge(status: string) {
        switch (status) {
            case 'confirmed':
                return <Badge color="green">확정</Badge>
            case 'cancelled':
                return <Badge color="red">취소</Badge>
            case 'scheduled':
                return <Badge color="yellow">예약됨</Badge>
            default:
                return <Badge color="gray">{status}</Badge>
        }
    }

    if (loading) {
        return (
            <Center h={300}>
                <Loader color="blue" />
            </Center>
        )
    }

    return (
        <Container size="lg" py="lg">
            <Group justify="space-between" mb="lg">
                <Title order={2} c="white">예약 관리</Title>
                <Button leftSection={<CalendarPlus size={16} />}>
                    예약 생성
                </Button>
            </Group>

            <Paper shadow="sm" radius="md" withBorder bg="dark.6">
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>예약 일시</Table.Th>
                            <Table.Th>환자명</Table.Th>
                            <Table.Th>진료과</Table.Th>
                            <Table.Th>상태</Table.Th>
                            <Table.Th>문진 내역</Table.Th>
                            <Table.Th>관리</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {appointments.map((appt) => (
                            <Table.Tr key={appt.id}>
                                <Table.Td>
                                    <Text size="sm">
                                        {format(new Date(appt.scheduled_at), 'PPP p', { locale: ko })}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm" fw={500}>{appt.patient?.name}</Text>
                                    <Text size="xs" c="dimmed">{appt.patient?.phone}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm">{appt.slot?.department || '-'}</Text>
                                </Table.Td>
                                <Table.Td>
                                    {getStatusBadge(appt.status)}
                                </Table.Td>
                                <Table.Td>
                                    {appt.patient && (
                                        <Button
                                            variant="light"
                                            size="xs"
                                            leftSection={<MessageSquare size={14} />}
                                            onClick={() => handleViewChat(appt.patient!.id, appt.patient!.name)}
                                        >
                                            증상 보기
                                        </Button>
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    <Button variant="light" size="xs">
                                        관리
                                    </Button>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                        {!appointments.length && (
                            <Table.Tr>
                                <Table.Td colSpan={6}>
                                    <Text ta="center" c="dimmed" py="lg">예약 내역이 없습니다.</Text>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </Paper>

            {/* Chat History Modal */}
            <Modal
                opened={opened}
                onClose={closeModal}
                title={
                    <Group gap="xs">
                        <MessageSquare size={20} />
                        <Text fw={600}>{selectedPatient?.name} 환자 문진 기록</Text>
                    </Group>
                }
                size="lg"
                centered
            >
                {loadingChat ? (
                    <Center py="xl">
                        <Loader color="blue" />
                    </Center>
                ) : chatSessions.length === 0 ? (
                    <Center py="xl">
                        <Stack align="center" gap="xs">
                            <MessageSquare size={48} color="gray" />
                            <Text c="dimmed">문진 기록이 없습니다.</Text>
                        </Stack>
                    </Center>
                ) : (
                    <Stack gap="md">
                        {chatSessions.map((session, idx) => (
                            <Paper key={session.id} withBorder p="md" radius="md" bg="dark.7">
                                <Group justify="space-between" mb="sm">
                                    <Text size="sm" fw={500}>문진 #{chatSessions.length - idx}</Text>
                                    <Text size="xs" c="dimmed">
                                        {format(new Date(session.created_at), 'yyyy-MM-dd HH:mm')}
                                    </Text>
                                </Group>
                                <ScrollArea h={200}>
                                    <Stack gap="xs">
                                        {session.messages.map((msg) => (
                                            <Group
                                                key={msg.id}
                                                justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                                                gap="xs"
                                            >
                                                {msg.role === 'assistant' && (
                                                    <Box
                                                        w={28}
                                                        h={28}
                                                        style={{
                                                            borderRadius: '50%',
                                                            backgroundColor: 'var(--mantine-color-blue-6)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Bot size={14} color="white" />
                                                    </Box>
                                                )}
                                                <Paper
                                                    px="sm"
                                                    py="xs"
                                                    radius="md"
                                                    maw="80%"
                                                    bg={msg.role === 'user' ? 'blue.6' : 'dark.5'}
                                                >
                                                    <Text size="sm" c={msg.role === 'user' ? 'white' : undefined}>
                                                        {msg.content}
                                                    </Text>
                                                </Paper>
                                                {msg.role === 'user' && (
                                                    <Box
                                                        w={28}
                                                        h={28}
                                                        style={{
                                                            borderRadius: '50%',
                                                            backgroundColor: 'var(--mantine-color-gray-6)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <User size={14} color="white" />
                                                    </Box>
                                                )}
                                            </Group>
                                        ))}
                                        {session.messages.length === 0 && (
                                            <Text ta="center" c="dimmed" size="sm" py="md">
                                                채팅 내역이 없습니다.
                                            </Text>
                                        )}
                                    </Stack>
                                </ScrollArea>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Modal>
        </Container>
    )
}
