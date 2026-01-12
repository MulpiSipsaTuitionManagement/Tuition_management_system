import { ChevronRight, ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, breadcrumbs, onBack, actions }) {
    return (
        <div className="mb-10 animate-fade-in px-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
                </div>

                {actions && (
                    <div className="flex items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>

            <nav className="flex items-center space-x-2 ml-12 mt-2">
                {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center">
                        {index > 0 && <ChevronRight size={14} className="mx-2 text-slate-300" />}
                        {crumb.active ? (
                            <span className="text-xs font-bold text-purple-600 tracking-wide uppercase">{crumb.label}</span>
                        ) : (
                            <button
                                onClick={crumb.onClick}
                                className="text-xs font-bold text-slate-400 hover:text-slate-600 tracking-wide uppercase transition-colors"
                            >
                                {crumb.label}
                            </button>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
}
