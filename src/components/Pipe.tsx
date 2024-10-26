import React from 'react';

interface PipeProps {
  x: number;
  height: number;
  canvasHeight: number;
  gapHeight: number;
}

export const Pipe: React.FC<PipeProps> = ({ x, height, canvasHeight, gapHeight }) => {
  const PIPE_WIDTH = 60;
  
  return (
    <>
      {/* Top pipe */}
      <rect
        x={x}
        y={0}
        width={PIPE_WIDTH}
        height={height}
        fill="#2E8B57"
      />
      {/* Bottom pipe */}
      <rect
        x={x}
        y={height + gapHeight}
        width={PIPE_WIDTH}
        height={canvasHeight - height - gapHeight}
        fill="#2E8B57"
      />
    </>
  );
};