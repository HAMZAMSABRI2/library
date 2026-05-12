<?php

namespace App\Tests\Functional;

class UserControllerTest extends AbstractApiTestCase
{
    // ─── GET /api/users ────────────────────────────────────────────────────────

    public function testListUsersReturnsPaginatedResponse(): void
    {
        $response = $this->jsonRequest('GET', '/api/users', null, $this->adminToken);
        $body     = $this->jsonBody($response);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertArrayHasKey('data', $body);
        $this->assertArrayHasKey('total', $body);
        $this->assertArrayHasKey('page', $body);
        $this->assertArrayHasKey('limit', $body);
        $this->assertSame(2, $body['total']);
    }

    public function testListUsersRequiresAuthentication(): void
    {
        $response = $this->jsonRequest('GET', '/api/users');

        $this->assertSame(401, $response->getStatusCode());
    }

    public function testListUsersSupportsSearchByNom(): void
    {
        $response = $this->jsonRequest('GET', '/api/users?q=Martin', null, $this->adminToken);
        $body     = $this->jsonBody($response);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertCount(1, $body['data']);
        $this->assertSame('Martin', $body['data'][0]['nom']);
    }

    public function testListUsersSupportsSearchByEmail(): void
    {
        $response = $this->jsonRequest('GET', '/api/users?q=admin%40test.com', null, $this->adminToken);
        $body     = $this->jsonBody($response);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertCount(1, $body['data']);
    }

    public function testListUsersSearchWithNoMatchReturnsEmpty(): void
    {
        $response = $this->jsonRequest('GET', '/api/users?q=XXXXXXXX', null, $this->adminToken);
        $body     = $this->jsonBody($response);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertCount(0, $body['data']);
    }

    public function testListUsersSupportsPagination(): void
    {
        $response = $this->jsonRequest('GET', '/api/users?page=1&limit=1', null, $this->adminToken);
        $body     = $this->jsonBody($response);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertCount(1, $body['data']);
        $this->assertSame(2, $body['total']);
        $this->assertSame(1, $body['limit']);
    }

    // ─── GET /api/users/{id} ───────────────────────────────────────────────────

    public function testShowUserReturnsCorrectData(): void
    {
        $response = $this->jsonRequest('GET', "/api/users/{$this->adminUserId}", null, $this->adminToken);
        $body     = $this->jsonBody($response);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame($this->adminUserId, $body['id']);
        $this->assertSame('admin@test.com', $body['email']);
        $this->assertSame('Martin', $body['nom']);
        $this->assertSame('Alice', $body['prenom']);
        $this->assertSame('ROLE_ADMIN', $body['role']);
        $this->assertArrayNotHasKey('password', $body);
    }

    public function testShowUserReturns404ForUnknownId(): void
    {
        $response = $this->jsonRequest('GET', '/api/users/99999', null, $this->adminToken);

        $this->assertSame(404, $response->getStatusCode());
    }

    // ─── PUT/PATCH /api/users/{id} ─────────────────────────────────────────────

    public function testUpdateUserModifiesNomAndPrenom(): void
    {
        $response = $this->jsonRequest('PUT', "/api/users/{$this->regularUserId}", [
            'nom'    => 'Nouveau',
            'prenom' => 'Prénom',
        ], $this->adminToken);

        $this->assertSame(200, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertSame('Nouveau', $body['nom']);
        $this->assertSame('Prénom', $body['prenom']);
    }

    public function testUpdateUserWithPatchMethod(): void
    {
        $response = $this->jsonRequest('PATCH', "/api/users/{$this->regularUserId}", [
            'nom' => 'NomModifié',
        ], $this->adminToken);

        $this->assertSame(200, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertSame('NomModifié', $body['nom']);
    }

    public function testUpdateUserEmailSucceeds(): void
    {
        $response = $this->jsonRequest('PUT', "/api/users/{$this->regularUserId}", [
            'email' => 'newemail@test.com',
        ], $this->adminToken);

        $this->assertSame(200, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertSame('newemail@test.com', $body['email']);
    }

    public function testUpdateUserEmailDuplicateReturns409(): void
    {
        $response = $this->jsonRequest('PUT', "/api/users/{$this->regularUserId}", [
            'email' => 'admin@test.com',
        ], $this->adminToken);

        $this->assertSame(409, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertArrayHasKey('error', $body);
    }

    public function testUpdateUserPasswordIsHashed(): void
    {
        $response = $this->jsonRequest('PUT', "/api/users/{$this->regularUserId}", [
            'password' => 'NouveauPass123!',
        ], $this->adminToken);

        $this->assertSame(200, $response->getStatusCode());

        $loginResponse = $this->jsonRequest('POST', '/api/auth/login', [
            'email'    => 'user@test.com',
            'password' => 'NouveauPass123!',
        ]);
        $this->assertSame(200, $loginResponse->getStatusCode());
    }

    public function testUpdateUserChangesRole(): void
    {
        $response = $this->jsonRequest('PUT', "/api/users/{$this->regularUserId}", [
            'role' => 'ROLE_ADMIN',
        ], $this->adminToken);

        $this->assertSame(200, $response->getStatusCode());
        $body = $this->jsonBody($response);
        $this->assertSame('ROLE_ADMIN', $body['role']);
    }

    public function testUpdateUserReturns404ForUnknownId(): void
    {
        $response = $this->jsonRequest('PUT', '/api/users/99999', [
            'nom' => 'Test',
        ], $this->adminToken);

        $this->assertSame(404, $response->getStatusCode());
    }

    // ─── DELETE /api/users/{id} ────────────────────────────────────────────────

    public function testDeleteUserReturns204(): void
    {
        $response = $this->jsonRequest('DELETE', "/api/users/{$this->regularUserId}", null, $this->adminToken);

        $this->assertSame(204, $response->getStatusCode());
    }

    public function testDeleteUserThenShowReturns404(): void
    {
        $this->jsonRequest('DELETE', "/api/users/{$this->regularUserId}", null, $this->adminToken);

        $response = $this->jsonRequest('GET', "/api/users/{$this->regularUserId}", null, $this->adminToken);

        $this->assertSame(404, $response->getStatusCode());
    }

    public function testDeleteUserReturns404ForUnknownId(): void
    {
        $response = $this->jsonRequest('DELETE', '/api/users/99999', null, $this->adminToken);

        $this->assertSame(404, $response->getStatusCode());
    }

    public function testResponseNeverExposesPassword(): void
    {
        $response = $this->jsonRequest('GET', "/api/users/{$this->adminUserId}", null, $this->adminToken);
        $body     = $this->jsonBody($response);

        $this->assertArrayNotHasKey('password', $body);
    }
}
