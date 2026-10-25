<?php
$manual = <<<EOT
ИМЯ
    groupadd — создать группу

СИНТАКСИС
    groupadd ИМЯ

ОПИСАНИЕ
    Создаёт новую группу в системе.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);