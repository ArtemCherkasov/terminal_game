<?php
header('Content-Type: application/json; charset=utf-8');

$lang = $_GET['lang'] ?? 'ru';
$rawCmd = $_GET['cmd'] ?? '';
$cmd = preg_replace('/[^a-zA-Z0-9\/\\-]/', '', $rawCmd);

if ($cmd === '') {
    echo json_encode(["error" => "NOTFOUND"], JSON_UNESCAPED_UNICODE);
    exit;
}

// Load man page from language-specific directory
$dir = ($lang === 'en') ? __DIR__ . '/man_en' : __DIR__ . '/man_ru';
$file = $dir . '/' . $cmd . '.php';

if (file_exists($file)) {
    include $file;
} else {
    echo json_encode(["error" => "NOTFOUND"], JSON_UNESCAPED_UNICODE);
}
