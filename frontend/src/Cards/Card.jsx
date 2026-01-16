
export default function Card({ children, className = '', noHover = false, noPadding = false, ...props }) {
  return (
    <div
      className={`bg-white shadow-sm shadow-slate-300 border border-slate-200/60 rounded-2xl ${noPadding ? '' : 'p-6'} ${noHover ? '' : 'hover:shadow-md hover:-translate-y-0.5'} transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}