<?php
$manual = <<<EOT
ИМЯ
    traceroute — маршрут до хоста

СИНТАКСИС
    traceroute ХОСТ

ОПИСАНИЕ
    Отслеживает путь пакетов до указанного хоста.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);