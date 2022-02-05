'use strict';
//http Connection                              ////gen01,gen02,accbro01,accsis01    ---  adm01
// "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" -kiosk -fullscreen http://google.com
var count = 1;
var http = require('http');
var express = require('express');
var WSS = require('ws').Server;
//var socketGlobal;

var app = express().use(express.static('public'));
var server = http.createServer(app);
server.listen(8080, '0.0.0.0');

// Start the server
var wss = new WSS({ port: 8081 });
var absentDuration = 5; //durasi absensi
//var wss = new WSS({ server: httpsServer });
var timerAbsent = null;


//  last update/ work code ---https connection
/*var fs = require('fs');
var https = require('https');
var express = require('express');
var WebSocketServer = require('ws').Server;
var privateKey  = fs.readFileSync('sslcert/key.pem', 'utf8');
var certificate = fs.readFileSync('sslcert/cert.pem', 'utf8');
//var socketGlobal;
var app = express().use(express.static('public'));
var credentials = { cert: certificate, key: privateKey };
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(8080, '0.0.0.0');
var wss = new WebSocketServer({ server: httpsServer, port: 8081 });
*/


var db = require("./db_config");
var dataRequest;
var currentDay = new Date().getDay();
var dataTempAbsent = [];
var canStoreAbsent = false;
var dataSiswa = [];
var currentScheduleAbsentData = [];
var savedDataAbsent = [];
var userID = [];
//var timerAbsent = null;


function sendDetailAbsentSummaryData(sql, id) {
  db.query(sql, function (err, result) {
    if (err) throw err;
    wss.clients.forEach(function each(client) {
      if(client.protocol===id) {
          //console.log(result);
          client.send('showDetailAbsentSummaryData~~~---|||<<<>>>|||---~~~'+JSON.stringify(JSON.parse(JSON.stringify(result))));
      }
    });
  }); 
}





function sendAbsentSummaryData(sql, week, id) {
  db.query(sql, function (err, result) {
    if (err) throw err;
    wss.clients.forEach(function each(client) {
      if(client.protocol===id) {
          client.send('showAbsentSummaryData~~~---|||<<<>>>|||---~~~'+week+'~~~---|||<<<>>>|||---~~~'+JSON.stringify(JSON.parse(JSON.stringify(result))));
      }
      
    });
  }); 
}





function sendAbsentData(sql, id) {
  db.query(sql, function (err, result) {
    if (err) throw err;
    wss.clients.forEach(function each(client) {
      if(client.protocol===id) {
          client.send('showAbsentData~~~---|||<<<>>>|||---~~~'+JSON.stringify(JSON.parse(JSON.stringify(result))));
      }
    });
  }); 
}



function sendAbsentDataSummary(sql, id) {
  db.query(sql, function (err, result) {
    if (err) throw err;
    wss.clients.forEach(function each(client) {
      if(client.protocol===id) {
          client.send('showAbsentData~~~---|||<<<>>>|||---~~~'+JSON.stringify(JSON.parse(JSON.stringify(result))));
      }
    });
  }); 
}


function sendDataSiswa(sql, id) {
  db.query(sql, function (err, result) {
    if (err) throw err;
        dataSiswa=[];
        result.forEach(data => {
        dataSiswa.push(data);
    });
    wss.clients.forEach(function each(client) {
      if(client.protocol===id) {
          client.send('setDataSiswa~~~---|||<<<>>>|||---~~~'+JSON.stringify(JSON.parse(JSON.stringify(result))));
      }
    });
  }); 
}


function sendUpdateDateToday() { //ketika hari berganti (pukul 00.00)
    wss.clients.forEach(function each(client) {
        client.send('updateTodayDate~~~---|||<<<>>>|||---~~~NoDataJustTrigger');
    });
}


function sendDataScheduleToday(sql, id) {
  db.query(sql, function (err, result) {
    if (err) throw err;
    wss.clients.forEach(function each(client) {
      if(client.protocol===id) {
          client.send('updateTodayScheduleTable~~~---|||<<<>>>|||---~~~' + JSON.stringify(JSON.parse(JSON.stringify(result))));
      } else if(id==='all') {
          client.send('updateTodayScheduleTable~~~---|||<<<>>>|||---~~~' + JSON.stringify(JSON.parse(JSON.stringify(result))));
      }
    });
  }); 
}


function showScheduleData(sql, id) {
  db.query(sql, function (err, result) {
    if (err) throw err;
      wss.clients.forEach(function each(client) {
        if(client.protocol===id) {
          client.send('showDataScheduleTable~~~---|||<<<>>>|||---~~~' + JSON.stringify(JSON.parse(JSON.stringify(result))));
        }
      });
  });
}  

function showAbsentData(sql, id) {
  db.query(sql, function (err, result) {
    if (err) throw err;
      wss.clients.forEach(function each(client) {
        if(client.protocol===id) {
          client.send('showDataAbsentTable~~~---|||<<<>>>|||---~~~' + JSON.stringify(JSON.parse(JSON.stringify(result))));
        }
      });
  });
}  

