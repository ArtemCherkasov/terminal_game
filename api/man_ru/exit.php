<?php
$manual = <<<EOT
ИМЯ
    exit — выйти из оболочки

СИНТАКСИС
    exit [КОД]

ОПИСАНИЕ
    Завершает сеанс текущей оболочки.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);