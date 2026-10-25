<?php
$manual = <<<EOT
ИМЯ
    echo — вывести строку текста

СИНТАКСИС
    echo [СТРОКА]...

ОПИСАНИЕ
    Выводит переданные строки. Часто используется в скриптах.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);