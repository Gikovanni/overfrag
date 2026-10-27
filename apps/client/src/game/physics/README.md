# Física local

`LocalSimulation` usa `@overfrag/shared/physics` e a mesma geometria da sala.
Simula em passo fixo de 30 Hz e interpola somente a pose visual da câmera.
Pausa ao entrar na sala estática e reseta ao sair. O mundo é liberado no teardown.
Regras de movimento estão em `docs/movement.md`; F03 integrará o servidor e a reconciliação.
