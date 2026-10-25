<?php
$manual = <<<EOT
ИМЯ
    cal — календарь

СИНТАКСИС
    cal [МЕСЯЦ] [ГОД]

ОПИСАНИЕ
    Показывает календарь на месяц или год.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);