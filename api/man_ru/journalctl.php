<?php
$manual = <<<EOT
ИМЯ
    journalctl — журналы systemd

СИНТАКСИС
    journalctl [ОПЦИИ]

ОПИСАНИЕ
    Просмотр логов systemd.
    -xe — последние сообщения с пояснениями
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);