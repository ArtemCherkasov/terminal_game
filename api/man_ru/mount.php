<?php
$manual = <<<EOT
ИМЯ
    mount — монтировать файловую систему

СИНТАКСИС
    mount [ОПЦИИ] УСТРОЙСТВО ТОЧКА

ОПИСАНИЕ
    Монтирует устройство в указанную точку.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);