function showAbsentDataSummary(sql, id) {
  db.query(sql, function (err, result) {
    if (err) throw err;
      wss.clients.forEach(function each(client) {
        if(client.protocol===id) {
          client.send('showAbsentSummaryTable~~~---|||<<<>>>|||---~~~' + JSON.stringify(JSON.parse(JSON.stringify(result))));
        }
      });
  });
}  


function showPresenceProgressReport(id, startDate, endDate) {
    db.query("SELECT * FROM trainee ORDER BY nama", function (err, result) {
        if (err) throw err;
        db.query("SELECT * FROM activity ORDER BY id ASC", function (err2, result2) {
            if (err2) throw err2;
            db.query("SELECT act.id, act.items, tr.nis, tr.nama, (SELECT COUNT(*) FROM absent WHERE act.id=absent.schedule_id AND (absent.mark='V' OR absent.mark='O') AND absent.nis=tr.nis  AND absent.absent_date>='"+startDate+"' AND absent.absent_date<='"+endDate+"') as FREQ FROM activity as act, trainee AS tr ORDER BY tr.nama ASC, act.id ASC", function (err3, result3) {
                if (err3) throw err3;
                wss.clients.forEach(function each(client) {
                    if(client.protocol===id) {
                        client.send('showPresenceProgressReport~~~---|||<<<>>>|||---~~~' + JSON.stringify(JSON.parse(JSON.stringify(result)))+ '~~~---|||<<<>>>|||---~~~' +JSON.stringify(JSON.parse(JSON.stringify(result2)))+ '~~~---|||<<<>>>|||---~~~' +JSON.stringify(JSON.parse(JSON.stringify(result3))));
                    }
                });
            });
        });
    });
}


function showAnnouncementData(sql, id) {
  db.query(sql, function (err, result) {
    if (err) throw err;
      wss.clients.forEach(function each(client) {
        if(client.protocol===id) {
          client.send('showAnnouncementData~~~---|||<<<>>>|||---~~~' + JSON.stringify(JSON.parse(JSON.stringify(result))));
        }
      });
  });
}

function updateAnnouncementData(sql, id) {
  db.query(sql, function (err, result) {
        if (err) throw err;
        wss.clients.forEach(function each(client) {
            if(client.protocol===id) {
                client.send('updateAnnouncementResult~~~---|||<<<>>>|||---~~~'+'<h4>Announcement saved!</h4>');
            }   
        });
  });
}



function getAnouncementStatus() {
  db.query("SELECT * FROM anouncement", function (err, result) {
    if (err) throw err;
    if ((typeof result != 'undefined') && (result[0].show==1)) { //siarkan
      wss.clients.forEach(function each(client) {
        client.send('updateAnouncement~~~---|||<<<>>>|||---~~~' + result[0].content);
      });
      //console.log("Send anouncement")
      db.query("UPDATE anouncement AS acn SET acn.show=0", function (err2, result2) {
        if (err) throw err;
        //console.log("Anouncement status updated to 0")
      });
    }
    //return result;
  }); 
}

function emptyTemporaryAbsentTable() {
  db.query("TRUNCATE tmp_absent", function (err, result) {
    if (err) throw err;
  }); 
}

function sendDataTemporaryAbsent(absenData, id) {
  wss.clients.forEach(function each(client) {
      var data = 'updateCurrentAbsentTable~~~---|||<<<>>>|||---~~~' + JSON.stringify(JSON.parse(JSON.stringify(absenData)));
      if((currentScheduleAbsentData[0].area==='kamar') && ((client.protocol==='accbro01')||(client.protocol==='accsis01'))) { 
          if(client.protocol===id){
            data += '~~~---|||<<<>>>|||---~~~showPict';
          }
          client.send(data);
      }
      else if((currentScheduleAbsentData[0].area==='umum') && ((client.protocol==='gen01')||(client.protocol==='gen02')||(client.protocol==='gen03'))){
          if(client.protocol===id){
            data += '~~~---|||<<<>>>|||---~~~showPict';
          }
          client.send(data);
      }
      /*if(client.protocol===id){
          client.send(data);
      }*/
      
    });
}



db.connect(function(err) {
    if (err) throw err;
    setInterval(realTimeUpdate, 1000);
});


function reconnectDB(){
  db.connect(function(err) {
    if (err) throw err;
    setInterval(realTimeUpdate, 1000);
  });
}

