<?php
$manual = <<<EOT
NAME
    groupadd — create a new group

SYNOPSIS
    groupadd NAME

DESCRIPTION
    Create a new group.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
