<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/users', name: 'api_users_')]
class UserController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private EntityManagerInterface $em
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $q     = $request->query->get('q', '');
        $page  = max(1, (int) $request->query->get('page', 1));
        $limit = min(100, max(1, (int) $request->query->get('limit', 20)));

        if ($q) {
            $users = $this->userRepository->createQueryBuilder('u')
                ->where('u.nom LIKE :q OR u.prenom LIKE :q OR u.email LIKE :q')
                ->setParameter('q', "%$q%")
                ->setFirstResult(($page - 1) * $limit)
                ->setMaxResults($limit)
                ->getQuery()->getResult();
        } else {
            $users = $this->userRepository->findBy([], ['nom' => 'ASC'], $limit, ($page - 1) * $limit);
        }

        return $this->json([
            'data'  => array_map(fn(User $u) => $this->serialize($u), $users),
            'total' => $this->userRepository->count([]),
            'page'  => $page,
            'limit' => $limit,
        ]);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(User $user): JsonResponse
    {
        return $this->json($this->serialize($user));
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(User $user, Request $request, UserPasswordHasherInterface $hasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!empty($data['email']) && $data['email'] !== $user->getEmail()) {
            if ($this->userRepository->findOneBy(['email' => $data['email']])) {
                return $this->json(['error' => 'Cet email est déjà utilisé'], 409);
            }
            $user->setEmail($data['email']);
        }
        if (!empty($data['password'])) {
            $user->setPassword($hasher->hashPassword($user, $data['password']));
        }
        if (!empty($data['nom']))    $user->setNom($data['nom']);
        if (!empty($data['prenom'])) $user->setPrenom($data['prenom']);
        if (!empty($data['role']))   $user->setRole($data['role']);

        $this->em->flush();

        return $this->json($this->serialize($user));
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(User $user): JsonResponse
    {
        $this->em->remove($user);
        $this->em->flush();

        return $this->json(null, 204);
    }

    private function serialize(User $u): array
    {
        return [
            'id'     => $u->getId(),
            'email'  => $u->getEmail(),
            'nom'    => $u->getNom(),
            'prenom' => $u->getPrenom(),
            'role'   => $u->getRole(),
        ];
    }
}
