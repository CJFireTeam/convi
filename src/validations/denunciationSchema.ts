import { z } from 'zod';

export const denunciationSchema = z.object({
    firstcomplaint: z.string(),
    derivative: z.string(),
    studentName: z.string(),
    course: z.string(),
    teacherName: z.string(),
    date: z.string(),
    description: z.string(),
    explain: z.string()
});