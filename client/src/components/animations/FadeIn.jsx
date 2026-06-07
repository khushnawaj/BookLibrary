export function FadeIn({ children, className, delay = 0 }) {
  return (
    <div
      className={className}
      style={{
        animation: `fadeIn 0.5s ease-out ${delay}ms both`,
      }}
    >
      {children}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