// When a connection is established
wss.on('connection', function(socket, req) { //ambil socketnya
  console.log('Opened Connection 🎉');
  //console.log('getSocketProtocollllllllllllllllll: ' + socket.protocol);
  

  //------------------------------------------------------------ When data is received from clients
  socket.on('message', function(message) {

    var content = message.split('~~~---|||<<<>>>|||---~~~');
    var msgType = content[0]; 

    if(msgType === 'reqestDataSiswa') {   
      sendDataSiswa("SELECT * FROM trainee ORDER BY nama", socket.protocol);       
    }//------------------------tiap request hanya dikirimkan spesifik ke user yang request, bukan dibroadcast

    else if(msgType === 'reqestDataScheduleToday') {// gunakan properti protocol sebagai identifier dari masing2 halaman    
      sendDataScheduleToday("SELECT *, (SELECT items FROM activity WHERE activity.id=schedule.info_id) AS presenceItems FROM schedule WHERE date='" + yyyymmdd(new Date()) + "' ORDER BY start_time ASC", socket.protocol);      
    }

    else if(msgType === 'storeTemporaryAbsentData') { 
      console.log("storeTemporaryAbsentData---------------------");   
      checkDuplicateDataAndStoreIntoTempAbsentTable(JSON.parse(content[1]),socket.protocol);   
    }

    else if(msgType === 'saveAbsentData' && canStoreAbsent==true) { //menyimpan data final absensi ke tabel absen
    /*
      console.log('Store data absent: --------------------------->>>>')
      if(canStoreAbsent==true){
        canStoreAbsent = false;
        saveAbsentData(); 
      }
    */    
    }
    else if(msgType === 'reqestAbsentData') {
      sendAbsentData("SELECT tr.nama AS name, ab.nis AS nis, (SELECT items FROM activity WHERE activity.id=ab.schedule_id) AS schedule, ab.mark FROM trainee AS tr, absent AS ab WHERE ab.absent_date='" + yyyymmdd(new Date()) + "' AND tr.nis=ab.nis ORDER BY name, ab.absent_time", socket.protocol);
    }
    else if(msgType === 'reqestAbsentData2') {
      sendAbsentData("SELECT tr.nama AS name, ab.nis AS nis, (SELECT items FROM activity WHERE activity.id=ab.schedule_id) AS schedule, ab.mark FROM trainee AS tr, absent AS ab WHERE ab.absent_date='" + content[1] + "' AND tr.nis=ab.nis ORDER BY name, ab.absent_time", socket.protocol);
    }
    else if(msgType === 'reqestAbsentSummaryData') {
      //content[1] is week number
      sendAbsentSummaryData("SELECT tr.nis, tr.nama, " +
        "(SELECT COUNT(*) FROM absent WHERE absent.mark='V' AND absent.nis=tr.nis AND absent.week=" + content[1] + ") AS V, " +
        "(SELECT COUNT(*) FROM absent WHERE absent.mark='O' AND absent.nis=tr.nis AND absent.week=" + content[1] + ") AS O, " +
        "(SELECT COUNT(*) FROM absent WHERE absent.mark='X' AND absent.nis=tr.nis AND absent.week=" + content[1] + ") AS X, " +
        "(SELECT COUNT(*) FROM absent WHERE absent.mark='i' AND absent.nis=tr.nis AND absent.week=" + content[1] + ") AS i, " +
        "(SELECT COUNT(*) FROM absent WHERE absent.mark='s' AND absent.nis=tr.nis AND absent.week=" + content[1] + ") AS s " +
        "FROM trainee as tr ORDER BY tr.nama ASC;", content[1], socket.protocol);
    }

    else if(msgType === 'reqestDetailAbsentSummaryData') {
      var sql = "";
      if(socket.protocol==='adm01'){//jika admin 
          sql = "SELECT (SELECT items FROM activity WHERE activity.id=absent.schedule_id) AS schedule, absent_date, absent_time FROM absent WHERE nis='"+ content[1] +"' AND mark='"+ content[2] +"' AND absent_date>='"+ content[3] +"' AND absent_date<='" + content[4] + "' ORDER BY id DESC"; //absent_date DESC, absent_time DESC";
      }
      else {
          sql = "SELECT (SELECT items FROM activity WHERE activity.id=absent.schedule_id) AS schedule, absent_date, absent_time FROM absent WHERE nis='"+ content[1] +"' AND week="+ content[2] +" AND mark='"+ content[3] +"' ORDER BY absent_date ASC, absent_time ASC";
      }
      sendDetailAbsentSummaryData(sql, socket.protocol);
    }

    else if(msgType === 'loginChecking') {
      loginChecking("SELECT * FROM admin WHERE username='"+ content[1] +"' AND password='"+ content[2]+"'", socket.protocol);
    }



    //------------------ ADMIN Areaaaaaaaaaaaaaaaaaa ---------------------------------
    //-----------------------------------------------------------Menu Schedule Handling
    else if(msgType === 'requestScheduleData') {
        showScheduleData("SELECT batch, week, (SELECT items FROM activity WHERE activity.id=schedule.info_id) AS presenceItems, info_id, info, start_time, end_time, is_need_absent, absent_time, has_triggered, date, participant, area, timer, id FROM schedule ORDER BY date DESC, start_time ASC", socket.protocol);
    }

    else if(msgType === 'requestActivityDataForSelectItem') {
        setActivityDataForSelectItem("SELECT * FROM activity ORDER BY id ASC", socket.protocol);
    }

    else if(msgType === 'updateScheduleData') {
        var data = JSON.parse(content[1]);
        var sql = "";
        var type = "";
        if(data.id==''){//insert 
          sql = "INSERT INTO schedule (batch, week, info, info_id, start_time, end_time, is_need_absent, absent_time, has_triggered, date, participant, area, timer) VALUES"+
                "('"+data.batch+"', '"+data.week+"', '"+data.info+"', '"+ data.presenceItemId +"','"+data.start+"', '"+data.end+"', "+data.needAbs+", '"+data.absTime+"', "+data.triggered+", '"+data.date+"', '"+data.participant+"', '"+data.area+"', '"+data.timer+"')";
          type = "insert";
        } else { //update
           sql = "UPDATE schedule SET batch='"+data.batch+"', week='"+data.week+"', info_id='"+ data.presenceItemId +"', info='"+data.info+"', start_time='"+data.start+"', end_time='"+data.end+"', is_need_absent="+data.needAbs+", absent_time='"+data.absTime+"', has_triggered="+data.triggered+", date='"+data.date+"', participant='"+data.participant+"', area='"+data.area+"', timer='"+data.timer+"' WHERE id='"+data.id+"'"; 
           type = "update";
        }
        //console.log("SQL: "+sql);
        updateScheduleData(sql, socket.protocol, type);
    }

    else if(msgType === 'updateScheduleDataWithSQL') {
        updateScheduleDataWithSQL(content[1], socket.protocol);
    }

    else if(msgType === 'deleteScheduleData') {
        deleteScheduleData("DELETE FROM schedule WHERE id="+content[1], socket.protocol);
    }



    /////////---------------------------------------------------Menu Absent handling ---------------------------------
    else if(msgType === 'requestAbsentData') {
        showAbsentData("SELECT ab.nis AS nis, tr.nama AS name, ab.batch, ab.week, ab.schedule, ab.absent_date, ab.absent_time, ab.mark, ab.additional_info, ab.id, ab.schedule_id, (SELECT items FROM activity WHERE activity.id=ab.schedule_id) AS presenceItems FROM trainee AS tr, absent AS ab WHERE tr.nis=ab.nis ORDER BY week DESC, absent_date DESC, absent_time DESC", socket.protocol); // LIMIT 1000
    }

    else if(msgType === 'requestAbsentDataSummary') {
        var sql = "SELECT tr.nis, tr.nama," +
                  "(SELECT COUNT(*) FROM absent WHERE absent.mark='V' AND absent.nis=tr.nis AND absent.absent_date>='"+ content[1] +"' AND absent.absent_date<='" + content[2] + "') AS V," +
                  "(SELECT COUNT(*) FROM absent WHERE absent.mark='O' AND absent.nis=tr.nis AND absent.absent_date>='"+ content[1] +"' AND absent.absent_date<='" + content[2] + "') AS O," +
                  "(SELECT COUNT(*) FROM absent WHERE absent.mark='X' AND absent.nis=tr.nis AND absent.absent_date>='"+ content[1] +"' AND absent.absent_date<='" + content[2] + "') AS X," +
                  "(SELECT COUNT(*) FROM absent WHERE absent.mark='i' AND absent.nis=tr.nis AND absent.absent_date>='"+ content[1] +"' AND absent.absent_date<='" + content[2] + "') AS i," +
                  "(SELECT COUNT(*) FROM absent WHERE absent.mark='s' AND absent.nis=tr.nis AND absent.absent_date>='"+ content[1] +"' AND absent.absent_date<='" + content[2] + "') AS s " +
                  "FROM trainee as tr ORDER BY tr.nama ASC";

        showAbsentDataSummary(sql, socket.protocol); // LIMIT 1000
    }

    else if(msgType === 'requestPresenceProgressReport') {
        showPresenceProgressReport(socket.protocol, content[1], content[2]);
    }

    else if(msgType === 'updateAbsentData') {
        var data = JSON.parse(content[1]);
        updateAbsentData("UPDATE absent SET mark='"+data.mark+"', additional_info='"+data.additional+"' WHERE id='"+data.id+"'", socket.protocol);
    }

    else if(msgType === 'deleteAbsentData') {
        deleteAbsentData("DELETE FROM absent WHERE id="+content[1], socket.protocol);
    }



//---------------------------------------------Menu Trainee Handling --------------------------------------
    else if(msgType === 'updateTraineeData') {
        var data = JSON.parse(content[1]);
        var sql = "";
        var type = content[2];
        if(type=='insert'){//insert 
          sql = "INSERT INTO trainee (nis, nama, gender, batch, jurusan, image) VALUES"+
                "('"+data.nis+"', '"+data.nama+"', '"+data.gender+"', '"+data.batch+"', '"+data.jurusan+"', '"+data.image+"')";
        } else { //update
           sql = "UPDATE trainee SET nama='"+data.nama+"', gender='"+data.gender+"', batch='"+data.batch+"', jurusan='"+data.jurusan+"', image='"+data.image+"' WHERE nis='"+data.nis+"'"; 
        }
        updateTraineeData(sql, socket.protocol, type);
    }

    else if(msgType === 'updateTraineeDataWithSQL') {
        updateTraineeDataWithSQL(content[1], socket.protocol);
    }

    else if(msgType === 'deleteTraineeData') {
        deleteTraineeData("DELETE FROM trainee WHERE nis='"+content[1]+"'", socket.protocol);
    }


//---------------------------------------------Menu Announcement Handling ----------------------------------------
    else if(msgType === 'requestAnnouncementData') {
        showAnnouncementData("SELECT * FROM anouncement", socket.protocol);
    }

    else if(msgType === 'updateAnnouncementData') { 
        updateAnnouncementData("UPDATE anouncement AS acn SET acn.content = '"+content[1]+"', acn.show = '"+content[2]+"' WHERE acn.id = 1", socket.protocol);
    }



//----------------------------------------Menu Request Refresh -----------------------------------------
    else if(msgType === 'requestRefreshAllClients') {
        refreshAllClients(socket.protocol);
    }


    
//----------------------------------------Menu Change Absent Duration-----------------------------------------
    else if(msgType === 'requestAbsentDurationData') {
        //clearAbsentTimer(socket.protocol);
      db.query("SELECT absentDuration FROM current WHERE id=1", function (err, result) {
          if (err) throw err;
          wss.clients.forEach(function each(client) {
              if(client.protocol===socket.protocol) {
                  client.send('showUpdateAbsentDurationModal~~~---|||<<<>>>|||---~~~'+result[0].absentDuration);                  
              }
          });
                    
        });
    }

    else if(msgType === 'updateAbsentDurationData') {
        updateAbsentDurationData("UPDATE current SET absentDuration = "+content[1]+" WHERE id = 1", socket.protocol);
    }


//----------------------------------------Menu Request Clear Absent Timer-----------------------------------------
    else if(msgType === 'clearAbsentTimer') {
        clearAbsentTimer(socket.protocol);
    }




  });



  // The connection was closed
  socket.on('close', function() {
    console.log('Closed Connection 😱');
  });


});




