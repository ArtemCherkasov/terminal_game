<?php
$manual = <<<EOT
ИМЯ
    export — экспорт переменной окружения

СИНТАКСИС
    export ИМЯ=ЗНАЧЕНИЕ

ОПИСАНИЕ
    Устанавливает переменную окружения.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);