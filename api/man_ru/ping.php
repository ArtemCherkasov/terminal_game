<?php
$manual = <<<EOT
ИМЯ
    ping — проверка сетевого соединения

СИНТАКСИС
    ping [ОПЦИИ] ХОСТ

ОПИСАНИЕ
    Отправляет ICMP-запросы к хосту.
    -c ЧИСЛО — количество запросов
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);