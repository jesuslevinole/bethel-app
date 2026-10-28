import './OliveBranch.css';

interface OliveBranchProps {
  // 'menu' = al pie del menú lateral; 'hero' = grande y tenue en las pantallas de entrada.
  placement?: 'hero' | 'menu';
}

// Rama de olivo en trazo fino, al pie del menú: el sello visual del instituto (paz, unción, Bethel = casa de Dios).
const OliveBranch = ({ placement = 'menu' }: OliveBranchProps) => (
  <svg aria-hidden="true" className={`olive-branch is-${placement}`} fill="none" viewBox="0 0 220 90">
    <path className="olive-branch-stem" d="M8 78C52 70 96 54 132 36s58-26 80-28" />
    <g className="olive-branch-leaves">
      <path d="M34 72c-4-11 2-20 12-23-1 11-5 19-12 23Z" />
      <path d="M40 71c10 5 20 3 25-5-11-2-19 0-25 5Z" />
      <path d="M70 62c-2-12 6-20 16-21-2 11-8 18-16 21Z" />
      <path d="M77 60c9 7 20 7 26 0-10-4-19-4-26 0Z" />
      <path d="M106 48c0-12 8-19 18-19-3 11-10 17-18 19Z" />
      <path d="M113 46c8 8 19 9 26 3-9-5-18-6-26-3Z" />
      <path d="M142 33c1-11 10-17 19-16-4 10-11 15-19 16Z" />
      <path d="M149 31c7 8 17 10 24 5-8-6-16-7-24-5Z" />
      <path d="M178 21c2-10 10-15 19-13-4 9-11 13-19 13Z" />
    </g>
    <g className="olive-branch-fruit">
      <ellipse cx="58" cy="74" rx="4.2" ry="5.4" transform="rotate(-24 58 74)" />
      <ellipse cx="128" cy="54" rx="4" ry="5.2" transform="rotate(-30 128 54)" />
    </g>
  </svg>
);

export default OliveBranch;
