<?php
$manual = <<<EOT
ИМЯ
    lsblk — список блочных устройств

СИНТАКСИС
    lsblk [ОПЦИИ]

ОПИСАНИЕ
    Показывает диски и разделы.
    -f — файловая система
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);