import { ArrowRight, BarChart3 } from "lucide-react";
import { reportCards } from "../../utils/reportUtils.js";

export function ReportCatalog({ setActiveReport }) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-6 shadow-lg shadow-slate-200/40 sm:p-8">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Reportes y exportación</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
              Elige un informe, aplica fechas y exporta a Excel cuando lo necesites.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportCards.map((card) => {
          const Icon = card.icon;
          const [iconBgClass, iconTextClass] = card.color.split(/\s+/);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveReport(card.id)}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 text-center shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2 hover:rotate-1"
            >
              <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${iconBgClass} shadow-sm transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 group-hover:shadow-lg`}>
                <Icon className={`h-7 w-7 ${iconTextClass} transition-transform duration-500 group-hover:rotate-0`} />
              </div>
              <h3 className="text-base font-semibold tracking-tight text-slate-900 group-hover:text-indigo-700 transition-colors">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.description}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 opacity-80 transition-all duration-500 group-hover:opacity-100 group-hover:gap-3">
                <span>{card.button}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-2 group-hover:rotate-45" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
