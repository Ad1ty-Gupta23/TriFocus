import React, { useEffect, useRef, useState } from 'react';

const CosmicDefender = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [showStart, setShowStart] = useState(true);
  const [highScore, setHighScore] = useState(0);
  const [keys, setKeys] = useState({});
  const playerRef = useRef({ 
    x: 0, y: 0, width: 40, height: 40, speed: 6, 
    health: 100, maxHealth: 100, shield: 0, rapidFire: 0 
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    const player = playerRef.current;
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 80;

    let bullets = [];
    let enemies = [];
    let powerUps = [];
    let particles = [];
    let boss = null;
    let frame = 0;
    let shootCooldown = 0;
    let enemySpawnRate = 100;
    let nextBossScore = 500;

    const handleKeyDown = (e) => {
      setKeys((prev) => ({ ...prev, [e.key]: true }));
      if (e.key === 'p' || e.key === 'P') setPaused(prev => !prev);
    };
    const handleKeyUp = (e) => setKeys((prev) => ({ ...prev, [e.key]: false }));

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const shoot = () => {
      const bulletCount = player.rapidFire > 0 ? 3 : 1;
      for (let i = 0; i < bulletCount; i++) {
        bullets.push({
          x: player.x + player.width / 2 - 2 + (i - 1) * 15,
          y: player.y,
          width: 4,
          height: 12,
          speed: 10,
          color: player.rapidFire > 0 ? '#ff0' : '#0ff'
        });
      }
    };

    const createEnemy = () => {
      const types = ['basic', 'fast', 'heavy'];
      const type = types[Math.floor(Math.random() * types.length)];
      const enemy = {
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: type === 'heavy' ? 60 : 40,
        height: type === 'heavy' ? 50 : 40,
        speed: type === 'fast' ? 4 + level : type === 'heavy' ? 1 + level * 0.5 : 2 + level * 0.3,
        health: type === 'heavy' ? 3 : 1,
        maxHealth: type === 'heavy' ? 3 : 1,
        type: type,
        shootTimer: Math.random() * 60,
        color: type === 'fast' ? '#f0f' : type === 'heavy' ? '#f80' : '#0f0'
      };
      enemies.push(enemy);
    };

    const createBoss = () => {
      boss = {
        x: canvas.width / 2 - 80,
        y: -120,
        width: 160,
        height: 120,
        speed: 1,
        health: 20 + level * 5,
        maxHealth: 20 + level * 5,
        shootTimer: 0,
        moveTimer: 0,
        direction: 1
      };
    };

    const createPowerUp = (x, y) => {
      if (Math.random() < 0.3) {
        const types = ['health', 'shield', 'rapidFire'];
        powerUps.push({
          x: x, y: y, width: 25, height: 25,
          type: types[Math.floor(Math.random() * types.length)],
          speed: 3, timer: 0
        });
      }
    };

    const createParticle = (x, y, color = '#ff0', count = 8) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: x, y: y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 30, color: color
        });
      }
    };

    const update = () => {
      if (paused || gameOver) return;

      // Player movement
      if (keys['ArrowLeft'] || keys['a']) player.x = Math.max(0, player.x - player.speed);
      if (keys['ArrowRight'] || keys['d']) player.x = Math.min(canvas.width - player.width, player.x + player.speed);
      if (keys['ArrowUp'] || keys['w']) player.y = Math.max(0, player.y - player.speed);
      if (keys['ArrowDown'] || keys['s']) player.y = Math.min(canvas.height - player.height, player.y + player.speed);

      // Shooting
      if ((keys[' '] || keys['Spacebar']) && shootCooldown <= 0) {
        shoot();
        shootCooldown = player.rapidFire > 0 ? 8 : 15;
      }
      shootCooldown = Math.max(0, shootCooldown - 1);

      // Power-up timers
      if (player.shield > 0) player.shield--;
      if (player.rapidFire > 0) player.rapidFire--;

      // Update bullets
      bullets.forEach(b => b.y -= b.speed);
      bullets = bullets.filter(b => b.y > -b.height);

      // Spawn enemies
      if (frame % Math.max(20, enemySpawnRate - level * 5) === 0) createEnemy();

      // Boss logic
      if (score >= nextBossScore && !boss) {
        createBoss();
        nextBossScore += 1000;
      }

      if (boss) {
        boss.y = Math.min(50, boss.y + boss.speed);
        boss.moveTimer++;
        if (boss.moveTimer > 60) {
          boss.direction *= -1;
          boss.moveTimer = 0;
        }
        boss.x += boss.direction * 2;
        boss.x = Math.max(0, Math.min(canvas.width - boss.width, boss.x));

        boss.shootTimer++;
        if (boss.shootTimer > 30) {
          enemies.push({
            x: boss.x + boss.width / 2 - 5,
            y: boss.y + boss.height,
            width: 10, height: 15,
            speed: 5, health: 1, maxHealth: 1,
            type: 'boss_bullet', color: '#f00'
          });
          boss.shootTimer = 0;
        }
      }

      // Update enemies
      enemies.forEach((e, i) => {
        e.y += e.speed;
        if (e.type !== 'boss_bullet') {
          e.shootTimer++;
          if (e.shootTimer > 120 && Math.random() < 0.02) {
            enemies.push({
              x: e.x + e.width / 2 - 3,
              y: e.y + e.height,
              width: 6, height: 10,
              speed: 4, health: 1, maxHealth: 1,
              type: 'enemy_bullet', color: '#f44'
            });
            e.shootTimer = 0;
          }
        }

        // Collision with player
        if (e.x < player.x + player.width && e.x + e.width > player.x &&
            e.y < player.y + player.height && e.y + e.height > player.y) {
          if (player.shield <= 0) {
            player.health -= 20;
            if (player.health <= 0) {
              setLives(prev => prev - 1);
              player.health = player.maxHealth;
              if (lives <= 1) setGameOver(true);
            }
          }
          createParticle(e.x + e.width/2, e.y + e.height/2, '#f00');
          enemies.splice(i, 1);
        }
      });

      // Bullet collisions
      bullets.forEach((b, bi) => {
        enemies.forEach((e, ei) => {
          if (e.type !== 'enemy_bullet' && e.type !== 'boss_bullet' &&
              b.x < e.x + e.width && b.x + b.width > e.x &&
              b.y < e.y + e.height && b.y + b.height > e.y) {
            e.health--;
            bullets.splice(bi, 1);
            createParticle(e.x + e.width/2, e.y + e.height/2);
            
            if (e.health <= 0) {
              setScore(prev => {
                const newScore = prev + (e.type === 'heavy' ? 50 : e.type === 'fast' ? 30 : 20);
                if (newScore > highScore) setHighScore(newScore);
                return newScore;
              });
              createPowerUp(e.x + e.width/2, e.y + e.height/2);
              createParticle(e.x + e.width/2, e.y + e.height/2, '#0f0', 12);
              enemies.splice(ei, 1);
            }
          }
        });

        // Boss collision
        if (boss && b.x < boss.x + boss.width && b.x + b.width > boss.x &&
            b.y < boss.y + boss.height && b.y + b.height > boss.y) {
          boss.health--;
          bullets.splice(bi, 1);
          createParticle(b.x, b.y, '#ff0');
          
          if (boss.health <= 0) {
            setScore(prev => {
              const newScore = prev + 500;
              if (newScore > highScore) setHighScore(newScore);
              return newScore;
            });
            setLevel(prev => prev + 1);
            createParticle(boss.x + boss.width/2, boss.y + boss.height/2, '#f0f', 20);
            boss = null;
          }
        }
      });

      // Update power-ups
      powerUps.forEach((p, i) => {
        p.y += p.speed;
        p.timer++;
        if (p.x < player.x + player.width && p.x + p.width > player.x &&
            p.y < player.y + player.height && p.y + p.height > player.y) {
          if (p.type === 'health') player.health = Math.min(player.maxHealth, player.health + 30);
          else if (p.type === 'shield') player.shield = 180;
          else if (p.type === 'rapidFire') player.rapidFire = 300;
          createParticle(p.x + p.width/2, p.y + p.height/2, '#0ff');
          powerUps.splice(i, 1);
        }
      });

      // Update particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
      });

      // Clean up
      enemies = enemies.filter(e => e.y <= canvas.height + 50);
      powerUps = powerUps.filter(p => p.y <= canvas.height);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Animated background
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      for (let i = 0; i < 150; i++) {
        const x = (i * 47 + frame * 0.5) % canvas.width;
        const y = (i * 89 + frame * 0.8) % canvas.height;
        ctx.fillRect(x, y, Math.random() * 2, Math.random() * 2);
      }

      // Player
      ctx.fillStyle = player.shield > 0 ? '#0ff' : '#00f';
      ctx.fillRect(player.x, player.y, player.width, player.height);
      if (player.shield > 0) {
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(player.x - 5, player.y - 5, player.width + 10, player.height + 10);
      }

      // Health bar
      const healthPercent = player.health / player.maxHealth;
      ctx.fillStyle = '#600';
      ctx.fillRect(10, 10, 200, 15);
      ctx.fillStyle = healthPercent > 0.3 ? '#0f0' : '#f00';
      ctx.fillRect(10, 10, 200 * healthPercent, 15);

      // Bullets
      bullets.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.width, b.height);
      });

      // Enemies
      enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.width, e.height);
        if (e.maxHealth > 1) {
          const hPercent = e.health / e.maxHealth;
          ctx.fillStyle = '#300';
          ctx.fillRect(e.x, e.y - 8, e.width, 4);
          ctx.fillStyle = '#f00';
          ctx.fillRect(e.x, e.y - 8, e.width * hPercent, 4);
        }
      });

      // Boss
      if (boss) {
        ctx.fillStyle = '#800';
        ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
        const bHealthPercent = boss.health / boss.maxHealth;
        ctx.fillStyle = '#400';
        ctx.fillRect(boss.x, boss.y - 15, boss.width, 8);
        ctx.fillStyle = '#f00';
        ctx.fillRect(boss.x, boss.y - 15, boss.width * bHealthPercent, 8);
      }

      // Power-ups
      powerUps.forEach(p => {
        const colors = { health: '#0f0', shield: '#0ff', rapidFire: '#ff0' };
        ctx.fillStyle = colors[p.type];
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(p.x + 2, p.y + 2, p.width - 4, p.height - 4);
      });

      // Particles
      particles.forEach(p => {
        const alpha = p.life / 30;
        ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('#', 'rgba(').replace(/(.{2})/g, '$1,').slice(0, -1) + ')';
        ctx.fillRect(p.x, p.y, 3, 3);
      });

      // UI
      ctx.fillStyle = '#fff';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, 10, 50);
      ctx.fillText(`Level: ${level}`, 10, 75);
      ctx.fillText(`Lives: ${lives}`, 10, 100);
      ctx.fillText(`High: ${highScore}`, canvas.width - 120, 30);

      if (paused) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width/2, canvas.height/2);
        ctx.font = '24px Arial';
        ctx.fillText('Press P to continue', canvas.width/2, canvas.height/2 + 50);
        ctx.textAlign = 'left';
      }
    };

    const loop = () => {
      if (gameOver) return;
      frame++;
      update();
      draw();
      requestAnimationFrame(loop);
    };

    if (!showStart) loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver, showStart, paused, lives]);

  const startGame = () => {
    setShowStart(false);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setLives(3);
    setPaused(false);
  };

  const restartGame = () => {
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setLives(3);
    setPaused(false);
    playerRef.current.health = 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-pink-400">
        🚀 Cosmic Defender
      </h1>
      
      {showStart ? (
        <div className="text-center bg-black bg-opacity-50 p-8 rounded-xl backdrop-blur-sm border border-purple-500">
          <h2 className="text-2xl mb-4">Advanced Space Combat</h2>
          <div className="text-left mb-6 space-y-2">
            <p>🎮 <strong>WASD/Arrows:</strong> Move ship</p>
            <p>🔫 <strong>Space:</strong> Shoot</p>
            <p>⏸️ <strong>P:</strong> Pause</p>
            <p>💊 <strong>Power-ups:</strong> Health (🟢), Shield (🔵), Rapid Fire (🟡)</p>
            <p>👾 <strong>Enemies:</strong> Basic, Fast, Heavy types</p>
            <p>🏆 <strong>Boss battles every 500 points!</strong></p>
          </div>
          <button 
            onClick={startGame}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-full font-bold transition-all duration-200 transform hover:scale-105"
          >
            🚀 Launch Game
          </button>
          {highScore > 0 && <p className="mt-4 text-yellow-400">High Score: {highScore}</p>}
        </div>
      ) : (
        <div className="relative">
          <canvas 
            ref={canvasRef} 
            className="border-4 border-purple-500 rounded-lg shadow-2xl bg-black"
          />
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-red-500 mb-4">GAME OVER</h2>
                <p className="text-xl mb-2">Final Score: {score}</p>
                <p className="text-lg mb-6">Level Reached: {level}</p>
                <button 
                  onClick={restartGame}
                  className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 px-6 py-3 rounded-full font-bold transition-all duration-200 transform hover:scale-110"
                >
                  🔄 Play Again
                </button>
              </div>
            </div>
          )}
          <p className="text-center mt-4 text-sm opacity-75">
            WASD/Arrows: Move | Space: Shoot | P: Pause
          </p>
        </div>
      )}
    </div>
  );
};

export default CosmicDefender;