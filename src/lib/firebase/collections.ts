// Única fuente de los nombres de colecciones. Nunca escribas collection(db, 'nombre') a mano:
// una colección nueva se agrega aquí y en security/firestore.rules.
export const COLLECTIONS = {
  academicPeriods: 'academic_periods',
  adminUsers: 'admin_users',
  appUsers: 'app_users',
  attendance: 'attendance',
  banks: 'banks',
  books: 'books',
  classes: 'classes',
  counters: 'counters',
  courseCosts: 'course_costs',
  enrollments: 'enrollments',
  expenseCategories: 'expense_categories',
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
