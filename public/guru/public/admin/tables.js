var socket = new WebSocket('ws://192.168.1.30:8081/', 'adm01');  //gen01,gen02,accbro01,accsis01
var decoder = null;
var tbl = null;
var tbl2 = null;
var dataSet = [];
var dataSet2 = [];
var canSendUpdateDataTrainee = false;
var canSendUpdateDataAbsent = false;
var resumeTodayAbsentData;
var dataSiswa;
var forShowDataTraineeTable = false;

//---------------------------------------------------------
// When a connection is made
socket.onopen = function(event) {
    
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

  if(msgType === 'loginResult') {  //LOGIN SUCCESS
     if(content[1]>0){
        $('#login_modal').modal('hide');
        document.getElementById('exampleInputEmail').value = '';
        document.getElementById('exampleInputPassword').value = '';
        document.getElementById('txtAdminName').innerHTML  = content[2]; 
        //document.getElementById("txtAdminName").innerHTML = content[1];
        var menu = '<div class="form-inline"><a class="badge badge-info edit_data_trainee" onclick="requestScheduleData()" href="#">Schedule</a>'+
                        '&nbsp;&nbsp;<a class="badge badge-info edit_data_trainee" onclick="requestAbsentData()" href="#">Absent</a>'+
                        '&nbsp;&nbsp;<a class="badge badge-info edit_data_trainee" onclick="requestTraineeData()" href="#">Trainee</a>'+
                        '&nbsp;&nbsp;<a class="badge badge-info edit_data_trainee" onclick="requestAnnouncementData()" href="#">Anouncement</a>'+
                        '&nbsp;&nbsp;<a class="badge badge-info edit_data_trainee" onclick="showConfirmationModalForRefreshAllClients()" href="#">Refresh All Clients Browser</a>'+
                        '&nbsp;&nbsp;<a class="badge badge-info edit_data_trainee" onclick="clearAbsentTimer()" href="#">Clear Absent Timer</a>'+ 
                        //'&nbsp;&nbsp;View Daily Presence:<input type="date" name="date" id="date" onchange="requestDailyAbsent(event);" class="form-control"/>';
                        '&nbsp;&nbsp;&nbsp;&nbsp;<label for="dateDaily">View Daily Presence:&nbsp;</label><input type="date" name="dateDaily" id="dateDaily" onchange="requestDailyAbsent(event);" /></div>';
        document.getElementById('txtWebsiteMenu').innerHTML = menu;
        socket.send('reqestDataScheduleToday~~~---|||<<<>>>|||---~~~noDataJustRequest');
        socket.send('reqestDataSiswa~~~---|||<<<>>>|||---~~~noDataJustRequest');
        requestActivityDataForSelectItem();
     }
     else {
        document.getElementById("txtLoginInformation").innerHTML = "<font color='red'>Wrong username or password</font>";
     }
  } 

  else if(msgType === 'setActivityDataForSelectItem') {
    setActivityDataForSelectItem(JSON.parse(content[1]));
  } 

  else if(msgType === 'updateScheduleResult') {
    document.getElementById("alert_txt_content").innerHTML = content[1];
    //$('#toast_message').toast('show');
    $('#alert_modal').modal('show');
    socket.send('reqestDataScheduleToday~~~---|||<<<>>>|||---~~~noDataJustRequest');
    requestScheduleData();      
  } 

  else if(msgType === 'updateAbsentResult') {
    document.getElementById("alert_txt_content").innerHTML = content[1];
    //$('#toast_message').toast('show');
    $('#alert_modal').modal('show');
    requestAbsentData();     
  } 

  else if(msgType === 'updateTraineeResult') {
    document.getElementById("alert_txt_content").innerHTML = content[1];
    //$('#toast_message').toast('show');
    $('#alert_modal').modal('show');
    requestTraineeData();      
  } 

  else if(msgType === 'showDataScheduleTable') {
        showDataScheduleTable(content[1]);
        document.getElementById("title_modal_schedule_data").innerHTML = "SCHEDULE &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+'<button type="button" name="btnAddSchedule" id="btnAddSchedule" data-toggle="modal" data-target="#add_schedule_data_Modal" class="btn btn-warning">Add Schedule</button>'
                                                        +'&nbsp;&nbsp;&nbsp;<button type="button" name="btnAddScheduleFromSql" id="btnAddScheduleFromSql" data-toggle="modal" data-target="#add_data_from_sql_Modal" class="btn btn-warning">Add Schedule Using SQL</button>';
  }

  else if(msgType === 'showDataAbsentTable') {
        showDataAbsentTable(content[1]);
  }

  else if(msgType === 'showAbsentSummaryTable') {
        showAbsentSummary(content[1], 'Presence Summary___'+ $('#startDate').val() +'__until__'+$('#endDate').val());
        document.getElementById("modal_title_for_absent_summary").innerHTML = "PRESENCE DATA SUMMARY &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;From: "+ $('#startDate').val() + "&nbsp;&nbsp;&nbsp;Until: " + $('#endDate').val();
  }

  else if(msgType === 'showPresenceProgressReport') {
        showAbsentProgressReport(JSON.parse(content[1]), JSON.parse(content[2]), JSON.parse(content[3]), "PROGRESS REPORT____" + $('#startDatePR').val() + "__until__" + $('#endDatePR').val());
        document.getElementById("modal_title_for_presence_progress_report").innerHTML = "PROGRESS REPORT &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;From: "+ $('#startDatePR').val() + "&nbsp;&nbsp;&nbsp;Until: " + $('#endDatePR').val();
  }

  else if(msgType === 'showDetailAbsentSummaryData'){ 
        showDetailAbsentSummary(JSON.parse(content[1]));
  }

  else if(msgType === 'showAbsentData'){ //   showDataAbsentTable
    resumeTodayAbsentData = JSON.parse(content[1]);
    displayDailyAbsent();
  }

  else if(msgType === 'setDataSiswa'){  //SHOW data Traineee
        dataSiswa = JSON.parse(content[1]);
        if(forShowDataTraineeTable==true) {
          forShowDataTraineeTable=false;
          showDataTraineeTable(content[1]); 
          document.getElementById("title_modal_trainee_data").innerHTML = "TRAINEE DATA &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+'<button type="button" name="btnAddTrainee" id="btnAddTrainee" data-toggle="modal" data-target="#add_trainee_data_Modal" class="btn btn-warning">Add Trainee</button>'
                                                        +'&nbsp;&nbsp;&nbsp;<button type="button" name="btnAddTraineeFromSql" id="btnAddTraineeFromSql" data-toggle="modal" data-target="#add_data_trainee_from_sql_Modal" class="btn btn-warning">Add Trainee Using SQL</button>';  
          
        }
  }

  else if(msgType === 'showAnnouncementData') {
    var data = JSON.parse(content[1]);
    $('#txt_announcement').val(data[0].content);
    $('#txt_post_now').val(data[0].show);
    $('#announcement_setting_modal').modal('show');      
  }

  else if(msgType === 'updateAnnouncementResult') {
    document.getElementById("alert_txt_content").innerHTML = content[1];
    $('#alert_modal').modal('show');
    $('#announcement_setting_modal').modal('hide');    
  }

  else if(msgType === 'refreshPage'){ 
    document.getElementById("alert_txt_content").innerHTML = "All clients browser page refreshed!";
    $('#alert_modal').modal('show');
  }

  else if(msgType === 'clearAbsentTimer'){ 
    document.getElementById("alert_txt_content").innerHTML = "Absent Schedule canceled!";
    $('#alert_modal').modal('show');
  }

  else if(msgType === 'showUpdateAbsentDurationModal') {
    //var data = JSON.parse(content[1]);
    //$('#txtUpdateAbsentDuration').val(content[1]);
    //console.log('Duratioooooooon: '+content[1]);
    document.getElementById("txtUpdateAbsentDuration").value = content[1];
    $('#update_absent_timer_modal').modal('show');      
  }

  else if(msgType === 'updateAbsentDurationDataResult') {
    $('#update_absent_timer_modal').modal('hide');
    document.getElementById("alert_txt_content").innerHTML = content[1];
    $('#alert_modal').modal('show');  
  }

  else if(msgType === 'updateTodayScheduleTable') {
    showTodayScheduleTable(content[1]);
  }


}