function loginChecking(sql, id) {
    db.query(sql, function (err, result) {
      if (err) throw err;
      wss.clients.forEach(function each(client) {
          if(client.protocol===id) {
              //console.log(result);
              if(result.length>0) {
                client.send('loginResult~~~---|||<<<>>>|||---~~~'+result.length+'~~~---|||<<<>>>|||---~~~'+result[0].name);
              }
              else {
                client.send('loginResult~~~---|||<<<>>>|||---~~~'+result.length+'~~~---|||<<<>>>|||---~~~'+'Login fail');
              }
              
          }          
      });
    }); 
}

function setActivityDataForSelectItem(sql, id) {
    db.query(sql, function (err, result) {
      if (err) throw err;
      wss.clients.forEach(function each(client) {
          if(client.protocol===id) {
              //console.log(result);
              client.send('setActivityDataForSelectItem~~~---|||<<<>>>|||---~~~' + JSON.stringify(JSON.parse(JSON.stringify(result))));
          }          
      });
    });   
}

function deleteScheduleData(sql, id) {
    db.query(sql, function (err, result) {
      if (err) throw err;
      wss.clients.forEach(function each(client) {
          if(client.protocol===id) {
              console.log(result);
              var message = "";
              if(result.affectedRows==1) { //jika update
                  message = '<h4>Schedule data delete successful!</h4>';
              }
              client.send('updateScheduleResult~~~---|||<<<>>>|||---~~~'+message);
          }          
      });
    });   
}

