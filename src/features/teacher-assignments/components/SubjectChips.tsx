interface SubjectChipsProps {
  subjectNames: string[];
}

const SubjectChips = ({ subjectNames }: SubjectChipsProps) => (
  <div className="chip-list">
    {subjectNames.map((subjectName, index) => (
      <span className="chip" key={`${subjectName}-${index}`}>
        {subjectName}
      </span>
    ))}
  </div>
);

export default SubjectChips;
