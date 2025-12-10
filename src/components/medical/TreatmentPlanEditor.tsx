"use client";

import { useState } from "react";
import { Save, Plus, Trash2, Calendar, Clock, FileText } from "lucide-react";
import {
    Paper,
    Group,
    Stack,
    Select,
    TextInput,
    Button,
    ActionIcon,
    Title,
    Text,
    Box,
    rem
} from "@mantine/core";

type TreatmentItem = {
    id: string;
    type: "침치료" | "약침" | "한약" | "물리치료" | "생활관리";
    description: string;
    frequency: string; // e.g., "주 2회", "매일"
    duration: string; // e.g., "4주", "3일"
};

export default function TreatmentPlanEditor() {
    const [items, setItems] = useState<TreatmentItem[]>([]);

    const addItem = () => {
        const newItem: TreatmentItem = {
            id: Date.now().toString(),
            type: "침치료",
            description: "",
            frequency: "",
            duration: ""
        };
        setItems([...items, newItem]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof TreatmentItem, value: string) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    return (
        <Paper radius="xl" p="xl" withBorder>
            <Group justify="space-between" mb="lg">
                <Group gap="xs">
                    <FileText size={20} />
                    <Title order={3} size="h4" c="dark.8">치료 계획 (Treatment Plan)</Title>
                </Group>
                <Button
                    onClick={() => alert("저장되었습니다 (Mock)")}
                    leftSection={<Save size={16} />}
                    color="sage-green"
                >
                    저장하기
                </Button>
            </Group>

            <Stack gap="md">
                {items.map((item) => (
                    <Paper key={item.id} p="md" bg="gray.0" withBorder radius="md">
                        <Group align="flex-start">
                            <Stack gap="xs" style={{ flex: 1 }}>
                                <Group grow>
                                    <Select
                                        value={item.type}
                                        onChange={(value) => updateItem(item.id, "type", value as any)}
                                        data={["침치료", "약침", "한약", "물리치료", "생활관리"]}
                                        placeholder="치료 종류"
                                    />
                                    <TextInput
                                        value={item.description}
                                        onChange={(e) => updateItem(item.id, "description", e.currentTarget.value)}
                                        placeholder="상세 내용 (예: 경추 이완)"
                                        style={{ flex: 2 }}
                                    />
                                </Group>
                                <Group grow>
                                    <TextInput
                                        leftSection={<Calendar size={16} />}
                                        value={item.frequency}
                                        onChange={(e) => updateItem(item.id, "frequency", e.currentTarget.value)}
                                        placeholder="빈도 (예: 주 2회)"
                                    />
                                    <TextInput
                                        leftSection={<Clock size={16} />}
                                        value={item.duration}
                                        onChange={(e) => updateItem(item.id, "duration", e.currentTarget.value)}
                                        placeholder="기간 (예: 4주)"
                                    />
                                </Group>
                            </Stack>
                            <ActionIcon
                                color="red"
                                variant="subtle"
                                onClick={() => removeItem(item.id)}
                                mt={4}
                            >
                                <Trash2 size={18} />
                            </ActionIcon>
                        </Group>
                    </Paper>
                ))}
            </Stack>

            <Button
                onClick={addItem}
                variant="outline"
                color="sage-green"
                fullWidth
                mt="md"
                leftSection={<Plus size={18} />}
                style={{ borderStyle: 'dashed' }}
            >
                항목 추가
            </Button>
        </Paper>
    );
}
