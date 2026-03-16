/**
 *
 * Copyright (c) 2020 Alexander Bazhanov
 * https://github.com/bazhanius/
 *
 */

let gameState;
let analytics;
let currentGameStartTime;

function ready() {

    // Initialize Analytics
    try {
        analytics = new AnalyticsManager();
        const sessionId = 'session_' + Date.now();
        analytics.initialize('15_puzzle_game', sessionId);
        window.analytics = analytics; // Make available globally
        console.log('[Game] Analytics initialized');
    } catch (e) {
        console.warn('[Game] Analytics not available:', e);
    }

    let buttonClicks = document.querySelectorAll('.game-menu-option');
    buttonClicks.forEach( (x) => {
        x.addEventListener("click", function(e) {
            document.documentElement.style.setProperty('--clickX', `${e.clientX}px`);
            document.documentElement.style.setProperty('--clickY', `${e.clientY}px`);
        });
    });

    function resizeWindow() {
        document.documentElement.style.setProperty('height', `${window.innerHeight}px`);
        document.documentElement.style.setProperty('width', `${window.innerWidth}px`);
    }

    // We listen to the resize event
    window.addEventListener('resize', () => {
        resizeWindow();
    });

    resizeWindow();

    let resultScreenInput = document.querySelector('.input-container__input');
    let btnSave = document.querySelector('#save');

    let btnStart = document.querySelector('#start');

    let gameMetrics = document.querySelector('.game-metrics');

    let btnClose = document.querySelector('.x-close');

    let countdownScreen = document.querySelector('.countdown');
    let countdownScreenDigits = document.querySelectorAll('.countdown__digit');
    let mainScreen = document.querySelector('.main-menu-screen');

    let gameScreen = document.querySelector('.game-screen');

    let btnScores = document.querySelector('#scores');
    let scoresScreen = document.querySelector('.scores-screen');

    let transitionScreen = document.querySelector('.transition-screen');
    let transitionScreenCircle = document.querySelector('.circle');

    let resultScreen = document.querySelector('.result-screen');

    let results = {};

    gameState = {
        interval: null,
        mainMenu() {
            clearInterval(gameState.interval);
            mainScreen.style.display = 'flex';
            gameScreen.style.display = 'flex';
            resultScreen.style.display = 'none';
            countdownScreen.style.display = 'none';
            scoresScreen.style.display = 'none';
            btnClose.style.display = 'none';
            gameMetrics.classList.add('hidden');
            gameState.interval = setInterval(function() {
                field.shuffle(1);
            }, 2000);
        },
        readyCheck() {
            clearInterval(gameState.interval);
            mainScreen.style.display = 'none';
            countdownScreen.style.display = 'flex';
            countdownScreenDigits.forEach( (x) => {
               x.classList.add('digit__anim-fly-in');
            });
            gameState.interval = setInterval(function(){
                field.shuffle();
            }, 3890);
            setTimeout(function(){
                clearInterval(gameState.interval);
                gameState.play();
                countdownScreenDigits.forEach( (x) => {
                    x.classList.remove('digit__anim-fly-in');
                });
            }, 4000);
        },
        play() {
            actions.keyEvents.init();
            actions.clickOnCubes.init();
            counters.seconds.start();
            counters.moves.reset();
            clearInterval(this.interval);
            btnClose.style.display = 'block';
            gameMetrics.classList.remove('hidden');
            mainScreen.style.display = 'none';
            countdownScreen.style.display = 'none';
            
            // Analytics: Start tracking level
            currentGameStartTime = Date.now();
            if (analytics) {
                analytics.startLevel('puzzle_game_' + Date.now());
            }
        },
        theEnd() {
            actions.keyEvents.destroy();
            actions.clickOnCubes.destroy();
            results = {
                'moves': counters.moves.value,
                'time': counters.seconds.getTime()
            };
            confetti.start(3000, 100, 150);
            resultScreen.style.display = 'flex';
            
            // Update result screen score display
            let resultMoves = document.querySelector('.result-moves');
            let resultTime = document.querySelector('.result-time');
            if (resultMoves) resultMoves.textContent = results.moves;
            if (resultTime) resultTime.textContent = results.time;
            
            // Analytics: End level tracking
            if (analytics && currentGameStartTime) {
                const timeTaken = Date.now() - currentGameStartTime;
                const xpEarned = Math.max(0, 1000 - (results.moves * 10)); // XP based on efficiency
                analytics.endLevel('puzzle_game_' + currentGameStartTime, true, timeTaken, xpEarned);
                analytics.addRawMetric('total_moves', results.moves);
                analytics.addRawMetric('completion_time', results.time);
            }
            
            //counters.moves.reset();
            counters.seconds.stop();
        },
        submitResult(nickname) {
            let el = document.getElementById("confetti-canvas");
            if (el) el.parentNode.removeChild(el);
            counters.results.add(nickname, results.moves, results.time);
        },
        transition(type) {
            transitionScreen.style.display = 'flex';
            transitionScreenCircle.classList.add('circle__fly-in');
            setTimeout(function(){
                transitionScreenCircle.classList.remove('circle__fly-in');
                transitionScreenCircle.classList.add('circle__fly-out');
                if (type === 'toMainMenu') gameState.mainMenu();
                if (type === 'toPlay') gameState.readyCheck();
                if (type === 'toScores') gameState.scores();
            }, 750);
            setTimeout(function(){
                transitionScreenCircle.classList.remove('circle__fly-out');
                transitionScreen.style.display = 'none';
            }, 1500);
        },
        reset() {
            field.reset();
            counters.seconds.stop();
            counters.moves.reset();
        },
        scores() {
            btnClose.style.display = 'block';
            scoresScreen.style.display = 'flex';
            gameScreen.style.display = 'none';
            mainScreen.style.display = 'none';
            resultScreen.style.display = 'none';
        },
        about() {
            //
        }
    };

    resultScreenInput.onfocus = function() {
        let el = document.getElementById("confetti-canvas");
        if (el) el.parentNode.removeChild(el);
    };

    btnSave.onclick = function() {
        gameState.submitResult(resultScreenInput.value);
        
        // Analytics: Submit report with player name
        if (analytics) {
            analytics.submitReport();
            console.log('[Game] Analytics report submitted');
        }
        
        gameState.transition('toScores');
    };

    btnStart.onclick = function() {
        gameState.transition('toPlay');
    };

    btnScores.onclick = function() {
        gameState.transition('toScores');
    };

    let btnGithub = document.querySelector('#github');
    
    if (btnGithub) {
        btnGithub.onclick = function() {
            window.open('https://github.com/SanwikSagarPW/Puzzle15th', '_blank');
        };
    }

    btnClose.onclick = function() {
        actions.keyEvents.destroy();
        actions.clickOnCubes.destroy();
        gameState.transition('toMainMenu');
    };

    /* Init App */
    actions.dragField.init();
    gameState.mainMenu();
    counters.results.updateHTML('byMoves');

}

document.addEventListener("DOMContentLoaded", ready);