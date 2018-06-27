var noteTitle = document.querySelector('.noteTitle');
var noteContent = document.querySelector('.noteContent');
var submitBtn = document.querySelector('.submitBtn');
var form = document.querySelector('form');
var list = document.querySelector('ul');
// element to create - li, h3, p for content

let db;

window.onload = function() {
    console.log('Window loaded');
    let request = window.indexedDB.open('notes', 1); // database: notes. Version: 1

    request.onerror = function() {
        console.log('Database failed to open.');
    };

    request.onsuccess = function() {
        console.log('Database opened successfully.');

        db = request.result;

        displayData();
    };

    request.onupgradeneeded = function(e) {
        let db = e.target.result;

        let objectStore = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });

        objectStore.createIndex('title', 'title', { unique: false });
        objectStore.createIndex('body', 'body', { unique: false });

        console.log('Database setup complete.');
    };

    form.onsubmit = addData;
};

function addData(e) {
    e.preventDefault();

    let newItem = { title: noteTitle.value, body: noteContent.value };
    let transaction = db.transaction(['notes'], 'readwrite');
    let objectStore = transaction.objectStore('notes');

    var request = objectStore.add(newItem);
    request.onsuccess = function() {
        noteTitle.value = '';
        noteContent.value = '';
    };

    transaction.oncomplete = function() {
        console.log('Transcation completed: Database modification finished.');
        displayData();
    };

    transaction.onerror = function() {
        console.log('Transaction not opened due to error.');
    };
}

function displayData() {
    while(list.firstChild) {
        list.removeChild(list.firstChild);
    }

    let objectStore = db.transaction('notes').objectStore('notes'); // chained
    objectStore.openCursor().onsuccess = function(e) {
        let cursor = e.target.result;

        if(cursor) {
            let listItem = document.createElement('li');
            let h3 = document.createElement('h3');
            let para = document.createElement('p');

            listItem.appendChild(h3);
            listItem.appendChild(para);
            list.appendChild(listItem);

            h3.textContent = cursor.value.title;
            para.textContent = cursor.value.body;

            listItem.setAttribute('data-note-id', cursor.value.id);

            let deleteBtn = document.createElement('button');
            listItem.appendChild(deleteBtn);
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', deleteItem);

            cursor.continue();
        } else {
            if(!list.firstChild) {
                let listItem = document.createElement('li');
                listItem.textContent = 'No notes stored.';
                list.appendChild(listItem);
            }
            console.log('Notes all displayed.');
        }
    };
}

function deleteItem(e) {
    let noteId = Number(e.target.parentNode.getAttribute('data-note-id'));
    let transaction = db.transaction(['notes'], 'readwrite');
    let objectStore = transaction.objectStore('notes');
    let request = objectStore.delete(noteId);

    transaction.oncomplete = function() {
        e.target.parentNode.parentNode.removeChild(e.target.parentNode);
        console.log('Note', noteId, 'deleted.');

        if(!list.firstChild) {
            let listItem = document.createElement('li');
            listItem.textContent = 'No notes stored.';
            list.appendChild(listItem);
        }
    };
}

// what's the difference between below and window.onload?
// document.body.onload = function() {
//     console.log('Body loaded');
// };