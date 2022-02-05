// Open a connection --- set ip with server ip for connection
//var socket = new WebSocket('wss://192.168.1.56:8081/');

//cons WebSocket = require('ws');
var socket = new WebSocket('ws://192.168.1.30:8081/', 'gen01');  
var decoder = null;
var dataSiswa;
var currentScheduleAbsentData;
var savedDataAbsent = [];
var todayScheduleData;
var resumeTodayAbsentData;
var resumeWeeklyAbsentData = null;
var week;
var beepSound = new Audio('audio/beep.mp3');
//var notifSoundUmum = new Audio('audio/BellStasiun~2.mp3');
var notifSoundUmum = new Audio('audio/Alarm05.mp3');
var notifSoundKamar = new Audio('audio/Alarm05.mp3');
var ontimeSound = new Audio('audio/beep.mp3');
var late1Sound = new Audio('audio/late_1.mp3');
var late2Sound = new Audio('audio/late_2.mp3');
var anouncementSound = new Audio('audio/anouncementSound.mp3');
var timerAbsent = null;







var log = function(text) {
  var li = document.createElement('li');
  li.innerHTML = text;
  document.getElementById('log').appendChild(li);
}




// When a connection is made
socket.onopen = function(event) {
  //log('Opened connection 🎉');
  // send data to the server
  socket.send('reqestDataSiswa~~~---|||<<<>>>|||---~~~noDataJustRequest');
  socket.send('reqestDataScheduleToday~~~---|||<<<>>>|||---~~~noDataJustRequest');
  socket.send('reqestAbsentData~~~---|||<<<>>>|||---~~~noDataJustRequest');
  //log('Sent: ' + json);
}

// A connection could not be made
socket.onerror = function(event) {
  console.log('Error: ' + JSON.stringify(event));
}

// When data is received from server
socket.onmessage = function (event) {
  //console.log('Received from server: ' + event.data);
  var content = event.data.split('~~~---|||<<<>>>|||---~~~');
  var msgType = content[0]; 

  if(msgType === 'showCamera') {
    currentScheduleAbsentData = JSON.parse(content[1]);
    showCamera(currentScheduleAbsentData.presenceItems + " | " + currentScheduleAbsentData.info, content[2]); //content[2] is abs timer 
  } 

  else if(msgType === 'updateCurrentAbsentTable') {
    updateCurrentAbsentTable(JSON.parse(content[1]), content.length);
  }

  else if(msgType === 'updateAnouncement') {
    //anouncement = JSON.parse(content[1]);
    anouncementSound.play();
    $('.anouncement_marquee').fadeOut(700);
    $('.anouncement_marquee').fadeIn(700);
    document.getElementById('anouncement').innerHTML = content[1];
    $('.anouncement_marquee').fadeOut(700);
    $('.anouncement_marquee').fadeIn(700);
    $('.anouncement_marquee').fadeOut(700);
    $('.anouncement_marquee').fadeIn(700);
    $('.anouncement_marquee').fadeOut(700);
    $('.anouncement_marquee').fadeIn(700);
    $('.anouncement_marquee').fadeOut(700);
    $('.anouncement_marquee').fadeIn(700);
  }

  else if(msgType === 'setDataSiswa') {
    dataSiswa = JSON.parse(content[1]);
    //log(data);
    //log('data siswa initialized!');
  }

  else if(msgType === 'updateTodayScheduleTable') {
    updateTodayScheduleTable(content[1]);
  }

  else if(msgType === 'updateTodayDate') {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("dateToday").innerHTML = new Date().toLocaleDateString('en-ID', options);
  }

  else if(msgType === 'showAbsentData'){ //   showDataAbsentTable
    resumeTodayAbsentData = JSON.parse(content[1]);
  }

  else if(msgType === 'showAbsentSummaryData'){
    resumeWeeklyAbsentData = JSON.parse(content[2]);
    showAbsentSummary();
  }

  else if(msgType === 'showDetailAbsentSummaryData'){ 
    showDetailAbsentSummary(JSON.parse(content[1]));
  }

  else if(msgType === 'refreshPage'){ 
    savedDataAbsent = [];
    location.reload();
  }

  else if(msgType === 'clearAbsentTimer'){ 
    $('#modalShowCamera').modal('hide');
    document.getElementById("alert_txt_content").innerHTML = "Absent Schedule canceled!";
    savedDataAbsent = [];
    $('#alert_modal').modal('show');
    tmrInfo = setTimeout(function(){ 
        $('#alert_modal').modal('hide'); 
    }, (10000)); //5sec
  }

}


