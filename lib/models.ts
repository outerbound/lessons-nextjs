// lib/models.ts
// Define types for database models
export type Lesson = {
  id: string;
  outline: string;
  status: string;

  title?: string;
  generated_tsx?: string;
  compiled_jsx?: string;
  
  created_at?: string;
};