// Única fuente de los nombres de colecciones. Nunca escribas collection(db, 'nombre') a mano:
// una colección nueva se agrega aquí y en security/firestore.rules.
export const COLLECTIONS = {
  academicPeriods: 'academic_periods',
  adminUsers: 'admin_users',
  admissionApplications: 'admission_applications',
  appSettings: 'app_settings',
  appUsers: 'app_users',
  attendance: 'attendance',
  banks: 'banks',
  bookMovements: 'book_movements',
  books: 'books',
  classes: 'classes',
  counters: 'counters',
  courseCosts: 'course_costs',
  enrollmentRequests: 'enrollment_requests',
  enrollments: 'enrollments',
  expenseCategories: 'expense_categories',
  expenses: 'expenses',
  grades: 'grades',
  incomeTypes: 'income_types',
  paymentTypes: 'payment_types',
  payments: 'payments',
  roles: 'roles',
  studentPhotos: 'student_photos',
  students: 'students',
  subjects: 'subjects',
  teacherAssignments: 'teacher_assignments',
  teachers: 'teachers',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
