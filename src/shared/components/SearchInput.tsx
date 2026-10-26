import { Search } from 'lucide-react';
import './SearchInput.css';

interface SearchInputProps {
  label: string;
  onChange: (query: string) => void;
  placeholder: string;
  value: string;
}

const SearchInput = ({ label, onChange, placeholder, value }: SearchInputProps) => (
  <div className="search-input">
    <Search aria-hidden="true" className="search-input-icon" size={18} />
    <input
      aria-label={label}
      className="input search-input-field"
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type="search"
      value={value}
    />
  </div>
);

export default SearchInput;
