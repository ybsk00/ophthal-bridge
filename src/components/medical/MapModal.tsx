'use client';

import { Modal, Button, Stack, Text, Group, ThemeIcon, Divider } from '@mantine/core';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface MapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// 환경변수 또는 하드코딩 (추후 환경변수로 이동)
const HOSPITAL_NAME = '평촌이생각치과';
const HOSPITAL_ADDRESS = '서울 강남구 삼성로 402';
const MAP_QUERY = encodeURIComponent(`${HOSPITAL_NAME} ${HOSPITAL_ADDRESS}`);

export default function MapModal({ isOpen, onClose }: MapModalProps) {

    const handleNaverMap = () => {
        // 네이버 지도 웹 링크
        const url = `https://map.naver.com/v5/search/${MAP_QUERY}`;
        window.open(url, '_blank', 'noopener,noreferrer');

        // 이벤트 로깅 (추후 구현)
        console.log('map_click', { provider: 'naver' });
    };

    const handleGoogleMap = () => {
        // 구글 지도 웹 링크
        const url = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;
        window.open(url, '_blank', 'noopener,noreferrer');

        // 이벤트 로깅 (추후 구현)
        console.log('map_click', { provider: 'google' });
    };

    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <ThemeIcon color="blue" variant="light" radius="xl">
                        <MapPin size={18} />
                    </ThemeIcon>
                    <Text fw={700}>위치 보기</Text>
                </Group>
            }
            centered
            radius="lg"
            size="sm"
        >
            <Stack gap="md" py="md">
                <div className="text-center">
                    <Text size="lg" fw={600} c="dark">
                        {HOSPITAL_NAME}
                    </Text>
                    <Text size="sm" c="dimmed">
                        {HOSPITAL_ADDRESS}
                    </Text>
                </div>

                <Divider />

                <Stack gap="sm">
                    <Button
                        fullWidth
                        size="lg"
                        color="green"
                        leftSection={<Navigation size={20} />}
                        rightSection={<ExternalLink size={16} />}
                        onClick={handleNaverMap}
                    >
                        네이버 지도에서 보기
                    </Button>

                    <Button
                        fullWidth
                        size="lg"
                        color="blue"
                        leftSection={<MapPin size={20} />}
                        rightSection={<ExternalLink size={16} />}
                        onClick={handleGoogleMap}
                    >
                        구글 지도에서 보기
                    </Button>
                </Stack>

                <Text size="xs" c="dimmed" ta="center">
                    클릭 시 외부 지도 앱/웹으로 이동합니다.
                </Text>
            </Stack>
        </Modal>
    );
}
