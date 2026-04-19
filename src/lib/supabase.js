import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wvajxljpbqiiztmliniw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2YWp4bGpwYnFpaXp0bWxpbml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTQ2NTUsImV4cCI6MjA5MjE5MDY1NX0.8iHlvfiYsDc2738M3ZXRbI5QtDp8T1bMIeoR63KSnq4'

export const supabase = createClient(supabaseUrl, supabaseKey)