function updateScheduleData(sql, id, type){
    db.query(sql, function (err, result) {
      if (err) throw err;
      wss.clients.forEach(function each(client) {
          if(client.protocol===id) {
              console.log(result);
              var message = "";
              if(type==="update") { //jika update
                  message = '<h4>Schedule update successful!</h4>';
              }
              else if(type==="insert") { //jika insert
                  message = "<h4>Schedule added!</h4>";
              }
              client.send('updateScheduleResult~~~---|||<<<>>>|||---~~~'+message);
          }          
      });
    }); 
}


function updateScheduleDataWithSQL(sql, id) {
    db.query(sql, function (err, result) {
      if (err) return console.log(err);
      
      wss.clients.forEach(function each(client) {
          if(client.protocol===id) {
              var message = "";
              if(result.affectedRows>=1) { //jika update
                  message = '<h4>Schedule Query successful!</h4>';
              }
              client.send('updateScheduleResult~~~---|||<<<>>>|||---~~~'+message);
          }          
      });
    });
}






function updateAbsentData(sql, id, type){
    db.query(sql, function (err, result) {
      if (err) throw err;
      wss.clients.forEach(function each(client) {
          if(client.protocol===id) {
              console.log(result);
              client.send('updateAbsentResult~~~---|||<<<>>>|||---~~~'+'<h5>Absent data update successful!</h5>');
          }          
      });
    }); 
}


