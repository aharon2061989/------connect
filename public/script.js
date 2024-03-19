document.addEventListener('click', function (event) {
    const { type, target } = event;
    console.log(target);
});


var readNotifications = [];
var unreadNotifications = [];
var allNotifications = [];
var currentView = 'unreaded';
var displayedNotificationsCount = 5;
var newNotificationsAlertCount = 0;


window.addEventListener('load', () => {
    fetchNotifications();
    updateNotificationCount();
    renderNotificationsLists();
    changeTab(currentView);
});

document.addEventListener('DOMContentLoaded', () => {
    updateNotificationCount();
});

document.addEventListener('DOMContentLoaded', () => {
    const textArea = document.getElementById('addNotificationContent');
    const wordCountDisplay = document.getElementById('wordCount');
    function updateWordCount() {
        const textLength = textArea.value.length;
        wordCountDisplay.textContent = `${textLength}/100`;
    }
    textArea.addEventListener('input', updateWordCount);
    updateWordCount();
});

document.getElementById('notificationIcon').addEventListener('click', openNotificationsSidebar);
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function () {
        changeTab(this.getAttribute('data-tab'));
    });
});

document.getElementById('loadMore').addEventListener('click', loadMoreNotifications);
function loadMoreNotifications() {
    displayedNotificationsCount += 5;
    renderNotificationsLists();
}

document.getElementById('addNotification').addEventListener('click', openAddNotificationWindow);
document.getElementById('closeAddNotificationWindow').addEventListener('click', closeAddNotificationWindow);

/**
 * Get date time object
 * @param {string|null} date 
 * @returns {{day: string, month: string, year: string, hours: string, minutes: string}}
 */
function getFormattedDateTime(date = null) {
    const d = date ? new Date(date) : new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return { day, month, year, hours, minutes }
}

function convertDateFromString(dateString) {
    const parts = dateString.split(' ');
    const dateParts = parts[0].split('/');
    const timeParts = parts[1].split(':');
    const date = new Date(
        dateParts[2], dateParts[1] - 1, dateParts[0],
        timeParts[0], timeParts[1]);
    return date;
}

function sortNotifications(notifications) {
    return notifications.sort((a, b) => {
        const dateA = convertDateFromString(a.date);
        const dateB = convertDateFromString(b.date);
        return dateB - dateA;
    });
}

document.getElementById('markAllAsRead').addEventListener('click', async function () {
    markAllAsRead().then((data) => openNotificationsSidebar());
});

document.addEventListener('click', async function (event) {
    const { type, target } = event;
    if (target instanceof HTMLElement) {
        if (target.classList.contains('notification-button')) {
            markAllAsRead().then((data) => openNotificationsSidebar());
        }
    }
});

async function markAllAsRead() {
    return fetch('/mark-all-as-read').then(response => response.json());
}

async function getNotificationsData(type) {
    return fetch('/get-notifications').then(response => response.json());
}

async function markNotificationAsRead() {
    return fetch('/mark-notification-as-read').then(response => response.json);
}

function fetchNotifications() {
    getNotificationsData()
        .then(data => {
            allNotifications = data;
            sortNotifications(allNotifications)
            unreadNotifications = allNotifications.filter(notification => !notification.read);
            readNotifications = allNotifications.filter(notification => notification.read);

            updateNotificationCount();
            renderNotificationsLists();
        })
        .catch((error) => {
            console.error('Error:', error)
        });
}
function renderNotificationsLists() {
    const context = document.querySelector('#notificationsContainer');
    const allTab = context.querySelector('.notifications-tab.all')
    const unreadedTab = context.querySelector('.notifications-tab.unreaded');
    const allList = allTab.querySelector('ul');
    const unreadedList = unreadedTab.querySelector('ul');

    allList.innerHTML = "";
    unreadedList.innerHTML = "";

    for (let i = 0; i < displayedNotificationsCount && i < allNotifications.length; i++) {
        const notification = allNotifications[i];
        const dateArray = notification.date.split(" ");
        const date = dateArray[0], time = dateArray[1];
        const template = `        
        <li class="border bg-white px-3 py-2 my-3">
            <div>
                <button class="notification-button" style="cursor:pointer"></button>
                <p class="title">${notification.title}</p>
                <div class="content">${notification.content}</div>
                <small>${time} | ${date}</small>
            </div>
        </li>`;

        allList.innerHTML += template;
        if (!notification.read) {
            unreadedList.innerHTML += template;
        }
    }

    if (displayedNotificationsCount >= allNotifications.length && displayedNotificationsCount >= unreadNotifications.length) {
        document.getElementById('loadMore').style.display = 'none';
    } else {
        document.getElementById('loadMore').style.display = 'block';
    }
}

document.getElementById('addNotificationForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const id = 0;
    const title = document.getElementById('addNotificationTitle').value;
    const content = document.getElementById('addNotificationContent').value;
    const date = new Date().toISOString();
    const read = false;
    const newData = JSON.stringify({ id, title, content, date, read });


    fetch('/add-new-notification', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title, content: content })
    })
        .then(response => response.json())
        .then(data => {
            alert('התראה נוספה בהצלחה!');
            document.getElementById('addNotificationWindow').style.display = 'none';
        })
        .catch(error => console.error('Error:', error));
    closeAddNotificationWindow();
    fetchNotifications();
    renderNotificationsLists();
    openNotificationsSidebar();
    document.getElementById('addNotificationForm').reset();
});

function openNotificationsSidebar() {
    document.getElementById('notificationsSidebar').style.display = 'flex';
    fetchNotifications();
    renderNotificationsLists();
}

function closeNotificationsSidebar() {
    document.getElementById('notificationsSidebar').style.display = 'none';
    displayedNotificationsCount = 5;
}

function openAddNotificationWindow() {
    document.getElementById('addNotificationWindow').style.display = 'flex';
    document.getElementById('addNotificationTitle').focus();
}

function closeAddNotificationWindow() {
    document.getElementById('addNotificationWindow').style.display = 'none';
}

window.onload = function () {
    changeTab('unreaded');
}

function changeTab(view) {
    currentView = view;
    const tabs = document.querySelectorAll('.tab');
    const tabsContents = document.querySelectorAll('.notifications-tab');

    tabs.forEach(tab => tab.classList.remove('selected'));
    tabsContents.forEach(tabContent => tabContent.classList.add('d-none'));

    const selectedTabElement = document.querySelector(`.tab[data-tab="${view}"]`);
    selectedTabElement.classList.add('selected');

    const selectedTabContentElement = document.querySelector(`.notifications-tab.${view}`);
    selectedTabContentElement.classList.remove('d-none');
}

function updateNotificationCount() {
    const badge = document.querySelector('.notification-badge-main');
    if (unreadNotifications.length > 0) {
        newNotificationsAlertCount = unreadNotifications.length;
        badge.style.display = 'flex';
        badge.innerText = newNotificationsAlertCount;
    } else {
        badge.style.display = 'none';
    }
}

document.getElementById('saveNotificationButton').addEventListener('click', showSuccessMessage);

function showSuccessMessage() {
    document.getElementById('success').style.visibility = 'visible';
    setTimeout(function () {
        document.getElementById('success').style.visibility = 'hidden';
    }, 3000);
}