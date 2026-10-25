<?php
$manual = <<<EOT
ИМЯ
    which — показать путь к исполняемому файлу

СИНТАКСИС
    which КОМАНДА...

ОПИСАНИЕ
    Показывает полный путь к программе.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);