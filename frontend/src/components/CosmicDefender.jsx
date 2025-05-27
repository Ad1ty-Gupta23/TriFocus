import React, { useState, useEffect, useCallback, useRef } from 'react';

const CosmicDefender = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const keysRef = useRef({});
  const gameStateRef = useRef({
    player: { x: 375, y: 500, width: 50, height: 40, health: 100, maxHealth: 100 },
    bullets: [],
    enemies: [],
    powerUps: [],
    boss: null,
    particles: [],
    score: 0,
    wave: 1,
    gameOver: false,
    paused: false,
    powerUpType: null,
    powerUpTimer: 0
  });

  const [gameState, setGameState] = useState(gameStateRef.current);
  const [showInstructions, setShowInstructions] = useState(true);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PLAYER_SPEED = 5;
  const BULLET_SPEED = 8;
  const ENEMY_SPEED = 2;
  const POWERUP_TYPES = ['rapidFire', 'shield', 'multiShot'];

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Keyboard event listeners
    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;
      if (e.key === ' ') {
        e.preventDefault();
        if (!gameStateRef.current.gameOver && !gameStateRef.current.paused) {
          shootBullet();
        }
      }
      if (e.key === 'p' || e.key === 'P') {
        togglePause();
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  const startGame = () => {
    setShowInstructions(false);
    gameStateRef.current = {
      player: { x: 375, y: 500, width: 50, height: 40, health: 100, maxHealth: 100 },
      bullets: [],
      enemies: [],
      powerUps: [],
      boss: null,
      particles: [],
      score: 0,
      wave: 1,
      gameOver: false,
      paused: false,
      powerUpType: null,
      powerUpTimer: 0
    };
    spawnEnemyWave();
    gameLoop();
  };

  const togglePause = () => {
    gameStateRef.current.paused = !gameStateRef.current.paused;
    setGameState({...gameStateRef.current});
    if (!gameStateRef.current.paused) {
      gameLoop();
    }
  };

  const shootBullet = () => {
    const player = gameStateRef.current.player;
    const bullets = gameStateRef.current.bullets;
    
    if (gameStateRef.current.powerUpType === 'multiShot') {
      bullets.push(
        { x: player.x + 15, y: player.y, width: 4, height: 10, speed: BULLET_SPEED },
        { x: player.x + 25, y: player.y, width: 4, height: 10, speed: BULLET_SPEED },
        { x: player.x + 35, y: player.y, width: 4, height: 10, speed: BULLET_SPEED }
      );
    } else {
      bullets.push({ x: player.x + 23, y: player.y, width: 4, height: 10, speed: BULLET_SPEED });
    }
  };

  const spawnEnemyWave = () => {
    const enemies = [];
    const wave = gameStateRef.current.wave;
    
    // Regular enemies
    for (let i = 0; i < 5 + wave; i++) {
      enemies.push({
        x: Math.random() * (CANVAS_WIDTH - 40),
        y: -Math.random() * 200 - 50,
        width: 40,
        height: 30,
        health: 1 + Math.floor(wave / 3),
        speed: ENEMY_SPEED + wave * 0.2,
        type: 'basic'
      });
    }
    
    // Boss every 5 waves
    if (wave % 5 === 0) {
      gameStateRef.current.boss = {
        x: CANVAS_WIDTH / 2 - 60,
        y: -100,
        width: 120,
        height: 80,
        health: 20 + wave * 2,
        maxHealth: 20 + wave * 2,
        speed: 1,
        shootTimer: 0,
        moveDirection: 1
      };
    }
    
    gameStateRef.current.enemies = enemies;
  };

  const spawnPowerUp = (x, y) => {
    if (Math.random() < 0.3) {
      const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
      gameStateRef.current.powerUps.push({
        x: x,
        y: y,
        width: 30,
        height: 30,
        type: type,
        speed: 2
      });
    }
  };

  const createParticles = (x, y, count = 5) => {
    for (let i = 0; i < count; i++) {
      gameStateRef.current.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20,
        maxLife: 20
      });
    }
  };

  const checkCollisions = () => {
    const state = gameStateRef.current;
    
    // Bullet vs enemies
    state.bullets.forEach((bullet, bulletIndex) => {
      state.enemies.forEach((enemy, enemyIndex) => {
        if (bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y) {
          
          enemy.health--;
          state.bullets.splice(bulletIndex, 1);
          createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
          
          if (enemy.health <= 0) {
            state.score += 100;
            spawnPowerUp(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            state.enemies.splice(enemyIndex, 1);
            createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 8);
          }
        }
      });
      
      // Bullet vs boss
      if (state.boss && 
          bullet.x < state.boss.x + state.boss.width &&
          bullet.x + bullet.width > state.boss.x &&
          bullet.y < state.boss.y + state.boss.height &&
          bullet.y + bullet.height > state.boss.y) {
        
        state.boss.health--;
        state.bullets.splice(bulletIndex, 1);
        createParticles(bullet.x, bullet.y);
        
        if (state.boss.health <= 0) {
          state.score += 1000;
          createParticles(state.boss.x + state.boss.width/2, state.boss.y + state.boss.height/2, 15);
          state.boss = null;
        }
      }
    });
    
    // Player vs enemies
    state.enemies.forEach((enemy, enemyIndex) => {
      if (state.player.x < enemy.x + enemy.width &&
          state.player.x + state.player.width > enemy.x &&
          state.player.y < enemy.y + enemy.height &&
          state.player.y + state.player.height > enemy.y) {
        
        if (state.powerUpType !== 'shield') {
          state.player.health -= 20;
        }
        state.enemies.splice(enemyIndex, 1);
        createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
      }
    });
    
    // Player vs power-ups
    state.powerUps.forEach((powerUp, powerUpIndex) => {
      if (state.player.x < powerUp.x + powerUp.width &&
          state.player.x + state.player.width > powerUp.x &&
          state.player.y < powerUp.y + powerUp.height &&
          state.player.y + state.player.height > powerUp.y) {
        
        state.powerUpType = powerUp.type;
        state.powerUpTimer = 300; // 5 seconds at 60fps
        state.powerUps.splice(powerUpIndex, 1);
        
        if (powerUp.type === 'shield') {
          state.player.health = Math.min(state.player.maxHealth, state.player.health + 20);
        }
      }
    });
  };

  const updateGame = () => {
    const state = gameStateRef.current;
    if (state.gameOver || state.paused) return;

    // Update player movement
    if (keysRef.current['ArrowLeft'] || keysRef.current['a']) {
      state.player.x = Math.max(0, state.player.x - PLAYER_SPEED);
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['d']) {
      state.player.x = Math.min(CANVAS_WIDTH - state.player.width, state.player.x + PLAYER_SPEED);
    }
    if (keysRef.current['ArrowUp'] || keysRef.current['w']) {
      state.player.y = Math.max(0, state.player.y - PLAYER_SPEED);
    }
    if (keysRef.current['ArrowDown'] || keysRef.current['s']) {
      state.player.y = Math.min(CANVAS_HEIGHT - state.player.height, state.player.y + PLAYER_SPEED);
    }

    // Auto-shoot with rapid fire
    if (state.powerUpType === 'rapidFire' && Math.random() < 0.3) {
      shootBullet();
    }

    // Update power-up timer
    if (state.powerUpTimer > 0) {
      state.powerUpTimer--;
      if (state.powerUpTimer === 0) {
        state.powerUpType = null;
      }
    }

    // Update bullets
    state.bullets.forEach((bullet, index) => {
      bullet.y -= bullet.speed;
      if (bullet.y < 0) {
        state.bullets.splice(index, 1);
      }
    });

    // Update enemies
    state.enemies.forEach((enemy, index) => {
      enemy.y += enemy.speed;
      if (enemy.y > CANVAS_HEIGHT) {
        state.enemies.splice(index, 1);
      }
    });

    // Update boss
    if (state.boss) {
      state.boss.y = Math.min(50, state.boss.y + state.boss.speed);
      state.boss.x += state.boss.moveDirection * 2;
      
      if (state.boss.x <= 0 || state.boss.x >= CANVAS_WIDTH - state.boss.width) {
        state.boss.moveDirection *= -1;
      }
      
      // Boss shooting
      state.boss.shootTimer++;
      if (state.boss.shootTimer > 60) {
        state.enemies.push({
          x: state.boss.x + state.boss.width/2 - 5,
          y: state.boss.y + state.boss.height,
          width: 10,
          height: 15,
          health: 1,
          speed: 4,
          type: 'boss_bullet'
        });
        state.boss.shootTimer = 0;
      }
    }

    // Update power-ups
    state.powerUps.forEach((powerUp, index) => {
      powerUp.y += powerUp.speed;
      if (powerUp.y > CANVAS_HEIGHT) {
        state.powerUps.splice(index, 1);
      }
    });

    // Update particles
    state.particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      if (particle.life <= 0) {
        state.particles.splice(index, 1);
      }
    });

    // Check for wave completion
    if (state.enemies.length === 0 && !state.boss) {
      state.wave++;
      spawnEnemyWave();
    }

    checkCollisions();

    // Check game over
    if (state.player.health <= 0) {
      state.gameOver = true;
    }

    setGameState({...state});
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const state = gameStateRef.current;

    // Draw stars background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 100; i++) {
      const x = (i * 123) % CANVAS_WIDTH;
      const y = (i * 456 + Date.now() * 0.1) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }

    // Draw player
    ctx.fillStyle = state.powerUpType === 'shield' ? '#00ffff' : '#00ff00';
    ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
    
    // Player flame effect
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(state.player.x + 10, state.player.y + 40, 10, 8);
    ctx.fillRect(state.player.x + 30, state.player.y + 40, 10, 8);

    // Draw bullets
    ctx.fillStyle = '#ffff00';
    state.bullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw enemies
    state.enemies.forEach(enemy => {
      if (enemy.type === 'boss_bullet') {
        ctx.fillStyle = '#ff0066';
      } else {
        ctx.fillStyle = '#ff0000';
      }
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Draw boss
    if (state.boss) {
      ctx.fillStyle = '#990000';
      ctx.fillRect(state.boss.x, state.boss.y, state.boss.width, state.boss.height);
      
      // Boss health bar
      const healthPercent = state.boss.health / state.boss.maxHealth;
      ctx.fillStyle = '#660000';
      ctx.fillRect(state.boss.x, state.boss.y - 10, state.boss.width, 6);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(state.boss.x, state.boss.y - 10, state.boss.width * healthPercent, 6);
    }

    // Draw power-ups
    state.powerUps.forEach(powerUp => {
      let color = '#00ffff';
      if (powerUp.type === 'rapidFire') color = '#ffff00';
      else if (powerUp.type === 'shield') color = '#00ff00';
      else if (powerUp.type === 'multiShot') color = '#ff00ff';
      
      ctx.fillStyle = color;
      ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    });

    // Draw particles
    state.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
      ctx.fillRect(particle.x, particle.y, 2, 2);
    });

    // UI Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${state.score}`, 10, 30);
    ctx.fillText(`Wave: ${state.wave}`, 10, 55);
    ctx.fillText(`Health: ${state.player.health}`, 10, 80);
    
    if (state.powerUpType) {
      ctx.fillStyle = '#00ffff';
      ctx.fillText(`Power: ${state.powerUpType.toUpperCase()}`, 10, 105);
    }

    if (state.paused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#ffffff';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
      ctx.font = '24px Arial';
      ctx.fillText('Press P to continue', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 50);
      ctx.textAlign = 'left';
    }

    if (state.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#ff0000';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 50);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.fillText(`Final Score: ${state.score}`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
      ctx.fillText(`Wave Reached: ${state.wave}`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 30);
      ctx.textAlign = 'left';
    }
  };

  const gameLoop = () => {
    updateGame();
    render();
    
    if (!gameStateRef.current.gameOver && !gameStateRef.current.paused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const restartGame = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    startGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4 bg-clip-text  bg-gradient-to-r from-yellow-400 to-pink-400">
          🚀 COSMIC DEFENDER
        </h1>
        
        {showInstructions ? (
          <div className="bg-black bg-opacity-50 p-8 rounded-xl backdrop-blur-sm border border-purple-500 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">How to Play</h2>
            <div className="text-left text-white space-y-2 mb-6">
              <p>🎯 <strong>Arrow Keys / WASD:</strong> Move your ship</p>
              <p>🔫 <strong>Spacebar:</strong> Shoot bullets</p>
              <p>⏸️ <strong>P:</strong> Pause game</p>
              <p>💥 <strong>Destroy enemies</strong> to earn points</p>
              <p>⚡ <strong>Collect power-ups:</strong></p>
              <p className="ml-4">🟡 Rapid Fire</p>
              <p className="ml-4">🟢 Shield + Health</p>
              <p className="ml-4">🟣 Multi-Shot</p>
              <p>👹 <strong>Boss appears every 5 waves!</strong></p>
            </div>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-105"
            >
              🚀 START GAME
            </button>
          </div>
        ) : (
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="border-4 border-purple-500 rounded-lg shadow-2xl bg-black"
            />
            {gameState.gameOver && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={restartGame}
                  className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-110 mt-20"
                >
                  🔄 PLAY AGAIN
                </button>
              </div>
            )}
            {!gameState.gameOver && (
              <div className="mt-4 text-white">
                <p className="text-sm opacity-75">Press P to pause • Spacebar to shoot</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CosmicDefender;