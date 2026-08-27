import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrpnkslpwmpjlntgdbms.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ycG5rc2xwd21wamxudGdkYm1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTQxMzEsImV4cCI6MjEwMzQzMDEzMX0.SscGj7YOQg8rq5LfSjdgzifsrLluWzbr18SU8yS-WpU';

export const supabase = createClient(supabaseUrl, supabaseKey);