// A connection was closed
socket.onclose = function(event) {
  console.log('Closed connection');
  document.getElementById("alert_txt_content").innerHTML = "Connection lost. Please refresh this page by pressing F5 button and then login again.";
  //$('#toast_message').toast('show');
  $('#alert_modal').modal('show');
  //location.reload();
}

// Close the connection when the window is closed
window.addEventListener('beforeunload', function() {
  socket.close();
});

//-----------------------------------------------------------

function login(){
    document.getElementById("txtLoginInformation").innerHTML = "";
    var username = document.getElementById("exampleInputEmail").value;
    var password = document.getElementById("exampleInputPassword").value;
    if((username==='') || (password==='')) {
        document.getElementById("txtLoginInformation").innerHTML = "<font color='red'>Please input your username and password</font>";
    } else {
        socket.send('loginChecking~~~---|||<<<>>>|||---~~~'+username+'~~~---|||<<<>>>|||---~~~'+password);
    }
    
}

function logout(){
    document.getElementById('txtAdminName').innerHTML = '';
    document.getElementById('txtWebsiteMenu').innerHTML = '';
    $('#login_modal').modal('show');
}

function requestActivityDataForSelectItem(){
    socket.send('requestActivityDataForSelectItem~~~---|||<<<>>>|||---~~~noDataJustRequest');
}

function requestScheduleData(){
    socket.send('requestScheduleData~~~---|||<<<>>>|||---~~~noDataJustRequest');
}

function requestAbsentData(){
    socket.send('requestAbsentData~~~---|||<<<>>>|||---~~~noDataJustRequest');
}

function reqestDetailAbsentSummary(data) { //Harus bikin khusus utk admin
  socket.send('reqestDetailAbsentSummaryData~~~---|||<<<>>>|||---~~~'+data[0]+'~~~---|||<<<>>>|||---~~~'+data[2]+'~~~---|||<<<>>>|||---~~~'+$('#startDate').val()+'~~~---|||<<<>>>|||---~~~'+$('#endDate').val());
}

function requestTraineeData() {
    forShowDataTraineeTable = true;
    socket.send('reqestDataSiswa~~~---|||<<<>>>|||---~~~noDataJustRequest');
}

function requestAnnouncementData() {
    socket.send('requestAnnouncementData~~~---|||<<<>>>|||---~~~noDataJustRequest');
}

function requestAbsentDurationData() {
    socket.send('requestAbsentDurationData~~~---|||<<<>>>|||---~~~noDataJustRequest');
}

function yyyymmdd(dateIn) {
  //console.log(dateIn);
  var yyyy = dateIn.getFullYear();
  var mm = dateIn.getMonth() + 1; // getMonth() is zero-based
  var dd = dateIn.getDate();
  return String(yyyy + "-" + mm + "-" + dd);
  //return String(10000 * yyyy + 100 * mm + dd); // Leading zeros for mm and dd
}

function setActivityDataForSelectItem(presenceItems) {
    var selectPI = document.getElementById("presenceItems");
    presenceItems.forEach(item => {
        var opt = document.createElement("option");
        opt.value = item.id;
        opt.text = item.items;
        selectPI.add(opt, null);
    });
}

function deleteScheduleData(id) {
    socket.send('deleteScheduleData~~~---|||<<<>>>|||---~~~'+id);
    $('#delete_schedule_data_Modal').modal('hide');
}

function deleteAbsentData(id) {
    socket.send('deleteAbsentData~~~---|||<<<>>>|||---~~~'+id);
    $('#delete_absent_data_Modal').modal('hide');
}

function deleteTraineeData(id) {
    socket.send('deleteTraineeData~~~---|||<<<>>>|||---~~~'+id);
    $('#delete_trainee_data_Modal').modal('hide');
}

