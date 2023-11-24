document.addEventListener('DOMContentLoaded', function () {
    let socket = new WebSocket("ws://localhost:6969/");
    let state = true;
    let queue = [];

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
            console.log('Connection died');
        }
    };

    socket.onerror = function () {
        console.log(`error`);
    };

    const queueList = document.getElementById('queueList');
    const inputField = document.getElementById('inputField');
    const addButton = document.getElementById('addButton');
    const removeButton = document.getElementById('removeButton');

    jsEnableElement('addButton');
    jsDisableElement('removeButton');
    let savedUser;

    addButton.addEventListener('click', function () {
        const person = inputField.value.trim();
        if (person !== '') {
            savedUser = person;
            addToQueue(savedUser);
            if (state) {
                state = updateButtons(state);
            }
        }
    });

    removeButton.addEventListener('click', function () {
        removeFromQueue(savedUser);
        if (!state) {
            state = updateButtons(state);
        }
    });

    function updateList() {
        queueList.innerHTML = '';
        queue.forEach(function (person, index) {
            const listItem = document.createElement('li');
            listItem.textContent = (index + 1) + '. ' + person;
            queueList.appendChild(listItem);

            setTimeout(function () {
                listItem.classList.add("fade-in");
            }, 10);
        });
    }

    function updateButtons(state) {
        jsDisableElement('removeButton');
        jsDisableElement('addButton');
        if (!state) {
            setTimeout( () => {
                jsEnableElement('addButton');
            }, 750)
        } else {
            setTimeout( () => {
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
        let keepActive = await fetch("http://localhost:6969/keepactive")
        console.log(await keepActive.json());
    }, 1000 * 60);
});
