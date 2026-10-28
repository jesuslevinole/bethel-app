import { Eye } from 'lucide-react';
import type { AdmissionApplication } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';
import { useColumnLabels } from '../../customization/useColumnLabels';
import { APPLICATION_STATUS_BADGES, APPLICATION_STATUS_LABELS } from '../applicationForm';

interface ApplicationTableProps {
  applications: AdmissionApplication[];
  onOpen: (application: AdmissionApplication) => void;
}

const OFFICE_STATUS_LABELS = { ...APPLICATION_STATUS_LABELS, pending: 'Pendiente', rejected: 'Devuelta' };

const ApplicationTable = ({ applications, onOpen }: ApplicationTableProps) => {
  const columnLabel = useColumnLabels('admissions');

  return (
    <div className="table-wrap">
      <table className="table table-stack">
        <thead>
          <tr>
            <th scope="col">{columnLabel('date')}</th>
            <th scope="col">{columnLabel('name')}</th>
            <th scope="col">{columnLabel('church')}</th>
            <th scope="col">{columnLabel('phone')}</th>
            <th scope="col">{columnLabel('email')}</th>
            <th scope="col">{columnLabel('status')}</th>
            <th scope="col">
              <span className="visually-hidden">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id}>
              <td className="cell-date" data-label={columnLabel('date')}>
                {formatDate(application.date)}
              </td>
              <td className="cell-strong" data-label={columnLabel('name')}>
                {application.name}
              </td>
              <td data-label={columnLabel('church')}>{application.churchName || '—'}</td>
              <td className="cell-muted" data-label={columnLabel('phone')}>
                {application.phone || '—'}
              </td>
              <td className="cell-muted" data-label={columnLabel('email')}>
                {application.email}
              </td>
              <td data-label={columnLabel('status')}>
                <span className={APPLICATION_STATUS_BADGES[application.status]}>
                  {OFFICE_STATUS_LABELS[application.status]}
                </span>
              </td>
              <td className="cell-actions">
                <button className="btn btn-secondary btn-compact" onClick={() => onOpen(application)} type="button">
                  <Eye size={16} />
                  {application.status === 'pending' ? 'Revisar' : 'Ver'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationTable;
