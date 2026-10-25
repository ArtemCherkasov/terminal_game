<?php
header('Content-Type: application/json; charset=utf-8');

// Файлы
$defaultFsFile = __DIR__ . '/fs_default.json';
$fsFile = __DIR__ . '/../fs_state.json';

// Загрузка эталонной ФС из отдельного файла (неизменяемая)
$defaultFs = json_decode(file_get_contents($defaultFsFile), true);

// Загрузка рабочей ФС из файла состояния
if (file_exists($fsFile)) {
    $fs = json_decode(file_get_contents($fsFile), true);
} else {
    $fs = json_decode(json_encode($defaultFs), true);
    file_put_contents($fsFile, json_encode($fs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Обработка запросов
$action = $_GET['action'] ?? '';

if ($action === 'save') {
    // Сохранение состояния рабочей ФС
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['fs'])) {
        file_put_contents($fsFile, json_encode($data['fs'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode(['status' => 'ok']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No data']);
    }
    exit;
}

if ($action === 'reset') {
    // Сброс рабочей ФС к эталонной
    file_put_contents($fsFile, json_encode(json_decode(json_encode($defaultFs), true), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['status' => 'ok']);
    exit;
}

if ($action === 'default') {
    // Возврат эталонной ФС (только для чтения)
    echo json_encode($defaultFs, JSON_UNESCAPED_UNICODE);
    exit;
}

// Возврат рабочей ФС
echo json_encode($fs, JSON_UNESCAPED_UNICODE);