function updateAbsentDurationData(sql, id){
    db.query(sql, function (err, result) {
      if (err) throw err;
      wss.clients.forEach(function each(client) {
          if(client.protocol===id) {
              console.log(result);
              client.send('updateAbsentDurationDataResult~~~---|||<<<>>>|||---~~~'+'<h5>Absent duration data update successful!</h5>');
          }          
      });
    }); 
}


function deleteAbsentData(sql, id) {
    db.query(sql, function (err, result) {
      if (err) throw err;
      wss.clients.forEach(function each(client) {
          if(client.protocol===id) {
              console.log(result);
              var message = "";
              if(result.affectedRows==1) { //jika update
                  message = '<h4>Absent data delete successful!</h4>';
              }
              client.send('updateAbsentResult~~~---|||<<<>>>|||---~~~'+message);
          }          
      });
    });   
}



function updateTraineeData(sql, id, type){
    db.query(sql, function (err, result) {
      if (err) throw err;
      wss.clients.forEach(function each(client) {
          if(client.protocol===id) {
              console.log(result);
              var message = "";
              if(type==="update") { //jika update
                  message = '<h4>Trainee data update successful!</h4>';
              }
              else if(type==="insert") { //jika insert
                  message = "<h4>Trainee data added!</h4>";
              }
              client.send('updateTraineeResult~~~---|||<<<>>>|||---~~~'+message);
          }          
      });
    }); 
}



function updateTraineeDataWithSQL(sql, id) {
    db.query(sql, function (err, result) {
      if (err) return console.log(err);
      
      wss.clients.forEach(function each(client) {
          if(client.protocol===id) {
              var message = "";
              if(result.affectedRows>=1) { //jika update
                  message = '<h4>Trainee Query successful!</h4>';
              }
              client.send('updateTraineeResult~~~---|||<<<>>>|||---~~~'+message);
          }          
      });
    });
}



function deleteTraineeData(sql, id) {
    db.query(sql, function (err, result) {
      if (err) throw err;
      wss.clients.forEach(function each(client) {
          if(client.protocol===id) {
              console.log(result);
              var message = "";
              if(result.affectedRows==1) { //jika update
                  message = '<h4>Trainee data delete successful!</h4>';
              }
              client.send('updateTraineeResult~~~---|||<<<>>>|||---~~~'+message);
          }          
      });
    });   
}

function refreshAllClients(id) {
    wss.clients.forEach(function each(client) {
              console.log('Refresh all clients');
              client.send('refreshPage~~~---|||<<<>>>|||---~~~NoDataJustTrigger');         
      });
}

function clearAbsentTimer(id) {
  //console.log('Clear absent timer');
    wss.clients.forEach(function each(client) {
              console.log('Clear absent timer');
              client.send('clearAbsentTimer~~~---|||<<<>>>|||---~~~NoDataJustTrigger');         
    });
    clearTimeout(timerAbsent);
}

// Every three seconds broadcast "{ message: 'Hello hello!' }" to all connected clients
/*
var broadcast = function() {
  var json = JSON.stringify({
    message: 'Hello hello!'
  });

  wss.clients.forEach(function each(client) {
    client.send(json);
    console.log('Sent: ' + json);
  });  
}*/
//setInterval(broadcast, 1000);







