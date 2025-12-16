import { createClient } from '@/lib/supabase/server'
import { AppointmentsClientPage } from './AppointmentsClient'

export default async function AppointmentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let appointments: any[] = []
    if (user) {
        // Fetch all appointments for this user (same as history page)
        const { data } = await supabase
            .from('appointments')
            .select('*')
            .eq('user_id', user.id)
            .order('scheduled_at', { ascending: true })
        if (data) appointments = data
    }

    return <AppointmentsClientPage initialAppointments={appointments} />
}
