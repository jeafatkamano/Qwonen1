import { Car } from 'lucide-react';

interface QwonenLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

export default function QwonenLogo({ size = 'md', className = '', animated = false }: QwonenLogoProps) {
  const sizeClasses = {
    sm: {
      container: 'text-lg',
      icon: 'w-4 h-4',
      spacing: 'gap-1'
    },
    md: {
      container: 'text-2xl',
      icon: 'w-6 h-6',
      spacing: 'gap-2'
    },
    lg: {
      container: 'text-4xl',
      icon: 'w-8 h-8',
      spacing: 'gap-3'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center justify-center ${currentSize.spacing} ${className}`}>
      {/* Icône de voiture stylisée */}
      <div className="relative">
        <Car className={`${currentSize.icon} text-red-500 ${animated ? 'qwonen-car-move' : ''}`} />
        {/* Effet de mouvement */}
        <div className={`absolute -right-1 -top-1 w-1 h-1 bg-red-500 rounded-full ${animated ? 'animate-pulse' : ''}`}></div>
      </div>
      
      {/* Texte du logo */}
      <span className={`${currentSize.container} font-bold tracking-tight ${animated ? 'qwonen-logo-glow' : ''}`}>
        <span className="text-black">Qwo</span>
        <span className="text-red-500">nen</span>
      </span>
    </div>
  );
}