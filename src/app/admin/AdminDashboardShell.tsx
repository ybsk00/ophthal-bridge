'use client';

import { AppShell, Burger, Group, NavLink, Text, Button, Stack, ThemeIcon, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Home, Users, Calendar, MessageSquare, Settings, LogOut, Stethoscope } from 'lucide-react';
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
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group gap="xs">
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <ThemeIcon variant="gradient" gradient={{ from: 'teal', to: 'cyan' }} size="lg" radius="md">
                            <Stethoscope size={20} />
                        </ThemeIcon>
                        <Text fw={700} size="xl">죽전한의원 관리</Text>
                    </Group>
                    <Badge variant="light" color="green" size="lg">
                        실시간 연동 중
                    </Badge>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <Stack gap="xs" style={{ flex: 1 }}>
                    {/* 진료 관리 섹션 */}
                    <Text size="xs" fw={500} c="dimmed" mt="sm">진료 관리</Text>

                    <Link href="/admin" style={{ textDecoration: 'none' }}>
                        <NavLink
                            label="대시보드"
                            description="오늘 예약 환자 현황"
                            leftSection={<Home size={16} />}
                            active={pathname === '/admin'}
                            variant="filled"
                        />
                    </Link>
                    <Link href="/admin/appointments" style={{ textDecoration: 'none' }}>
                        <NavLink
                            label="예약 관리"
                            description="일정 및 예약 확인"
                            leftSection={<Calendar size={16} />}
                            active={pathname === '/admin/appointments'}
                            variant="filled"
                        />
                    </Link>

                    {/* CRM 관리 섹션 */}
                    <Text size="xs" fw={500} c="dimmed" mt="md">CRM 관리</Text>

                    <Link href="/admin/patients" style={{ textDecoration: 'none' }}>
                        <NavLink
                            label="환자 관리"
                            description="환자 등록 및 조회"
                            leftSection={<Users size={16} />}
                            active={pathname === '/admin/patients'}
                            variant="filled"
                        />
                    </Link>
                    <Link href="/admin/messages" style={{ textDecoration: 'none' }}>
                        <NavLink
                            label="메시지 센터"
                            description="알림톡/푸시 전송"
                            leftSection={<MessageSquare size={16} />}
                            active={pathname === '/admin/messages' || pathname.startsWith('/admin/messages/')}
                            variant="filled"
                        />
                    </Link>
                    <Link href="/admin/settings" style={{ textDecoration: 'none' }}>
                        <NavLink
                            label="설정"
                            description="메시지 템플릿 등"
                            leftSection={<Settings size={16} />}
                            active={pathname === '/admin/settings'}
                            variant="filled"
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

            <AppShell.Main bg="dark.8">
                {children}
            </AppShell.Main>
        </AppShell>
    );
}