function realTimeUpdate() {
    let sql = "SELECT batch, week, info, start_time, end_time, is_need_absent, absent_time, has_triggered, date, participant, area, timer, id, info_id, (SELECT items FROM activity WHERE activity.id=schedule.info_id) AS presenceItems FROM schedule WHERE date='" + yyyymmdd(new Date()) + "'";
            db.query(sql, function (err, result) {
              if (err) throw err;
        
            result.forEach(schedule => {   
            var str = (schedule.start_time).split(":");
            var end = (schedule.end_time).split(":");
            //date = (schedule.date).getFullYear().toString()+(schedule.date).getMonth().toString()+(schedule.date).getDay().toString();
            
            var currentTime = new Date();
            var start_time = new Date();
            start_time.setHours(str[0], str[1], str[2]);
            var end_time = new Date();
            end_time.setHours(end[0], end[1], end[2]);
            
            if(currentTime >= start_time && currentTime <= end_time) {
                //console.log("Jadwal Now is: " + schedule.info);
            }
            if(schedule.is_need_absent == 1 && schedule.has_triggered==0) {
                //console.log("Schedule date: " + schedule.date);
                //console.log("Schedule absent time: " + schedule.absent_time);
                var abs = (schedule.absent_time).split(":");
                var absent_time = new Date();
                absent_time.setHours(abs[0], abs[1], abs[2]);

                if(currentTime >= absent_time) {
                    //trigger for absent
                    console.log("Start absent for schedule: " + schedule.presenceItems + " | " + schedule.info); 
                    updateData("UPDATE schedule SET has_triggered = 1 WHERE id='" + schedule.id + "' AND date='" + yyyymmdd(schedule.date) + "' AND absent_time = '" + schedule.absent_time + "'");
                    currentScheduleAbsentData = [];
                    currentScheduleAbsentData.push({info: ''+ schedule.info +'', info_id: '' + schedule.info_id + '', date: ''+ yyyymmdd(schedule.date) +'', start: ''+ schedule.start_time +'', end: ''+ schedule.end_time +'', batch: schedule.batch, week: schedule.week, participant: ''+ schedule.participant +'', area: ''+ schedule.area +'', timer: ''+ schedule.timer +''});
                    emptyTemporaryAbsentTable();
                    canStoreAbsent = true;  
                    var json;
                    

                        if (err) throw err; 
                        absentDuration = schedule.timer;
                        json = 'showCamera~~~---|||<<<>>>|||---~~~' + JSON.stringify({info: ''+ schedule.info +'', info_id: ''+ schedule.info_id +'', presenceItems: '' + schedule.presenceItems + '', date: ''+ yyyymmdd(schedule.date) +'', start: ''+ schedule.start_time +'', end: ''+ schedule.end_time +'', batch: schedule.batch, week: schedule.week, participant: ''+ schedule.participant +'', area: ''+ schedule.area +''})+'~~~---|||<<<>>>|||---~~~'+schedule.timer;    
                    
                        //send triger for absent to clients
                        wss.clients.forEach(function each(client) {
                            //currentScheduleAbsentData.push({info: ''+ schedule.info +'', date: ''+ yyyymmdd(schedule.date) +'', start: ''+ schedule.start_time +'', end: ''+ schedule.end_time +'', batch: schedule.batch, week: schedule.week, participant: ''+ schedule.participant +'', area: ''+ schedule.area +''});
                            if((schedule.area==='kamar') && ((client.protocol==='accbro01')||(client.protocol==='accsis01'))) {
                                client.send(json);
                            } else if((schedule.area==='umum') && ((client.protocol==='gen01')||(client.protocol==='gen02')||(client.protocol==='gen03'))){
                                client.send(json);
                            }                         
                        });

                        timerAbsent = setTimeout(function(){ 
                            saveAbsentData();
                        }, (absentDuration*60000)); 

                          
/*                    db.query("SELECT absentDuration FROM current WHERE id = 1", function (err, result) { 
                        if (err) throw err; 
                        absentDuration = schedule.timer;
                        json = 'showCamera~~~---|||<<<>>>|||---~~~' + JSON.stringify({info: ''+ schedule.info +'', date: ''+ yyyymmdd(schedule.date) +'', start: ''+ schedule.start_time +'', end: ''+ schedule.end_time +'', batch: schedule.batch, week: schedule.week, participant: ''+ schedule.participant +'', area: ''+ schedule.area +''})+'~~~---|||<<<>>>|||---~~~'+schedule.timer;    
                    
                        //send triger for absent to clients
                        wss.clients.forEach(function each(client) {
                            //currentScheduleAbsentData.push({info: ''+ schedule.info +'', date: ''+ yyyymmdd(schedule.date) +'', start: ''+ schedule.start_time +'', end: ''+ schedule.end_time +'', batch: schedule.batch, week: schedule.week, participant: ''+ schedule.participant +'', area: ''+ schedule.area +''});
                            if((schedule.area==='kamar') && ((client.protocol==='accbro01')||(client.protocol==='accsis01'))) {
                                client.send(json);
                            } else if((schedule.area==='umum') && ((client.protocol==='gen01')||(client.protocol==='gen02'))){
                                client.send(json);
                            }                         
                        });

                        timerAbsent = setTimeout(function(){ 
                            saveAbsentData();
                        }, (absentDuration*60000)); 
                    });*/
                    
                    
                }
            }
        });
    });   
    getAnouncementStatus(); //-----------> ANOUNCEMENT UPDATE
        

    if(currentDay != new Date().getDay()) { //lakukan update DATE & Schedule today ke client
      currentDay = new Date().getDay();
      sendUpdateDateToday();
      sendDataScheduleToday("SELECT * FROM schedule WHERE date='" + yyyymmdd(new Date()) + "' ORDER BY start_time DESC", 'all');
    }
        console.log('-> '+ (count++) +' Update Server Flats...\n'); 
}

function yyyymmdd(dateIn) {
  var yyyy = dateIn.getFullYear();
  var mm = dateIn.getMonth() + 1; // getMonth() is zero-based
  var dd = dateIn.getDate();
  return String(yyyy + "-" + mm + "-" + dd);
  //return String(10000 * yyyy + 100 * mm + dd); // Leading zeros for mm and dd
}

