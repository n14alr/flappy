import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameOverlay } from './GameOverlay';

const GRAVITY = 0.4;
const JUMP_FORCE = -6;
const PIPE_SPEED = 1.5;
const PIPE_SPACING = 300;
const PIPE_WIDTH = 60;
const GAP_HEIGHT = 200;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const HOLD_FORCE = -0.5;
const BIRD_RADIUS = 15;
const MAX_UPWARD_VELOCITY = -4;

interface GameState {
  bird: { y: number; velocity: number };
  pipes: Array<{ x: number; height: number }>;
  animationFrame: number;
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isHolding, setIsHolding] = useState(false);

  const gameStateRef = useRef<GameState>({
    bird: { y: 250, velocity: 0 },
    pipes: [{ x: 400, height: Math.random() * 150 + 100 }],
    animationFrame: 0,
  });

  const drawBird = useCallback((ctx: CanvasRenderingContext2D, y: number) => {
    // Bird body
    ctx.beginPath();
    ctx.arc(100, y, BIRD_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Eye
    ctx.beginPath();
    ctx.arc(108, y - 5, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.closePath();

    // Wing
    ctx.beginPath();
    ctx.ellipse(95, y + 5, 8, 5, Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = '#DAA520';
    ctx.fill();
    ctx.closePath();
  }, []);

  const drawPipe = useCallback((ctx: CanvasRenderingContext2D, x: number, height: number) => {
    // Top pipe
    ctx.fillStyle = '#2E8B57';
    ctx.fillRect(x, 0, PIPE_WIDTH, height);
    ctx.strokeStyle = '#1a5c34';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, 0, PIPE_WIDTH, height);

    // Top pipe cap
    ctx.fillStyle = '#3CB371';
    ctx.fillRect(x - 5, height - 20, PIPE_WIDTH + 10, 20);

    // Bottom pipe
    const bottomPipeY = height + GAP_HEIGHT;
    ctx.fillStyle = '#2E8B57';
    ctx.fillRect(x, bottomPipeY, PIPE_WIDTH, CANVAS_HEIGHT - bottomPipeY);
    ctx.strokeStyle = '#1a5c34';
    ctx.strokeRect(x, bottomPipeY, PIPE_WIDTH, CANVAS_HEIGHT - bottomPipeY);

    // Bottom pipe cap
    ctx.fillStyle = '#3CB371';
    ctx.fillRect(x - 5, bottomPipeY, PIPE_WIDTH + 10, 20);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const time = Date.now() * 0.001;
    for (let i = 0; i < 3; i++) {
      const x = ((time * 20 + i * 200) % (CANVAS_WIDTH + 200)) - 100;
      const y = 50 + i * 40;
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.arc(x + 25, y - 10, 25, 0, Math.PI * 2);
      ctx.arc(x + 25, y + 10, 25, 0, Math.PI * 2);
      ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }

    // Pipes
    gameStateRef.current.pipes.forEach(pipe => {
      drawPipe(ctx, pipe.x, pipe.height);
    });

    // Bird
    drawBird(ctx, gameStateRef.current.bird.y);

    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, CANVAS_HEIGHT - 23, CANVAS_WIDTH, 3);

    // Score
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.strokeText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Score: ${score}`, 10, 30);
  }, [score, drawBird, drawPipe]);

  const update = useCallback(() => {
    if (!gameStarted || gameOver) return;

    const state = gameStateRef.current;
    
    // Bird physics
    if (isHolding) {
      state.bird.velocity += HOLD_FORCE;
      state.bird.velocity = Math.max(state.bird.velocity, MAX_UPWARD_VELOCITY);
    } else {
      state.bird.velocity += GRAVITY;
    }
    
    state.bird.y += state.bird.velocity;

    // Pipe movement
    state.pipes.forEach(pipe => {
      pipe.x -= PIPE_SPEED;
    });

    // Generate new pipes
    if (state.pipes[state.pipes.length - 1].x < CANVAS_WIDTH - PIPE_SPACING) {
      state.pipes.push({
        x: CANVAS_WIDTH,
        height: Math.random() * 150 + 100,
      });
    }

    // Remove off-screen pipes and update score
    if (state.pipes[0].x < -PIPE_WIDTH) {
      state.pipes.shift();
      setScore(prev => prev + 1);
    }

    // Collision detection
    const birdY = state.bird.y;
    const hitGround = birdY > CANVAS_HEIGHT - 35;
    const hitCeiling = birdY < 15;

    const hitPipe = state.pipes.some(pipe => {
      const inXRange = pipe.x < 115 && pipe.x + PIPE_WIDTH > 85;
      const hitTopPipe = birdY - BIRD_RADIUS < pipe.height;
      const hitBottomPipe = birdY + BIRD_RADIUS > pipe.height + GAP_HEIGHT;
      return inXRange && (hitTopPipe || hitBottomPipe);
    });

    if (hitGround || hitCeiling || hitPipe) {
      setGameOver(true);
      setHighScore(prev => Math.max(prev, score));
    }

    draw();
  }, [draw, gameStarted, gameOver, score, isHolding]);

  const jump = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    if (gameOver) {
      setGameOver(false);
      setScore(0);
      gameStateRef.current = {
        bird: { y: 250, velocity: 0 },
        pipes: [{ x: 400, height: Math.random() * 150 + 100 }],
        animationFrame: 0,
      };
    }
    gameStateRef.current.bird.velocity = JUMP_FORCE;
  }, [gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    draw();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isHolding) {
          jump();
          setIsHolding(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsHolding(false);
      }
    };

    const handleMouseDown = () => {
      jump();
      setIsHolding(true);
    };

    const handleMouseUp = () => {
      setIsHolding(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    const gameLoop = () => {
      update();
      gameStateRef.current.animationFrame = requestAnimationFrame(gameLoop);
    };
    gameStateRef.current.animationFrame = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      cancelAnimationFrame(gameStateRef.current.animationFrame);
    };
  }, [jump, update, draw, isHolding]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center flex-col">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-emerald-600 rounded-lg shadow-lg"
        />
        <GameOverlay
          gameStarted={gameStarted}
          gameOver={gameOver}
          score={score}
          highScore={highScore}
        />
      </div>
    </div>
  );
}