import './PortalIntro.css';

interface PortalIntroProps {
  text: string;
  title: string;
}

const PortalIntro = ({ text, title }: PortalIntroProps) => (
  <header className="portal-intro">
    <h2 className="portal-intro-title">{title}</h2>
    <p className="portal-intro-text">{text}</p>
  </header>
);

export default PortalIntro;
