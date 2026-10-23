<?php

/**
 * Router for PHP's built-in server that mirrors the production /lams mount.
 *
 * Start it through `composer run dev` or:
 * php -S 127.0.0.1:8000 -t public scripts/lams-dev-server.php
 */
$publicPath = dirname(__DIR__).'/public';
$publicRealPath = realpath($publicPath);
$basePath = '/lams';
$requestPath = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');

if ($requestPath === '/') {
    header('Location: '.$basePath.'/', true, 302);

    return true;
}

if ($requestPath === $basePath) {
    header('Location: '.$basePath.'/', true, 301);

    return true;
}

if (! str_starts_with($requestPath, $basePath.'/')) {
    http_response_code(404);
    echo 'Not Found';

    return true;
}

$relativePath = substr($requestPath, strlen($basePath));
$requestedFile = realpath($publicPath.$relativePath);

if (
    $relativePath !== '/'
    && $requestedFile !== false
    && is_file($requestedFile)
    && $publicRealPath !== false
    && str_starts_with($requestedFile, $publicRealPath.DIRECTORY_SEPARATOR)
) {
    $extension = strtolower(pathinfo($requestedFile, PATHINFO_EXTENSION));
    $contentTypes = [
        'css' => 'text/css; charset=UTF-8',
        'gif' => 'image/gif',
        'ico' => 'image/x-icon',
        'jpeg' => 'image/jpeg',
        'jpg' => 'image/jpeg',
        'js' => 'text/javascript; charset=UTF-8',
        'json' => 'application/json; charset=UTF-8',
        'map' => 'application/json; charset=UTF-8',
        'png' => 'image/png',
        'svg' => 'image/svg+xml',
        'webp' => 'image/webp',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
    ];

    header('Content-Type: '.($contentTypes[$extension] ?? 'application/octet-stream'));
    header('Content-Length: '.filesize($requestedFile));

    if ($_SERVER['REQUEST_METHOD'] !== 'HEAD') {
        readfile($requestedFile);
    }

    return true;
}

$_SERVER['DOCUMENT_ROOT'] = $publicPath;
$_SERVER['SCRIPT_FILENAME'] = $publicPath.'/index.php';
$_SERVER['SCRIPT_NAME'] = $basePath.'/index.php';
$_SERVER['PHP_SELF'] = $basePath.'/index.php';

chdir($publicPath);
require $publicPath.'/index.php';

return true;
