<?php
$manual = <<<EOT
NAME
    fdisk — manipulate disk partition table

SYNOPSIS
    fdisk [OPTION] DEVICE

DESCRIPTION
    Partition management utility.
    -l — list partitions
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
