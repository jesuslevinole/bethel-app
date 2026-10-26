import { ShieldAlert } from 'lucide-react';
import CopyableValue from '../../../shared/components/CopyableValue';
import type { AccessIssue } from '../../../types/index';
import { useAppSession } from '../appSessionContext';
import { signOutUser } from '../services/authService';
import './NoAccessNotice.css';

interface IssueCopy {
  steps: string[];
  text: string;
  title: string;
}

const ISSUE_COPY: Record<AccessIssue, IssueCopy> = {
  inactive: {
    steps: ['Pide a Administración que reactive tu usuario en Usuarios.'],
    text: 'Tu usuario está desactivado.',
    title: 'Tu acceso está pausado',
  },
  missingProfile: {
    steps: [
      'Pide a Administración que te cree el usuario en Usuarios, con este mismo correo.',
      'Si eres el propietario del sistema: en Firebase → Firestore crea admin_users con un documento cuyo ID sea el UID de abajo y los campos name y email.',
    ],
    text: 'Tu cuenta existe, pero todavía no tiene usuario en la app.',
    title: 'Falta habilitar tu cuenta',
  },
  missingRole: {
    steps: ['Pide a Administración que te asigne un rol en Usuarios.'],
    text: 'El rol que tenías asignado ya no existe.',
    title: 'Tu usuario no tiene rol',
  },
  rulesBlocked: {
    steps: [
      'En Firebase, abre Firestore y entra a la pestaña "Reglas".',
      'Reemplaza todo con el contenido de security/firestore.rules del proyecto.',
      'Toca "Publicar", espera un minuto y vuelve a revisar.',
    ],
    text: 'Las reglas de Firestore no dejan leer tu perfil. Casi siempre es porque la versión nueva de las reglas aún no está publicada.',
    title: 'Las reglas de Firestore bloquean el acceso',
  },
};

const NoAccessNotice = () => {
  const { accessIssue, email, uid } = useAppSession();
  const issueCopy = ISSUE_COPY[accessIssue ?? 'missingProfile'];

  return (
    <div className="no-access">
      <div className="no-access-panel panel">
        <span className="empty-state-icon">
          <ShieldAlert size={24} />
        </span>
        <h1 className="empty-state-title">{issueCopy.title}</h1>
        <p className="no-access-text">{issueCopy.text}</p>
        <ol className="no-access-steps">
          {issueCopy.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {uid && <CopyableValue label="UID de tu cuenta" value={uid} />}
        <p className="no-access-email">Sesión iniciada como {email}</p>
        <div className="no-access-actions">
          <button className="btn btn-secondary" onClick={signOutUser} type="button">
            Salir
          </button>
          <button className="btn btn-primary" onClick={() => window.location.reload()} type="button">
            Ya lo hice, revisar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoAccessNotice;
