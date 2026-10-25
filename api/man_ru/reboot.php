<?php
$manual = <<<EOT
ИМЯ
    reboot — перезагрузить систему

СИНТАКСИС
    reboot [ОПЦИИ]

ОПИСАНИЕ
    Перезагружает компьютер.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);