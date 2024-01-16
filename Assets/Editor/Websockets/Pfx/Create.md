    openssl req -x509 -newkey rsa:4096 -keyout privateKey.key -out certificate.crt -days 3650 -subj '/CN=CN' -nodes

    openssl pkcs12 -export -out certificate.pfx -inkey privateKey.key -in certificate.crt -macalg SHA1 -certpbe PBE-SHA1-3DES -keypbe PBE-SHA1-3DES
    
    
    pwd: 7758  