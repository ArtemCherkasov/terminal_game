<?php
$manual = <<<EOT
ИМЯ
    xargs — построчное выполнение команды

СИНТАКСИС
    xargs [ОПЦИИ] КОМАНДА

ОПИСАНИЕ
    Принимает строки из stdin и выполняет команду для каждой.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);