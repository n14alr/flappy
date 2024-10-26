import React from 'react';

interface BirdProps {
  y: number;
}

export const Bird: React.FC<BirdProps> = ({ y }) => {
  return (
    <circle
      cx={100}
      cy={y}
      r={15}
      fill="#FFD700"
    />
  );
};