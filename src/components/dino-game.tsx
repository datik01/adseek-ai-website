'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface DinoGameState {
  dinoY: number;
  dinoVelY: number;
  isJumping: boolean;
  obstacles: { x: number; width: number; height: number }[];
  score: number;
  isGameOver: boolean;
  gameSpeed: number;
}

const INITIAL_STATE: DinoGameState = {
  dinoY: 150, // Position from top
  dinoVelY: 0,
  isJumping: false,
  obstacles: [],
  score: 0,
  isGameOver: false,
  gameSpeed: 5,
};

const GROUND_Y = 150;
const DINO_X = 50;
const DINO_WIDTH = 20;
const DINO_HEIGHT = 30;
const GRAVITY = 0.6;
const JUMP_FORCE = -10;
const OBSTACLE_MIN_GAP = 200;
const OBSTACLE_MAX_GAP = 400;
const OBSTACLE_WIDTH = 20;
const OBSTACLE_HEIGHT = 40;
const GAME_WIDTH = 600;
const GAME_HEIGHT = 200;

export default function DinoGame({ onScoreUpdate, onGameOver }: { onScoreUpdate: (score: number) => void; onGameOver: () => void }) {
  const [gameState, setGameState] = useState<DinoGameState>(INITIAL_STATE);
  const gameLoopRef = useRef<number | null>(null);
  const lastObstacleTimeRef = useRef<number>(0);
  const lastScoreIncrementTimeRef = useRef<number>(0); // Will accumulate delta time now
  const lastFrameTimestampRef = useRef<number>(0); // Added ref for previous frame time
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const resetGame = useCallback(() => {
    setGameState(INITIAL_STATE);
    lastObstacleTimeRef.current = 0;
    lastScoreIncrementTimeRef.current = 0; // Reset accumulator
    lastFrameTimestampRef.current = 0; // Reset frame timestamp
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    // Start the loop, capture the first timestamp to initialize frame timing
    gameLoopRef.current = requestAnimationFrame((firstTimestamp) => {
        lastFrameTimestampRef.current = firstTimestamp; // Initialize last frame time
        gameLoop(firstTimestamp); // Start the actual loop
    });
  }, []); // Add gameLoop to dependencies later if needed, currently empty for mount/unmount behavior

  const jump = useCallback(() => {
    if (!gameState.isJumping && !gameState.isGameOver) {
      setGameState(prev => ({ ...prev, dinoVelY: JUMP_FORCE, isJumping: true }));
    }
  }, [gameState.isJumping, gameState.isGameOver]);

  const gameLoop = useCallback((timestamp: number) => {
    if (gameState.isGameOver) {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      onGameOver();
      return;
    }

    // Calculate deltaTime since last frame
    const deltaTime = timestamp - lastFrameTimestampRef.current;
    lastFrameTimestampRef.current = timestamp; // Update for next frame calculation

    setGameState(prev => {
      // Use previous state directly for calculations
      let { dinoY, dinoVelY, isJumping, obstacles, gameSpeed } = prev;

      // Update Dino position (Gravity) - Use deltaTime for potentially smoother physics if needed, but sticking to original for now
      dinoVelY += GRAVITY;
      dinoY += dinoVelY;

      // Check ground collision
      if (dinoY >= GROUND_Y) {
        dinoY = GROUND_Y;
        dinoVelY = 0;
        isJumping = false;
      }

      // Update Obstacles
      const newObstacles = obstacles
        .map(obs => ({ ...obs, x: obs.x - gameSpeed }))
        .filter(obs => obs.x + obs.width > 0); // Remove off-screen obstacles

      // Add new obstacles
      const lastObstacle = newObstacles[newObstacles.length - 1];
      const timeSinceLastObstacle = timestamp - lastObstacleTimeRef.current;
      const nextObstacleThreshold = OBSTACLE_MIN_GAP + Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP);

      if (!lastObstacle || (GAME_WIDTH - lastObstacle.x >= nextObstacleThreshold && timeSinceLastObstacle > 500 / gameSpeed)) {
         newObstacles.push({
           x: GAME_WIDTH,
           width: OBSTACLE_WIDTH,
           height: OBSTACLE_HEIGHT,
         });
         lastObstacleTimeRef.current = timestamp;
      }


      // Collision Detection
      let collision = false;
      for (const obs of newObstacles) {
        if (
          DINO_X < obs.x + obs.width &&
          DINO_X + DINO_WIDTH > obs.x &&
          dinoY < GROUND_Y + DINO_HEIGHT && // Check if dino is high enough
          dinoY + DINO_HEIGHT > GROUND_Y + DINO_HEIGHT - obs.height // Check collision with obstacle height
        ) {
           // More precise check considering dino's actual height from ground
           const dinoBottom = dinoY + DINO_HEIGHT;
           const obstacleTop = GROUND_Y + DINO_HEIGHT - obs.height; // Obstacle top relative to canvas top
           if (dinoBottom > obstacleTop) {
               collision = true;
               break;
           }
        }
      }


      // --- Score Update Logic ---
      let newScore = prev.score;
      // Add deltaTime to the accumulator ref
      let accumulatedTime = lastScoreIncrementTimeRef.current + deltaTime;

      if (accumulatedTime >= 100) { // Check if threshold is met or exceeded
        newScore = prev.score + 1;
        accumulatedTime -= 100; // Subtract threshold, keep remainder for next frame
      }
      // Update the ref with the new accumulated time for the next frame
      lastScoreIncrementTimeRef.current = accumulatedTime;
      // --- End Score Update Logic ---

      // Increase speed gradually based on previous speed
      const newGameSpeed = prev.gameSpeed + 0.001;


      return {
        ...prev, // Spread previous state first
        dinoY,
        dinoVelY,
        isJumping,
        obstacles: newObstacles,
        score: newScore, // Assign the calculated new score
        isGameOver: collision,
        gameSpeed: newGameSpeed, // Assign the calculated new speed
      };
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    // Remove onScoreUpdate from dependencies here as it's handled in a separate effect
  }, [gameState.isGameOver, onGameOver]);

  // Effect to call onScoreUpdate when internal score changes
  useEffect(() => {
    onScoreUpdate(gameState.score); // Call onScoreUpdate whenever score changes
  }, [gameState.score, gameState.isGameOver, onScoreUpdate]);


  // Start game loop on mount
  useEffect(() => {
    resetGame(); // Start the game when component mounts
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetGame]); // Only run on mount/unmount

  // Handle user input (jump)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        jump();
      }
      if (gameState.isGameOver && e.code === 'Space') {
         resetGame();
      }
    };
     const handleTouch = () => {
        if (!gameState.isGameOver) { // Only jump if game is not over
            jump();
        }
     }

    window.addEventListener('keydown', handleKeyDown);
    // Add touch event listener for mobile
    const gameArea = gameAreaRef.current;
    if (gameArea) {
        gameArea.addEventListener('touchstart', handleTouch);
    }


    return () => {
      window.removeEventListener('keydown', handleKeyDown);
       if (gameArea) {
           gameArea.removeEventListener('touchstart', handleTouch);
       }
    };
  }, [jump, resetGame, gameState.isGameOver]);

  return (
    <div
      ref={gameAreaRef}
      className="relative border bg-gray-100 overflow-hidden"
      style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      tabIndex={0} // Make div focusable for key events if needed
    >
      {/* Ground */}
      <div
        className="absolute bottom-0 left-0 w-full bg-gray-400"
        style={{ height: `${GAME_HEIGHT - GROUND_Y}px` }}
      />

      {/* Dino */}
      <div
        className="absolute bg-green-600"
        style={{
          left: `${DINO_X}px`,
          bottom: `${GAME_HEIGHT - gameState.dinoY - DINO_HEIGHT}px`, // Position from bottom
          width: `${DINO_WIDTH}px`,
          height: `${DINO_HEIGHT}px`,
        }}
      />

      {/* Obstacles */}
      {gameState.obstacles.map((obs, index) => (
        <div
          key={index}
          className="absolute bg-red-600 bottom-0"
          style={{
            left: `${obs.x}px`,
            width: `${obs.width}px`,
            height: `${obs.height}px`,
            bottom: `${GAME_HEIGHT - GROUND_Y - DINO_HEIGHT + (DINO_HEIGHT - obs.height)}px` // Align obstacle bottom with ground
          }}
        />
      ))}

      {/* Score */}
      <div className="absolute top-2 right-2 text-lg font-mono">
        Score: {gameState.score}
      </div>

       {/* Game Over Message */}
       {gameState.isGameOver && (
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
           <div className="text-4xl font-bold mb-4">GAME OVER</div>
           <div className="text-xl">Score: {gameState.score}</div>
           <div className="mt-4 text-lg">Press Space to Restart</div>
         </div>
       )}
    </div>
  );
}
