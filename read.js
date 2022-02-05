var db = require("./db_config");

db.connect(function(err) {
    if (err) throw err;
    
    let sql = "SELECT * FROM schedule";
    db.query(sql, function (err, result) {
        if (err) throw err;
        // gunakan perulangan untuk menampilkan data
        //console.log(result[0].info);
        //result[0].info = 'Aaaaaaaaaaaaaaa';
        //console.log('Info \t Start Time \t\t End Time');
        console.log('----------------------------------------------------------');

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

            //console.log("Current time: " + currentTime);
            //console.log("Start time: " + start_time);
            //console.log("End time: " + end_time);
            
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
                    console.log("Start absen for schedule: " + schedule.info); //trigger for absent
                    update("UPDATE schedule SET has_triggered = 1 WHERE date='" + yyyymmdd(schedule.date) + "' AND absent_time = '" + schedule.absent_time + "'");
                }
            }
        });
        console.End;
    });
});

function yyyymmdd(dateIn) {
  var yyyy = dateIn.getFullYear();
  var mm = dateIn.getMonth() + 1; // getMonth() is zero-based
  var dd = dateIn.getDate();
  return String(yyyy + "-" + mm + "-" + dd);
  //return String(10000 * yyyy + 100 * mm + dd); // Leading zeros for mm and dd
}

function update(sql) {
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