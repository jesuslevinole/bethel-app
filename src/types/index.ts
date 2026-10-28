export type { AcademicPeriod, AcademicSemester } from './academicPeriods';
export type {
  AdmissionApplication,
  ApplicationStatus,
  BirthGender,
  MaritalStatus,
  PostalAddress,
  PreviousInstitute,
  SchoolRecord,
  YesNo,
} from './admissionApplications';
export type { AppSettings, NavGroup } from './appSettings';
export type { DateRange } from './dateRange';
export type { AccessIssue, AdminUser, AppSession, SessionStatus } from './adminUsers';
export type { AppUser } from './appUsers';
export type { AssignmentRow } from './assignmentRow';
export type { AttendanceMark, AttendanceSheet, SessionDraft } from './attendance';
export type { Bank } from './banks';
export type { Book } from './books';
export type { BookMovement, BookMovementKind, BookOutReason, BookStock } from './bookMovements';
export type { CatalogItem } from './catalogItem';
export type {
  CatalogExtraField,
  CatalogExtraFieldName,
  CatalogFormValues,
  CatalogKey,
  CatalogRecord,
} from './catalogRecord';
export type { SchoolClass } from './classes';
export type { CourseBook, CourseBookRow, CourseCost, MonthlyFee } from './courseCosts';
export type { EnrollmentRow } from './enrollmentRow';
export type { Enrollment } from './enrollments';
export type { EnrollmentRequest, EnrollmentRequestStatus } from './enrollmentRequests';
export type { Expense } from './expenses';
export type { AppNotification } from './notifications';
export type { ChargeKind, MonthStatus, Payment, PaymentItem, StudentAccount } from './payments';
export type { ExpenseCategory } from './expenseCategories';
export type { GradeResult, GradeSheet, ScoreField, StudentScores } from './grades';
export type { IncomeType } from './incomeTypes';
export type { PaymentType } from './paymentTypes';
export type { RoleRow } from './roleRow';
export type { RowPermissions } from './rowPermissions';
export type {
  ModulePermission,
  PermissionAction,
  PermissionModule,
  Role,
  RoleKind,
  RolePermissions,
  ViewScope,
} from './roles';
export type { SelectOption } from './selectOption';
export type { StudentPhoto } from './studentPhotos';
export type { StudentSubjectRecord } from './studentRecord';
export type { Student } from './students';
export type { Subject } from './subjects';
export type { RosterStudent, TeacherAssignment } from './teacherAssignments';
export type { Teacher } from './teachers';
export type { TranscriptRow, TranscriptSection, TranscriptSummary } from './transcript';
export type { TeachingGroup } from './teachingGroup';
export type { EditorState } from './ui';
export type { UserRow } from './userRow';

// Datos de un documento antes de existir (sin id).
export type NewRecord<T extends { id: string }> = Omit<T, 'id'>;
