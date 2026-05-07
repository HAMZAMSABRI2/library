<?php

namespace App\Controller;

use App\Entity\Livre;
use App\Repository\LivreRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/livres', name: 'api_livres_')]
class LivreController extends AbstractController
{
    public function __construct(
        private LivreRepository $livreRepository,
        private EntityManagerInterface $em
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $q     = $request->query->get('q', '');
        $page  = max(1, (int) $request->query->get('page', 1));
        $limit = min(100, max(1, (int) $request->query->get('limit', 20)));

        $livres = $q
            ? $this->livreRepository->findBySearch($q, $page, $limit)
            : $this->livreRepository->findBy([], ['titre' => 'ASC'], $limit, ($page - 1) * $limit);

        $total = $q
            ? count($this->livreRepository->findBySearch($q, 1, 9999))
            : $this->livreRepository->count([]);

        return $this->json([
            'data'  => array_map(fn(Livre $l) => $this->serialize($l), $livres),
            'total' => $total,
            'page'  => $page,
            'limit' => $limit,
        ]);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(Livre $livre): JsonResponse
    {
        return $this->json($this->serialize($livre));
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        foreach (['isbn', 'titre', 'auteur'] as $field) {
            if (empty($data[$field])) {
                return $this->json(['error' => "Le champ '$field' est requis"], 400);
            }
        }

        if ($this->livreRepository->findOneBy(['isbn' => $data['isbn']])) {
            return $this->json(['error' => 'Cet ISBN existe déjà'], 409);
        }

        $livre = (new Livre())
            ->setIsbn($data['isbn'])
            ->setTitre($data['titre'])
            ->setAuteur($data['auteur'])
            ->setEditeur($data['editeur'] ?? null)
            ->setAnnee(!empty($data['annee']) ? (int) $data['annee'] : null)
            ->setStock(isset($data['stock']) ? (int) $data['stock'] : 3)
            ->setImageUrl($data['image_url'] ?? null);

        $this->em->persist($livre);
        $this->em->flush();

        return $this->json($this->serialize($livre), 201);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(Livre $livre, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['titre']))    $livre->setTitre($data['titre']);
        if (isset($data['auteur']))   $livre->setAuteur($data['auteur']);
        if (array_key_exists('editeur', $data))   $livre->setEditeur($data['editeur']);
        if (array_key_exists('annee', $data))      $livre->setAnnee($data['annee'] !== null ? (int) $data['annee'] : null);
        if (isset($data['stock']))    $livre->setStock((int) $data['stock']);
        if (array_key_exists('image_url', $data)) $livre->setImageUrl($data['image_url']);

        $this->em->flush();

        return $this->json($this->serialize($livre));
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(Livre $livre): JsonResponse
    {
        $this->em->remove($livre);
        $this->em->flush();

        return $this->json(null, 204);
    }

    private function serialize(Livre $l): array
    {
        return [
            'id'        => $l->getId(),
            'isbn'      => $l->getIsbn(),
            'titre'     => $l->getTitre(),
            'auteur'    => $l->getAuteur(),
            'editeur'   => $l->getEditeur(),
            'annee'     => $l->getAnnee(),
            'stock'     => $l->getStock(),
            'image_url' => $l->getImageUrl(),
        ];
    }
}