// A connection was closed
socket.onclose = function(event) {
  console.log('Closed connection');
  document.getElementById("alert_txt_content").innerHTML = "Disconnected! Connection lost! Please refresh this page by pressing F5 button. If page still does not show, please check and make sure this PC is connected to network and then refresh this page by pressing F5 button.";
  $('#alert_modal').modal('show');
  //location.reload();
}

// Close the connection when the window is closed
window.addEventListener('beforeunload', function() {
  socket.close();
});


function updateTodayScheduleTable(content) {
    var dataSet = [];
    JSON.parse(content).forEach(data => {
        var temp = [ data.presenceItems+ ' | ' + data.info, data.start_time ];
        dataSet.push(temp);  
    });
    $(document).ready(function() { 
        tbl = $('#dailyScheduleTable').DataTable( {
                scrollY:        '60vh',
                scrollCollapse: true,
                "paging": false,
                "bDestroy": true,
                "lengthChange": false,
                data: dataSet,
                bFilter: false,
                "ordering": false,
                "info":     false,
                columns: [
                    { title: "Today's Schedule" },
                    { title: "Start Time" }                  
                ]
            }).columns.adjust();//end DataTable
    });//end of document.ready
}




function displayAbsent(){  //menampilkan data absen hari ini
  socket.send('reqestAbsentData~~~---|||<<<>>>|||---~~~noDataJustRequest');
  var table = document.getElementById("viewAbsentTable");
  if(table.rows.length>0) {
    while(table.rows.length > 0) {
      table.deleteRow(0);
    }
  }
  
  var header = table.createTHead();
  var row = header.insertRow(0);
  var cell = row.insertCell(0);
  cell.innerHTML = "<b>NAME/SCHEDULE</b>";
  var nis = dataSiswa[0].nis;

  for(var i=0; i<resumeTodayAbsentData.length; i++) {
    if(nis==resumeTodayAbsentData[i].nis){
      cell = row.insertCell(i+1);
      cell.innerHTML = "<b>"+resumeTodayAbsentData[i].schedule+"</b>";
    }
  }
  for(var i=0; i<dataSiswa.length; i++) {
    if(i%2==0) {
      row.style.backgroundColor = "#EBEEEE";
    }
    else {
      row.style.backgroundColor = "white";
    }
    row = table.insertRow(i+1);
    cell = row.insertCell(0);
    cell.innerHTML = dataSiswa[i].nama;

    var colNum = 1;
    for(var j=0; j<resumeTodayAbsentData.length; j++) {
      if(dataSiswa[i].nis==resumeTodayAbsentData[j].nis){
        cell = row.insertCell(colNum);
        if(resumeTodayAbsentData[j].mark==='V') {
          cell.innerHTML = "<center><span class=\"badge badge-pill badge-success\">" + resumeTodayAbsentData[j].mark + "</span></center>";
        }
        else if(resumeTodayAbsentData[j].mark==='O') {
          cell.innerHTML = "<center><span class=\"badge badge-pill badge-warning\">" + resumeTodayAbsentData[j].mark + "</span></center>";
        }
        else if(resumeTodayAbsentData[j].mark==='X') {
          cell.innerHTML = "<center><span class=\"badge badge-pill badge-danger\">" + resumeTodayAbsentData[j].mark + "</span></center>";
        }
        else if((resumeTodayAbsentData[j].mark==='i')||(resumeTodayAbsentData[j].mark==='s')) {
          cell.innerHTML = "<center><span class=\"badge badge-pill badge-info\">" + resumeTodayAbsentData[j].mark + "</span></center>";
        }
        else {
          cell.innerHTML = "<center><b>" + resumeTodayAbsentData[j].mark + "</b></center>";
        }
        
        colNum+=1;
      } else {
        colNum = 1;
      }
    }
  }
  
  $('#modalViewAbsent').modal('show');
  resumeTodayAbsentData = null;
}




