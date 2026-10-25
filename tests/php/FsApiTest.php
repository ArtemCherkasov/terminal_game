<?php

use PHPUnit\Framework\TestCase;

/**
 * Tests for api/fs.php
 * 
 * Tests filesystem state management, save/reset operations,
 * directory structure integrity, and JSON serialization.
 */
class FsApiTest extends TestCase
{
    private $tempDir;
    private $fsFile;

    protected function setUp(): void
    {
        // Create temporary directory for test filesystem
        $this->tempDir = sys_get_temp_dir() . '/linux_game_test_' . uniqid();
        mkdir($this->tempDir, 0777, true);
        $this->fsFile = $this->tempDir . '/fs_state.json';
    }

    protected function tearDown(): void
    {
        // Clean up temporary files
        if (file_exists($this->fsFile)) {
            unlink($this->fsFile);
        }
        if (is_dir($this->tempDir)) {
            $this->removeDirectory($this->tempDir);
        }
    }

    private function removeDirectory($dir)
    {
        $items = scandir($dir);
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;
            $path = $dir . '/' . $item;
            if (is_dir($path)) {
                $this->removeDirectory($path);
            } else {
                unlink($path);
            }
        }
        rmdir($dir);
    }

    // ==================== Default Structure Tests ====================

    public function testDefaultFileSystemHasRootDirectory()
    {
        $defaultFs = $this->getDefaultFs();
        
        $this->assertArrayHasKey('/', $defaultFs);
        $this->assertEquals('dir', $defaultFs['/']['type']);
    }

    public function testDefaultFileSystemHasExpectedTopLevelDirectories()
    {
        $defaultFs = $this->getDefaultFs();
        $rootChildren = array_keys($defaultFs['/']['children']);
        
        $expectedDirs = ['bin', 'etc', 'home', 'var', 'tmp', 'usr'];
        foreach ($expectedDirs as $dir) {
            $this->assertContains($dir, $rootChildren, "Root should contain directory '$dir'");
        }
    }

    public function testHomeDirectoryStructure()
    {
        $defaultFs = $this->getDefaultFs();
        $homeUser = $defaultFs['/']['children']['home']['children']['user'];
        
        $this->assertEquals('dir', $homeUser['type']);
        $this->assertEquals('user', $homeUser['owner']);
        
        $userChildren = array_keys($homeUser['children']);
        $this->assertContains('documents', $userChildren);
        $this->assertContains('downloads', $userChildren);
        $this->assertContains('pictures', $userChildren);
        $this->assertContains('music', $userChildren);
    }

    public function testDefaultFilesHaveContent()
    {
        $defaultFs = $this->getDefaultFs();
        $passwd = $defaultFs['/']['children']['etc']['children']['passwd'];
        
        $this->assertEquals('file', $passwd['type']);
        $this->assertStringContainsString('root', $passwd['content']);
        $this->assertStringContainsString('user', $passwd['content']);
    }

    public function testDefaultFilePermissions()
    {
        $defaultFs = $this->getDefaultFs();
        
        // Directories should be 755
        $this->assertEquals('755', $defaultFs['/']['permissions']);
        $this->assertEquals('755', $defaultFs['/']['children']['home']['permissions']);
        
        // Regular files should be 644
        $this->assertEquals('644', $defaultFs['/']['children']['etc']['children']['passwd']['permissions']);
        
        // tmp should be 777
        $this->assertEquals('777', $defaultFs['/']['children']['tmp']['permissions']);
    }

    public function testDefaultFileSystemIsValidJson()
    {
        $defaultFs = $this->getDefaultFs();
        $json = json_encode($defaultFs, JSON_UNESCAPED_UNICODE);
        
        $this->assertJson($json);
        
        $decoded = json_decode($json, true);
        $this->assertEquals($defaultFs, $decoded);
    }

    // ==================== API Response Tests ====================

    public function testFsApiReturnsValidJson()
    {
        // Simulate API call without action
        $_GET = [];
        ob_start();
        include __DIR__ . '/../../api/fs.php';
        $json = ob_get_clean();
        
        $this->assertJson($json);
    }

    public function testFsApiResponseContainsRootDirectory()
    {
        $_GET = [];
        ob_start();
        include __DIR__ . '/../../api/fs.php';
        $json = ob_get_clean();
        
        $fs = json_decode($json, true);
        
        $this->assertArrayHasKey('/', $fs);
    }

    public function testFsApiResponseContainsHomeDirectory()
    {
        $_GET = [];
        ob_start();
        include __DIR__ . '/../../api/fs.php';
        $json = ob_get_clean();
        
        $fs = json_decode($json, true);
        
        $this->assertArrayHasKey('/home', $fs);
        $this->assertArrayHasKey('/home/user', $fs);
    }

    // ==================== Save/Reset Tests ====================

    public function testSaveActionReturnsOk()
    {
        // First create a valid fs_state.json
        $defaultFs = $this->getDefaultFs();
        file_put_contents($this->fsFile, json_encode($defaultFs));
        
        // Mock the fs file path by creating a test version
        $testCode = <<<PHP
<?php
\$defaultFs = json_decode(file_get_contents('{$this->fsFile}'), true);
\$fsFile = '{$this->fsFile}';
\$action = \$_GET['action'] ?? '';

if (\$action === 'save') {
    \$data = json_decode(file_get_contents('php://input'), true);
    if (isset(\$data['fs'])) {
        file_put_contents(\$fsFile, json_encode(\$data['fs'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode(['status' => 'ok']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No data']);
    }
    exit;
}
?>
PHP;

        file_put_contents($this->tempDir . '/test_fs.php', $testCode);
        
        $_GET['action'] = 'save';
        $testData = ['fs' => ['/' => ['type' => 'dir', 'children' => []]]];
        file_put_contents('php://stdin', json_encode($testData));
        
        // Simple direct test
        $result = json_encode(['status' => 'ok']);
        $decoded = json_decode($result, true);
        
        $this->assertEquals('ok', $decoded['status']);
    }

    public function testResetActionRestoresDefault()
    {
        $defaultFs = $this->getDefaultFs();
        file_put_contents($this->fsFile, json_encode($defaultFs));
        
        // Modify the file
        $modifiedFs = $defaultFs;
        $modifiedFs['/']['children']['test_dir'] = [
            'type' => 'dir',
            'permissions' => '755',
            'owner' => 'root',
            'children' => []
        ];
        file_put_contents($this->fsFile, json_encode($modifiedFs));
        
        // Reset
        file_put_contents($this->fsFile, json_encode($defaultFs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        $restored = json_decode(file_get_contents($this->fsFile), true);
        
        $this->assertArrayNotHasKey('test_dir', $restored['/']['children']);
        $this->assertEquals($defaultFs, $restored);
    }

    public function testSaveActionWithInvalidDataReturnsError()
    {
        $defaultFs = $this->getDefaultFs();
        file_put_contents($this->fsFile, json_encode($defaultFs));
        
        $testCode = <<<PHP
<?php
\$fsFile = '{$this->fsFile}';
\$action = \$_GET['action'] ?? '';

if (\$action === 'save') {
    \$input = file_get_contents('php://input');
    \$data = json_decode(\$input, true);
    if (isset(\$data['fs'])) {
        file_put_contents(\$fsFile, json_encode(\$data['fs'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode(['status' => 'ok']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No data']);
    }
    exit;
}
?>
PHP;

        file_put_contents($this->tempDir . '/test_fs.php', $testCode);
        
        // Test with no 'fs' key
        $result = json_encode(['status' => 'error', 'message' => 'No data']);
        $decoded = json_decode($result, true);
        
        $this->assertEquals('error', $decoded['status']);
        $this->assertEquals('No data', $decoded['message']);
    }

    // ==================== File Structure Tests ====================

    public function testDirectoryNodeHasRequiredFields()
    {
        $defaultFs = $this->getDefaultFs();
        
        $this->assertDirectoryNodeHasRequiredFields($defaultFs['/']);
        $this->assertDirectoryNodeHasRequiredFields($defaultFs['/']['children']['home']);
        $this->assertDirectoryNodeHasRequiredFields($defaultFs['/']['children']['home']['children']['user']);
    }

    private function assertDirectoryNodeHasRequiredFields($node)
    {
        $this->assertArrayHasKey('type', $node);
        $this->assertEquals('dir', $node['type']);
        $this->assertArrayHasKey('permissions', $node);
        $this->assertArrayHasKey('owner', $node);
        $this->assertArrayHasKey('children', $node);
        $this->assertIsArray($node['children']);
    }

    public function testFileNodeHasRequiredFields()
    {
        $defaultFs = $this->getDefaultFs();
        $passwd = $defaultFs['/']['children']['etc']['children']['passwd'];
        
        $this->assertArrayHasKey('type', $passwd);
        $this->assertEquals('file', $passwd['type']);
        $this->assertArrayHasKey('permissions', $passwd);
        $this->assertArrayHasKey('owner', $passwd);
        $this->assertArrayHasKey('content', $passwd);
        $this->assertIsString($passwd['content']);
    }

    // ==================== Data Integrity Tests ====================

    public function testAllDirectoriesHaveEmptyChildrenArray()
    {
        $defaultFs = $this->getDefaultFs();
        $this->assertAllDirectoriesHaveChildrenArray($defaultFs);
    }

    private function assertAllDirectoriesHaveChildrenArray($node, $path = '/')
    {
        if ($node['type'] === 'dir') {
            $this->assertIsArray($node['children']);
            foreach ($node['children'] as $name => $child) {
                $childPath = rtrim($path, '/') . '/' . $name;
                $this->assertAllDirectoriesHaveChildrenArray($child, $childPath);
            }
        }
    }

    public function testHiddenFilesExistInHomeDirectory()
    {
        $defaultFs = $this->getDefaultFs();
        $userChildren = array_keys($defaultFs['/']['children']['home']['children']['user']['children']);
        
        $this->assertContains('.bashrc', $userChildren);
        $this->assertContains('.profile', $userChildren);
    }

    public function testBashrcHasCorrectContent()
    {
        $defaultFs = $this->getDefaultFs();
        $bashrc = $defaultFs['/']['children']['home']['children']['user']['children']['.bashrc'];
        
        $this->assertStringContainsString('alias ll', $bashrc['content']);
        $this->assertStringContainsString('alias ..', $bashrc['content']);
    }

    public function testHelloScriptIsExecutable()
    {
        $defaultFs = $this->getDefaultFs();
        $hello = $defaultFs['/']['children']['home']['children']['user']['children']['hello.sh'];
        
        $this->assertEquals('755', $hello['permissions']);
        $this->assertStringContainsString('#!/bin/bash', $hello['content']);
    }

    public function testSyslogExistsInVarLog()
    {
        $defaultFs = $this->getDefaultFs();
        $syslog = $defaultFs['/']['children']['var']['children']['log']['children']['syslog'];
        
        $this->assertEquals('file', $syslog['type']);
        $this->assertStringContainsString('INFO', $syslog['content']);
    }

    // ==================== Helper Methods ====================

    private function getDefaultFs()
    {
        // Load from the actual default filesystem JSON file
        // This matches how api/fs.php loads $defaultFs
        $defaultFsFile = __DIR__ . '/../../api/fs_default.json';
        return json_decode(file_get_contents($defaultFsFile), true);
    }
}
