import { Sun, Moon } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

/**
 * Toggle de tema claro/oscuro.
 * Se renderiza como botón con ícono de sol/luna.
 */
export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-card border border-transparent hover:border-card-border transition-all duration-200 cursor-pointer"
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
