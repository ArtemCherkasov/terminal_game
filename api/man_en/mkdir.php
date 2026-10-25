<?php
$manual = <<<EOT
NAME
    mkdir — make directories

SYNOPSIS
    mkdir [OPTION]... DIRECTORY...

DESCRIPTION
    Create the DIRECTORY(IES).
    -p — create parent directories as needed
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
