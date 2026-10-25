<?php
$manual = <<<EOT
ИМЯ
    kill — завершить процесс

СИНТАКСИС
    kill [СИГНАЛ] PID

ОПИСАНИЕ
    Отправляет сигнал процессу.
    -9 (SIGKILL) — принудительное завершение
    -15 (SIGTERM) — мягкое завершение
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);