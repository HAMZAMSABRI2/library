<?php

namespace App\Controller;

use App\Entity\Emprunt;
use App\Repository\EmpruntRepository;
use App\Repository\LivreRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/emprunts', name: 'api_emprunts_')]
class EmpruntController extends AbstractController
{
    public function __construct(
        private EmpruntRepository $empruntRepository,
        private LivreRepository $livreRepository,
        private UserRepository $userRepository,
        private EntityManagerInterface $em
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $userId = $request->query->get('user_id');
        $statut = $request->query->get('statut');
        $page   = max(1, (int) $request->query->get('page', 1));
        $limit  = min(100, max(1, (int) $request->query->get('limit', 20)));

        $qb = $this->empruntRepository->createQueryBuilder('e')
            ->join('e.livre', 'l')->addSelect('l')
            ->join('e.user', 'u')->addSelect('u')
            ->orderBy('e.dateEmprunt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        if ($userId) {
            $qb->andWhere('e.user = :userId')->setParameter('userId', (int) $userId);
        }
        if ($statut) {
            $qb->andWhere('e.statut = :statut')->setParameter('statut', $statut);
        }

        $emprunts = $qb->getQuery()->getResult();

        return $this->json([
            'data'  => array_map(fn(Emprunt $e) => $this->serialize($e), $emprunts),
            'total' => $this->empruntRepository->count([]),
            'page'  => $page,
            'limit' => $limit,
        ]);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(Emprunt $emprunt): JsonResponse
    {
        return $this->json($this->serialize($emprunt));
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['user_id']) || empty($data['livre_id'])) {
            return $this->json(['error' => 'user_id et livre_id sont requis'], 400);
        }

        $user  = $this->userRepository->find($data['user_id']);
        $livre = $this->livreRepository->find($data['livre_id']);

        if (!$user)  return $this->json(['error' => 'Utilisateur introuvable'], 404);
        if (!$livre) return $this->json(['error' => 'Livre introuvable'], 404);
        if ($livre->getStock() <= 0) {
            return $this->json(['error' => 'Livre indisponible (stock épuisé)'], 400);
        }

        $empruntActif = $this->empruntRepository->findOneBy([
            'user'   => $user,
            'livre'  => $livre,
            'statut' => 'en_cours',
        ]);
        if ($empruntActif) {
            return $this->json(['error' => 'Cet utilisateur a déjà ce livre en cours d\'emprunt'], 409);
        }

        $emprunt = (new Emprunt())->setUser($user)->setLivre($livre)->setStatut('en_cours');
        $livre->setStock($livre->getStock() - 1);

        $this->em->persist($emprunt);
        $this->em->flush();

        return $this->json($this->serialize($emprunt), 201);
    }

    #[Route('/{id}/retour', name: 'retour', methods: ['PATCH'])]
    public function retour(Emprunt $emprunt): JsonResponse
    {
        if ($emprunt->getStatut() === 'rendu') {
            return $this->json(['error' => 'Ce livre a déjà été rendu'], 400);
        }

        $emprunt->setStatut('rendu')->setDateRetour(new \DateTime());
        $emprunt->getLivre()->setStock($emprunt->getLivre()->getStock() + 1);
        $this->em->flush();

        return $this->json($this->serialize($emprunt));
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(Emprunt $emprunt): JsonResponse
    {
        if ($emprunt->getStatut() === 'en_cours') {
            $emprunt->getLivre()->setStock($emprunt->getLivre()->getStock() + 1);
        }

        $this->em->remove($emprunt);
        $this->em->flush();

        return $this->json(null, 204);
    }

    private function serialize(Emprunt $e): array
    {
        return [
            'id'           => $e->getId(),
            'user_id'      => $e->getUser()->getId(),
            'user_nom'     => $e->getUser()->getNom().' '.$e->getUser()->getPrenom(),
            'livre_id'     => $e->getLivre()->getId(),
            'livre_titre'  => $e->getLivre()->getTitre(),
            'livre_auteur' => $e->getLivre()->getAuteur(),
            'date_emprunt' => $e->getDateEmprunt()->format('Y-m-d'),
            'date_retour'  => $e->getDateRetour()?->format('Y-m-d'),
            'statut'       => $e->getStatut(),
        ];
    }
}