function reqestDetailAbsentSummary(data) {
  socket.send('reqestDetailAbsentSummaryData~~~---|||<<<>>>|||---~~~'+data[0]+'~~~---|||<<<>>>|||---~~~'+data[2]+'~~~---|||<<<>>>|||---~~~'+data[3]);
}



function reqestAbsentSummary(){
  var optionWeek = document.getElementById("absentSummaryWeeklyOpt");
  week = optionWeek.options[optionWeek.selectedIndex].value;
  socket.send('reqestAbsentSummaryData~~~---|||<<<>>>|||---~~~'+week);
}


function showDetailAbsentSummary(absentData){
  var table = document.getElementById("ViewDetailAbsentSummaryTable");
  if(table.rows.length>0) {
    while(table.rows.length > 0) {
      table.deleteRow(0);
    }
  }
  var header = table.createTHead();
  var row = header.insertRow(0);
  var cell = row.insertCell(0);
  cell.innerHTML = "<h5><center><b>SCHEDULE</b></center></h5>";
  cell = row.insertCell(1);
  cell.innerHTML = "<h5><center><b>DATE</b></center></h5>";
  cell = row.insertCell(2);
  cell.innerHTML = "<h5><center><b>PRESENCE TIME</b></center></h5>";
  for(var i=0; i<absentData.length; i++) {
    if(i%2==0) {
      row.style.backgroundColor = "#EBEEEE";
    }
    else {
      row.style.backgroundColor = "white";
    }

    row = table.insertRow(i+1);
    cell = row.insertCell(0);
    cell.innerHTML = absentData[i].schedule;
    cell = row.insertCell(1);
    cell.innerHTML = new Date(absentData[i].absent_date).toLocaleDateString('id-ID');
    cell = row.insertCell(2);
    cell.innerHTML = absentData[i].absent_time;
  }
}


