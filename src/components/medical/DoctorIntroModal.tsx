'use client';

import { Modal, Text, Button, Group, Avatar, Badge, Stack, Divider } from '@mantine/core';
import { Calendar, MapPin, Star, User } from 'lucide-react';

interface Doctor {
    name: string;
    title: string;
    education: string;
    specialty: string[];
    tracks: string[];
}

interface DoctorIntroModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctors: Doctor[];
    onReservation?: () => void;
    onReviewTabClick?: () => void;
    onMapTabClick?: () => void;
}

const doctorImages: Record<string, string> = {
    '최서형': '/images/doctors/choi-seohyung.jpg',
    '노기환': '/images/doctors/noh-gihwan.jpg',
    '나병조': '/images/doctors/na-byungjo.jpg',
    '최규호': '/images/doctors/choi-gyuho.jpg',
};

export default function DoctorIntroModal({
    isOpen,
    onClose,
    doctors,
    onReservation,
    onReviewTabClick,
    onMapTabClick
}: DoctorIntroModalProps) {
    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-traditional-primary" />
                    <span className="font-bold text-lg">위담한방병원 의료진</span>
                </div>
            }
            size="lg"
            radius="lg"
            overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        >
            <Stack gap="md">
                {/* 고지 문구 */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                    <Text size="xs">
                        아래 의료진은 사용자의 불편 양상에 따라 자주 다루는 진료 범위를 기준으로 안내됩니다.
                        질환 매칭이 아니며, 정확한 상담은 내원 진료가 필요합니다.
                    </Text>
                </div>

                {/* 의료진 카드 목록 */}
                {doctors.map((doctor, index) => (
                    <div
                        key={doctor.name}
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex gap-4">
                            {/* 프로필 이미지 */}
                            <Avatar
                                src={doctorImages[doctor.name] || '/images/default-doctor.jpg'}
                                alt={doctor.name}
                                size={80}
                                radius="md"
                                className="border-2 border-traditional-primary/20"
                            >
                                <User size={40} className="text-gray-400" />
                            </Avatar>

                            {/* 의료진 정보 */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Text fw={700} size="lg">{doctor.name}</Text>
                                    <Badge
                                        color={doctor.title === '이사장' ? 'yellow' : 'gray'}
                                        variant="light"
                                    >
                                        {doctor.title}
                                    </Badge>
                                </div>

                                <Text size="xs" c="dimmed" className="mb-2">
                                    {doctor.education}
                                </Text>

                                <div className="flex flex-wrap gap-1">
                                    {doctor.specialty.slice(0, 5).map((spec) => (
                                        <Badge
                                            key={spec}
                                            size="xs"
                                            variant="outline"
                                            color="green"
                                        >
                                            {spec}
                                        </Badge>
                                    ))}
                                    {doctor.specialty.length > 5 && (
                                        <Badge size="xs" variant="light" color="gray">
                                            +{doctor.specialty.length - 5}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <Divider />

                {/* CTA 버튼 */}
                <Group grow>
                    <Button
                        leftSection={<Calendar size={16} />}
                        variant="filled"
                        color="green"
                        onClick={() => {
                            onReservation?.();
                            onClose();
                        }}
                    >
                        예약하기
                    </Button>
                    <Button
                        leftSection={<Star size={16} />}
                        variant="light"
                        color="amber"
                        onClick={() => {
                            onReviewTabClick?.();
                            onClose();
                        }}
                    >
                        후기보기
                    </Button>
                    <Button
                        leftSection={<MapPin size={16} />}
                        variant="light"
                        color="rose"
                        onClick={() => {
                            onMapTabClick?.();
                            onClose();
                        }}
                    >
                        위치보기
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
