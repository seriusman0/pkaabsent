<?php

// Basic example of PHP script to handle with jQuery-Tabledit plug-in.
// Note that is just an example. Should take precautions such as filtering the input data.
include_once("config.php");
header('Content-Type: application/json');

/*$input = filter_input_array(INPUT_POST);

$mysqli = new mysqli('localhost', 'user', 'password', 'database');

if (mysqli_connect_errno()) {
  echo json_encode(array('mysqli' => 'Failed to connect to MySQL: ' . mysqli_connect_error()));
  exit;
}

if ($input['action'] === 'edit') {
    $mysqli->query("UPDATE users SET username='" . $input['username'] . "', email='" . $input['email'] . "', avatar='" . $input['avatar'] . "' WHERE id='" . $input['id'] . "'");
} else if ($input['action'] === 'delete') {
    $mysqli->query("UPDATE users SET deleted=1 WHERE id='" . $input['id'] . "'");
} else if ($input['action'] === 'restore') {
    $mysqli->query("UPDATE users SET deleted=0 WHERE id='" . $input['id'] . "'");
}

mysqli_close($mysqli);

echo json_encode($input);*/

//---------------------------------

include_once("config.php");
$input = filter_input_array(INPUT_POST);
if ($input['action'] == 'edit') {
	$update_field='';
	if(isset($input['name'])) {
		$update_field.= "name='".$input['name']."'";
	} else if(isset($input['gender'])) {
		$update_field.= "gender='".$input['gender']."'";
	} else if(isset($input['address'])) {
		$update_field.= "address='".$input['address']."'";
	} else if(isset($input['age'])) {
		$update_field.= "age='".$input['age']."'";
	} else if(isset($input['designation'])) {
		$update_field.= "designation='".$input['designation']."'";
	}

	if($update_field && $input['id']) {
		$sql_query = "UPDATE developers SET $update_field WHERE id='" . $input['id'] . "'";
		mysqli_query($conn, $sql_query) or die("database error:". mysqli_error($conn));
	}
}
?>