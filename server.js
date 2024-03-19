const express = require('express');
const { engine } = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const { getFormattedDateTime } = require('./public/helpers/TimeHelper');
const app = express();
const PORT = process.env.PORT || 3000;
app.engine('hbs', engine({ defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(express.json());

const readType = {
  all: 0,
  read: 1,
  unread: 2
}

/**
 * Get notifications
 * @param {number} type 
 * @returns {object[]}
 */
function getNotifications(type = readType.all) {
  const jsonPath = path.join(__dirname + "/public", 'task.json');
  let data = fs.readFileSync(jsonPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send("Error reading the file.");
  });  
  data = JSON.parse(data);
  if(type != readType.all) {
    if(readType.read) {
      data = data.filter((notification) => notification.read);    
    } else {
      data = data.filter((notification) => notification.read);
    }
  }
  const notifications = data.data[0].notifications;
  return notifications.sort((a, b) => {
    const notificationAdateData = new Date(a.date);;
    const notificationBdateData = new Date(b.date);;
    return notificationAdateData.getTime() - notificationBdateData.getTime();
  });
}


/**
 * @param {number} id 
 * @returns {object|null}
 */
function getNotificationById(id) {
  const notifications = getNotifications();
  notifications.forEach((notification) => {
    if(notification?.id == id){
      return notification;
    } 
  });
  return null;
}

/**
 * 
 * @param {object|string} fileData 
 * @returns 
 */
function saveNotificationsData(fileData) {
  fileData = typeof fileData !== 'string' ? JSON.stringify(fileData) : fileData;
  const jsonPath = path.join(__dirname + "/public", 'task.json');
  const saveAction = fs.writeFileSync(jsonPath, fileData, {encoding: 'utf-8'}, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error writing to the file.");
    }
  });
  return saveAction;
}



/////////// ROUTES ACTIONS ///////////

app.get('/get-notifications', (req, res) => {
  let selectedReadType = readType.all;
  switch (req.query.type) {
    case readType.read: selectedReadType = readType.read; break;
    case readType.unread: selectedReadType = readType.unread; break;
  }
  const notifications = getNotifications(selectedReadType);
  res.send(notifications);
});

app.post('/add-new-notification', (req, res) => {
  const newData = req.body;
  const jsonPath = path.join(__dirname + "/public", 'task.json');
  let fileData = fs.readFileSync(jsonPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading the file.");
    }
  });
  fileData = JSON.parse(fileData);
  if(Array.isArray(fileData?.data) && fileData?.data[0]?.notifications) {
    const notificationsArray = fileData.data[0].notifications;
    const newId = notificationsArray.length + 1;
    const {day, month, year, hours, minutes} = getFormattedDateTime();
    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
    const newNotification = {
      id: newId,
      title: newData.title ?? '',
      content: newData.content ?? '',
      date: formattedDate,
      read: false
    };
    fileData.data[0].notifications.push(newNotification);

    fs.writeFile(jsonPath, JSON.stringify(fileData, null, 2), 'utf8', (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error writing to the file.");
      }
    });
  }
  res.send("Data successfully updated.");
});

app.post('/mark-notification-as-read', (req, res) => {
  const {id} = req.body;
  const notifications = getNotifications();

  for (let i = 0; i < notifications.length; i++) {
    if(notifications[i].id == id) {
      notifications[i].read = true;
      break;
    }
  }

  const saveResults = saveNotificationsData({data: [{notifications: notifications}]});
  return res.send(saveResults);
});

app.get('/mark-all-as-read', (req, res) => {
  const jsonPath = path.join(__dirname + "/public", 'task.json');
  let fileData = fs.readFileSync(jsonPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading the file.");
    }
  });
  fileData = JSON.parse(fileData);

  if(Array.isArray(fileData?.data) && fileData?.data[0]?.notifications) {
    let notificationsArray = fileData.data[0].notifications;
    notificationsArray = notificationsArray.map((notification) => { 
      notification.read = true;
      return notification;
    });
    fileData.data[0].notifications = notificationsArray;
    fileData = JSON.stringify(fileData);
    fs.writeFileSync(jsonPath, fileData, {encoding: 'utf-8'}, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error writing to the file.");
      }
    });
  }
  res.send({success: true});
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


