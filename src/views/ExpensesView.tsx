import { Plus, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useAcademicPeriod } from '../features/academic-periods/academicPeriodContext';
import { usePermissions, useRowPermissions } from '../features/auth/hooks/usePermissions';
import ExpenseForm from '../features/expenses/components/ExpenseForm';
import ExpenseTable from '../features/expenses/components/ExpenseTable';
import { EXPENSE_EXPORT_COLUMNS } from '../features/expenses/expenseExport';
import { expensesService } from '../services/expensesService';
import ConfirmDialog from '../shared/components/ConfirmDialog';
import DateRangeFilter from '../shared/components/DateRangeFilter';
import EmptyState from '../shared/components/EmptyState';
import ExportButton from '../shared/components/ExportButton';
import FilterChips from '../shared/components/FilterChips';
import ListSkeleton from '../shared/components/ListSkeleton';
import SearchInput from '../shared/components/SearchInput';
import ViewHeader from '../shared/components/ViewHeader';
import { useLiveData, useLiveRangeCollection } from '../shared/data/liveCollections';
import { useCrudScreen } from '../shared/hooks/useCrudScreen';
import { exportToExcel } from '../shared/export/exportToExcel';
import type { DateRange, Expense } from '../types/index';
import { formatDateRange } from '../utils/dateFormat';
import { getMonthRange } from '../utils/dateRanges';
import { formatMoney, sumMoney } from '../utils/money';
import { toSelectOptions } from '../utils/options';
import { pluralize } from '../utils/plural';
import { matchesSearch } from '../utils/search';

const ExpensesView = () => {
  const { selectedPeriod } = useAcademicPeriod();
  const permissions = usePermissions();
  const rowPermissions = useRowPermissions('expenses');
  const [range, setRange] = useState<DateRange>(() => getMonthRange());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { data: expenses, isLoading } = useLiveRangeCollection('expenses', range.startDate, range.endDate);
  const categories = useLiveData('expenseCategories');
  const incomeTypes = useLiveData('incomeTypes');
  const banks = useLiveData('banks');
  const { askDelete, cancelDelete, closeEditor, editingRecord, editor, openEdit, openNew, recordToDelete } =
    useCrudScreen<Expense>();

  const visibleExpenses = expenses.filter(
    (expense) =>
      (!categoryFilter || expense.categoryId === categoryFilter) &&
      matchesSearch([expense.description, expense.categoryName, expense.notes], search),
  );
  const total = sumMoney(visibleExpenses.map((expense) => expense.amount));
  const subtitle = `${pluralize(visibleExpenses.length, 'gasto', 'gastos')} por ${formatMoney(total)} del ${formatDateRange(range.startDate, range.endDate)}`;

  return (
    <div className="view">
      <ViewHeader subtitle={subtitle} title="Gastos">
        <SearchInput label="Buscar gasto" onChange={setSearch} placeholder="Descripción o categoría…" value={search} />
        {permissions.can('expenses', 'export') && (
          <ExportButton
            disabled={visibleExpenses.length === 0}
            onExport={() => exportToExcel('Gastos', EXPENSE_EXPORT_COLUMNS, visibleExpenses)}
          />
        )}
        {permissions.can('expenses', 'create') && (
          <button className="btn btn-primary" onClick={openNew} type="button">
            <Plus size={18} />
            Registrar gasto
          </button>
        )}
      </ViewHeader>
      <section className="panel panel-padded">
        <DateRangeFilter onChange={setRange} period={selectedPeriod} value={range} />
      </section>
      {categories.length > 0 && (
        <FilterChips
          allLabel="Todas las categorías"
          label="Filtrar por categoría"
          onChange={setCategoryFilter}
          options={toSelectOptions(categories)}
          value={categoryFilter}
        />
      )}
      <section className="panel panel-body-flush">
        {isLoading && <ListSkeleton rows={6} />}
        {!isLoading && visibleExpenses.length === 0 && (
          <EmptyState
            icon={Wallet}
            text="No hay gastos en estas fechas. Cambia las fechas o registra uno."
            title="Sin gastos"
          />
        )}
        {!isLoading && visibleExpenses.length > 0 && (
          <ExpenseTable
            expenses={visibleExpenses}
            onDelete={askDelete}
            onEdit={openEdit}
            rowPermissions={rowPermissions}
          />
        )}
      </section>
      {editor.mode !== 'closed' && (
        <ExpenseForm
          banks={banks}
          categories={categories}
          expense={editingRecord}
          incomeTypes={incomeTypes}
          key={editingRecord?.id ?? 'new'}
          onClose={closeEditor}
        />
      )}
      {recordToDelete && (
        <ConfirmDialog
          confirmLabel="Eliminar gasto"
          description={`Se eliminará el gasto "${recordToDelete.description}" de ${formatMoney(recordToDelete.amount)}.`}
          item={recordToDelete}
          onCancel={cancelDelete}
          onConfirm={(expense) => expensesService.delete(expense.id)}
          title="Eliminar gasto"
        />
      )}
    </div>
  );
};

export default ExpensesView;
