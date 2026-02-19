// fruits-new123 - Phaser.js Game

let player, cursors, score = 0, scoreText, gameOver = false;
let foods, goblins;

// Tone.js audio globals
let masterVolume, bgMusic, collectSfx, gameOverSfx;

function preload() {
    // Create pixel-art style textures programmatically
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Player texture (pixel hero)
    graphics.clear();
    graphics.fillStyle(0x4a90e2);
    graphics.fillRect(4, 0, 24, 8);  // head
    graphics.fillRect(0, 8, 32, 16); // body
    graphics.fillRect(4, 24, 8, 8);   // legs
    graphics.fillRect(20, 24, 8, 8);
    graphics.generateTexture('player', 32, 32);
    
    // Banana texture
    graphics.clear();
    graphics.fillStyle(0xf7e98e);
    graphics.fillRect(8, 8, 16, 16);
    graphics.fillStyle(0xffd700);
    graphics.fillRect(10, 10, 12, 12);
    graphics.generateTexture('banana', 32, 32);
    
    // Apple texture
    graphics.clear();
    graphics.fillStyle(0xff6b6b);
    graphics.fillCircle(16, 16, 12);
    graphics.fillStyle(0x4ecdc4);
    graphics.fillRect(14, 4, 4, 6);
    graphics.generateTexture('apple', 32, 32);
    
    // Pineapple texture
    graphics.clear();
    graphics.fillStyle(0xffe66d);
    graphics.fillRect(6, 6, 20, 20);
    graphics.fillStyle(0xff9f1c);
    for(let i=0; i<4; i++) {
        for(let j=0; j<4; j++) {
            graphics.fillRect(6+i*5, 6+j*5, 3, 3);
        }
    }
    graphics.generateTexture('pineapple', 32, 32);
    
    // Goblin texture
    graphics.clear();
    graphics.fillStyle(0x4a7c59);
    graphics.fillRect(8, 0, 16, 8);  // head
    graphics.fillRect(4, 8, 24, 16); // body
    graphics.fillRect(6, 24, 6, 6);  // legs
    graphics.fillRect(20, 24, 6, 6);
    graphics.fillStyle(0xff0000);
    graphics.fillRect(10, 4, 4, 2);  // eyes
    graphics.fillRect(18, 4, 4, 2);
    graphics.generateTexture('goblin', 32, 32);
}

function create() {
    // Background - SNES style dark purple
    this.cameras.main.setBackgroundColor('#2c1b47');
    
    // Create player (top-down, no gravity)
    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);
    player.setScale(1.5);
    
    // Create food group
    foods = this.physics.add.group();
    
    // Spawn initial food
    for(let i = 0; i < 8; i++) {
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);
        const foodType = ['banana', 'apple', 'pineapple'][Phaser.Math.Between(0, 2)];
        const food = foods.create(x, y, foodType);
        food.setScale(1.5);
        food.setTint(Phaser.Display.Color.GetColor32(200 + Phaser.Math.Between(0, 55), 200 + Phaser.Math.Between(0, 55), 200 + Phaser.Math.Between(0, 55)));
    }
    
    // Create goblin enemies
    goblins = this.physics.add.group();
    for(let i = 0; i < 4; i++) {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        const goblin = goblins.create(x, y, 'goblin');
        goblin.setScale(1.5);
        goblin.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
        goblin.setBounce(1);
        goblin.setCollideWorldBounds(true);
    }
    
    // WASD controls
    cursors = this.input.keyboard.addKeys('W,S,A,D');
    
    // Score
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'Courier New'
    });
    
    // Game over text (hidden initially)
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
        fontSize: '64px',
        fill: '#ff0000',
        fontFamily: 'Courier New'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);
    
    // Collisions
    this.physics.add.overlap(player, foods, collectFood, null, this);
    this.physics.add.overlap(player, goblins, hitGoblin, null, this);
    
    // Instructions
    this.add.text(16, 550, 'WASD to move • Collect fruits • Avoid goblins', {
        fontSize: '16px',
        fill: '#ffffff',
        fontFamily: 'Courier New'
    });
    
    // Initialize audio
    initAudio();
}

function update() {
    if (gameOver) return;
    
    // Player movement (top-down)
    const speed = 200;
    let velocityX = 0;
    let velocityY = 0;
    
    if (cursors.A.isDown) velocityX = -speed;
    else if (cursors.D.isDown) velocityX = speed;
    
    if (cursors.W.isDown) velocityY = -speed;
    else if (cursors.S.isDown) velocityY = speed;
    
    player.setVelocity(velocityX, velocityY);
    
    // Randomize goblin movement occasionally
    goblins.children.entries.forEach(goblin => {
        if (Math.random() < 0.01) {
            goblin.setVelocity(
                Phaser.Math.Between(-150, 150),
                Phaser.Math.Between(-150, 150)
            );
        }
    });
}

function collectFood(player, food) {
    food.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
    
    // Play collect sound
    if (collectSfx) {
        collectSfx.triggerAttackRelease('C5', '8n');
    }
    
    // Spawn new food
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const foodType = ['banana', 'apple', 'pineapple'][Phaser.Math.Between(0, 2)];
    const newFood = foods.create(x, y, foodType);
    newFood.setScale(1.5);
    newFood.setTint(Phaser.Display.Color.GetColor32(200 + Phaser.Math.Between(0, 55), 200 + Phaser.Math.Between(0, 55), 200 + Phaser.Math.Between(0, 55)));
}

function hitGoblin(player, goblin) {
    this.physics.pause();
    player.setTint(0xff0000);
    gameOver = true;
    this.gameOverText.setVisible(true);
    
    // Stop music and play game over sound
    if (bgMusic) bgMusic.stop();
    if (gameOverSfx) {
        gameOverSfx.triggerAttackRelease('A3', '4n');
    }
}

function initAudio() {
    // Master volume at -30 dB (very quiet)
    masterVolume = new Tone.Volume(-30).toDestination();
    
    // Background music synth
    bgMusic = new Tone.PolySynth(Tone.Synth).connect(masterVolume);
    bgMusic.set({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.5 }
    });
    
    // Sound effect synths
    collectSfx = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
    }).connect(masterVolume);
    
    gameOverSfx = new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.5 }
    }).connect(masterVolume);
    
    // Start background music loop
    const melody = ['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'C4'];
    let noteIndex = 0;
    
    Tone.Transport.scheduleRepeat((time) => {
        bgMusic.triggerAttackRelease(melody[noteIndex % melody.length], '8n', time);
        noteIndex++;
    }, '4n');
    
    Tone.Transport.start();
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2c1b47',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: { preload, create, update }
};

// Initialize game
const game = new Phaser.Game(config);