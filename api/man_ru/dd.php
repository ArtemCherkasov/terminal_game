<?php
$manual = <<<EOT
ИМЯ
    dd — копировать данные с преобразованием

СИНТАКСИС
    dd if=ИСТОЧНИК of=НАЗНАЧЕНИЕ

ОПИСАНИЕ
    Низкоуровневое копирование.
    bs= — размер блока
    count= — количество блоков
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);