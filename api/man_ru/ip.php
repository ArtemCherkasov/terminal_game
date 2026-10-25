<?php
$manual = <<<EOT
ИМЯ
    ip — управление сетевыми интерфейсами

СИНТАКСИС
    ip [ОБЪЕКТ] [КОМАНДА]

ОПИСАНИЕ
    Настройка сетевых интерфейсов.
    ip addr show — показать IP
    ip link set — настройка
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);