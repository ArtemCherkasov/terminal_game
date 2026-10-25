<?php
$manual = <<<EOT
ИМЯ
    sleep — задержка на N секунд

СИНТАКСИС
    sleep ЧИСЛО

ОПИСАНИЕ
    Приостанавливает выполнение на указанное число секунд.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);