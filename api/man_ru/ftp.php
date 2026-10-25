<?php
$manual = <<<EOT
ИМЯ
    ftp — FTP-клиент

СИНТАКСИС
    ftp ХОСТ

ОПИСАНИЕ
    Подключается к FTP-серверу.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);