function showConfirmationModalForRefreshAllClients() {
    $('#refresh_client_confirmation_Modal').modal('show');
}

function showChangeAbsentDurationModal() {
    $('#update_absent_timer_modal').modal('show');
}

function requestRefreshAllClients() {
    socket.send('requestRefreshAllClients~~~---|||<<<>>>|||---~~~noDataJustRequest');
}

function clearAbsentTimer() {
    $('#clear_absent_timer_confirmation_Modal').modal('show');
}

function requestClearAbsentTimer() {
    socket.send('clearAbsentTimer~~~---|||<<<>>>|||---~~~noDataJustRequest');
}

function requestDailyAbsent(e){
  socket.send('reqestAbsentData2~~~---|||<<<>>>|||---~~~' + e.target.value);
}

function displayDailyAbsent(){  //menampilkan data absen hari ini
  
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
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById("labelSelectedDate").innerHTML = new Date(document.getElementById("dateDaily").value).toLocaleDateString('en-ID', options) + "&nbsp;&nbsp;";
  //document.getElementById("labelSelectedDate").innerHTML = document.getElementById("dateDaily").value + "&nbsp;&nbsp;";
  
  $('#modalViewAbsent').modal('show');
  resumeTodayAbsentData = null;
}


function showTodayScheduleTable(content) {
    dataSet2 = [];
    dataSet = [];
    JSON.parse(content).forEach(data => {
        var act = '<a href="#" id="'+ data.id + '~~~---|||<<<>>>|||---~~~' + data.info_id +'" name="edit" class="badge badge-info edit_data_schedule">Edit</a>';
        var temp2 = [ act, data.presenceItems+ ' | ' + data.info, data.start_time ];
        var temp = [ '', data.batch, data.week, data.presenceItems, data.info, yyyymmdd(new Date(data.date)), data.start_time, data.end_time, data.absent_time, data.is_need_absent, data.has_triggered, data.participant, data.area, data.timer, data.id ]; //data.date.substr(0,10)     new Date(data.date).toLocaleDateString('id-ID')
        dataSet2.push(temp2);    
        dataSet.push(temp);  
    });
    $(document).ready(function() { 
        tbl = null;
        tbl = $('#dailyScheduleTable').DataTable( {
                scrollY:        '60vh',
                scrollCollapse: true,
                "paging": false,
                "bDestroy": true,
                "lengthChange": false,
                data: dataSet2,
                bFilter: false,
                "ordering": false,
                "info":     false,
                columns: [
                    { title: "Action" },
                    { title: "Today's Schedule" },
                    { title: "Start Time" }                  
                ]
            }).columns.adjust();//end DataTable


            $(document).on('click', '.edit_data_schedule', function(){  //show modal edit schedule data
                var schedule_id = ($(this).attr("id")).split('~~~---|||<<<>>>|||---~~~'); 
                var idx;
                for(var i=0; i<=dataSet.length-1; i++) {
                    if(dataSet[i][14]==schedule_id[0]) { //schedule_id[0]=id dari schedule, schedule_id[1]=id dari presence item
                        idx = i;
                        break; 
                    }
                }

                $('#batch').val(dataSet[idx][1]);  
                $('#week').val(dataSet[idx][2]); 
                //$('#presenceItems').val(); //<-------------------------------select
                document.getElementById("presenceItems").selectedIndex = (schedule_id[1]-1)+""; 
                $('#info').val(dataSet[idx][4]);  
                $('#date').val(dataSet[idx][5]);
                $('#start_time').val(dataSet[idx][6]);  
                $('#end_time').val(dataSet[idx][7]); 
                $('#absent_time').val(dataSet[idx][8]);  
                $('#is_need_absent').val(dataSet[idx][9]);  
                $('#has_triggered').val(dataSet[idx][10]); 
                $('#participant').val(dataSet[idx][11]); 
                $('#area').val(dataSet[idx][12]); 
                $('#txtAbsentTimer').val(dataSet[idx][13]); 
                $('#schedule_id').val(dataSet[idx][14]);  //data pada input hidden
                $('#insert').val('Update');  
                $('#add_schedule_data_Modal').modal('show');
            });


            $('#insert_form').on("submit", function(event){  
                event.preventDefault();  
                    if($('#batch').val() == '') { 
                        //alert("Batch is required"); 
                    }  
                    else if($('#week').val() == '') { 
                        //alert("Week is required"); 
                    }  
                    else if($('#presenceItems').val() == '') { 
                        //alert("presence item is required"); 
                    }
                    //else if($('#info').val() == '') { 
                        //alert("Schedule is required"); 
                    //}  
                    else if($('#start_time').val() == '') { 
                        //alert("Start Time is required"); 
                    } 
                    else if($('#end_time').val() == '') { 
                        //alert("End Time is required"); 
                    }
                    else if($('#is_need_absent').val() == '') { 
                        //alert("Is Need Absent is required"); 
                    }
                    else if($('#absent_time').val() == '') { 
                        //alert("Absent Time is required"); 
                    }
                    else if($('#has_triggered').val() == '') { 
                        //alert("Has Triggered is required"); 
                    }
                    else if($('#date').val() == '') { 
                        //alert("Schedule Date is required"); 
                    } 
                    else if($('#participant').val() == '') { 
                        //alert("Participant is required"); 
                    }
                    else if($('#area').val() == '') { 
                        //alert("Area is required");
                    }
                    else if($('#txtAbsentTimer').val() == '') { 
                        //alert("Area is required");
                    }

                    else {  
                        socket.send('updateScheduleData~~~---|||<<<>>>|||---~~~' + JSON.stringify({info: ''+ $('#info').val() +'', date: ''+ $('#date').val() +'', start: ''+ $('#start_time').val() +'', end: ''+ $('#end_time').val() +'', batch: $('#batch').val(), week: $('#week').val(), participant: ''+ $('#participant').val() +'', area: ''+ $('#area').val() +'', id: ''+ $('#schedule_id').val() +'', triggered: ''+ $('#has_triggered').val() +'', needAbs: ''+ $('#is_need_absent').val() +'', absTime: ''+ $('#absent_time').val() +'', timer: ''+ $('#txtAbsentTimer').val() +'', presenceItemId: ''+ $('#presenceItems').val() +'' }));  //+'~~~---|||<<<>>>|||---~~~'+socket.protocol); 
                        $('#insert_form')[0].reset();  
                        $('#add_schedule_data_Modal').modal('hide');
                    }
                    
            });  

    });//end of document.ready
}

