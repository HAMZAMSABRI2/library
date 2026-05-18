<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/auth', name: 'api_auth_')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserRepository $userRepository,
        private JWTTokenManagerInterface $jwtManager,
        private UserPasswordHasherInterface $hasher,
    ) {}

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['email']) || empty($data['password'])) {
            return $this->json(['error' => 'Email et mot de passe requis'], 400);
        }

        $user = $this->userRepository->findOneBy(['email' => $data['email']]);

        if (!$user || !$this->hasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['error' => 'Identifiants invalides'], 401);
        }

        $token = $this->jwtManager->createFromPayload($user, [
            'email' => $user->getEmail(),
            'role'  => $user->getRole(),
        ]);

        return $this->json([
            'token' => $token,
            'user'  => [
                'id'     => $user->getId(),
                'email'  => $user->getEmail(),
                'nom'    => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'role'   => $user->getRole(),
            ],
        ]);
    }

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $required = ['email', 'password', 'nom', 'prenom'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return $this->json(['error' => "Le champ '$field' est requis"], 400);
            }
        }

        if ($this->userRepository->findOneBy(['email' => $data['email']])) {
            return $this->json(['error' => 'Cet email est déjà utilisé'], 409);
        }

        $user = new User();
        $user->setEmail($data['email'])
             ->setNom($data['nom'])
             ->setPrenom($data['prenom'])
             ->setRole($data['role'] ?? 'ROLE_USER');

        $user->setPassword(
            $this->hasher->hashPassword($user, $data['password'])
        );

        $this->em->persist($user);
        $this->em->flush();

        $token = $this->jwtManager->createFromPayload($user, [
            'email' => $user->getEmail(),
            'role'  => $user->getRole(),
        ]);

        return $this->json([
            'token' => $token,
            'user'  => [
                'id'     => $user->getId(),
                'email'  => $user->getEmail(),
                'nom'    => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'role'   => $user->getRole(),
            ],
        ], 201);
    }
}
