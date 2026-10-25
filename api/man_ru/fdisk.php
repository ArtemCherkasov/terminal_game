<?php
$manual = <<<EOT
ИМЯ
    fdisk — управление разделами диска

СИНТАКСИС
    fdisk [ОПЦИИ] УСТРОЙСТВО

ОПИСАНИЕ
    Утилита для работы с таблицей разделов.
    -l — список разделов
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);