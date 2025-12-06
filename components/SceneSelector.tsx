import React, { useState } from 'react';
import { StyleOption, StyleCategory } from '../types';

interface SceneSelectorProps {
  onSelect: (style: StyleOption) => void;
  disabled: boolean;
}

export const STYLES: StyleOption[] = [
  // Historical
  {
    id: '1920s',
    name: 'Roaring Twenties',
    description: 'Jazz, flappers, and Art Deco glamour.',
    promptSuffix: '1920s New York, wearing a flapper dress or tuxedo, jazz club background, art deco style, sepia tone',
    imagePlaceholder: 'https://picsum.photos/300/200?random=1',
    category: 'historical'
  },
  {
    id: 'victorian',
    name: 'Victorian Era',
    description: 'Steampunk vibes and industrial revolution elegance.',
    promptSuffix: 'Victorian London, wearing a top hat or corset dress, steampunk aesthetic, foggy cobblestone street, brass details',
    imagePlaceholder: 'https://picsum.photos/300/200?random=2',
    category: 'historical'
  },
  {
    id: 'medieval',
    name: 'Medieval Knight',
    description: 'Castles, armor, and epic fantasy.',
    promptSuffix: 'Medieval era, wearing shining silver plate armor, castle courtyard background, epic fantasy style, dramatic lighting',
    imagePlaceholder: 'https://picsum.photos/300/200?random=3',
    category: 'historical'
  },
  {
    id: 'ancient_egypt',
    name: 'Ancient Egypt',
    description: 'Pharaohs, pyramids, and golden sands.',
    promptSuffix: 'Ancient Egypt, wearing gold jewelry and white linen robes, pyramids in background, warm desert sunlight',
    imagePlaceholder: 'https://picsum.photos/300/200?random=4',
    category: 'historical'
  },
  {
    id: 'wild_west',
    name: 'Wild West',
    description: 'Cowboys, saloons, and the frontier.',
    promptSuffix: 'Wild West 1800s, wearing cowboy hat and leather duster, saloon background, dusty atmosphere, western movie style',
    imagePlaceholder: 'https://picsum.photos/300/200?random=6',
    category: 'historical'
  },
  // Professional
  {
    id: 'pro_headshot',
    name: 'Corporate Headshot',
    description: 'Clean, confident, and business-ready.',
    promptSuffix: 'Professional corporate headshot, wearing business suit, neutral grey studio background, soft studio lighting, 8k resolution, confident expression',
    imagePlaceholder: 'https://picsum.photos/300/200?random=7',
    category: 'professional'
  },
  {
    id: 'cinematic',
    name: 'Cinematic Portrait',
    description: 'Dramatic lighting and movie star aesthetic.',
    promptSuffix: 'Cinematic close-up portrait, teal and orange color grading, dramatic side lighting, shallow depth of field, bokeh background, high concept photography',
    imagePlaceholder: 'https://picsum.photos/300/200?random=8',
    category: 'professional'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon lights and high-tech future.',
    promptSuffix: 'Cyberpunk future city, neon lights, wearing futuristic techwear, holographic interface, rainy night, vibrant colors',
    imagePlaceholder: 'https://picsum.photos/300/200?random=5',
    category: 'professional'
  },
  {
    id: 'studio_bw',
    name: 'B&W Studio',
    description: 'Timeless artistic black and white.',
    promptSuffix: 'Artistic black and white studio portrait, high contrast, rembrandt lighting, black background, expressive and emotional',
    imagePlaceholder: 'https://picsum.photos/300/200?random=9',
    category: 'professional'
  },
];

const SceneSelector: React.FC<SceneSelectorProps> = ({ onSelect, disabled }) => {
  const [activeCategory, setActiveCategory] = useState<StyleCategory>('historical');

  const filteredStyles = STYLES.filter(s => s.category === activeCategory);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl text-center text-amber-500 mb-6 historical-font font-bold">Choose Your Style</h2>
      
      {/* Category Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-800 p-1 rounded-full inline-flex border border-slate-700">
          <button
            onClick={() => setActiveCategory('historical')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === 'historical' 
                ? 'bg-amber-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Time Travel
          </button>
          <button
            onClick={() => setActiveCategory('professional')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === 'professional' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Professional
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style)}
            disabled={disabled}
            className={`group relative h-40 rounded-xl overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              activeCategory === 'historical' 
                ? 'border-slate-700 hover:border-amber-500 focus:ring-amber-500' 
                : 'border-slate-700 hover:border-indigo-500 focus:ring-indigo-500'
            }`}
          >
            {/* Background Image Effect */}
            <div className="absolute inset-0 bg-slate-800 transition-transform duration-500 group-hover:scale-110">
                <img src={style.imagePlaceholder} alt={style.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-40" />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col justify-end text-left">
              <h3 className={`text-xl font-bold text-white mb-1 transition-colors ${
                 activeCategory === 'historical' ? 'group-hover:text-amber-400' : 'group-hover:text-indigo-400'
              }`}>{style.name}</h3>
              <p className="text-xs text-slate-300 line-clamp-2 group-hover:text-white">{style.description}</p>
            </div>

            {/* Selection Indicator */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className={`text-black text-xs font-bold px-2 py-1 rounded-full ${
                  activeCategory === 'historical' ? 'bg-amber-500' : 'bg-indigo-500 text-white'
               }`}>Select</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SceneSelector;