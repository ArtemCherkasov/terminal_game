<?php
$manual = <<<EOT
ИМЯ
    pwd — показать текущий рабочий каталог

СИНТАКСИС
    pwd

ОПИСАНИЕ
    Выводит полный путь к текущему каталогу.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);