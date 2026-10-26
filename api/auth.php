<?php
header('Content-Type: application/json; charset=utf-8');
$lang = $_GET['lang'] ?? $_POST['lang'] ?? 'ru';

$messages = [
    'ru' => [
        'error_credentials' => 'Неверный логин или пароль',
        'error_empty' => 'Введите логин и пароль',
        'error_fill' => 'Заполните все поля',
        'error_passwords' => 'Пароли не совпадают',
        'error_exists' => 'Пользователь уже существует',
        'error_create' => 'Ошибка создания пользователя',
        'error_no_data' => 'Нет данных',
        'error_unknown' => 'Неизвестное действие',
        'error_no_user_id' => 'Не указан user_id',
        'error_fs_not_found' => 'Файловая система не найдена',
        'error_save' => 'Ошибка сохранения',
        'ok_login' => 'Авторизация успешна',
        'ok_register' => 'Пользователь создан',
    ],
    'en' => [
        'error_credentials' => 'Invalid login or password',
        'error_empty' => 'Enter login and password',
        'error_fill' => 'Fill in all fields',
        'error_passwords' => 'Passwords do not match',
        'error_exists' => 'User already exists',
        'error_create' => 'Error creating user',
        'error_no_data' => 'No data',
        'error_unknown' => 'Unknown action',
        'error_no_user_id' => 'User ID not specified',
        'error_fs_not_found' => 'Filesystem not found',
        'error_save' => 'Save error',
        'ok_login' => 'Login successful',
        'ok_register' => 'User created',
    ]
];

require_once __DIR__ . '/db.php';

$db = Database::getInstance();
$conn = $db->getConnection();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'login':
        $login = trim($_POST['login'] ?? '');
        $pass = md5($_POST['pass'] ?? '');
        
        // If the passed password is already 32 chars (md5), use as-is
        if (strlen($pass) === 32 && ctype_xdigit($pass)) {
            // already md5, keep it
        } else {
            // hash plain text password
            $pass = md5($pass);
        }
        
        if (empty($login) || empty($pass)) {
            echo json_encode(['status' => 'error', 'message' => $messages[$lang]['error_empty']]);
            exit;
        }
        
        $user = $db->authenticate($login, $pass);
        if ($user) {
            $db->updateUserActivity($user['id']);
            echo json_encode([
                'status' => 'ok',
                'message' => $messages[$lang]['ok_login'],
                'user_id' => $user['id'],
                'login' => $user['login']
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => $messages[$lang]['error_credentials']]);
        }
        break;
        
    case 'register':
        $login = trim($_POST['login'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $pass1 = $_POST['pass1'] ?? '';
        $pass2 = $_POST['pass2'] ?? '';
        
        if (empty($login) || empty($email) || empty($pass1) || empty($pass2)) {
            echo json_encode(['status' => 'error', 'message' => $messages[$lang]['error_fill']]);
            exit;
        }
        
        if ($pass1 !== $pass2) {
            echo json_encode(['status' => 'error', 'message' => $messages[$lang]['error_passwords']]);
            exit;
        }
        
        if ($db->userExists($login, $email)) {
            echo json_encode(['status' => 'error', 'message' => $messages[$lang]['error_exists']]);
            exit;
        }
        
        // Загрузить дефолтную файловую систему
        $defaultFsFile = __DIR__ . '/fs_default.json';
        $defaultFs = json_decode(file_get_contents($defaultFsFile), true);
        
        // Переименовать /home/user в /home/<login>
        if (isset($defaultFs['/']['children']['home']['children']['user'])) {
            $defaultFs['/']['children']['home']['children'][$login] = $defaultFs['/']['children']['home']['children']['user'];
            unset($defaultFs['/']['children']['home']['children']['user']);
        }
        
        $fsJson = json_encode($defaultFs, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        
        $userId = $db->createUser($login, $email, md5($pass1), $fsJson);
        if ($userId) {
            echo json_encode([
                'status' => 'ok',
                'message' => $messages[$lang]['ok_register'],
                'user_id' => $userId
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => $messages[$lang]['error_create']]);
        }
        break;
        
    case 'get_fs':
        $userId = $_GET['user_id'] ?? '';
        if (empty($userId)) {
            echo json_encode(['status' => 'error', 'message' => $messages[$lang]['error_no_user_id']]);
            exit;
        }
        
        $fs = $db->getUserFilesystem($userId);
        if ($fs) {
            echo json_encode($fs);
        } else {
            echo json_encode(['status' => 'error', 'message' => $messages[$lang]['error_fs_not_found']]);
        }
        break;
        
    case 'save_fs':
        $userId = $_POST['user_id'] ?? '';
        $fs = json_decode(file_get_contents('php://input'), true);
        
        if (empty($userId) || !isset($fs)) {
            echo json_encode(['status' => 'error', 'message' => $messages[$lang]['error_no_data']]);
            exit;
        }
        
        if ($db->saveUserFilesystem($userId, $fs)) {
            echo json_encode(['status' => 'ok']);
        } else {
            echo json_encode(['status' => 'error', 'message' => $messages[$lang]['error_save']]);
        }
        break;
        
    default:
        echo json_encode(['status' => 'error', 'message' => $messages[$lang]['error_unknown']]);
        break;
}
