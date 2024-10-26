import React from 'react';

interface GameOverlayProps {
  gameStarted: boolean;
  gameOver: boolean;
  score: number;
  highScore: number;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({ gameStarted, gameOver, score, highScore }) => {
  if (gameStarted && !gameOver) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
      <div className="text-white text-center">
        {!gameStarted ? (
          <>
            <h2 className="text-3xl font-bold mb-4">Flappy Bird</h2>
            <p className="mb-2">Click or hold SPACE to fly</p>
            <p className="text-sm">The longer you hold, the higher you'll go!</p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
            <p className="mb-2">Score: {score}</p>
            <p className="mb-4">High Score: {highScore}</p>
            <p>Click or press SPACE to play again</p>
          </>
        )}
      </div>
    </div>
  );
};