function showAbsentSummary(){
  document.getElementById("h5AbesntWeekSummary").innerHTML = "Presence Summary Week: " + week + "&nbsp;&nbsp;";
if(resumeWeeklyAbsentData != null) {
  var table = document.getElementById("viewAbsentSummaryTable");
  if(table.rows.length>0) {
    while(table.rows.length > 0) {
      table.deleteRow(0);
    }
  }
  var header = table.createTHead();
  var row = header.insertRow(0);
  var cell = row.insertCell(0);
  cell.innerHTML = "<h5><center><b>NAME</b></center></h5>";
  cell = row.insertCell(1);
  cell.innerHTML = "<h5><center><span class=\"badge badge-pill badge-success\">V</span></center></h5>";
  cell = row.insertCell(2);
  cell.innerHTML = "<h5><center><span class=\"badge badge-pill badge-warning\">O</span></center></h5>";
  cell = row.insertCell(3);
  cell.innerHTML = "<h5><center><span class=\"badge badge-pill badge-danger\">X</span></center></h5>";
  cell = row.insertCell(4);
  cell.innerHTML = "<h5><center><span class=\"badge badge-pill badge-primary\">i</span></center></h5>";
  cell = row.insertCell(5);
  cell.innerHTML = "<h5><center><span class=\"badge badge-pill badge-info\">s</span></center></h5>";
  cell = row.insertCell(6);
  cell.innerHTML = "<h5><center><b>POINTS</b></center></h5>";

  for(var i=0; i<resumeWeeklyAbsentData.length; i++) {
    if(i%2==0) {
      row.style.backgroundColor = "#cff3fc";
    }
    else {
      row.style.backgroundColor = "white";
    }

    row = table.insertRow(i+1);
    cell = row.insertCell(0);
    cell.innerHTML = resumeWeeklyAbsentData[i].nama;

    cell = row.insertCell(1);
    if(resumeWeeklyAbsentData[i].V>0){
      cell.innerHTML = "<center><a href=\"#modalViewDetailAbsentSummary\" data-toggle=\"modal\" data-id=\""+ 
        resumeWeeklyAbsentData[i].nis+"~~~---|||<<<>>>|||---~~~"+
        resumeWeeklyAbsentData[i].nama+"~~~---|||<<<>>>|||---~~~"+
        week+"~~~---|||<<<>>>|||---~~~V\">"+resumeWeeklyAbsentData[i].V+"</a></center>";
    } else {
      cell.innerHTML = "<center>"+resumeWeeklyAbsentData[i].V+"</center>";
    }
    

    cell = row.insertCell(2);
    if(resumeWeeklyAbsentData[i].O>0){
      cell.innerHTML = "<center><a href=\"#modalViewDetailAbsentSummary\" data-toggle=\"modal\" data-id=\""+ 
        resumeWeeklyAbsentData[i].nis+"~~~---|||<<<>>>|||---~~~"+
        resumeWeeklyAbsentData[i].nama+"~~~---|||<<<>>>|||---~~~"+
        week+"~~~---|||<<<>>>|||---~~~O\">"+resumeWeeklyAbsentData[i].O+"</a></center>";
    } else {
      cell.innerHTML = "<center>"+resumeWeeklyAbsentData[i].O+"</center>";
    }
    

    cell = row.insertCell(3);
    if(resumeWeeklyAbsentData[i].X>0){
      cell.innerHTML = "<center><a href=\"#modalViewDetailAbsentSummary\" data-toggle=\"modal\" data-id=\""+ 
        resumeWeeklyAbsentData[i].nis+"~~~---|||<<<>>>|||---~~~"+
        resumeWeeklyAbsentData[i].nama+"~~~---|||<<<>>>|||---~~~"+
        week+"~~~---|||<<<>>>|||---~~~X\">"+resumeWeeklyAbsentData[i].X+"</a></center>";
    } else {
      cell.innerHTML = "<center>"+resumeWeeklyAbsentData[i].X+"</center>";
    }
    

    cell = row.insertCell(4);
    if(resumeWeeklyAbsentData[i].i>0){
      cell.innerHTML = "<center><a href=\"#modalViewDetailAbsentSummary\" data-toggle=\"modal\" data-id=\""+ 
        resumeWeeklyAbsentData[i].nis+"~~~---|||<<<>>>|||---~~~"+
        resumeWeeklyAbsentData[i].nama+"~~~---|||<<<>>>|||---~~~"+
        week+"~~~---|||<<<>>>|||---~~~i\">"+resumeWeeklyAbsentData[i].i+"</a></center>";
    } else {
      cell.innerHTML = "<center>"+resumeWeeklyAbsentData[i].i+"</center>";
    }
    

    cell = row.insertCell(5);
    if(resumeWeeklyAbsentData[i].s>0){
      cell.innerHTML = "<center><a href=\"#modalViewDetailAbsentSummary\" data-toggle=\"modal\" data-id=\""+ 
        resumeWeeklyAbsentData[i].nis+"~~~---|||<<<>>>|||---~~~"+
        resumeWeeklyAbsentData[i].nama+"~~~---|||<<<>>>|||---~~~"+
        week+"~~~---|||<<<>>>|||---~~~s\">"+resumeWeeklyAbsentData[i].s+"</a></center>";
    } else {
      cell.innerHTML = "<center>"+resumeWeeklyAbsentData[i].s+"</center>";
    }
    

    cell = row.insertCell(6);
    if((resumeWeeklyAbsentData[i].V+resumeWeeklyAbsentData[i].O+resumeWeeklyAbsentData[i].X+resumeWeeklyAbsentData[i].i+resumeWeeklyAbsentData[i].s)>0) {
      var score = (((resumeWeeklyAbsentData[i].V)*(2)) + ((resumeWeeklyAbsentData[i].O)*(-1)) + ((resumeWeeklyAbsentData[i].X * 1) * (-2)));
      //var score = (data.V*2) + (data.O*(-1)) + (data.X*(-2));
      var scoreMax = (resumeWeeklyAbsentData[i].V + resumeWeeklyAbsentData[i].O + resumeWeeklyAbsentData[i].X + resumeWeeklyAbsentData[i].i + resumeWeeklyAbsentData[i].s) * 2;
      var progress = '<div class="progress"><div class="progress-bar progress-bar-striped bg-info" role="progressbar" style="width: '+(score / scoreMax * 100)+'%" aria-valuenow="'+ score +'" aria-valuemin="0" aria-valuemax="'+ scoreMax +'"></div></div>';    
      var color = "black";
      if(score>0) {
        color = "#00b014";
      } 
      //cell.innerHTML = "<center><font size=\"4pt\" color=\""+color+"\"><b>"+ total +"</b></font></center>";
      cell.innerHTML = score+' / '+ scoreMax + '<br>'+ progress;
    }
    else {
      cell.innerHTML = "<center><b>--</b></center>";
    }

  }
}

  $('#modalViewAbsentSummary').modal('show');
  resumeWeeklyAbsentData = null;

}