function checkDuplicateDataAndStoreIntoTempAbsentTable(absentData, id) {
  var isDuplicate = false;
  db.query("SELECT * FROM tmp_absent", function (err, result) {
    if (err) throw err;
    
    if(result.length>0) {
      for(var i=0; i<=result.length-1; i++) {
          if(result[i].nis===absentData[0].nis) {
            console.log("DATA sudah adaaaaaaaaaaaaaaaaaaa: <<--------------------------");
            isDuplicate = true;
            break;
          }
      }       
    }
    dataTempAbsent = [];
    result.forEach(data => {
      dataTempAbsent.push(data);
    });
    if(isDuplicate==false){
          var sqlQuery = "INSERT INTO tmp_absent (nis, batch, week, schedule, absent_date, absent_time, mark, schedule_id) VALUES ";
          for(var i=0; i<=absentData.length-1; i++) {
            sqlQuery += "('" + absentData[i].nis + "', '"+ absentData[i].batch +"', '" + absentData[i].week + "', '" + absentData[i].schedule + "', '" + absentData[i].absent_date + "', '" + absentData[i].absent_time + "', '" + absentData[i].mark + "', '" + absentData[i].schedule_id + "')";
            if(i==absentData.length-1) { sqlQuery += ";"; }
            else { sqlQuery += ", "; }
          }
          //console.log("Sebelum insert data absen: " + sqlQuery);
          db.query(sqlQuery, function (err, result) { 
            if (err) throw err;    
            //console.log("Hasil penyimpanan data absen: " + JSON.stringify(result));
            
            dataTempAbsent.push({nis: absentData[0].nis, batch: absentData[0].batch, week: absentData[0].week, schedule: absentData[0].schedule, absent_date: absentData[0].absent_date, absent_time: absentData[0].absent_time, mark: absentData[0].mark, schedule_id: absentData[0].schedule_id});
            sendDataTemporaryAbsent(absentData, id);
          }); 
    }
    
  }); 
}



function saveAbsentData(){//menyimpan data yang tdk melakukan absensi dan menyimpan data final dari absensi ke tabel absen
  if ((typeof dataSiswa !== "undefined") && (dataTempAbsent !== "undefined")) { 
        savedDataAbsent = [];
        var hasSaved = false;
        for(var i=0; i<=dataSiswa.length-1; i++) {
            for(var j=0; j<=dataTempAbsent.length-1; j++){
                
                if(dataSiswa[i].nis===dataTempAbsent[j].nis) {
                  hasSaved = true;
                  break;
                }
            }
            if(hasSaved==false) { //jika belum disimpan
                if((currentScheduleAbsentData[0].participant===dataSiswa[i].gender)||(currentScheduleAbsentData[0].participant==='all')) {
                    savedDataAbsent.push({ nis: dataSiswa[i].nis , batch: dataSiswa[i].batch, week: currentScheduleAbsentData[0].week, schedule: currentScheduleAbsentData[0].info, absent_date: currentScheduleAbsentData[0].date, absent_time: new Date().toLocaleTimeString('it-IT'), mark: 'X', schedule_id: currentScheduleAbsentData[0].info_id });
                }
                else {
                    savedDataAbsent.push({ nis: dataSiswa[i].nis , batch: dataSiswa[i].batch, week: currentScheduleAbsentData[0].week, schedule: currentScheduleAbsentData[0].info, absent_date: currentScheduleAbsentData[0].date, absent_time: new Date().toLocaleTimeString('it-IT'), mark: '-', schedule_id: currentScheduleAbsentData[0].info_id });
                }
            }
            hasSaved = false;            
        }
        //console.log("isi dataTempAbsent: " + JSON.stringify(JSON.parse(JSON.stringify(dataTempAbsent))) + "isi dataTempAbsent: \n\n");
        //console.log("isi currentScheduleAbsentData: " + JSON.stringify(JSON.parse(JSON.stringify(currentScheduleAbsentData))) + "isi currentScheduleAbsentData: \n\n");
        //console.log("isi Saved Data Absen: " + JSON.stringify(JSON.parse(JSON.stringify(savedDataAbsent))) + "isi Saved Data Absen: \n\n");
        
        //masukkan data yang belum absent ke tabel tmp_absent
        if(savedDataAbsent.length>0) {
          var sqlQuery = "INSERT INTO tmp_absent (nis, batch, week, schedule, absent_date, absent_time, mark, schedule_id) VALUES ";
            for(var i=0; i<=savedDataAbsent.length-1; i++) {
              sqlQuery += "('" + savedDataAbsent[i].nis + "', '"+ savedDataAbsent[i].batch +"', '" + savedDataAbsent[i].week + "', '" + savedDataAbsent[i].schedule + "', '" + savedDataAbsent[i].absent_date + "', '" + savedDataAbsent[i].absent_time + "', '" + savedDataAbsent[i].mark + "', '" + savedDataAbsent[i].schedule_id + "' )";
              if(i==savedDataAbsent.length-1) { sqlQuery += ";"; }
              else { sqlQuery += ", "; }
          } 
          //console.log(sqlQuery);       
          db.query(sqlQuery, function (err, result) { 
              if (err) throw err;    
              //console.log("Hasil penyimpanan data absen: " + JSON.stringify(result));
              //sendDataTemporaryAbsent(absentData);
          });
        }

        setTimeout(function(){ 
            db.query("INSERT INTO absent SELECT * FROM tmp_absent", function (err, result) { 
              if (err) throw err;    
              console.log("Hasil penyimpanan data ke tbl absent: " + JSON.stringify(result));
            });  
        }, 15000);
        
  }

}



function isDuplicateData(nis){
  
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
