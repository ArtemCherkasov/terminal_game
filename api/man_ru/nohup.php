<?php
$manual = <<<EOT
ИМЯ
    nohup — запуск без привязки к терминалу

СИНТАКСИС
    nohup КОМАНДА [АРГУМЕНТЫ]

ОПИСАНИЕ
    Запускает процесс, устойчивый к закрытию терминала.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);