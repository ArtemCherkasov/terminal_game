<?php
$manual = <<<EOT
ИМЯ
    uptime — время работы системы

СИНТАКСИС
    uptime

ОПИСАНИЕ
    Показывает как долго система работает без перезагрузки.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);