function showDataTraineeTable(content){
        dataSet = [];
        dataSet2 = [];
        var fileInput = document.getElementById('btnChooseImageFile');

        JSON.parse(content).forEach(data => {
            
            var act = '<a href="#" id="'+ data.nis +'" name="edit" class="badge badge-info edit_data_trainee">Edit</a>'+'&nbsp;<a href="#" id="'+ data.nis +'" name="delete" class="badge badge-danger delete_data_trainee">Del</a>';
            var img = '<img id="image" src="'+data.image+'" width="100px" height="100px" alt="No data" />';
            //var action = '<input type="button" name="edit" value="Edit" id="'+ data.id +'" class="btn btn-info btn-sm edit_data" />&nbsp;' + '<input type="button" name="delete" value="Delete" id="'+ data.id +'" class="btn btn-danger btn-sm delete_data" />';
            //console.log(data.date.substr(0, 10));
            var temp = [ act, data.nis, data.nama, data.gender, data.batch, data.jurusan, img ]; //data.date.substr(0,10)     new Date(data.date).toLocaleDateString('id-ID')
            var temp2 = [ data.nis, data.image ]; //'data:image/jpg;base64,'+
            dataSet.push(temp);
            dataSet2.push(temp2);
        });
        //--------------------------------------------------------------------------------
        $(document).ready(function() { 
            
            
            //-------------------------------------------------
            tbl = null;
            tbl = $('#tblDataTrainee').DataTable( {
                //"scrollY": 200,
                "scrollX": true,
                scrollY:        '60vh',
                //scrollCollapse: true,
                "pagingType": "full_numbers",
                "bDestroy": true,
                data: dataSet,
                //bFilter: false,
                columns: [
                    { title: "Action" },
                    { title: "NIS" },
                    { title: "Nama" },
                    { title: "Gender" },
                    { title: "Batch" },
                    { title: "Jurusan" },
                    { title: "Image" }                   
                ]

            });//end DataTable
            
            $('#trainee_data_table_modal').modal('show');

            //-----------------------------------------------------------------

            $('#btnAddTrainee').click(function(){         //change button caption and clear form when button add schedule clicked
                $('#insert_trainee_form')[0].reset(); 
                document.getElementById("txt_nis_trainee").disabled = false; 
                document.getElementById('img_trainee').src = '';
                $('#btnChooseImageFile').val("");
                $('#insert_trainee_btn').val('Insert'); 
                $('#txt_nis_trainee').val('');
            });     
            $('#btnAddTraineeFromSql').click(function(){          //clear text when button SQL clicked
                $('#insert_trainee_form_sql')[0].reset();  
            });   

            //-------------------------------------------------------
            $(document).on('click', '.edit_data_trainee', function(){  //show modal edit schedule data
                canSendUpdateDataTrainee=true;
                var nis = $(this).attr("id");  
                var idx;
                
                for(var i=0; i<=dataSet.length-1; i++) {
                    
                    if(dataSet[i][1]==nis) {
                        idx = i;
                        break; 
                    }
                }
                
                $('#btnChooseImageFile').val("");
                $('#txt_nis_trainee').val(dataSet[idx][1]); document.getElementById("txt_nis_trainee").disabled = true; 
                $('#txt_nama_trainee').val(dataSet[idx][2]);  
                $('#txt_gender_trainee').val(dataSet[idx][3]);  
                $('#txt_batch_trainee').val(dataSet[idx][4]);
                $('#txt_jurusan_trainee').val(dataSet[idx][5]);  
                $('#txt_image_data').val(dataSet2[idx][1]); 
                document.getElementById("img_trainee").src = dataSet2[idx][1];
                
                $('#insert_trainee_btn').val('Update');  
                $('#add_trainee_data_Modal').modal('show');
            });


            //----------------------------------------------------------------------
            $(document).on('click', '.delete_data_trainee', function(){  
                var nis = $(this).attr("id");  
                var idx;
                for(var i=0; i<=dataSet.length-1; i++) {
                    
                    if(dataSet[i][1]==nis) {
                        idx = i;
                        break; 
                    }
                }
                
                var txt = '';
                txt += 'NIS: '+dataSet[idx][1]+'<br>';
                txt += 'Nama: '+dataSet[idx][2]+'<br>';
                txt += 'Gender: '+dataSet[idx][3]+'<br>';
                txt += 'Batch: '+dataSet[idx][4]+'<br>';
                txt += 'Jurusan: '+dataSet[idx][5]+'<br>';
                txt += 'Sure to delete?' + '&nbsp;&nbsp;<input type="button" name="modalDelBtn" value="YES" onclick="deleteTraineeData('+dataSet[idx][1]+');" class="btn btn-danger btn-xl"/>';  
                document.getElementById("txtDeleteTraineeConfirmation").innerHTML = txt;
                $('#delete_trainee_data_Modal').modal('show');
            });


            //-------------------------------------------------------------------------
            $('#insert_trainee_form').on("submit", function(event){  
                event.preventDefault();  
                    if($('#txt_nis_trainee').val() == '') { 
                        //alert("Batch is required"); 
                    }  
                    else if($('#txt_nama_trainee').val() == '') { 
                        //alert("Week is required"); 
                    }  
                    else if($('#txt_gender_trainee').val() == '') { 
                        //alert("Schedule is required"); 
                    }  
                    else if($('#txt_batch_trainee').val() == '') { 
                        //alert("Start Time is required"); 
                    } 
                    else if($('#txt_jurusan_trainee').val() == '') { 
                        //alert("End Time is required"); 
                    }
                    else {  
                        //console.log('Update trainee dataaaaaaaaa');
                        var type = '';
                        if($('#insert_trainee_btn').val()=='Insert'){
                            type='insert';
                        }
                        else{
                            type='update';
                        }
                        if(canSendUpdateDataTrainee==true) {
                            canSendUpdateDataTrainee=false;
                            socket.send('updateTraineeData~~~---|||<<<>>>|||---~~~' + JSON.stringify({nis: ''+ $('#txt_nis_trainee').val() +'', nama: ''+ $('#txt_nama_trainee').val() +'', gender: ''+ $('#txt_gender_trainee').val() +'', end: ''+ $('#end_time').val() +'', batch: $('#txt_batch_trainee').val(), jurusan: $('#txt_jurusan_trainee').val(), image: ''+ $('#txt_image_data').val() +'' })+'~~~---|||<<<>>>|||---~~~'+type); 
                        }
                        $('#insert_form')[0].reset();  
                        $('#btnChooseImageFile').val("");
                        $('#add_trainee_data_Modal').modal('hide');
                    }
                    
            });  
            
            $('#insert_trainee_form_sql').on("submit", function(event){  
                event.preventDefault();  
                    if($('#txtInsertTraineeSql').val() == '') { 
                        //alert("Batch is required"); 
                    }  
                    else {  
                        socket.send('updateTraineeDataWithSQL~~~---|||<<<>>>|||---~~~'+ $('#txtInsertTraineeSql').val() );
                        $('#insert_trainee_form_sql')[0].reset();  
                        $('#add_data_trainee_from_sql_Modal').modal('hide');
                    }
                    
            });  

        });//end of document.ready
}





