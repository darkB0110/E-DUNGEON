import React from 'react';

const Loader: React.FC<{ text?: string }> = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-dungeon-800 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-dungeon-accent rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-dungeon-accent rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="text-dungeon-accent font-display tracking-widest text-sm animate-pulse">{text}</p>
    </div>
  );
};

export default Loader;
