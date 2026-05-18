#!/bin/sh
set -e

# Generate JWT keys if missing
if [ ! -f config/jwt/private.pem ]; then
  mkdir -p config/jwt
  openssl genpkey -algorithm RSA -out config/jwt/private.pem \
    -aes256 -pass pass:"${JWT_PASSPHRASE}" -pkeyopt rsa_keygen_bits:4096
  openssl pkey -in config/jwt/private.pem \
    -out config/jwt/public.pem -pubout -passin pass:"${JWT_PASSPHRASE}"
fi

exec php -S 0.0.0.0:8000 -t public
