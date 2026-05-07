<?php

namespace App\Repository;

use App\Entity\Emprunt;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class EmpruntRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Emprunt::class);
    }

    public function findByUser(int $userId): array
    {
        return $this->createQueryBuilder('e')
            ->join('e.livre', 'l')
            ->addSelect('l')
            ->where('e.user = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('e.dateEmprunt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
