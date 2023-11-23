document.addEventListener('DOMContentLoaded', function () {
    let socket = new WebSocket("ws://localhost:6969/");

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

    let savedUser;

    addButton.addEventListener('click', function () {
        const person = inputField.value.trim();
        if (person !== '') {
            savedUser = person;
            addToQueue(savedUser);
        }
    });

    removeButton.addEventListener('click', function () {
        removeFromQueue(savedUser);
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

    setInterval( async() => {
        let keepActive = await fetch("http://localhost:6969/keepactive")
        console.log(await keepActive.json());
    }, 1000 * 60);
});
