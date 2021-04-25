//Noy Elbaz 315073122

const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");

function main() {
    let frames = 0;
    let DieHeight = cvs.height - 112;
    const gameState = { current: 0, getReady: 0, game: 1, over: 2, nextLevel: 3 }
    const startBtn = { x: 120, y: 263, w: 83, h: 29 }
    const levelUpBtn = { x: 120, y: 300, w: 83, h: 29 }
    const volumeBtn = { x: 0, y: 0, w: 50, h: 50 }
    const BirdDegree = Math.PI / 180;
    let challenge = false;
    let volumeOrSilent = true;

    // Images 
    const sprite = new Image();
    const myBird = new Image();
    const myBack = new Image();
    const myCoins = new Image();
    const myLevelUp = new Image();
    const sound = new Image();
    const mute = new Image();

    // Sounds 
    const scoreSound = new Audio();
    const FLAP = new Audio();
    const HIT = new Audio();
    const SWOOSHING = new Audio();
    const DIE = new Audio();

    const backGround = {
        sourceX: 0,
        sourceY: 0,
        w: 320,
        h: 480,
        destX: 0,
        destY: 0,

        draw: function() {
            ctx.drawImage(myBack, this.sourceX, this.sourceY, this.w, this.h, this.destX, this.destY, this.w, this.h);
        }
    }

    const foreGround = {
        sourceX: 276,
        sourceY: 0,
        w: 224,
        h: 112,
        destX: 0,
        destY: cvs.height - 112,
        gapX: 3,
        draw: function() {
            ctx.drawImage(sprite, this.sourceX, this.sourceY, this.w, this.h, this.destX, this.destY, this.w, this.h);
            ctx.drawImage(sprite, this.sourceX, this.sourceY, this.w, this.h, this.destX + this.w, this.destY, this.w, this.h);
        },
        update: function() {
            if (gameState.current == gameState.game) {
                this.x = (this.destX - this.gapX) % (this.w / 2);
            }
        }
    }

    const bird = {
        animation: [
            { sourceX: 0, sourceY: 0 },
            { sourceX: 34, sourceY: 0 },
            { sourceX: 68, sourceY: 0 },
            { sourceX: 102, sourceY: 0 }
        ],
        x: 50,
        y: 150,
        w: 34,
        h: 34,
        radius: 12,
        frame: 0,
        gravity: 0.2,
        jump: 4,
        movement: 0,
        rotation: 0,

        draw: function() {
            let bird = this.animation[this.frame];

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.drawImage(myBird, bird.sourceX, bird.sourceY, this.w, this.h, -this.w / 2, -this.h / 2, this.w, this.h);
            ctx.restore();
        },

        flap: function() {
            this.movement = -this.jump;
        },

        update: function() {
            this.period = gameState.current == gameState.getReady ? 10 : 5;
            this.frame += frames % this.period == 0 ? 1 : 0;
            this.frame = this.frame % this.animation.length;

            if (gameState.current == gameState.getReady) {
                this.y = 150;
                this.rotation = 0 * BirdDegree;
            } else {
                this.movement += this.gravity;
                this.y += this.movement;

                if (this.y + this.h / 2 >= DieHeight) {
                    this.y = DieHeight - this.h / 2;
                    //game over
                    if (gameState.current == gameState.game) {
                        gameState.current = gameState.over;
                        DIE.play();
                    }
                }
                if (this.movement >= this.jump) {
                    this.rotation = 90 * BirdDegree;
                    this.frame = 1;
                } else {
                    this.rotation = -30 * BirdDegree;
                }
            }
        },
        movementReset: function() {
            this.movement = 0;
        }
    }

    const pipes = {
        position: [],
        top: {
            sourceX: 553,
            sourceY: 0
        },
        bottom: {
            sourceX: 502,
            sourceY: 0
        },
        w: 53,
        h: 400,
        gap: 90,
        maxYPos: -150,
        destX: 3,

        draw: function() {
            for (let i = 0; i < this.position.length; i++) {
                let p = this.position[i];

                let topYPos = p.y;
                let bottomYPos = p.y + this.h + this.gap;

                // top pipe
                ctx.drawImage(sprite, this.top.sourceX, this.top.sourceY, this.w, this.h, p.x, topYPos, this.w, this.h);

                // bottom pipe
                ctx.drawImage(sprite, this.bottom.sourceX, this.bottom.sourceY, this.w, this.h, p.x, bottomYPos, this.w, this.h);

            }
        },

        update: function() {
            if (gameState.current !== gameState.game) return;


            if (frames % 100 == 0) {
                this.position.push({
                    x: cvs.width,
                    y: this.maxYPos * (Math.random() + 1)
                });
            }

            if (challenge == true) {
                let p;
                for (let i = 0; i < this.position.length; i++) {
                    p = this.position[i];
                    let bottomPipeYPos = p.y + this.h + this.gap;
                    if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
                        gameState.current = gameState.over;
                        if (volumeOrSilent == true)
                            HIT.play();
                        else
                            HIT.pause();
                    }
                    if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h) {
                        gameState.current = gameState.over;
                        if (volumeOrSilent == true)
                            HIT.play();
                        else
                            HIT.pause();
                    }
                    if (p.x + this.w <= 0) {
                        this.position.shift();
                        score.currentScore += 1;
                        score.bestScore = Math.max(score.currentScore, score.bestScore);
                        localStorage.setItem("bestScore", score.bestScore);
                    }
                    if (this.position.length % 2 == 0) {
                        p.y += 0.5;
                    } else {
                        p.y -= 0.5;
                    }
                    p.x -= this.destX;
                }
            } else {
                console.log("challenge == false");
                for (let i = 0; i < this.position.length; i++) {
                    p = this.position[i];
                    let bottomPipeYPos = p.y + this.h + this.gap;


                    if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
                        gameState.current = gameState.over;
                        if (volumeOrSilent == true)
                            HIT.play();
                        else
                            HIT.pause();
                    }
                    if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h) {
                        gameState.current = gameState.over;
                        if (volumeOrSilent == true)
                            HIT.play();
                        else
                            HIT.pause();
                    }
                    if (p.x + this.w <= 0) {
                        this.position.shift();
                        score.currentScore += 1;
                        score.bestScore = Math.max(score.currentScore, score.bestScore);
                        localStorage.setItem("bestScore", score.bestScore);
                    }
                    p.x -= this.destX;
                }
            }
        },
        reset: function() {
            this.position = [];
        }
    }

    const coins = {
        position: [],
        sourceX: 0,
        sourceY: 0,
        w: 34,
        h: 34,
        destX: 3,
        maxYPos: (cvs.height - foreGround.destY) / 2,

        draw: function() {
            for (let i = 0; i < this.position.length; i++) {
                let p = this.position[i];
                for (let j = 0; j < pipes.position.length; j++) {
                    if (p.x == pipes.position[j].x)
                        ctx.drawImage(myCoins, this.sourceX, this.sourceY, this.w, this.h, p.x + pipes.w * 2, p.y, this.w, this.h);
                    else
                        ctx.drawImage(myCoins, this.sourceX, this.sourceY, this.w, this.h, p.x, p.y, this.w, this.h);
                }
            }
        },

        update: function() {
            if (gameState.current !== gameState.game) return;

            if (frames % 150 == 0) {
                this.position.push({
                    x: cvs.width,
                    y: this.maxYPos * (Math.random() + 1)
                });
            }
            for (let i = 0; i < this.position.length; i++) {
                let p = this.position[i];

                if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
                    this.position.shift();
                    score.currentScore += 3;
                    scoreSound.play();
                    score.bestScore = Math.max(score.currentScore, score.bestScore);
                    localStorage.setItem("bestScore", score.bestScore);
                }

                p.x -= this.destX;

                if (p.x + this.w <= 0) {
                    this.position.shift();
                }
            }
        },

        reset: function() {
            this.position = [];
        }
    }

    const score = {
        bestScore: parseInt(localStorage.getItem("bestScore")) || 0,
        currentScore: 0,

        draw: function() {
            ctx.fillStyle = "#FFF";
            ctx.strokeStyle = "#000";

            if (gameState.current == gameState.game) {
                ctx.lineWidth = 2;
                ctx.font = "35px Georgia";
                ctx.fillStyle = "blue";
                ctx.fillText(this.currentScore, cvs.width / 2, 50);
                ctx.strokeText(this.currentScore, cvs.width / 2, 50);

            } else if (gameState.current == gameState.over) {
                // currentScore
                ctx.font = "25px Comic Sans MS";
                ctx.fillText(this.currentScore, 225, 186);
                ctx.strokeText(this.currentScore, 225, 186);
                // bestScore
                ctx.fillText(this.bestScore, 225, 228);
                ctx.strokeText(this.bestScore, 225, 228);
            }
        },

        reset: function() {
            this.currentScore = 0;
        }
    }

    const getReady = {
            sourceX: 0,
            sourceY: 228,
            w: 173,
            h: 152,
            destX: cvs.width / 2 - 173 / 2,
            destY: 80,

            sourceX1: 0,
            sourceY1: 0,
            w1: 110,
            h1: 44,
            destX1: cvs.width / 2 - 127 / 2,
            destY1: 290,

            sourceX2: 0,
            sourceY2: 0,
            w2: 110,
            h2: 44,
            destX2: cvs.width / 2 - 280 / 2,
            destY2: 5,
            draw: function() {
                if (gameState.current == gameState.getReady) { //appear only if we in "getReady" state
                    ctx.drawImage(sprite, this.sourceX, this.sourceY, this.w, this.h, this.destX, this.destY, this.w, this.h);
                    ctx.drawImage(myLevelUp, this.sourceX1, this.sourceY1, this.w1, this.h1, this.destX1, this.destY1, this.w1, this.h1);
                    if (volumeOrSilent == true) {
                        ctx.drawImage(sound, this.sourceX2, this.sourceY2, this.w2, this.h2, this.destX2, this.destY2, this.w2, this.h2);
                    } else {
                        ctx.drawImage(mute, this.sourceX2, this.sourceY2, this.w2, this.h2, this.destX2, this.destY2, this.w2, this.h2);
                    }
                }
            }
        } //getReady label


    const gameOver = {
            sourceX: 175,
            sourceY: 228,
            w: 225,
            h: 202,
            destX: cvs.width / 2 - 225 / 2,
            destY: 90,

            sourceX2: 0,
            sourceY2: 0,
            sourceX2w: 42,
            w2: 110,
            h2: 44,
            destX2: cvs.width / 2 - 280 / 2,
            destY2: 5,

            draw: function() {
                if (gameState.current == gameState.over) { //appear only if we in "gameOver" state
                    ctx.drawImage(sprite, this.sourceX, this.sourceY, this.w, this.h, this.destX, this.destY, this.w, this.h);
                    if (volumeOrSilent == true) {
                        ctx.drawImage(sound, this.sourceX2, this.sourceY2, this.w2, this.h2, this.destX2, this.destY2, this.w2, this.h2);
                    } else {
                        ctx.drawImage(mute, this.sourceX2, this.sourceY2, this.w2, this.h2, this.destX2, this.destY2, this.w2, this.h2);
                    }
                }
            }

        } //gameOver label
        // Game Functions
    function gameListener() {
        cvs.addEventListener("click", function(evt) {
            let rect = cvs.getBoundingClientRect();
            let clickX;
            let clickY;
            switch (gameState.current) {
                case gameState.getReady:
                    clickX = evt.clientX - rect.left;
                    clickY = evt.clientY - rect.top;
                    gameState.current = gameState.game;
                    if (clickX >= levelUpBtn.x && clickX <= levelUpBtn.x + levelUpBtn.w && clickY >= levelUpBtn.y && clickY <= levelUpBtn.y + levelUpBtn.h) {
                        challenge = true;
                    } else {
                        challenge = false;
                    }
                    if (clickX >= volumeBtn.x && clickX <= volumeBtn.y + volumeBtn.w && clickY >= volumeBtn.y && clickY <= volumeBtn.y + volumeBtn.h)
                        volumeOrSilent = !volumeOrSilent;
                    if (volumeOrSilent == false) {
                        setSoundsOff();
                        console.log("false");
                    } else {
                        setSoundsOn();
                        SWOOSHING.play();
                        console.log("true");
                    }
                    break;
                case gameState.game:
                    if (bird.y - bird.radius <= 0) return;
                    bird.flap();
                    //FLAP.play();
                    if (volumeOrSilent == false) {
                        setSoundsOff();
                        console.log("sound off");
                    } else {
                        setSoundsOn();
                        FLAP.play();
                        console.log("sound on");
                    }
                    break;
                case gameState.over:
                    clickX = evt.clientX - rect.left;
                    clickY = evt.clientY - rect.top;
                    // check if RESTART clicked
                    if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) {
                        restart();
                    }
                    if (clickX >= volumeBtn.x && clickX <= volumeBtn.x + volumeBtn.w && clickY >= volumeBtn.y && clickY <= volumeBtn.y + volumeBtn.h)
                        volumeOrSilent = !volumeOrSilent;
                    if (volumeOrSilent == false) {
                        setSoundsOff();
                        console.log("sound off");
                    } else {
                        setSoundsOn();
                        console.log("sound on");
                    }
                    break;
            }

        });
    } //on mouseClicked

    function loadImages() {
        sprite.src = "img/sprite.png";
        myLevelUp.src = "img/myLevelUp.png";
        myBack.src = "img/myBackground.png";
        myBird.src = "img/myBird.png";
        myCoins.src = "img/money.png";
        sound.src = "img/sound.png";
        mute.src = "img/mute.png";
    }

    function setSoundsOff() {
        scoreSound.src.volume = 0;
        FLAP.src.volume = 0;
        HIT.src.volume = 0;
        SWOOSHING.volume = 0;
        DIE.volume = 0;
    }

    function setSoundsOn() {
        scoreSound.src.volume = 1;
        FLAP.src.volume = 1;
        HIT.src.volume = 1;
        SWOOSHING.volume = 1;
        DIE.volume = 1;
    }


    function loadSounds() {
        scoreSound.src = "audio/pointSound.wav";
        FLAP.src = "audio/flipSound.wav";
        HIT.src = "audio/hitSound.wav";
        SWOOSHING.src = "audio/swooshingSound.wav";
        DIE.src = "audio/dieSound.wav";
    }

    function init() {
        loadSounds();
        loadImages();
        gameListener();
        loop();
    }

    function draw() {
        ctx.fillStyle = "#70c5ce";
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        backGround.draw();
        foreGround.draw();
        pipes.draw();
        bird.draw();
        coins.draw();
        getReady.draw();
        gameOver.draw();
        score.draw();
    }

    function update() {
        bird.update();
        foreGround.update();
        coins.update();
        pipes.update();
    }

    function loop() {
        update();
        draw();
        frames++;
        requestAnimationFrame(loop);
    }

    function restart() {
        pipes.reset();
        coins.reset();
        bird.movementReset();
        score.reset();
        gameState.current = gameState.getReady;
    }
    init();
}
main();