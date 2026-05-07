<?php

namespace App\Repository;

use App\Entity\Livre;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class LivreRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Livre::class);
    }

    public function findBySearch(string $q, int $page = 1, int $limit = 20): array
    {
        $offset = ($page - 1) * $limit;
        $qb = $this->createQueryBuilder('l')
            ->where('l.titre LIKE :q OR l.auteur LIKE :q OR l.isbn LIKE :q')
            ->setParameter('q', "%$q%")
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->orderBy('l.titre', 'ASC');

        return $qb->getQuery()->getResult();
    }
}
