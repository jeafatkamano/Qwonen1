import { useEffect, useState } from 'react';
import { MapPin, Car } from 'lucide-react';
import QwonenLogo from './QwonenLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    // Animation d'entrée du logo
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 300);

    // Animation de la barre de progression
    const progressTimer = setTimeout(() => {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 40);
    }, 800);

    // Timer principal pour terminer le splash
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 3200);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(progressTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col items-center justify-center z-50">
      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className={`text-center transition-all duration-700 ${showLogo ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
          {/* Logo Qwonen */}
          <div className="flex items-center justify-center mb-8">
            <QwonenLogo size="lg" animated={true} />
          </div>
          
          {/* Slogan */}
          <p className="text-xl text-gray-600 font-medium mb-6">
            Transport pour la Guinée
          </p>
          
          {/* Description */}
          <p className="text-gray-500 text-base max-w-xs mx-auto leading-relaxed">
            Votre application de transport rapide, sûre et abordable
          </p>
        </div>
      </div>
      
      {/* Barre de progression moderne */}
      <div className="mb-16 w-full max-w-xs px-8">
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-black to-red-500 rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>Chargement...</span>
          <span>{progress}%</span>
        </div>
      </div>
      
      {/* Crédit Sinaiproduction */}
      <div className={`pb-8 transition-all duration-500 delay-1000 ${showLogo ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
          <p className="text-sm tracking-wider font-light">
            Sinaiproduction
          </p>
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
        </div>
      </div>

      {/* Effet de particules subtil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-black/5 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}