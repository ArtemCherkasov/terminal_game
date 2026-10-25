<?php
$manual = <<<EOT
ИМЯ
    lsusb — список USB-устройств

СИНТАКСИС
    lsusb [ОПЦИИ]

ОПИСАНИЕ
    Показывает все USB-устройства.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);