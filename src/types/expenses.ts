// Gasto del instituto (salida de dinero). Los nombres de categoría, forma de pago y banco se copian
// al guardar, como en los pagos.
export interface Expense {
  amount: number;
  bankId: string;
  bankName: string;
  categoryId: string;
  categoryName: string;
  date: string;
  description: string;
  id: string;
  incomeTypeId: string;
  incomeTypeName: string;
  notes: string;
}
