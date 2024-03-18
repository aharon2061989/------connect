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


app.get('/task.json', (req, res) => {
  const rawData = fs.readFile(path.join(__dirname, 'task.json'));
  const data = JSON.parse(rawData);
  res.render('notification', { notifications: data.data[0].notifications });
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
  const jsonPath = path.join(__dirname + "/public", 'task.json');
  let fileData = fs.readFileSync(jsonPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading the file.");
    }
  });
  fileData = JSON.parse(fileData);

})

app.post('/mark-all-as-read', (req, res) => {
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


