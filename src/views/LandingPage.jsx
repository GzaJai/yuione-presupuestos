import { ArrowRight, Shield, FileText, Smartphone } from 'lucide-react';
import Button from '../components/ui/Button';

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
    <div className="min-h-dvh flex flex-col">
      {/* Navbar simple */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-zinc-800">
        <span className="text-sm font-bold text-emerald-400 tracking-tight">
          Presupuesto Online
        </span>
        <Button variant="ghost" size="sm" onClick={onStart}>
          Ingresar
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 pt-12 sm:pt-20 pb-16 max-w-2xl mx-auto w-full">
        {/* ── Hero ── */}
        <section className="text-center mb-16 animate-fade-in-up">
          <span className="inline-block text-[10px] tracking-[0.2em] uppercase text-emerald-400 border border-emerald-400/30 px-3 py-1 rounded-full mb-6">
            Mobile First · 100% offline
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-100 leading-tight">
            Presupuestos{' '}
            <span className="text-emerald-400">profesionales</span>
            <br />
            al instante
          </h1>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
            Creá, gestioná y exportá presupuestos desde cualquier dispositivo,
            sin registro, sin internet, sin limites.
          </p>
          <Button size="lg" className="mt-8" onClick={onStart}>
            Comenzar a usar
            <ArrowRight size={16} />
          </Button>
        </section>

        {/* ── Características ── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-16">
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
            },
            {
              icon: Smartphone,
              title: 'Mobile First',
              desc: 'Diseñada para usarse desde el celular, rápida y liviana.',
            },
          ].map((feat) => (
            <div
              key={feat.title}
              className="flex flex-col items-center text-center rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
            >
              <div className="rounded-full bg-emerald-500/10 p-2.5 mb-3">
                <feat.icon size={20} className="text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">
                {feat.title}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </section>

        {/* ── Transparencia ── */}
        <section className="w-full rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-7">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Shield size={16} className="text-emerald-400" />
            Tus datos están seguros
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            <p>
              <strong className="text-zinc-300">Esta app guarda todo en tu navegador</strong>{' '}
              usando IndexedDB, una base de datos local. No hay servidores, no hay
              cuentas, no hay cookies de seguimiento.
            </p>
            <p>
              Cuando cerrás el navegador o perdés conexión, tus presupuestos siguen ahí.
              Incluso podés exportar un archivo de respaldo y llevarlo a otro dispositivo.
            </p>
            <p className="text-zinc-500 text-[11px] italic">
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
      </main>

      <footer className="text-center text-[10px] text-zinc-700 py-6 border-t border-zinc-800/50">
        Presupuesto Online — Hecho con ❤️ por{' '}
        <span className="text-zinc-500">un desarrollador</span>
      </footer>
    </div>
  );
}
