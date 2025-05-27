import { useEffect, useRef, useState } from 'react';

const FRUIT_SIZE = 40;
const BASKET_WIDTH = 100;
const BASKET_HEIGHT = 30;
const FALL_SPEED = 3;

function getRandomX(max) {
  return Math.floor(Math.random() * (max - FRUIT_SIZE));
}

export default function Game() {
  const [basketX, setBasketX] = useState(150);
  const [fruits, setFruits] = useState([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameAreaRef = useRef();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') {
        setBasketX((prev) => Math.max(prev - 20, 0));
      } else if (e.key === 'ArrowRight') {
        setBasketX((prev) =>
          Math.min(prev + 20, gameAreaRef.current.clientWidth - BASKET_WIDTH)
        );
      } else if (gameOver && e.key === 'r') {
        setScore(0);
        setMissed(0);
        setFruits([]);
        setGameOver(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setFruits((prev) => [...prev, { x: getRandomX(400), y: 0 }]);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setFruits((prev) => {
        const updated = prev.map((fruit) => ({ ...fruit, y: fruit.y + FALL_SPEED }));
        const caught = updated.filter((fruit) => {
          const isCaught =
            fruit.y + FRUIT_SIZE >= 360 &&
            fruit.x >= basketX &&
            fruit.x <= basketX + BASKET_WIDTH;
          if (isCaught) setScore((s) => s + 1);
          return !isCaught;
        });

        const missedNow = caught.filter((f) => f.y > 400).length;
        if (missedNow > 0) setMissed((m) => m + missedNow);

        return caught.filter((f) => f.y <= 400);
      });
    }, 30);
    return () => clearInterval(interval);
  }, [basketX, gameOver]);

  useEffect(() => {
    if (missed >= 5) setGameOver(true);
  }, [missed]);

  return (
    <div
      className="relative w-[400px] h-[400px] mx-auto mt-10 bg-gradient-to-t from-green-100 to-blue-100 border-2 border-gray-800 rounded-lg overflow-hidden"
      ref={gameAreaRef}
    >
      <div className="absolute top-2 left-2 text-lg flex gap-6">
        <span>Score: {score}</span>
        <span>Missed: {missed}/5</span>
      </div>

      {fruits.map((fruit, index) => (
        <div
          key={index}
          className="absolute w-10 h-10 bg-red-500 border-2 border-red-900 rounded-full"
          style={{ left: fruit.x, top: fruit.y }}
        />
      ))}

      <div
        className="absolute w-[100px] h-[30px] bg-yellow-700 rounded-xl bottom-0"
        style={{ left: basketX }}
      />

      {gameOver && (
        <div className="absolute top-1/3 left-0 w-full text-center bg-white bg-opacity-80 py-6 text-red-700">
          <h2 className="text-2xl font-bold">Game Over</h2>
          <p>Your Score: {score}</p>
          <p className="mt-2">Press 'R' to Restart</p>
        </div>
      )}
    </div>
  );
}