function showAbsentSummary(content, excelFileName) {
        var dataSource = []; 
        var progress = '';

        JSON.parse(content).forEach(data => {
            var score = (data.V*2) + (data.O*(-1)) + (data.X*(-2));
            var scoreMax = (data.V + data.O + data.X + data.i + data.s) * 2;
            if(data.V>0){
                data.V = "<a href=\"#modalViewDetailAbsentSummary\" data-toggle=\"modal\" data-id=\""+ 
                        data.nis+"~~~---|||<<<>>>|||---~~~"+
                        data.nama+"~~~---|||<<<>>>|||---~~~"+"V\">"+data.V+"</a>";
            }
            if(data.O>0){
                data.O = "<a href=\"#modalViewDetailAbsentSummary\" data-toggle=\"modal\" data-id=\""+ 
                        data.nis+"~~~---|||<<<>>>|||---~~~"+
                        data.nama+"~~~---|||<<<>>>|||---~~~"+"O\">"+data.O+"</a>";
            }
            if(data.X>0){
                data.X = "<a href=\"#modalViewDetailAbsentSummary\" data-toggle=\"modal\" data-id=\""+ 
                        data.nis+"~~~---|||<<<>>>|||---~~~"+
                        data.nama+"~~~---|||<<<>>>|||---~~~"+"X\">"+data.X+"</a>";
            }
            if(data.i>0){
                data.i = "<a href=\"#modalViewDetailAbsentSummary\" data-toggle=\"modal\" data-id=\""+ 
                        data.nis+"~~~---|||<<<>>>|||---~~~"+
                        data.nama+"~~~---|||<<<>>>|||---~~~"+"i\">"+data.i+"</a>";
            }
            if(data.s>0){
                data.s = "<a href=\"#modalViewDetailAbsentSummary\" data-toggle=\"modal\" data-id=\""+ 
                        data.nis+"~~~---|||<<<>>>|||---~~~"+
                        data.nama+"~~~---|||<<<>>>|||---~~~"+"s\">"+data.s+"</a>";
            }
            progress = '<div class="progress"><div class="progress-bar progress-bar-striped bg-info" role="progressbar" style="width: '+(score / scoreMax * 100)+'%" aria-valuenow="'+ score +'" aria-valuemin="0" aria-valuemax="'+ scoreMax +'"></div></div><br>';
            
            var temp = [ data.nis, data.nama, data.V, data.O, data.X, data.i, data.s, '<br>'+score+' / '+scoreMax +'<br>'+progress ];
            dataSource.push(temp);
        });

        //--------------------------------------------------------------------------------
        $(document).ready(function() {
            tbl = null;
            tbl = $('#tblDataAbsentSummary').DataTable( {
                //"scrollY": 200,
                "scrollX": true,
                scrollY: '43vh',
                //scrollCollapse: true,
                //"pagingType": "full_numbers",
                "bDestroy": true,
                data: dataSource,
                columns: [
                    { title: "NIS" },
                    { title: "Name" },
                    { title: "V(+2)" },
                    { title: "O(-1)" },
                    { title: "X(-2)" },
                    { title: "i" },
                    { title: "s" },
                    { title: "Points" }               
                ],
                dom: 'Bfrtip',
                buttons: [ {extend: 'excelHtml5', title: excelFileName} ]
            }).columns.adjust();//end DataTable
            $('#absent_summary_data_table_modal').modal('show');

        });//end of Document.Ready
}




function showAbsentProgressReport(trainees, activity, progReport, excelFileName) {
    var tdPR = [];
    var tHeader = [{title: "ITEMS"}];


    trainees.forEach(tr => {
        tHeader.push({title: tr.nama}); 
    });

    activity.forEach(act => {
        var tmp = [];
        tmp.push(act.items);

        progReport.forEach(pr => {
            if(act.id===pr.id){
                tmp.push(pr.FREQ);
            }
        });
        tdPR.push(tmp);
    });



    $(document).ready(function() {
            $('#tblPresenceProgressReport').DataTable( {
                //"scrollY": 200,
                "scrollX": true,
                scrollY:        '50vh',
                //scrollCollapse: true,
                //"pagingType": "full_numbers",
                "paging": false,
                "bDestroy": true,
                "bFilter": false,
                data: tdPR,
                columns: tHeader,
                "ordering": false,
                dom: 'Bfrtip',
                buttons: [ {extend: 'excelHtml5', title: excelFileName} ]
            }).columns.adjust();//end DataTable
            $('#presence_progress_report_modal').modal('show');
    });
}