function getAbsentMark(minute){
  if(minute>=1 && minute<=5) {
    return ("O");
  }
  else if(minute>5) {
    return ("X");
  } 
  else {
    return ("V");
  }
}

function getName(nis){
  for (var i=0; i<=dataSiswa.length-1; i++) {
      if(nis===dataSiswa[i].nis){
        return (dataSiswa[i].nama);
      }
  }
}

function getImage(nis){
  for(var i=0; i<=dataSiswa.length-1; i++){
              if(dataSiswa[i].nis===nis) {
                return(dataSiswa[i].image);
              }
            } 
}

function showCamera(schedule, timer) {
            var txt = "innerText" in HTMLElement.prototype ? "innerText" : "textContent";
            var arg = {
                resultFunction: function(result) {
                    absentChecking(result.code);                 
                }
            };

            decoder = new WebCodeCamJS('#webcodecam-canvas');
            
            if(currentScheduleAbsentData.area==='umum'){
                notifSoundUmum.play();
            } else if(currentScheduleAbsentData.area==='kamar') {
                notifSoundKamar.play();
            }
            //simple initialization
            //decoder.init(arg);
            /* Select environment camera if available, without visible select menu*/
            decoder.buildSelectMenu(document.createElement('select'), 'USB Web Camera').init(arg);
            document.getElementById("modalShowCamera-Title").innerHTML = "<b>Next Schedule Absent:</b> <font size='5pt'>" + schedule + '</font>';
            if (decoder != null) {
                  decoder.play();
                  timerAbsent = setTimeout(function(){ 
                      $('#modalShowCamera').modal('hide'); 
                  }, (timer*60000)); //25menit
            }
            $('#modalShowCamera').modal('show');
}


function displayPhoto(img){
  document.getElementById('image').src = "data:image/jpg;base64," + img;
  $('#modalViewPhoto').modal('handleUpdate');
  $('#modalViewPhoto').modal('show');
  setTimeout(function(){ $('#modalViewPhoto').modal('hide'); }, 900);
}

