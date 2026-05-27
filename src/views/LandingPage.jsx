import { ArrowRight, Shield, FileText, Smartphone, ExternalLink } from 'lucide-react';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import logoYuiOne from '../assets/yuione.png'

/**
 * Pantalla de bienvenida con:
 * - Hero section (título + presentación del creador)
 * - Sección de transparencia (cómo se almacenan los datos)
 * - CTA para comenzar
 *
 * @param {{ onStart: () => void }} props
 */
export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-dvh flex flex-col bg-background transition-colors duration-300">
      {/* Navbar simple */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-card-border transition-colors duration-300">
        <span className="font-brand text-base font-bold text-primary tracking-wide">
          YUI ONE
        </span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
        <Button variant="ghost" size="sm" onClick={onStart}>
          Ingresar
        </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 pt-12 sm:pt-20 pb-16 max-w-2xl mx-auto w-full">
        {/* ── Hero ── */}
        <section className="text-center mb-16 animate-fade-in-up">
          <span className="inline-block text-[10px] tracking-[0.2em] uppercase text-primary border border-primary/30 px-3 py-1 rounded-full mb-6">
            NIVEL PROFESIONAL · PARA LA COMUNIDAD
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-text-primary leading-tight">
            Presupuestos{' '}
            <span className="text-primary">profesionales</span>
            <br />
            al instante
          </h1>
          <p className="mt-4 text-sm sm:text-base text-text-secondary max-w-md mx-auto leading-relaxed">
            Creá, gestioná y exportá presupuestos desde cualquier dispositivo,
            sin registro, sin internet, sin limites.
          </p>
          <Button size="lg" className="mt-8" onClick={onStart}>
            Comenzar a usar
            <ArrowRight size={16} />
          </Button>
        </section>

        {/* ── Características ── */}
        <section className="grid grid-cols-2 sm:grid-cols-2 gap-4 w-full mb-16">
          {[
            {
              icon: FileText,
              title: 'PDF profesional',
              desc: 'Exportá presupuestos con diseño limpio, tabla de ítems y firma.',
            },
            {
              icon: Shield,
              title: 'Privacidad total',
              desc: 'Tus datos nunca salen de tu dispositivo. Sin servidores, sin nube.',
            }
          ].map((feat) => (
            <div
              key={feat.title}
              className="flex flex-col items-center text-center rounded-xl border border-card-border bg-card p-5 transition-colors duration-200"
            >
              <div className="rounded-full bg-accent-bg p-2.5 mb-3">
                <feat.icon size={20} className="text-accent-icon" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                {feat.title}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </section>

        {/* ── Transparencia ── */}
        <section className="w-full rounded-xl border border-card-border bg-card p-5 sm:p-7 transition-colors duration-200">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            Tus datos están seguros
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-text-secondary leading-relaxed">
            <p>
              <strong className="text-text-primary">Esta app guarda todo en tu navegador</strong>{' '}
              usando IndexedDB, una base de datos local. No hay servidores, no hay
              cuentas, no hay cookies de seguimiento.
            </p>
            <p>
              Cuando cerrás el navegador o perdés conexión, tus presupuestos siguen ahí.
              Incluso podés exportar un archivo de respaldo y llevarlo a otro dispositivo.
            </p>
            <p className="text-text-secondary/60 text-[11px] italic">
              Tecnología: IndexedDB (vía Dexie) + almacenamiento persistente del navegador.
              Sin llamadas a APIs externas.
            </p>
          </div>
        </section>

        {/* ── Footer CTA ── */}
        <Button size="lg" className="mt-10" onClick={onStart}>
          Comenzar a usar
          <ArrowRight size={16} />
        </Button>

        <section className="mt-20 mb-12 flex flex-col items-center justify-center text-center px-4">
          <div className="flex flex-col items-center gap-2 mb-3">
            <img src={logoYuiOne} alt="Logo de yui one" className='w-32' />
            <h2 className="text-3xl font-bold text-text-primary tracking-[0.2em] uppercase font-brand">
              YUI ONE
            </h2>
          </div>

          <p className="text-text-secondary max-w-md text-sm md:text-base mb-6 leading-relaxed">
            ¿Necesitás ir más allá de los presupuestos?
          </p>
          <p className="text-text-secondary max-w-md text-sm md:text-base mb-6 leading-relaxed">
            Conocé nuestro Sistema Integral de Gestión Empresarial. Todo tu entorno de trabajo, centralizado y simplificado.
          </p>

          <a
            href="https://yuione.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-[15px] font-semibold text-primary hover:text-text-primary duration-300 hover:-translate-y-1"
          >
            <span>Visitalo acá</span>
            <ExternalLink 
              size={16} 
            />
          </a>
        </section>
      </main>

      <footer className="text-center text-sm text-text-secondary/50 py-6 border-t border-card-border/50 transition-colors duration-200">
        <a className='text-primary font-brand font-semibold' href="https://yuione.com.ar" target='_blank'>
          YUI ONE {" "}
        </a>
          — Hecho por
        <a  target='_blank' href='https://www.gonzalojaime.me/' className="text-text-secondary"> Gonzalo Jaime Guiñazú</a>
      </footer>
    </div>
  );
}
