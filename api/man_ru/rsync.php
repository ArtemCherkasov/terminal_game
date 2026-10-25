<?php
$manual = <<<EOT
ИМЯ
    rsync — синхронизация файлов

СИНТАКСИС
    rsync [ОПЦИИ]... ИСТОЧНИК НАЗНАЧЕНИЕ

ОПИСАНИЕ
    Синхронизирует файлы с минимальным трафиком.
    -a — архивный режим
    -v — подробный вывод
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);