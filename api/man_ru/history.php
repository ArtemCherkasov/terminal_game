<?php
$manual = <<<EOT
ИМЯ
    history — история команд

СИНТАКСИС
    history

ОПИСАНИЕ
    Показывает историю введённых команд.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);