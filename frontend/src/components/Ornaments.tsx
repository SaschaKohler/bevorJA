export function FloralOrnament({ className = "", size = 80 }: { className?: string; size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Central flower */}
      <circle cx="50" cy="50" r="8" fill="#D4AF37" opacity="0.8" />
      <ellipse cx="50" cy="35" rx="6" ry="12" fill="#D4AF37" opacity="0.6" />
      <ellipse cx="50" cy="65" rx="6" ry="12" fill="#D4AF37" opacity="0.6" />
      <ellipse cx="35" cy="50" rx="12" ry="6" fill="#D4AF37" opacity="0.6" />
      <ellipse cx="65" cy="50" rx="12" ry="6" fill="#D4AF37" opacity="0.6" />
      <ellipse cx="39" cy="39" rx="8" ry="8" fill="#D4AF37" opacity="0.5" transform="rotate(45 39 39)" />
      <ellipse cx="61" cy="39" rx="8" ry="8" fill="#D4AF37" opacity="0.5" transform="rotate(45 61 39)" />
      <ellipse cx="39" cy="61" rx="8" ry="8" fill="#D4AF37" opacity="0.5" transform="rotate(45 39 61)" />
      <ellipse cx="61" cy="61" rx="8" ry="8" fill="#D4AF37" opacity="0.5" transform="rotate(45 61 61)" />
      
      {/* Decorative leaves */}
      <path d="M50 15 Q45 5 50 0 Q55 5 50 15" fill="#B76E79" opacity="0.7" />
      <path d="M50 85 Q45 95 50 100 Q55 95 50 85" fill="#B76E79" opacity="0.7" />
      <path d="M15 50 Q5 45 0 50 Q5 55 15 50" fill="#B76E79" opacity="0.7" />
      <path d="M85 50 Q95 45 100 50 Q95 55 85 50" fill="#B76E79" opacity="0.7" />
    </svg>
  );
}

export function OrnamentDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold to-gold/50" />
      <FloralOrnament size={32} />
      <div className="h-px w-24 bg-gradient-to-l from-transparent via-gold to-gold/50" />
    </div>
  );
}

export function CornerOrnament({ className = "", position = "top-left" }: { 
  className?: string; 
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" 
}) {
  const rotations = {
    "top-left": 0,
    "top-right": 90,
    "bottom-right": 180,
    "bottom-left": 270,
  };
  
  return (
    <svg 
      width="60" 
      height="60" 
      viewBox="0 0 60 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: `rotate(${rotations[position]}deg)` }}
    >
      <path 
        d="M0 30 Q15 30 15 15 Q15 0 30 0" 
        stroke="#D4AF37" 
        strokeWidth="1.5" 
        fill="none"
        opacity="0.6"
      />
      <path 
        d="M5 30 Q18 30 18 18 Q18 5 30 5" 
        stroke="#D4AF37" 
        strokeWidth="1" 
        fill="none"
        opacity="0.4"
      />
      <circle cx="15" cy="15" r="3" fill="#D4AF37" opacity="0.5" />
      <circle cx="8" cy="22" r="2" fill="#B76E79" opacity="0.6" />
      <circle cx="22" cy="8" r="2" fill="#B76E79" opacity="0.6" />
    </svg>
  );
}

export function VineBorder({ className = "" }: { className?: string }) {
  return (
    <svg 
      width="100%" 
      height="20" 
      viewBox="0 0 200 20" 
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M0 10 Q25 5 50 10 T100 10 T150 10 T200 10" 
        stroke="#D4AF37" 
        strokeWidth="1" 
        fill="none"
        opacity="0.4"
      />
      <circle cx="50" cy="10" r="2" fill="#D4AF37" opacity="0.5" />
      <circle cx="100" cy="10" r="2" fill="#D4AF37" opacity="0.5" />
      <circle cx="150" cy="10" r="2" fill="#D4AF37" opacity="0.5" />
    </svg>
  );
}

export function ElegantFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <CornerOrnament position="top-left" className="absolute -top-2 -left-2" />
      <CornerOrnament position="top-right" className="absolute -top-2 -right-2" />
      <CornerOrnament position="bottom-left" className="absolute -bottom-2 -left-2" />
      <CornerOrnament position="bottom-right" className="absolute -bottom-2 -right-2" />
      <div className="border border-gold/20 rounded-lg p-6">
        {children}
      </div>
    </div>
  );
}
