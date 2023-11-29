// ==UserScript==
// @name         FPS Counter
// @description  Track frames per second for particlesJS
// @author       You
// @match        *://localhost:6969/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    let fpsCounter = 0;
    let lastTime = performance.now();
    function displayFPS() {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        fpsCounter = 1000 / deltaTime;
        console.log(`Current FPS: ${fpsCounter.toFixed(2)}`);
        lastTime = currentTime;
        requestAnimationFrame(displayFPS);
    }
    function hookParticlesJS() {
        const originalParticlesJSFunction = window.particlesJS.fn.particlesDraw;
        window.particlesJS.fn.particlesDraw = function () {
            originalParticlesJSFunction.apply(this, arguments);
            console.log(`Current FPS from particlesJS: ${fpsCounter.toFixed(2)}`);
        };
    }
    displayFPS();
    hookParticlesJS();
})();
