import { Check, X } from 'lucide-react';
import type { EnrollmentRequest } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';
import { getRelationName } from '../../../utils/relations';
import { useColumnLabels } from '../../customization/useColumnLabels';
import { ENROLLMENT_REQUEST_STATUS_LABELS } from '../applicationForm';

interface EnrollmentRequestTableProps {
  canReview: boolean;
  classNames: Map<string, string>;
  onApprove: (request: EnrollmentRequest) => void;
  onReject: (request: EnrollmentRequest) => void;
  periodNames: Map<string, string>;
  requests: EnrollmentRequest[];
}

const STATUS_BADGES = {
  approved: 'badge badge-success',
  pending: 'badge badge-warning',
  rejected: 'badge badge-danger',
};

const EnrollmentRequestTable = ({
  canReview,
  classNames,
  onApprove,
  onReject,
  periodNames,
  requests,
}: EnrollmentRequestTableProps) => {
  const columnLabel = useColumnLabels('enrollmentRequests');

  return (
    <div className="table-wrap">
      <table className="table table-stack">
        <thead>
          <tr>
            <th scope="col">{columnLabel('date')}</th>
            <th scope="col">{columnLabel('student')}</th>
            <th scope="col">{columnLabel('className')}</th>
            <th scope="col">{columnLabel('period')}</th>
            <th scope="col">{columnLabel('status')}</th>
            <th scope="col">
              <span className="visually-hidden">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td className="cell-date" data-label={columnLabel('date')}>
                {formatDate(request.date)}
              </td>
              <td className="cell-strong" data-label={columnLabel('student')}>
                {request.studentName}
              </td>
              <td data-label={columnLabel('className')}>{getRelationName(classNames, request.classId)}</td>
              <td data-label={columnLabel('period')}>{getRelationName(periodNames, request.periodId)}</td>
              <td data-label={columnLabel('status')}>
                <span className={STATUS_BADGES[request.status]}>
                  {ENROLLMENT_REQUEST_STATUS_LABELS[request.status]}
                </span>
                {request.reviewNote && <span className="cell-note">{request.reviewNote}</span>}
              </td>
              <td className="cell-actions">
                {canReview && request.status === 'pending' && (
                  <div className="request-actions">
                    <button className="btn btn-primary btn-compact" onClick={() => onApprove(request)} type="button">
                      <Check size={16} />
                      Inscribir
                    </button>
                    <button
                      className="btn btn-danger-outline btn-compact"
                      onClick={() => onReject(request)}
                      type="button"
                    >
                      <X size={16} />
                      No aprobar
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EnrollmentRequestTable;
