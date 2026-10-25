<?php
$manual = <<<EOT
ИМЯ
    mkfs — создать файловую систему

СИНТАКСИС
    mkfs -t ТИП УСТРОЙСТВО

ОПИСАНИЕ
    Создаёт файловую систе��у на устройстве.
    -t ext4 — тип ФС
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);