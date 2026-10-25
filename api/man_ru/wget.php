<?php
$manual = <<<EOT
ИМЯ
    wget — скачивание файлов из сети

СИНТАКСИС
    wget [ОПЦИИ]... URL

ОПИСАНИЕ
    Скачивает файлы по HTTP, HTTPS, FTP.
    -O — имя выходного файла
    -c — докачка файла
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);