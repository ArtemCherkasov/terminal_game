<?php
$manual = <<<EOT
ИМЯ
    service — управление сервисами (SysV)

СИНТАКСИС
    service ИМЯ КОМАНДА

ОПИСАНИЕ
    Управляет службами (start/stop/restart/status).
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);