function showDetailAbsentSummary(absentData){
  /*var table = document.getElementById("ViewDetailAbsentSummaryTable");
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
  cell.innerHTML = "<h5><center><b>ABSENT TIME</b></center></h5>";
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
  }*/



        console.log(absentData);
        var dataSourceArray = []; 

        (absentData).forEach(data => {
            var temp = [ data.schedule, yyyymmdd(new Date(data.absent_date)), data.absent_time ];
            dataSourceArray.push(temp);
        });

        //--------------------------------------------------------------------------------
        $(document).ready(function() {
            tbl = null;
            tbl = $('#ViewDetailAbsentSummaryTable').DataTable( {
                //"scrollY": 200,
                "scrollX": true,
                scrollY: '50vh',
                "paging": false,
                //scrollCollapse: true,
                //"pagingType": "full_numbers",
                "bDestroy": true,
                data: dataSourceArray,
                columns: [
                    { title: "SCHEDULE" },
                    { title: "DATE" },
                    { title: "TIME" }              
                ],
                //dom: 'Bfrtip',
                //buttons: [ 'excelHtml5' ]
            }).columns.adjust();//end DataTable
            $('#absent_summary_data_table_modal').modal('show');

        });//end of Document.Ready
}





function showDataScheduleTable(content){
        dataSet = []; 
        JSON.parse(content).forEach(data => {
            var act = '<a href="#" id="'+ data.id + '~~~---|||<<<>>>|||---~~~' + data.info_id +'" name="edit" class="badge badge-info edit_data_schedule">Edit</a>'+'&nbsp;<a href="#" id="'+ data.id + '~~~---|||<<<>>>|||---~~~' + data.info_id +'" name="del" class="badge badge-danger delete_data_schedule">Del</a>';
            var temp = [ act, data.batch, data.week, data.presenceItems, data.info, yyyymmdd(new Date(data.date)), data.start_time, data.end_time, data.absent_time, data.is_need_absent, data.has_triggered, data.participant, data.area, data.timer, data.id ]; //data.date.substr(0,10)     new Date(data.date).toLocaleDateString('id-ID')
            dataSet.push(temp);
        });

        //--------------------------------------------------------------------------------
        $(document).ready(function() {
            // Setup - add a text input to each footer cell
            var tblHead = [
                    { title: "Action" }, //0
                    { title: "Batch" }, //1
                    { title: "Week" }, //2
                    { title: "Schedule Item"}, //3
                    { title: "Schedule" }, //4
                    { title: "Schedule Date" }, //5
                    { title: "Start Time" }, //6
                    { title: "End Time" }, //7
                    { title: "Absent Time" }, //8
                    { title: "Is Need Absent" }, //9
                    { title: "Has Triggered" }, //10
                    { title: "Participant" }, //11
                    { title: "Area" }, //12
                    { title: "Absent Timer" }, //13
                    { title: "ID" } //14                    
                ];
            $('#tblDataSchedule tfoot th').each( function () {
                var title = $(this).text();
                $(this).html( '<input type="text" maxlength="10" size="8" placeholder="Search '+title+'" />' );
            } );
            //-------------------------------------------------
            tbl = null;
            tbl = $('#tblDataSchedule').DataTable( {
                //"scrollY": 200,
                "scrollX": true,
                scrollY:        '43vh',
                //scrollCollapse: true,
                "pagingType": "full_numbers",
                "bDestroy": true,
                data: dataSet,
                columns: tblHead,
                //dom: 'Bfrtip',
                //buttons: [ 'excelHtml5' ],
                initComplete: function () {
                    // Apply the search
                    this.api().columns().every( function () {
                        var that = this;
 
                    $( 'input', this.footer() ).on( 'keyup change clear', function () {
                        if ( that.search() !== this.value ) {
                            that
                                .search( this.value )
                                .draw();
                            }
                        });
                    });
                }//end of initComplete

            }).columns.adjust();//end DataTable
            $('#schedule_data_table_modal').modal('show');


                
            $('#btnAddSchedule').click(function(){         //change button caption and clear form when button add schedule clicked
                $('#insert_form')[0].reset(); 
                $('#insert').val('Insert'); 
                $('#schedule_id').val('');
            });     
            $('#btnAddScheduleFromSql').click(function(){          //clear text when button SQL clicked
                $('#insert_form_sql')[0].reset();  
            });             


            $(document).on('click', '.edit_data_schedule', function(){  //show modal edit schedule data
                var schedule_id = ($(this).attr("id")).split('~~~---|||<<<>>>|||---~~~'); 
                var idx;
                for(var i=0; i<=dataSet.length-1; i++) {
                    if(dataSet[i][14]==schedule_id[0]) { //schedule_id[0]=id dari schedule, schedule_id[1]=id dari presence item
                        idx = i;
                        break; 
                    }
                }

                $('#batch').val(dataSet[idx][1]);  
                $('#week').val(dataSet[idx][2]); 
                //$('#presenceItems').val(); //<-------------------------------select
                document.getElementById("presenceItems").selectedIndex = (schedule_id[1]-1)+""; 
                $('#info').val(dataSet[idx][4]);  
                $('#date').val(dataSet[idx][5]);
                $('#start_time').val(dataSet[idx][6]);  
                $('#end_time').val(dataSet[idx][7]); 
                $('#absent_time').val(dataSet[idx][8]);  
                $('#is_need_absent').val(dataSet[idx][9]);  
                $('#has_triggered').val(dataSet[idx][10]); 
                $('#participant').val(dataSet[idx][11]); 
                $('#area').val(dataSet[idx][12]); 
                $('#txtAbsentTimer').val(dataSet[idx][13]); 
                $('#schedule_id').val(dataSet[idx][14]);  //data pada input hidden
                $('#insert').val('Update');  
                $('#add_schedule_data_Modal').modal('show');
            });


            $(document).on('click', '.delete_data_schedule', function(){  
                var schedule_id = ($(this).attr("id")).split('~~~---|||<<<>>>|||---~~~'); 
                var idx;
                for(var i=0; i<=dataSet.length-1; i++) {
                    if(dataSet[i][14]==schedule_id[0]) {  //schedule_id[0]=id dari schedule, schedule_id[1]=id dari presence item
                        idx = i;
                        break; 
                    }
                }
                
                var txt = '';
                txt += 'Batch: '+dataSet[idx][1]+'<br>';
                txt += 'Week: '+dataSet[idx][2]+'<br>';
                txt += 'Schedule: '+dataSet[idx][3]+ ' | ' + dataSet[idx][4] + '<br>';
                txt += 'Date: '+dataSet[idx][5]+'<br>';
                txt += 'Start: '+dataSet[idx][6]+'<br>';
                txt += 'End: '+dataSet[idx][7]+'<br><br>';
                txt += 'Sure to delete?' + '&nbsp;&nbsp;<input type="button" name="modalDelBtn" value="YES" onclick="deleteScheduleData('+dataSet[idx][14]+');" class="btn btn-danger btn-xl"/>';  
                
                document.getElementById("txtDeleteScheduleConfirmation").innerHTML = txt;
                $('#delete_schedule_data_Modal').modal('show');
            });


            $('#insert_form').on("submit", function(event){  
                event.preventDefault();  
                    if($('#batch').val() == '') { 
                        //alert("Batch is required"); 
                    }  
                    else if($('#week').val() == '') { 
                        //alert("Week is required"); 
                    }  
                    else if($('#presenceItems').val() == '') { 
                        //alert("presence item is required"); 
                    }
                    //else if($('#info').val() == '') { 
                        //alert("Schedule is required"); 
                    //}  
                    else if($('#start_time').val() == '') { 
                        //alert("Start Time is required"); 
                    } 
                    else if($('#end_time').val() == '') { 
                        //alert("End Time is required"); 
                    }
                    else if($('#is_need_absent').val() == '') { 
                        //alert("Is Need Absent is required"); 
                    }
                    else if($('#absent_time').val() == '') { 
                        //alert("Absent Time is required"); 
                    }
                    else if($('#has_triggered').val() == '') { 
                        //alert("Has Triggered is required"); 
                    }
                    else if($('#date').val() == '') { 
                        //alert("Schedule Date is required"); 
                    } 
                    else if($('#participant').val() == '') { 
                        //alert("Participant is required"); 
                    }
                    else if($('#area').val() == '') { 
                        //alert("Area is required");
                    }
                    else if($('#txtAbsentTimer').val() == '') { 
                        //alert("Area is required");
                    }

                    else {  
                        socket.send('updateScheduleData~~~---|||<<<>>>|||---~~~' + JSON.stringify({info: ''+ $('#info').val() +'', date: ''+ $('#date').val() +'', start: ''+ $('#start_time').val() +'', end: ''+ $('#end_time').val() +'', batch: $('#batch').val(), week: $('#week').val(), participant: ''+ $('#participant').val() +'', area: ''+ $('#area').val() +'', id: ''+ $('#schedule_id').val() +'', triggered: ''+ $('#has_triggered').val() +'', needAbs: ''+ $('#is_need_absent').val() +'', absTime: ''+ $('#absent_time').val() +'', timer: ''+ $('#txtAbsentTimer').val() +'', presenceItemId: ''+ $('#presenceItems').val() +'' }));  //+'~~~---|||<<<>>>|||---~~~'+socket.protocol); 
                        $('#insert_form')[0].reset();  
                        $('#add_schedule_data_Modal').modal('hide');
                    }
                    
            });  
            
            $('#insert_form_sql').on("submit", function(event){  
                event.preventDefault();  
                    if($('#txtsql').val() == '') { 
                        //alert("Batch is required"); 
                    }  
                    else {  
                        socket.send('updateScheduleDataWithSQL~~~---|||<<<>>>|||---~~~'+ $('#txtsql').val() );
                        $('#insert_form_sql')[0].reset();  
                        $('#add_data_from_sql_Modal').modal('hide');
                    }
                    
            });  

        });//end of document.ready
}






