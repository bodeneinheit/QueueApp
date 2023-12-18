/* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
let jsonParticles;
if (getVisible()) {
    initParticles();
}

function initParticles() {
    if (new Date().getMonth() === 11 || new Date().getMonth() === 0) {
        jsonParticles = "particles-dec";
        document.body.style.background = '#0a3b2a';
        document.documentElement.style.setProperty('--swm-green', '#c92222');
        document.documentElement.style.setProperty('--swm-blue', '#7c0808');
    } else {
        jsonParticles = "particles";
        document.getElementById("hat").style.display = 'none';
    }
    particlesJS.load('particles-js', `src/${jsonParticles}.json`, function () {
        console.log('particles.js loaded');
    });
}

let socket = new WebSocket("ws://localhost:6969/websocket");
let state = true;
let queue = [];
let whiteListedNames = ["danial", "daniel", "fabi", "falk", "lukas", "maxi", "mert", "niklas", "simon", "tibo"];

socket.onopen = function () {
    console.log("socket opened")
};

function addToQueue(name) {
    socket.send(JSON.stringify({
        type: 0,
        message: name
    }));
}

function removeFromQueue(name) {
    socket.send(JSON.stringify({
        type: 1,
        message: name
    }));
}

socket.onmessage = function (event) {
    let receivedData = event.data;
    if (receivedData !== '') {
        queue = receivedData.split(",");
    } else {
        queue = [];
    }
    updateList();
    console.log(queue);
};

socket.onclose = function (event) {
    if (event.wasClean) {
        console.log(`Closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.log('Connection died ${event.code}');
    }
};

socket.onerror = function () {
    console.log(`error`);
};

const queueList = document.getElementById('queueList');
const inputField = document.getElementById('inputField');
const addButton = document.getElementById('addButton');
const removeButton = document.getElementById('removeButton');
const effectsButton = document.getElementById('effectsButton');


jsEnableElement('addButton');
jsDisableElement('removeButton');
let savedUser;
const maxLength = 25;
const useWhiteList = false;
const audio = new Audio('src/cow.mp3');
let myName = '';

addButton.addEventListener('click', function () {
    const person = inputField.value.trim();
    if (!useWhiteList || (useWhiteList && whiteListedNames.includes(person.toLowerCase()))) {
        if (!/^\d+$/.test(person)) {
            if (person.length < maxLength) {
                if (person !== '') {
                    if (!queue.includes(person)) {
                        savedUser = person;
                        addToQueue(person);
                        myName = person;
                        /* for (let i = 0; i < 15; i++) {
                             addToQueue(Math.random().toFixed(2));
                         }*/
                        if (state) {
                            state = updateButtons(state);
                        }
                    } else {
                        alert("name is already taken");
                    }
                } else {
                    alert("name may not be empty");
                }
            } else {
                alert("name exceeds length limit");
            }
        } else {
            alert("name must include a non-numeric character");
        }
    } else {
        alert("name must be whitelisted");
    }
});

removeButton.addEventListener('click', function () {
    removeFromQueue(savedUser);
    myName = '';
    if (!state) {
        state = updateButtons(state);
    } else {
        alert("invalid action");
    }
});

let enabled = getVisible();
let oldValue;

effectsButton.addEventListener('click', function () {
    if (enabled) {
        oldValue = pJSDom[0].pJS.particles.number.value;
        pJSDom[0].pJS.particles.number.value = 0;
        pJSDom[0].pJS.fn.particlesRefresh();
        setVisible(false);
    } else {
        if (jsonParticles !== undefined) {
            pJSDom[0].pJS.particles.number.value = oldValue;
            pJSDom[0].pJS.fn.particlesRefresh();
        } else {
            initParticles();
        }
        setVisible(true);
    }
    enabled = !enabled;
});

let prevString = '';

function updateList() {
    queueList.innerHTML = '';

    if (queue.length === 0) {
        // Add default entry if the array is empty
        const defaultItem = document.createElement('div');
        defaultItem.classList.add("empty");
        defaultItem.textContent = 'Queue is empty';
        queueList.appendChild(defaultItem);
        prevString = '';
    } else {
        queue.forEach(function (person, index) {
            const listItem = document.createElement('li');
            listItem.textContent = (index + 1) + '. ' + person;
            queueList.appendChild(listItem);
            // console.log(`Person: ${person}, Prev: ${prevString}, My: ${myName}, i: ${index}`);
            if (index === 0) {
                if (person !== prevString) {
                    if (myName === person) {
                        audio.play();
                    }
                    prevString = person;
                }
            }
            setTimeout(function () {
                listItem.classList.add("fade-in");
            }, 10);
        });
    }
}


function updateButtons(state) {
    jsDisableElement('removeButton');
    jsDisableElement('addButton');
    if (!state) {
        setTimeout(() => {
            jsEnableElement('addButton');
        }, 750)
    } else {
        setTimeout(() => {
            jsEnableElement('removeButton');
        }, 750)
    }
    return !state;
}

function jsEnableElement(id) {
    if (document.getElementById(id)) {
        document.getElementById(id).removeAttribute("disabled");
        document.getElementById(id).className = "enabled";
        //document.getElementById(id).disabled = false;
    }
}

function jsDisableElement(id) {
    if (document.getElementById(id)) {
        document.getElementById(id).removeAttribute("enabled");
        document.getElementById(id).className = "disabled";
        //document.getElementById(id).disabled = true;
    }
}

setInterval(async () => {
    let keepActive = await fetch("http://localhost:6969/keepactive");
}, 1000 * 60 * 1);

function getVisible() {
    let value = localStorage.getItem('visible');
    return !(value == '0');
}

function setVisible(visible) {
    localStorage.setItem('visible', (visible ? '1' : '0'));
}


addEventListener("DOMContentLoaded", (event) => {
    (function () {
        'use strict';
        let fpsCounter = 0;
        let lastTime = performance.now();

        function displayFPS() {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastTime;
            fpsCounter = 1000 / deltaTime;
            // console.log(`Current FPS: ${fpsCounter.toFixed(2)}`);
            document.getElementById("frameRate").innerHTML = `${Math.floor(fpsCounter)} FPS`;
            lastTime = currentTime;
            requestAnimationFrame(displayFPS);
        }

        function hookParticlesJS() {
            const originalParticlesJSFunction = window.particlesJS.fn.particlesDraw;
            window.particlesJS.fn.particlesDraw = function () {
                originalParticlesJSFunction.apply(this, arguments);
                // console.log(`Current FPS from particlesJS: ${fpsCounter.toFixed(2)}`);
            };
        }

        displayFPS();
        hookParticlesJS();
    })();
});