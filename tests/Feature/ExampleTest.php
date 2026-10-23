<?php

test('returns a successful response', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
});

test('serves the configured application mount path', function () {
    $this->get('/lams/')->assertOk();
});
