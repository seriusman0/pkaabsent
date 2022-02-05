<?php
//koneksi ke database mysql, silahkan di rubah dengan koneksi agan sendiri
//$koneksi = mysqli_connect("192.168.1.190","armius","672007104","pka_absent_db_guru");
$conn = mysqli_connect("localhost","root","#dbabsensipka#","pka_absent_db_guru");

//cek jika koneksi ke mysql gagal, maka akan tampil pesan berikut
if (mysqli_connect_errno()){
	echo "Gagal melakukan koneksi ke MySQL: " . mysqli_connect_error();
}
