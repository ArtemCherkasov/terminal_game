<?php
$manual = <<<EOT
ИМЯ
    ifconfig — настройка сетевого интерфейса

СИНТАКСИС
    ifconfig [ИНТЕРФЕЙС]

ОПИСАНИЕ
    Настройка и просмотр сетевых интерфейсов.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);