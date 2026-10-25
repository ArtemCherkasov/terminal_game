<?php
$manual = <<<EOT
ИМЯ
    lscpu — информация о процессоре

СИНТАКСИС
    lscpu

ОПИСАНИЕ
    Показывает архитектуру процессора, ядра, потоки.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);