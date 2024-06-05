const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const port = 1602;
const host = "192.168.1.71";



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



app.post('/register', (req, res) => {
  let name = req.body.name;
  let mac_address = req.body.mac_address;
  
  // Tiếp theo, bạn có thể sử dụng thông tin người dùng đã nhập để lưu vào cơ sở dữ liệu hoặc thực hiện một số thao tác khác.

  console.log(name, mac_address);
  res.send("Đăng ký thành công!");
  let db = new sqlite3.Database('C:/sqlite/db/dulieudiemdanh.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the dulieu.');
  });

  let datadulieu = [name, mac_address];
  let sqlInsertdulieu = "INSERT INTO dulieu (Ten,Mac) VALUES (?,?);"

  db.run(sqlInsertdulieu, datadulieu, function (err) {
    if (err) {
      return console.error(err.message);
    };
    console.log(`Row inserted ${this.changes}`)
  });
});
app.get('/dangki', function (req, res) {
  //Gửi file HTML trong thư mục "public"
  res.sendFile(__dirname + '/public/dangki.html');
});

app.get('/danhsach', (req, res) => {
  let db = new sqlite3.Database('C:/sqlite/db/dulieudiemdanh.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
  });

  db.serialize(() => {
      db.all("SELECT * FROM dulieu", (err, rows) => {
          if (err) {
              console.error(err.message);
              res.status(500).send(err.message);
          }
           res.render('index.ejs', {data: rows});
      });
  });

  db.close(err => {
      if (err) {
          console.error(err.message);
      }
      console.log('Close the database connection.');
  });
});



function getTime() {
  const date = new Date();
  const dateTimeFormat = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const [{ value: month }, , { value: day }, , { value: year }, , {
    value: hour
  }, , { value: minute }, , { value: second }] = dateTimeFormat.formatToParts(date);

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function checkMac(mac, callback) {
  let db = new sqlite3.Database('C:/sqlite/db/dulieudiemdanh.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
  });

  db.get("SELECT Ten FROM dulieu WHERE Mac = ?", [mac], (err, row) => {
    if (err) {
      console.error(err.message);
      callback(err, null);
      return;
    }
    if (row) {
      console.log(row.Ten);
      callback(null, row.Ten);
    } else {
      console.log(`No record found with the MAC: ${mac}`);
      callback(null, null);
    }
  });

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });
};
app.post("/:mac", function (req ,res) {

  const macAddress =req.params.mac;

  console.log(`MAC Address Received: ${macAddress}`);
  res.send(`MAC Address Received: ${macAddress}`);

  const Time = getTime();
  let db = new sqlite3.Database('C:/sqlite/db/dulieudiemdanh.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the dulieu.');
  });

  let dataInput = [macAddress, Time];
  let sqlInsertInput = "INSERT INTO Input (Mac,Time) VALUES (?,?);"

  db.run(sqlInsertInput, dataInput, function (err) {
    if (err) {
      return console.error(err.message);
    };
    console.log(`Row inserted ${this.changes}`)
  });

  checkMac(macAddress, (err, Ten) => {
    if (err) {
      // Handle error
    }
    if (Ten) {
      // MAC found, let's insert in Output
      let dataOutput = [Ten, macAddress, Time];
      let sqlInsertOutput = "INSERT INTO output (Ten,Mac,Time) VALUES (?,?,?);";
      db.run(sqlInsertOutput, dataOutput, function (err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`Row inserted ${this.changes}`);
      });
    }
  });

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });
});



app.listen(port, host, () => {
  console.log(`App listening on IP ${host} and port ${port}`);
});