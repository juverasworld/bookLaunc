<?php
	echo "<h2>Files in Current Directory:</h2>";

	$directory = __DIR__; // or just "." for current directory

	$files = scandir($directory);

	echo "<ul>";
	foreach ($files as $file) {
		if (is_file($file)) {
			echo "<li><a href=\"$file\">$file</a></li>";
		}
	}
	echo "</ul>";
?>