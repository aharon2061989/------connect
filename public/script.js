var readNotifications = [];
var unreadNotifications = [];
var allNotifications = [];
var currentView = 'unread';
var displayedNotificationsCount = 5;
var newNotificationsAlertCount = 0;

////עידכון ספירת התראות
document.addEventListener('DOMContentLoaded', () => {
    updateNotificationCount();
})
////ספירת אותיות לאינפוט
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
///שינוי טאב
document.getElementById('notificationIcon').addEventListener('click', openNotificationsSidebar);
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function () {
        changeTab(this.getAttribute('data-tab'));
    });
});
///טעינת עוד התראות איבנט ליסנר
document.getElementById('loadMore').addEventListener('click', loadMoreNotifications);

///סימון כל ההתראות -נקראו---כשחוזרים לטאב לא נקראו מופיעות ההתראות שכבר סומנו
document.getElementById('markAllAsRead').addEventListener('click', function () {
    document.querySelectorAll('.notification-dot').forEach(dot => {
        dot.classList.remove('notification-dot-blue');

    });
    unreadNotifications.forEach(notification => {
        notification.read = true;
        console.log(allNotifications);
    });
    unreadNotifications = [];
    currentView = 'all';
    const sortedNotifications = sortNotifications(allNotifications);
    const firstFiveNotifications = sortedNotifications.slice(0, displayedNotificationsCount);
    updateNotificationsView();
    changeTab(currentView)
    showNotifications(firstFiveNotifications);
    updateNotificationCount()
});

////פתיחה וסגירה חלון התראות----עובד
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
    return {
        day,
        month,
        year,
        hours,
        minutes
    }
}


///המרה של תאריך----עובד
function convertDateFromString(dateString) {
    const parts = dateString.split(' ');
    const dateParts = parts[0].split('/');
    const timeParts = parts[1].split(':');
    const date = new Date(
        dateParts[2], dateParts[1] - 1, dateParts[0],
        timeParts[0], timeParts[1]);
    return date;
}
///מיון התראות לפי תאריך חדש לישן---עובד
function sortNotifications(notifications) {
    return notifications.sort((a, b) => {
        const dateA = convertDateFromString(a.date);
        const dateB = convertDateFromString(b.date);
        return dateB - dateA;
    });
}
///הצג התראות דרך תבנית----עובד
function showNotifications(notifications) {
    const templateSource = document.getElementById('notificationTemplate').innerHTML;
    const compiledTemplate = Handlebars.compile(templateSource);
    const sortedNotifications = sortNotifications(notifications);
    const html = compiledTemplate({ notifications: sortedNotifications });
    document.getElementById('notificationsContainer').innerHTML = html;
}

// function updateNotificationsView() {
//     let notificationsToShow = [];
//     if (currentView === 'unread') {
//         notificationsToShow = [...unreadNotifications];
//         if(unreadNotifications.length === 0) {
//             notificationsToShow = [...readNotifications];
//         }
//     } 
//     else if(currentView === 'all') { 
//         notificationsToShow = [...readNotifications];
//     }
//     const sortedNotifications = sortNotifications(notificationsToShow);
//     const firstFiveNotifications = sortedNotifications.slice(0, displayedNotificationsCount);
//     showNotifications(firstFiveNotifications);
//     if (displayedNotificationsCount >= notificationsToShow.length) {
//         document.getElementById('loadMore').style.display = 'none';
//     }
//     else {
//         document.getElementById('loadMore').style.display = 'flex';
//     }
// }

function renderNotificationsLists() {
    const context = document.querySelector('#notificationsContainer');
    const allTab = context.querySelector('.notifications-tab.all')
    const unreadedTab = context.querySelector('.notifications-tab.unreaded');
    const allList = allTab.querySelector('ul');
    const unreadedList = unreadedTab.querySelector('ul');

    allList.innerHTML = "";
    unreadedList.innerHTML = "";

    allNotifications.forEach((notification) => {
        const dateArray = notification.date.split(" ");
        const date = dateArray[0], time = dateArray[1];
        const template = `        
            <li class="border bg-white px-3 py-2 my-3">
                <div>
                    <div class="float-end">O</div>
                    <p class="title">${notification.title}</p>
                    <div class="content">${notification.content}</div>
                    <small>${time} | ${date}</small>
                </div>
            </li>`;
        if (!notification.read) {
            unreadedList.innerHTML += template;
        }
    });
}

function fetchNotifications() {
    fetch('/task.json')
        .then(response => response.json())
        .then(data => {
            allNotifications = data.data[0].notifications;
            unreadNotifications = allNotifications.filter(notification => !notification.read);
            readNotifications = allNotifications.filter(notification => notification.read);

            renderNotificationsLists();
            updateNotificationCount();
        })
        .catch(error => console.error('Error:', error));
}
///יצירת התראה חדשה מהטופס לקוח---עובד
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
            document.getElementById('addNotificationForm').reset();
        })
        .catch(error => console.error('Error:', error));
    closeAddNotificationWindow();
    fetchNotifications();

});
///טעינת עוד התראות----עובד
function loadMoreNotifications() {
    displayedNotificationsCount += 5;
    updateNotificationsView();
}
//פתעחת סייד בר----עובד
function openNotificationsSidebar() {
    document.getElementById('notificationsSidebar').style.display = 'flex';
    fetchNotifications();
}
///סגירת סייד בר----עובד
function closeNotificationsSidebar() {
    document.getElementById('notificationsSidebar').style.display = 'none';
    displayedNotificationsCount = 5;
    updateNotificationsView();
}
///פתיחת חלון יצירת התראה----עובד
function openAddNotificationWindow() {
    document.getElementById('addNotificationWindow').style.display = 'flex';
    document.getElementById('addNotificationTitle').focus();
}
///סגירת חלון יצירת התראה----עובד
function closeAddNotificationWindow() {
    document.getElementById('addNotificationWindow').style.display = 'none';
}
///שינוי מצב ראשוני לטאב - לא נקרא----עובד
window.onload = function () {
    changeTab('unread');
    updateNotificationsView()
}
///שינווי טאב---עובד
function changeTab(view) {
    currentView = view;
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('selected');
    });
    const selectedTabElement = document.querySelector(`.tab[data-tab="${view}"]`);
    if (selectedTabElement) {
        selectedTabElement.classList.add('selected');
    }
    updateNotificationsView();
}

///עדכון ספירת התראות----עובד
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