function absentChecking(qrCode) {
  if (typeof dataSiswa !== "undefined") {
    for (var i=0; i<=dataSiswa.length-1; i++) {
      if(qrCode === dataSiswa[i].nis) {
          currentAbsentProccess(dataSiswa[i]);
          break;
      }
    }
  }
}



function currentAbsentProccess(siswa){ //ketika qrberhasil di scan

  //data belum absen
        var str = (currentScheduleAbsentData.start).split(":");
        var start_time = new Date();
        start_time.setHours(str[0], str[1], str[2]);

        var absMark = getAbsentMark(Math.round(((new Date() - start_time) / 60000 ))); 
        savedDataAbsent.push({ nis: siswa.nis , batch: siswa.batch, week: currentScheduleAbsentData.week, schedule: currentScheduleAbsentData.info, absent_date: currentScheduleAbsentData.date, absent_time: new Date().toLocaleTimeString('it-IT'), mark: absMark, schedule_id: currentScheduleAbsentData.info_id });
        socket.send('storeTemporaryAbsentData~~~---|||<<<>>>|||---~~~'+JSON.stringify(savedDataAbsent));
        savedDataAbsent = [];//setelah dikirim, kosongkan lagi datanya
}

function updateCurrentAbsentTable(dataAbsen, showPict){
        //----------pengaturan tabel di samping display scanner yg menampilkan list nama yang sudah absen
        //console.log('dataAbsen[0].nis ----------------------->>'+dataAbsen[0].nis);
        var table = document.getElementById("absentTable");
        //var totalAbsent = document.getElementById("totalAbsent");
        var row = table.insertRow(1);
        if( (table.rows.length-1) % 2 == 0 ) {
          row.style.backgroundColor = "#EBEEEE";
        }
        else {
          row.style.backgroundColor = "white";
        }
        row.setAttribute("class","studentDataRow"+table.rows.length);
        var cell0 = row.insertCell(0);
        var cell1 = row.insertCell(1);
        var cell2 = row.insertCell(2);
        var cell3 = row.insertCell(3);

        cell0.innerHTML = (table.rows.length-1).toString();
        cell1.innerHTML = '<img id="image" src="'+getImage(dataAbsen[0].nis)+'" width="90px" height="90px" alt="No data" />&nbsp;&nbsp;<b><font size="3pt">' + getName(dataAbsen[0].nis)+'</font></b>';//siswa.nama;
        cell2.innerHTML = dataAbsen[0].absent_time;//new Date().toLocaleTimeString('it-IT');
        
        if(dataAbsen[0].mark === 'V') {
          cell3.innerHTML = "<h5><span class=\"badge badge-pill badge-success\">V</span></h5>";
          ontimeSound.play();
        }
        else if(dataAbsen[0].mark === 'O') {
          cell3.innerHTML = "<h5><span class=\"badge badge-pill badge-warning\">O</span></h5>";
          late1Sound.play();
        }
        else {
          cell3.innerHTML = "<h5><span class=\"badge badge-pill badge-danger\">X</span></h5>";
          late2Sound.play();
        }
        $('.flash').fadeOut(180);
        $('.flash').fadeIn(180);
        $('.studentDataRow'+table.rows.length).fadeOut(250);
        $('.studentDataRow'+table.rows.length).fadeIn(250);
        $('.studentDataRow'+table.rows.length).fadeOut(250);
        $('.studentDataRow'+table.rows.length).fadeIn(250);
        
        /*
        if(showPict==3){
            for(var i=0; i<=dataSiswa.length-1; i++){
              if(dataSiswa[i].nis===dataAbsen[0].nis) {
                displayPhoto(dataSiswa[i].image);
              }
            }            
        }*/
//------------------------pengaturan tabel di samping display scanner yg menampilkan list nama yang sudah absen
}

function saveAbsentData(){
  socket.send('saveAbsentData~~~---|||<<<>>>|||---~~~noDataJustRequest');
}
