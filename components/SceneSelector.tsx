import React from 'react';
import { HistoricalEra } from '../types';

interface SceneSelectorProps {
  onSelect: (era: HistoricalEra) => void;
  disabled: boolean;
}

export const ERAS: HistoricalEra[] = [
  {
    id: '1920s',
    name: 'Roaring Twenties',
    description: 'Jazz, flappers, and Art Deco glamour.',
    promptSuffix: '1920s New York, wearing a flapper dress or tuxedo, jazz club background, art deco style, sepia tone',
    imagePlaceholder: 'https://picsum.photos/300/200?random=1'
  },
  {
    id: 'victorian',
    name: 'Victorian Era',
    description: 'Steampunk vibes and industrial revolution elegance.',
    promptSuffix: 'Victorian London, wearing a top hat or corset dress, steampunk aesthetic, foggy cobblestone street, brass details',
    imagePlaceholder: 'https://picsum.photos/300/200?random=2'
  },
  {
    id: 'medieval',
    name: 'Medieval Knight',
    description: 'Castles, armor, and epic fantasy.',
    promptSuffix: 'Medieval era, wearing shining silver plate armor, castle courtyard background, epic fantasy style, dramatic lighting',
    imagePlaceholder: 'https://picsum.photos/300/200?random=3'
  },
  {
    id: 'ancient_egypt',
    name: 'Ancient Egypt',
    description: 'Pharaohs, pyramids, and golden sands.',
    promptSuffix: 'Ancient Egypt, wearing gold jewelry and white linen robes, pyramids in background, warm desert sunlight',
    imagePlaceholder: 'https://picsum.photos/300/200?random=4'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077',
    description: 'Neon lights and high-tech future.',
    promptSuffix: 'Cyberpunk future city, neon lights, wearing futuristic techwear, holographic interface, rainy night, vibrant colors',
    imagePlaceholder: 'https://picsum.photos/300/200?random=5'
  },
  {
    id: 'wild_west',
    name: 'Wild West',
    description: 'Cowboys, saloons, and the frontier.',
    promptSuffix: 'Wild West 1800s, wearing cowboy hat and leather duster, saloon background, dusty atmosphere, western movie style',
    imagePlaceholder: 'https://picsum.photos/300/200?random=6'
  },
];

const SceneSelector: React.FC<SceneSelectorProps> = ({ onSelect, disabled }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl text-center text-amber-500 mb-6 historical-font font-bold">Choose Your Destiny</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {ERAS.map((era) => (
          <button
            key={era.id}
            onClick={() => onSelect(era)}
            disabled={disabled}
            className="group relative h-40 rounded-xl overflow-hidden border-2 border-slate-700 hover:border-amber-500 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {/* Background Image Effect - In a real app, use real era images */}
            <div className="absolute inset-0 bg-slate-800 transition-transform duration-500 group-hover:scale-110">
                <img src={era.imagePlaceholder} alt={era.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-40" />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col justify-end text-left">
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">{era.name}</h3>
              <p className="text-xs text-slate-300 line-clamp-2 group-hover:text-white">{era.description}</p>
            </div>

            {/* Selection Indicator */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded-full">Select</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SceneSelector;