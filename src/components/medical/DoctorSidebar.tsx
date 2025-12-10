"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Search, Bell, Video, LogOut } from "lucide-react";
import { Stack, NavLink, Group, Text, ThemeIcon, Button, Divider, Box } from "@mantine/core";

export default function DoctorSidebar() {
    const pathname = usePathname();

    const menuItems = [
        { icon: Calendar, label: "오늘 환자", href: "/medical/dashboard" },
        { icon: Search, label: "환자 검색", href: "/medical/dashboard/search" },
        { icon: Bell, label: "알림/리마인드", href: "/medical/dashboard/notifications" },
        { icon: Video, label: "영상분석", href: "/medical/dashboard/video-analysis" },
    ];

    return (
        <Stack h="100%" justify="space-between">
            <Box>
                {/* Header */}
                <Box p="md" mb="md">
                    <Group gap="xs" mb={4}>
                        <ThemeIcon size="lg" radius="xl" color="sage-green" variant="filled">
                            <Text fw={700} size="sm">J</Text>
                        </ThemeIcon>
                        <Text fw={700} size="lg" c="dark.9">한의원</Text>
                    </Group>
                    <Text size="xs" c="sage-green.7" fw={500} pl={42}>Doctor Dashboard</Text>
                </Box>

                {/* Menu */}
                <Stack gap={4}>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <NavLink
                                key={item.href}
                                component={Link}
                                href={item.href}
                                label={item.label}
                                leftSection={<item.icon size={20} />}
                                active={isActive}
                                color="sage-green"
                                variant="light"
                                style={{ borderRadius: 'var(--mantine-radius-md)' }}
                            />
                        );
                    })}
                </Stack>
            </Box>

            {/* Footer */}
            <Box>
                <Divider mb="md" />
                <Button
                    variant="subtle"
                    color="gray"
                    fullWidth
                    justify="flex-start"
                    leftSection={<LogOut size={20} />}
                >
                    로그아웃
                </Button>
            </Box>
        </Stack>
    );
}
