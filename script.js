const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');

// Adjust canvas size for mobile responsiveness
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;  // 90% of screen width
    canvas.height = window.innerHeight * 0.7; // 70% of screen height
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let santa = { x: canvas.width / 2 - 20, y: canvas.height - 60, width: 60, height: 60, speed: 15, dragging: false };
let gifts = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;  // Retrieve high score from localStorage
let gameRunning = false;
let touchStartX = 0;

// Update the high score display
function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore); // Save high score to localStorage
    }
    highScoreDisplay.textContent = `High Score: ${highScore}`;
}

// Load images
const santaImg = new Image();
santaImg.src = 'santa.png';
const giftImg = new Image();
giftImg.src = 'gift.png';

// Create falling gifts
function createGift() {
    if (!gameRunning) return;
    const gift = { x: Math.random() * (canvas.width - 20), y: 0, width: 30, height: 30, speed: 4 };
    gifts.push(gift);
}

// Update game objects
function update() {
    if (!gameRunning) return;

    gifts.forEach((gift, index) => {
        gift.y += gift.speed;

        // Check if Santa catches the gift
        if (gift.x < santa.x + santa.width &&
            gift.x + gift.width > santa.x &&
            gift.y < santa.y + santa.height &&
            gift.y + gift.height > santa.y) {
            gifts.splice(index, 1);
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
        }

        // End game if gift is missed
        if (gift.y > canvas.height) {
            gameRunning = false;
            scoreDisplay.textContent = `Game Over! Final Score: ${score}`;
            updateHighScore(); // Update high score when game ends
            clearInterval(giftInterval);
        }
    });
}

// Draw game objects
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Santa
    ctx.drawImage(santaImg, santa.x, santa.y, santa.width, santa.height);

    // Draw gifts
    gifts.forEach(gift => {
        ctx.drawImage(giftImg, gift.x, gift.y, gift.width, gift.height);
    });
}

// Main game loop
function gameLoop() {
    if (gameRunning) {
        update();
        updateSnowflakes();
        draw();
        drawSnowflakes();
        requestAnimationFrame(gameLoop);
    }
}

// Event listeners for keyboard controls
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' && santa.x > 0) santa.x -= santa.speed;
    if (event.key === 'ArrowRight' && santa.x < canvas.width - santa.width) santa.x += santa.speed;
});

// Event listeners for touch controls on mobile
canvas.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
    santa.dragging = true;  // Start dragging
});

canvas.addEventListener('touchmove', (event) => {
    if (!santa.dragging) return;

    const touchEndX = event.touches[0].clientX;
    const touchDiff = touchEndX - touchStartX;

    // Move Santa based on drag distance with a higher sensitivity factor
    santa.x += touchDiff * 0.4;  // Increased sensitivity for faster response
    if (santa.x < 0) santa.x = 0;  // Prevent moving out of bounds
    if (santa.x > canvas.width - santa.width) santa.x = canvas.width - santa.width;

    touchStartX = touchEndX;  // Update start point for the next movement
});

canvas.addEventListener('touchend', () => {
    santa.dragging = false;  // Stop dragging when touch ends
});

// Start game
startButton.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        gifts = [];
        gameLoop();
        giftInterval = setInterval(createGift, 1000);
    }
});

// Reset game
resetButton.addEventListener('click', () => {
    gameRunning = false;
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    gifts = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateHighScore();  // Update high score display after reset
});

// Snowflake settings
let snowflakes = [];

function createSnowflake() {
    const snowflake = {
        x: Math.random() * canvas.width,
        y: -10,
        radius: Math.random() * 3 + 1,
        speed: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.5 + 0.5
    };
    snowflakes.push(snowflake);
}

function updateSnowflakes() {
    snowflakes.forEach((snowflake, index) => {
        snowflake.y += snowflake.speed;
        if (snowflake.y > canvas.height) {
            snowflakes.splice(index, 1);
        }
    });
}

function drawSnowflakes() {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'white';

    snowflakes.forEach(snowflake => {
        ctx.beginPath();
        ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.restore();
}

// Call createSnowflake periodically to add new snowflakes
setInterval(createSnowflake, 100);

// Update and draw snowflakes within the game loop
function gameLoop() {
    if (gameRunning) {
        update();
        updateSnowflakes();
        draw();
        drawSnowflakes();
        requestAnimationFrame(gameLoop);
    }
}
