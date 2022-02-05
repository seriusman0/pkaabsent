<?php  
 //fetch.php  
 $connect = mysqli_connect("localhost","root","#dbabsensipka#","pka_absent_db_guru");  
 if(isset($_POST["schedule_id"]))  
 {  
      $query = "SELECT * FROM tbl_employee WHERE id = '".$_POST["schedule_id"]."'";  
      $result = mysqli_query($connect, $query);  
      $row = mysqli_fetch_array($result);  
      echo json_encode($row);  
 }
