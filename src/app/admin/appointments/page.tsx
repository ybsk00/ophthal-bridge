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
    TextInput,
    Select,
    Alert,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks'
import { X, MessageSquare, User, Bot, CalendarPlus, CheckCircle, AlertCircle } from 'lucide-react'

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

    // 예약 생성 모달
    const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false)
    const [createLoading, setCreateLoading] = useState(false)
    const [patients, setPatients] = useState<{ value: string; label: string }[]>([])
    const [newAppointment, setNewAppointment] = useState({
        patientId: '',
        scheduledDate: null as Date | null,
        scheduledTime: '',
        department: '',
        memo: ''
    })
    const [createError, setCreateError] = useState<string | null>(null)
    const [createSuccess, setCreateSuccess] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        fetchAppointments()
        fetchPatients()
    }, [])

    const fetchPatients = async () => {
        const { data } = await supabase
            .from('patients')
            .select('id, name, phone')
            .order('name')

        if (data) {
            setPatients(data.map(p => ({
                value: String(p.id),
                label: `${p.name} (${p.phone || '연락처 없음'})`
            })))
        }
    }

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

    const handleCreateAppointment = async () => {
        if (!newAppointment.patientId || !newAppointment.scheduledDate || !newAppointment.scheduledTime) {
            setCreateError('환자와 예약 일시를 선택해주세요.')
            return
        }

        // 날짜와 시간 결합
        const [hours, minutes] = newAppointment.scheduledTime.split(':').map(Number)
        const scheduledDate = new Date(newAppointment.scheduledDate)
        scheduledDate.setHours(hours, minutes, 0, 0)

        setCreateLoading(true)
        setCreateError(null)

        try {
            // 1. Create appointment slot if department is selected (optional logic, simplified for now)
            // For now, we just insert into appointments directly. 
            // If we need slots, we would create one or find one. 
            // Let's assume we just store the department in a slot for now or just skip slot logic if not strictly needed by schema constraints.
            // The schema has slot_id, but it's nullable. We can create a slot if we want to track department.

            let slotId = null
            if (newAppointment.department) {
                const { data: slot, error: slotError } = await supabase
                    .from('appointment_slots')
                    .insert({
                        department: newAppointment.department,
                        starts_at: scheduledDate.toISOString(),
                        ends_at: new Date(scheduledDate.getTime() + 30 * 60000).toISOString() // 30 min duration
                    })
                    .select()
                    .single()

                if (slotError) throw slotError
                slotId = slot.id
            }

            const appointmentData = {
                patient_id: newAppointment.patientId,
                scheduled_at: scheduledDate.toISOString(),
                status: 'scheduled',
                slot_id: slotId
            }

            const { error } = await supabase
                .from('appointments')
                .insert(appointmentData)

            if (error) throw error

            setCreateSuccess('예약이 생성되었습니다.')
            fetchAppointments()
            setTimeout(() => {
                closeCreate()
                setNewAppointment({ patientId: '', scheduledDate: null, scheduledTime: '', department: '', memo: '' })
                setCreateSuccess(null)
            }, 1500)
        } catch (err: any) {
            console.error('Error creating appointment:', err)
            setCreateError(err.message || '예약 생성 중 오류가 발생했습니다.')
        } finally {
            setCreateLoading(false)
        }
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
                <Button leftSection={<CalendarPlus size={16} />} onClick={openCreate}>
                    예약 생성
                </Button>
            </Group>

            <Paper shadow="sm" radius="md" bg="dark.7" withBorder style={{ borderColor: 'var(--mantine-color-dark-5)', overflow: 'hidden' }}>
                <Table highlightOnHover highlightOnHoverColor="dark.6">
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
                                <Table.Td colSpan={6} bg="dark.8">
                                    <Text ta="center" c="dimmed" py="xl">예약 내역이 없습니다.</Text>
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


            {/* 예약 생성 모달 */}
            <Modal
                opened={createOpened}
                onClose={closeCreate}
                title="새 예약 생성"
                centered
                styles={{
                    header: { backgroundColor: 'var(--mantine-color-dark-7)' },
                    content: { backgroundColor: 'var(--mantine-color-dark-7)' },
                    title: { color: 'white' }
                }}
            >
                <Stack gap="md">
                    {createError && (
                        <Alert color="red" icon={<AlertCircle size={16} />} withCloseButton onClose={() => setCreateError(null)}>
                            {createError}
                        </Alert>
                    )}
                    {createSuccess && (
                        <Alert color="green" icon={<CheckCircle size={16} />} withCloseButton onClose={() => setCreateSuccess(null)}>
                            {createSuccess}
                        </Alert>
                    )}

                    <Select
                        label="환자 선택"
                        placeholder="환자를 선택하세요"
                        data={patients}
                        searchable
                        nothingFoundMessage="환자를 찾을 수 없습니다"
                        value={newAppointment.patientId}
                        onChange={(val) => setNewAppointment(prev => ({ ...prev, patientId: val || '' }))}
                        required
                    />

                    <DatePickerInput
                        label="예약 날짜"
                        placeholder="날짜를 선택하세요"
                        value={newAppointment.scheduledDate}
                        onChange={(date) => setNewAppointment(prev => ({ ...prev, scheduledDate: date as Date | null }))}
                        required
                        minDate={new Date()}
                    />

                    <Select
                        label="예약 시간"
                        placeholder="시간을 선택하세요"
                        data={[
                            { value: '09:00', label: '오전 09:00' },
                            { value: '09:10', label: '오전 09:10' },
                            { value: '09:20', label: '오전 09:20' },
                            { value: '09:30', label: '오전 09:30' },
                            { value: '09:40', label: '오전 09:40' },
                            { value: '09:50', label: '오전 09:50' },
                            { value: '10:00', label: '오전 10:00' },
                            { value: '10:10', label: '오전 10:10' },
                            { value: '10:20', label: '오전 10:20' },
                            { value: '10:30', label: '오전 10:30' },
                            { value: '10:40', label: '오전 10:40' },
                            { value: '10:50', label: '오전 10:50' },
                            { value: '11:00', label: '오전 11:00' },
                            { value: '11:10', label: '오전 11:10' },
                            { value: '11:20', label: '오전 11:20' },
                            { value: '11:30', label: '오전 11:30' },
                            { value: '11:40', label: '오전 11:40' },
                            { value: '11:50', label: '오전 11:50' },
                            { value: '12:00', label: '오후 12:00' },
                            { value: '12:10', label: '오후 12:10' },
                            { value: '12:20', label: '오후 12:20' },
                            { value: '12:30', label: '오후 12:30' },
                            { value: '12:40', label: '오후 12:40' },
                            { value: '12:50', label: '오후 12:50' },
                            { value: '13:00', label: '오후 01:00' },
                            { value: '13:10', label: '오후 01:10' },
                            { value: '13:20', label: '오후 01:20' },
                            { value: '13:30', label: '오후 01:30' },
                            { value: '13:40', label: '오후 01:40' },
                            { value: '13:50', label: '오후 01:50' },
                            { value: '14:00', label: '오후 02:00' },
                            { value: '14:10', label: '오후 02:10' },
                            { value: '14:20', label: '오후 02:20' },
                            { value: '14:30', label: '오후 02:30' },
                            { value: '14:40', label: '오후 02:40' },
                            { value: '14:50', label: '오후 02:50' },
                            { value: '15:00', label: '오후 03:00' },
                            { value: '15:10', label: '오후 03:10' },
                            { value: '15:20', label: '오후 03:20' },
                            { value: '15:30', label: '오후 03:30' },
                            { value: '15:40', label: '오후 03:40' },
                            { value: '15:50', label: '오후 03:50' },
                            { value: '16:00', label: '오후 04:00' },
                            { value: '16:10', label: '오후 04:10' },
                            { value: '16:20', label: '오후 04:20' },
                            { value: '16:30', label: '오후 04:30' },
                            { value: '16:40', label: '오후 04:40' },
                            { value: '16:50', label: '오후 04:50' },
                            { value: '17:00', label: '오후 05:00' },
                            { value: '17:10', label: '오후 05:10' },
                            { value: '17:20', label: '오후 05:20' },
                            { value: '17:30', label: '오후 05:30' },
                            { value: '17:40', label: '오후 05:40' },
                            { value: '17:50', label: '오후 05:50' },
                            { value: '18:00', label: '오후 06:00' },
                        ]}
                        value={newAppointment.scheduledTime}
                        onChange={(val) => setNewAppointment(prev => ({ ...prev, scheduledTime: val || '' }))}
                        searchable
                        required
                    />

                    <Select
                        label="진료과"
                        placeholder="진료과 선택"
                        data={[
                            { value: '일반진료', label: '일반진료' },
                            { value: '침구과', label: '침구과' },
                            { value: '한방내과', label: '한방내과' },
                            { value: '재활의학과', label: '재활의학과' },
                            { value: '여성클리닉', label: '여성클리닉' },
                            { value: '성장클리닉', label: '성장클리닉' },
                        ]}
                        value={newAppointment.department}
                        onChange={(val) => setNewAppointment(prev => ({ ...prev, department: val || '' }))}
                    />

                    <TextInput
                        label="메모"
                        placeholder="예약 관련 메모"
                        value={newAppointment.memo}
                        onChange={(e) => setNewAppointment(prev => ({ ...prev, memo: e.target.value }))}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={closeCreate}>취소</Button>
                        <Button onClick={handleCreateAppointment} loading={createLoading}>예약 생성</Button>
                    </Group>
                </Stack>
            </Modal>
        </Container >
    )
}
