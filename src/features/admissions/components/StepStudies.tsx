import type { ApplicationStepProps } from '../applicationForm';
import InstituteFields from './InstituteFields';
import SchoolFields from './SchoolFields';

const StepStudies = ({ onChange, values }: ApplicationStepProps) => (
  <div className="application-step">
    <SchoolFields
      idPrefix="application-primary"
      label="Primaria"
      onChange={(school) => onChange('primarySchool', school)}
      value={values.primarySchool}
    />
    <SchoolFields
      idPrefix="application-university"
      label="Universidad"
      onChange={(school) => onChange('university', school)}
      value={values.university}
    />
    <InstituteFields
      idPrefix="application-district"
      onChange={(institute) => onChange('districtInstitute', institute)}
      question="¿Has estudiado en algún Instituto Bíblico del Distrito?"
      value={values.districtInstitute}
    />
    <InstituteFields
      idPrefix="application-other"
      onChange={(institute) => onChange('otherInstitute', institute)}
      question="¿Has estudiado en algún otro Instituto Bíblico?"
      value={values.otherInstitute}
    />
  </div>
);

export default StepStudies;
