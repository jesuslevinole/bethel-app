import { Columns3, PanelLeft } from 'lucide-react';
import { useState } from 'react';
import { usePermissions } from '../features/auth/hooks/usePermissions';
import { useAppSettings } from '../features/customization/appSettingsContext';
import ColumnEditor from '../features/customization/components/ColumnEditor';
import MenuEditor from '../features/customization/components/MenuEditor';
import ListSkeleton from '../shared/components/ListSkeleton';
import SegmentedTabs from '../shared/components/SegmentedTabs';
import ViewHeader from '../shared/components/ViewHeader';
import '../features/customization/components/Customization.css';

type CustomizationSection = 'columns' | 'menu';

const SECTIONS = [
  { icon: PanelLeft, label: 'Menú', value: 'menu' as const },
  { icon: Columns3, label: 'Columnas', value: 'columns' as const },
];

const CustomizationView = () => {
  const { isLoading, settings } = useAppSettings();
  const canEdit = usePermissions().can('customization', 'edit');
  const [section, setSection] = useState<CustomizationSection>('menu');

  return (
    <div className="view">
      <ViewHeader subtitle="Así se ve el menú y así se llaman las columnas para todos." title="Personalizar" />
      <SegmentedTabs label="Qué personalizar" onChange={setSection} tabs={SECTIONS} value={section} />
      {isLoading && <ListSkeleton rows={8} />}
      {!isLoading && section === 'menu' && <MenuEditor canEdit={canEdit} settings={settings} />}
      {!isLoading && section === 'columns' && <ColumnEditor canEdit={canEdit} settings={settings} />}
    </div>
  );
};

export default CustomizationView;
