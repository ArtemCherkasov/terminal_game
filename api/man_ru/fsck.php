<?php
$manual = <<<EOT
ИМЯ
    fsck — проверка файловой системы

СИНТАКСИС
    fsck [ОПЦИИ] УСТРОЙСТВО

ОПИСАНИЕ
    Проверяет целостность файловой системы.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);