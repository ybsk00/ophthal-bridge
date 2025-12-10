"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
    Paper,
    Stack,
    Group,
    Text,
    Textarea,
    ActionIcon,
    Avatar,
    ScrollArea,
    Loader,
    Box,
    ThemeIcon,
    rem
} from "@mantine/core";

interface Message {
    role: "user" | "ai";
    content: string;
}

interface HealthcareChatProps {
    serviceType: string;
    serviceName: string;
    initialMessage: string;
}

export default function HealthcareChat({
    serviceType,
    serviceName,
    initialMessage,
}: HealthcareChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "ai", content: initialMessage },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const viewport = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (viewport.current) {
            viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/healthcare/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages,
                    serviceType: serviceType,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            const data = await response.json();
            setMessages((prev) => [...prev, { role: "ai", content: data.content }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    content: "죄송합니다. 잠시 문제가 발생했습니다. 다시 시도해 주세요.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Paper
            shadow="xl"
            radius="lg"
            withBorder
            h="calc(100vh - 120px)"
            maw={700}
            mx="auto"
            style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
            {/* Header */}
            <Box p="md" bg="sage-green.0" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                <Group>
                    <ThemeIcon size="lg" radius="xl" color="sage-green" variant="light">
                        <Sparkles size={20} />
                    </ThemeIcon>
                    <div>
                        <Text fw={700} size="lg" c="dark.8">
                            {serviceName}
                        </Text>
                        <Text size="xs" c="dimmed">
                            AI 한방 헬스케어
                        </Text>
                    </div>
                </Group>
            </Box>

            {/* Messages Area */}
            <ScrollArea viewportRef={viewport} style={{ flex: 1 }} p="md" bg="gray.0">
                <Stack gap="md">
                    {messages.map((msg, index) => (
                        <Group
                            key={index}
                            align="flex-start"
                            justify={msg.role === "user" ? "flex-end" : "flex-start"}
                            gap="xs"
                        >
                            {msg.role === "ai" && (
                                <Avatar color="sage-green" radius="xl" size="sm">
                                    <Bot size={16} />
                                </Avatar>
                            )}

                            <Paper
                                p="md"
                                radius="md"
                                bg={msg.role === "user" ? "sage-green.6" : "white"}
                                c={msg.role === "user" ? "white" : "dark.8"}
                                shadow="xs"
                                maw="85%"
                                style={{
                                    borderTopRightRadius: msg.role === "user" ? 0 : undefined,
                                    borderTopLeftRadius: msg.role === "ai" ? 0 : undefined,
                                }}
                            >
                                <Text size="xs" mb={4} opacity={0.7} fw={500} c={msg.role === "user" ? "white" : "dimmed"}>
                                    {msg.role === "user" ? "나" : serviceName}
                                </Text>
                                <div className={`prose prose-sm max-w-none ${msg.role === "user" ? "text-white prose-headings:text-white prose-p:text-white prose-strong:text-white" : "text-gray-800"}`}>
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </Paper>

                            {msg.role === "user" && (
                                <Avatar color="gray" radius="xl" size="sm">
                                    <User size={16} />
                                </Avatar>
                            )}
                        </Group>
                    ))}

                    {isLoading && (
                        <Group align="flex-start" gap="xs">
                            <Avatar color="sage-green" radius="xl" size="sm">
                                <Bot size={16} />
                            </Avatar>
                            <Paper p="md" radius="md" bg="white" shadow="xs" style={{ borderTopLeftRadius: 0 }}>
                                <Loader size="xs" color="sage-green" type="dots" />
                            </Paper>
                        </Group>
                    )}
                </Stack>
            </ScrollArea>

            {/* Input Area */}
            <Box p="md" bg="white" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                <Group align="flex-end" gap="sm">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.currentTarget.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="답변을 입력해주세요..."
                        autosize
                        minRows={1}
                        maxRows={4}
                        style={{ flex: 1 }}
                        styles={{ input: { padding: '10px' } }}
                    />
                    <ActionIcon
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoading}
                        size="lg"
                        color="sage-green"
                        variant="filled"
                        mb={4}
                    >
                        <Send size={18} />
                    </ActionIcon>
                </Group>
                <Text size="xs" c="dimmed" ta="center" mt="xs">
                    AI 답변은 참고용이며 의학적 진단을 대체하지 않습니다.
                </Text>
            </Box>
        </Paper>
    );
}
