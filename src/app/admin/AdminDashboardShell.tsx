'use client';

import { AppShell, Burger, Group, NavLink, Text, Button, Stack, ThemeIcon, Badge, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    Home,
    Users,
    Calendar,
    MessageSquare,
    Settings,
    LogOut,
    Stethoscope,
    ClipboardList,
    Building2,
    UserPlus,
    Bell,
    Send,
    TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminDashboardShell({ children }: { children: React.ReactNode }) {
    const [opened, { toggle }] = useDisclosure();
    const pathname = usePathname();

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 280,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
            styles={{
                main: {
                    backgroundColor: 'var(--mantine-color-dark-8)',
                },
            }}
        >
            <AppShell.Header bg="dark.9" style={{ borderBottom: '1px solid var(--mantine-color-dark-5)' }}>
                <Group h="100%" px="md" justify="space-between">
                    <Group gap="xs">
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="white" />
                        <ThemeIcon variant="gradient" gradient={{ from: 'orange', to: 'yellow' }} size="lg" radius="md">
                            <Stethoscope size={20} />
                        </ThemeIcon>
                        <Text fw={700} size="xl" c="white">리원피부과 CRM</Text>
                    </Group>
                    <Badge variant="light" color="green" size="lg">
                        실시간 연동 중
                    </Badge>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md" bg="dark.9" style={{ borderRight: '1px solid var(--mantine-color-dark-5)' }}>
                <Stack gap="xs" style={{ flex: 1 }}>
                    {/* 진료 관리 섹션 */}
                    <Text size="xs" fw={500} c="dimmed" mt="sm">진료 관리</Text>

                    <Link href="/admin" style={{ textDecoration: 'none' }}>
                        <NavLink
                            label="진료 대시보드"
                            description="오늘 예약 환자 현황"
                            leftSection={<Home size={16} />}
                            active={pathname === '/admin'}
                            variant="filled"
                            color="orange"
                            styles={{
                                root: { borderRadius: 8 },
                                label: { color: pathname === '/admin' ? 'white' : 'var(--mantine-color-gray-4)' },
                                description: { color: 'var(--mantine-color-dimmed)' }
                            }}
                        />
                    </Link>
                    <Link href="/admin/appointments" style={{ textDecoration: 'none' }}>
                        <NavLink
                            label="예약 관리"
                            description="일정 및 예약 확인"
                            leftSection={<Calendar size={16} />}
                            active={pathname === '/admin/appointments'}
                            variant="filled"
                            color="orange"
                            styles={{
                                root: { borderRadius: 8 },
                                label: { color: pathname === '/admin/appointments' ? 'white' : 'var(--mantine-color-gray-4)' },
                                description: { color: 'var(--mantine-color-dimmed)' }
                            }}
                        />
                    </Link>

                    <Divider my="sm" color="dark.5" />

                    {/* CRM 관리 섹션 */}
                    <Text size="xs" fw={500} c="dimmed">CRM 관리</Text>

                    <Link href="/admin/patients" style={{ textDecoration: 'none' }}>
                        <NavLink
                            label="환자 등록/관리"
                            description="오프라인 환자 등록 및 조회"
                            leftSection={<UserPlus size={16} />}
                            active={pathname === '/admin/patients'}
                            variant="filled"
                            color="orange"
                            styles={{
                                root: { borderRadius: 8 },
                                label: { color: pathname === '/admin/patients' ? 'white' : 'var(--mantine-color-gray-4)' },
                                description: { color: 'var(--mantine-color-dimmed)' }
                            }}
                        />
                    </Link>
                    <Link href="/admin/messages" style={{ textDecoration: 'none' }}>
                        <NavLink
                            label="메시지 전송"
                            description="앱 푸시/카카오 알림톡"
                            leftSection={<Send size={16} />}
                            active={pathname === '/admin/messages' || pathname.startsWith('/admin/messages/')}
                            variant="filled"
                            color="orange"
                            styles={{
                                root: { borderRadius: 8 },
                                label: { color: (pathname === '/admin/messages' || pathname.startsWith('/admin/messages/')) ? 'white' : 'var(--mantine-color-gray-4)' },
                                description: { color: 'var(--mantine-color-dimmed)' }
                            }}
                        />
                    </Link>
                    <Link href="/admin/settings" style={{ textDecoration: 'none' }}>
                        <NavLink
                            label="메시지 규칙 설정"
                            description="자동 발송 템플릿 관리"
                            leftSection={<Bell size={16} />}
                            active={pathname === '/admin/settings'}
                            variant="filled"
                            color="orange"
                            styles={{
                                root: { borderRadius: 8 },
                                label: { color: pathname === '/admin/settings' ? 'white' : 'var(--mantine-color-gray-4)' },
                                description: { color: 'var(--mantine-color-dimmed)' }
                            }}
                        />
                    </Link>

                    <Divider my="sm" color="dark.5" />

                    {/* 마케팅 */}
                    <Text size="xs" fw={500} c="dimmed">마케팅</Text>

                    <Link href="/admin/marketing" style={{ textDecoration: 'none' }}>
                        <NavLink
                            label="마케팅 트래킹"
                            description="UTM 생성 및 퍼널 분석"
                            leftSection={<TrendingUp size={16} />}
                            active={pathname === '/admin/marketing' || pathname.startsWith('/admin/marketing/')}
                            variant="filled"
                            color="orange"
                            styles={{
                                root: { borderRadius: 8 },
                                label: { color: (pathname === '/admin/marketing' || pathname.startsWith('/admin/marketing/')) ? 'white' : 'var(--mantine-color-gray-4)' },
                                description: { color: 'var(--mantine-color-dimmed)' }
                            }}
                        />
                    </Link>

                    <Divider my="sm" color="dark.5" />

                    {/* 시스템 설정 */}
                    <Text size="xs" fw={500} c="dimmed">시스템</Text>

                    <Link href="/admin/system" style={{ textDecoration: 'none' }}>
                        <NavLink
                            label="시스템 설정"
                            description="관리자 계정 및 설정"
                            leftSection={<Settings size={16} />}
                            active={pathname === '/admin/system'}
                            variant="filled"
                            color="orange"
                            styles={{
                                root: { borderRadius: 8 },
                                label: { color: pathname === '/admin/system' ? 'white' : 'var(--mantine-color-gray-4)' },
                                description: { color: 'var(--mantine-color-dimmed)' }
                            }}
                        />
                    </Link>
                </Stack>

                <form action="/auth/signout" method="post">
                    <Button
                        fullWidth
                        variant="light"
                        color="red"
                        leftSection={<LogOut size={16} />}
                        type="submit"
                    >
                        로그아웃
                    </Button>
                </form>
            </AppShell.Navbar>

            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    );
}
