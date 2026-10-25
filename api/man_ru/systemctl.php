<?php
$manual = <<<EOT
ИМЯ
    systemctl — управление systemd

СИНТАКСИС
    systemctl [ОПЦИИ] КОМАНДА [СЛУЖБА]

ОПИСАНИЕ
    Управление службами systemd.
    start/stop/restart/status/enable
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);