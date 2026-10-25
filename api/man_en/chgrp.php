<?php
$manual = <<<EOT
NAME
    chgrp — change group ownership

SYNOPSIS
    chgrp [OPTION]... GROUP FILE...

DESCRIPTION
    Change group ownership.
    -R — recursive
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