function showDataAbsentTable(content) {
        dataSet = []; 

        JSON.parse(content).forEach(data => {
            var act = '<a href="#" id="'+ data.id + '~~~---|||<<<>>>|||---~~~' + data.schedule_id +'" name="editAbsent" class="badge badge-info edit_data_absent">Edit</a>'+'&nbsp;<a href="#" id="'+ data.id + '~~~---|||<<<>>>|||---~~~' + data.schedule_id +'" name="deleteAbsent" class="badge badge-danger delete_data_absent">Del</a>';
            var temp = [ act, data.nis, data.name, data.batch, data.week, data.presenceItems, data.schedule, yyyymmdd(new Date(data.absent_date)), data.absent_time, data.mark, data.additional_info, data.id ];
            dataSet.push(temp);
        });
                //--------------------------------------------------------------------------------
        $(document).ready(function() {
            // Setup - add a text input to each footer cell
            $('#tblDataAbsent tfoot th').each( function () {
                var title = $(this).text();
                $(this).html( '<input type="text" maxlength="10" size="8" placeholder="Search '+title+'" />' );
            } );
            //-------------------------------------------------
            tbl = null;
            tbl = $('#tblDataAbsent').DataTable( {
                //"scrollY": 200,
                "scrollX": true,
                scrollY:        '43vh',
                //scrollCollapse: true,
                "pagingType": "full_numbers",
                "bDestroy": true,
                data: dataSet,
                columns: [
                    { title: "Action" }, //0
                    { title: "NIS" }, //1
                    { title: "Name" }, //2
                    { title: "Batch" }, //3
                    { title: "Week" }, //4
                    { title: "Schedule" }, //5
                    { title: "Schedule Detail" }, //6
                    { title: "Absent Date" }, //7
                    { title: "Absent Time" }, //8
                    { title: "Mark" }, //9
                    { title: "Additional Info" }, //10
                    { title: "ID" } //11
                ],
                //dom: 'Bfrtip',
                //buttons: [ 'excelHtml5' ],
                initComplete: function () {
                    // Apply the search
                    this.api().columns().every( function () {
                        var that = this;
 
                    $( 'input', this.footer() ).on( 'keyup change clear', function () {
                        if ( that.search() !== this.value ) {
                            that
                                .search( this.value )
                                .draw();
                            }
                        });
                    });
                }//end of initComplete
            }).columns.adjust();//end DataTable
            $('#absent_data_table_modal').modal('show');



            $(document).on('click', '.edit_data_absent', function(){  //show modal edit absent data
                canSendUpdateDataAbsent = true;
                var txtInfo = "";
                var absent_id = ($(this).attr("id")).split('~~~---|||<<<>>>|||---~~~');  
                var idx;
                for(var i=0; i<=dataSet.length-1; i++) {
                    if(dataSet[i][11]==absent_id[0]) {
                        idx = i;
                        break; 
                    }
                }
                txtInfo = "<h5>Name: "+dataSet[idx][2]+"<br>"+
                          "Week: "+dataSet[idx][4]+"<br>"+
                          "Schedule: "+dataSet[idx][5]+"<br>"+ 
                          "Absent Date: "+dataSet[idx][7]+"<br>"+  
                          "Absent Time: "+dataSet[idx][8]+"</h5>";
                document.getElementById("txtUpdateAbsentData").innerHTML = txtInfo;
                $('#select_absent_mark').val(dataSet[idx][9]);  
                $('#txtAbsentAdditionalInfo').val(dataSet[idx][10]);  
                $('#absent_id').val(dataSet[idx][11]);   
                $('#update_absent_data_Modal').modal('show');
            });


            $(document).on('click', '.delete_data_absent', function(){  
                var absent_id = $(this).attr("id");  
                var idx;
                for(var i=0; i<=dataSet.length-1; i++) {
                    if(dataSet[i][11]==absent_id[0]) {
                        idx = i;
                        break; 
                    }
                }
                
                var txt = "Name: "+dataSet[idx][2]+"<br>"+
                          "Week: "+dataSet[idx][4]+"<br>"+
                          "Schedule: "+dataSet[idx][5]+"<br>"+ 
                          "Absent Date: "+dataSet[idx][7]+"<br>"+  
                          "Absent Time: "+dataSet[idx][8]+"<br>"+
                          "Absent Mark: "+dataSet[idx][9]+"<br>"+
                          "Additional Info: "+dataSet[idx][10]+"<br>";
                txt += 'Sure to delete?' + '&nbsp;&nbsp;<input type="button" value="YES" onclick="deleteAbsentData('+dataSet[idx][11]+');" class="btn btn-danger btn-xl"/>';  
                
                document.getElementById("txtDeleteAbsentConfirmation").innerHTML = txt;

                $('#delete_absent_data_Modal').modal('show');
            });




            $('#form_update_absent').on("submit", function(event){  
                event.preventDefault();  
                    if($('#select_absent_mark').val() == '') { 
                        //alert("Batch is required"); 
                    }  
                    else {  
                        //console.log($('#info').val());
                        //console.log(JSON.stringify({info: ''+ $('#info').val() +'', date: ''+ $('#date').val() +'', start: ''+ $('#start_time').val() +'', end: ''+ $('#end_time').val() +'', batch: $('#batch').val(), week: $('#week').val(), participant: ''+ $('#participant').val() +'', area: ''+ $('#area').val() +'', id: ''+ $('#schedule_id').val() +'', triggered: ''+ $('#has_triggered').val() +'', needAbs: ''+ $('#is_need_absent').val() +'', absTime: ''+ $('#absent_time').val() +''}));
                        

                        if(canSendUpdateDataAbsent==true) {
                            socket.send('updateAbsentData~~~---|||<<<>>>|||---~~~' + JSON.stringify({mark: ''+ $('#select_absent_mark').val() +'', additional: ''+ $('#txtAbsentAdditionalInfo').val() +'', id: ''+ $('#absent_id').val() +''})); 
                            canSendUpdateDataAbsent=false;
                        }
                        $('#form_update_absent')[0].reset();  
                        $('#update_absent_data_Modal').modal('hide'); 
                    }
                    
            });  


            $('#form_request_absent_summary').on("submit", function(event){  //console.log("SUBMIIIIIIIIIIIIIT1111");
                event.preventDefault();  
                    if($('#startDate').val() == '') { 
                         
                    } 
                    else if($('#endDate').val() == '') { 
                         
                    } 
                    else {  
                        socket.send('requestAbsentDataSummary~~~---|||<<<>>>|||---~~~'+ $('#startDate').val() + '~~~---|||<<<>>>|||---~~~' + $('#endDate').val() +'~~~---|||<<<>>>|||---~~~'+socket.protocol); 
                    }
                    
            });

            $('#form_request_presence_progress_report').on("submit", function(event){  //console.log("SUBMIIIIIIIIIIIIIT22222");
                event.preventDefault();  
                    if($('#startDatePR').val() == '') { 
                         
                    } 
                    else if($('#endDatePR').val() == '') { 
                         
                    } 
                    else {  
                        socket.send('requestPresenceProgressReport~~~---|||<<<>>>|||---~~~'+ $('#startDatePR').val() + '~~~---|||<<<>>>|||---~~~' + $('#endDatePR').val() +'~~~---|||<<<>>>|||---~~~'+socket.protocol); 
                    }
                    
            });


        });//end of Document.Ready
}





function yyyymmdd(dateIn) {
  var yyyy = dateIn.getFullYear();
  var mm = dateIn.getMonth() + 1; // getMonth() is zero-based
  var dd = dateIn.getDate();
  if(mm<10 && mm.toString().length==1){
    mm = '0'+ mm;
  }
  if(dd<10 && dd.toString().length==1){
    dd = '0'+ dd;
  }
  return String(yyyy + "-" + mm + "-" + dd);
  //return String(10000 * yyyy + 100 * mm + dd); // Leading zeros for mm and dd
}