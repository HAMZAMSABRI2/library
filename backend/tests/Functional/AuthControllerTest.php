<?php

namespace App\Tests\Functional;

class AuthControllerTest extends AbstractApiTestCase
{
    // ─── Register ────────────────────────────────────────────────────────────

    public function testRegisterReturns201WithTokenAndUser(): void
    {
        $response = $this->jsonRequest('POST', '/api/auth/register', [
            'email'    => 'nouveau@test.com',
            'password' => 'Pass123!',
            'nom'      => 'Durand',
            'prenom'   => 'Claire',
        ]);

        $this->assertSame(201, $response->getStatusCode());

        $body = $this->jsonBody($response);
        $this->assertArrayHasKey('token', $body);
        $this->assertNotEmpty($body['token']);
        $this->assertArrayHasKey('user', $body);
        $this->assertSame('nouveau@test.com', $body['user']['email']);
        $this->assertSame('Durand', $body['user']['nom']);
        $this->assertSame('Claire', $body['user']['prenom']);
        $this->assertSame('ROLE_USER', $body['user']['role']);
        $this->assertArrayHasKey('id', $body['user']);
    }

    public function testRegisterDefaultsToRoleUser(): void
    {
        $response = $this->jsonRequest('POST', '/api/auth/register', [
            'email'    => 'sans.role@test.com',
            'password' => 'Pass123!',
            'nom'      => 'Test',
            'prenom'   => 'Role',
        ]);

        $body = $this->jsonBody($response);
        $this->assertSame('ROLE_USER', $body['user']['role']);
    }

    public function testRegisterWithAdminRole(): void
    {
        $response = $this->jsonRequest('POST', '/api/auth/register', [
            'email'    => 'superadmin@test.com',
            'password' => 'Admin123!',
            'nom'      => 'Super',
            'prenom'   => 'Admin',
            'role'     => 'ROLE_ADMIN',
        ]);

        $this->assertSame(201, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertSame('ROLE_ADMIN', $body['user']['role']);
    }

    public function testRegisterReturnsMissingEmailError(): void
    {
        $response = $this->jsonRequest('POST', '/api/auth/register', [
            'password' => 'Pass123!',
            'nom'      => 'Test',
            'prenom'   => 'User',
        ]);

        $this->assertSame(400, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertArrayHasKey('error', $body);
    }

    public function testRegisterReturnsMissingPasswordError(): void
    {
        $response = $this->jsonRequest('POST', '/api/auth/register', [
            'email'  => 'nopass@test.com',
            'nom'    => 'Test',
            'prenom' => 'User',
        ]);

        $this->assertSame(400, $response->getStatusCode());
    }

    public function testRegisterReturnsMissingNomError(): void
    {
        $response = $this->jsonRequest('POST', '/api/auth/register', [
            'email'    => 'nonom@test.com',
            'password' => 'Pass123!',
            'prenom'   => 'User',
        ]);

        $this->assertSame(400, $response->getStatusCode());
    }

    public function testRegisterReturnsMissingPrenomError(): void
    {
        $response = $this->jsonRequest('POST', '/api/auth/register', [
            'email'    => 'noprenom@test.com',
            'password' => 'Pass123!',
            'nom'      => 'Test',
        ]);

        $this->assertSame(400, $response->getStatusCode());
    }

    public function testRegisterReturnsDuplicateEmailError(): void
    {
        $response = $this->jsonRequest('POST', '/api/auth/register', [
            'email'    => 'admin@test.com',
            'password' => 'Other123!',
            'nom'      => 'Doublon',
            'prenom'   => 'Email',
        ]);

        $this->assertSame(409, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertArrayHasKey('error', $body);
    }

    // ─── Login ────────────────────────────────────────────────────────────────

    public function testLoginWithValidCredentialsReturnsToken(): void
    {
        $response = $this->jsonRequest('POST', '/api/auth/login', [
            'email'    => 'admin@test.com',
            'password' => 'Admin123!',
        ]);

        $this->assertSame(200, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertArrayHasKey('token', $body);
        $this->assertNotEmpty($body['token']);
    }

    public function testLoginWithWrongPasswordReturns401(): void
    {
        $response = $this->jsonRequest('POST', '/api/auth/login', [
            'email'    => 'admin@test.com',
            'password' => 'MauvaisMotDePasse',
        ]);

        $this->assertSame(401, $response->getStatusCode());
    }

    public function testLoginWithUnknownEmailReturns401(): void
    {
        $response = $this->jsonRequest('POST', '/api/auth/login', [
            'email'    => 'inconnu@test.com',
            'password' => 'Pass123!',
        ]);

        $this->assertSame(401, $response->getStatusCode());
    }

    // ─── Protection JWT ───────────────────────────────────────────────────────

    public function testProtectedRouteWithoutTokenReturns401(): void
    {
        $response = $this->jsonRequest('GET', '/api/livres');

        $this->assertSame(401, $response->getStatusCode());
    }

    public function testProtectedRouteWithInvalidTokenReturns401(): void
    {
        $response = $this->jsonRequest('GET', '/api/livres', null, 'invalid.jwt.token');

        $this->assertSame(401, $response->getStatusCode());
    }
}
