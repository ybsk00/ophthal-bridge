import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 운영 시간 설정
const OPERATING_HOURS = {
    start: 9,   // 09:00
    end: 18     // 18:00
}
const SLOT_INTERVAL = 30  // 30분 간격

export async function GET(request: NextRequest) {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')  // YYYY-MM-DD 형식
    const doctorName = searchParams.get('doctor_name')

    if (!date) {
        return NextResponse.json({ error: '날짜가 필요합니다.' }, { status: 400 })
    }

    try {
        // 해당 날짜의 시작과 끝 시간
        const startOfDay = new Date(`${date}T00:00:00+09:00`)
        const endOfDay = new Date(`${date}T23:59:59+09:00`)

        // 해당 날짜의 모든 예약 조회 (doctor_name 또는 notes에서 확인)
        const { data: bookedAppointments, error } = await supabase
            .from('appointments')
            .select('scheduled_at, doctor_name, notes')
            .gte('scheduled_at', startOfDay.toISOString())
            .lte('scheduled_at', endOfDay.toISOString())
            .neq('status', 'cancelled')

        if (error) {
            console.error('Error fetching appointments:', error)
            return NextResponse.json({ error: '예약 조회 실패' }, { status: 500 })
        }

        // 의사 이름 매칭 함수 (doctor_name 또는 notes에서 확인)
        const matchesDoctor = (apt: any, targetDoctor: string) => {
            if (!targetDoctor || targetDoctor === '전체') return true
            if (apt.doctor_name === targetDoctor) return true
            if (apt.notes && apt.notes.includes(targetDoctor)) return true
            return false
        }

        // 예약된 시간 슬롯 추출 (HH:MM 형식) - 선택된 의사와 매칭되는 예약만
        const bookedSlots = new Set<string>()
        bookedAppointments?.forEach(apt => {
            // 선택된 의사와 매칭되는 경우만 예약된 시간으로 처리
            if (matchesDoctor(apt, doctorName || '')) {
                const aptDate = new Date(apt.scheduled_at)
                const timeStr = aptDate.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                })
                bookedSlots.add(timeStr)
            }
        })

        // 전체 시간 슬롯 생성
        const allSlots: string[] = []
        for (let hour = OPERATING_HOURS.start; hour < OPERATING_HOURS.end; hour++) {
            for (let minute = 0; minute < 60; minute += SLOT_INTERVAL) {
                const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
                allSlots.push(timeStr)
            }
        }

        // 예약 가능한 시간만 필터링
        const availableSlots = allSlots.filter(slot => !bookedSlots.has(slot))

        // 오늘 날짜인 경우 이미 지난 시간 제외
        const now = new Date()
        const isToday = date === now.toISOString().split('T')[0]

        const filteredSlots = isToday
            ? availableSlots.filter(slot => {
                const [h, m] = slot.split(':').map(Number)
                return h > now.getHours() || (h === now.getHours() && m > now.getMinutes())
            })
            : availableSlots

        return NextResponse.json({
            date,
            doctor_name: doctorName || '전체',
            available_slots: filteredSlots,
            booked_slots: Array.from(bookedSlots),
            all_slots: allSlots
        })

    } catch (error) {
        console.error('Available slots error:', error)
        return NextResponse.json({ error: '서버 오류' }, { status: 500 })
    }
}
