'use client'; // Add this line because we'll use state hooks

import React, { useState, useCallback } from 'react';
import DinoGame from '@/components/dino-game'; // Import the game component

export default function GamePage() {
  const [score, setScore] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false); // To control when the game runs
  const [isGameOver, setIsGameOver] = useState(false);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleGameOver = useCallback(() => {
    setIsGameActive(false);
    setIsGameOver(true);
    // Here you might submit the score if it was a contest entry
    console.log(`Game Over! Final Score: ${score}`);
  }, [score]);

  const startPractice = () => {
    setScore(0);
    setIsGameOver(false);
    setIsGameActive(true);
    // The DinoGame component resets itself internally when it mounts or restarts
  };

  const enterContest = () => {
    // TODO: Implement payment and contest entry logic
    console.log("Entering contest...");
    setScore(0);
    setIsGameOver(false);
    setIsGameActive(true);
  };


  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Dino Run Contest</h1>
      <p className="mb-6 text-center">Practice your skills or enter a contest to win!</p>

      {/* Game Component Area */}
      <div className="mb-6">
        {isGameActive ? (
          <DinoGame onScoreUpdate={handleScoreUpdate} onGameOver={handleGameOver} />
        ) : (
          <div
            className="bg-gray-200 flex items-center justify-center text-gray-500"
            style={{ width: '600px', height: '200px' }} // Match game dimensions
          >
            {isGameOver ? `Game Over! Final Score: ${score}` : '[Press Practice or Enter Contest]'}
          </div>
        )}
      </div>


      {/* Score Display */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Score: {score}</h2>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={startPractice}
          disabled={isGameActive}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Practice
        </button>
        <button
          onClick={enterContest}
          disabled={isGameActive}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Enter Contest ($1 Entry)
        </button>
      </div>

      {/* Contest Details */}
      <div className="mt-8 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Contest Details</h3>
        <p>Players: 1/10</p>
        <p>Prize Pool: $9</p>
      </div>
    </div>
  );
}
