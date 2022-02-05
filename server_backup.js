
var http = require('http');
var express = require('express');
var WSS = require('ws').Server;
var socketGlobal;

var app = express().use(express.static('public'));
var server = http.createServer(app);
server.listen(8080, '0.0.0.0');

// Start the server
var wss = new WSS({ port: 8081 });
//var wss = new WSS({ server: httpsServer });

// When a connection is established
wss.on('connection', function(socket) {
  console.log('Opened Connection 🎉');

  // Send data back to the client
  var json = JSON.stringify({ message: 'Gotcha' });
  socket.send(json);
  console.log('Sent: ' + json);
  socketGlobal = socket;

  // When data is received
  socket.on('message', function(message) {
    console.log('Received: ' + message);

    wss.clients.forEach(function each(client) {
      var json = JSON.stringify({ message: 'Something changed' });
      //client.send(json);
      console.log('Sent: ' + json);
    });
  });

  // The connection was closed
  socket.on('close', function() {
    console.log('Closed Connection 😱');
  });
});

// Every three seconds broadcast "{ message: 'Hello hello!' }" to all connected clients
var broadcast = function() {
  var json = JSON.stringify({
    message: 'Hello hello!'
  });

  wss.clients.forEach(function each(client) {
    client.send(json);
    console.log('Sent: ' + json);
  });  
}
//setInterval(broadcast, 1000);



var db = require("./db_config");

db.connect(function(err) {
    if (err) throw err;
    setInterval(realTimeUpdate, 1000);
});

function realTimeUpdate() {
    let sql = "SELECT * FROM schedule WHERE date='" + yyyymmdd(new Date()) + "'";
            db.query(sql, function (err, result) {
              if (err) throw err;
              // gunakan perulangan untuk menampilkan data
              //console.log(result[0].info);
              //result[0].info = 'Aaaaaaaaaaaaaaa';
              //console.log('Info \t Start Time \t\t End Time');
            


            result.forEach(schedule => {
            //console.log('${schedule.info} \t ${schedule.start_time} \t ${schedule.end_time}');
            //console.log(schedule.info);
            //console.log(schedule.start_time);
            //console.log(Date.parse(schedule.start_time));    
            //console.log(schedule.end_time);   
            str = (schedule.start_time).split(":");
            end = (schedule.end_time).split(":");
            //date = (schedule.date).getFullYear().toString()+(schedule.date).getMonth().toString()+(schedule.date).getDay().toString();
            
            currentTime = new Date();
            start_time = new Date();
            start_time.setHours(str[0], str[1], str[2]);
            end_time = new Date();
            end_time.setHours(end[0], end[1], end[2]);
            
            if(currentTime >= start_time && currentTime <= end_time) {
                console.log("Jadwal Now is: " + schedule.info);
            }
            if(schedule.is_need_absent == 1 && schedule.has_triggered==0) {
                //console.log("Schedule date: " + schedule.date);
                //console.log("Schedule absent time: " + schedule.absent_time);
                abs = (schedule.absent_time).split(":");
                absent_time = new Date();
                absent_time.setHours(abs[0], abs[1], abs[2]);

                if(currentTime >= absent_time) {
                    //trigger for absent
                    console.log("Start absen for schedule: " + schedule.info); 
                    updateData("UPDATE schedule SET has_triggered = 1 WHERE date='" + yyyymmdd(schedule.date) + "' AND absent_time = '" + schedule.absent_time + "'");
                    
                    //send triger for absent to clients
                    wss.clients.forEach(function each(client) {
                      var json = JSON.stringify({info: ''+ schedule.info +'', date: ''+ yyyymmdd(schedule.date) +'', start: ''+ schedule.start_time +'', end: ''+ schedule.end_time +''});
                      client.send(json); 
                      console.log('Sent to clients: ' + json);
                    });
                }
            }
        });
    });        
        console.log("--------------------> update...");
}

function yyyymmdd(dateIn) {
  var yyyy = dateIn.getFullYear();
  var mm = dateIn.getMonth() + 1; // getMonth() is zero-based
  var dd = dateIn.getDate();
  return String(yyyy + "-" + mm + "-" + dd);
  //return String(10000 * yyyy + 100 * mm + dd); // Leading zeros for mm and dd
}

function getData(sql) {
  db.query(sql, function (err, result) {
    if (err) throw err;
    // gunakan perulangan untuk menampilkan data
    //console.log(result[0].info);
    //result[0].info = 'Aaaaaaaaaaaaaaa';
    //console.log('Info \t Start Time \t\t End Time');
  });
  return result;
}

function updateData(sql) {
    //var db = require("./db_config");

    //db.connect(function(err) {
        //if (err) throw err;
    
        // kita akan mengubah data
        //let sql = "UPDATE schedule SET address='LEM Lantai 1' WHERE id=1";

        db.query(sql, function (err, result) {
            if (err) throw err;
            //console.log("Data trigger telah terupdate!");
            console.log("Number of records inserted: " + result.affectedRows);
        });
    //});
}
