<?php
$conn = mysql_connect("localhost", "db_user", "db_pass");
mysql_select_db("my_database", $conn);

$id = $_GET['id'];
$query = "SELECT * FROM users WHERE id = " . $id;
$result = mysql_query($query);

while ($row = mysql_fetch_array($result)) {
    echo "User: " . $row['username'] . "<br>";
    echo "Email: " . $row['email'] . "<br>";
}
?>
