# Movimento local

O controlador compartilhado prepara um movimento por tick de 1/30 s. O dono do
mundo chama `world.step()` depois de preparar os personagens. O render apenas
interpola poses; não escolhe o timestep nem resolve colisões.

## Regras e unidades

- Metros, segundos e radianos, Y para cima. Posição é o centro real da cápsula.
- Cápsula em pé: raio 0,35 m e segmento de meia altura 0,55 m (altura total 1,8 m).
- Cápsula agachada: mesmo raio, segmento de meia altura 0,25 m (altura total 1,2 m).
- Redimensionar move o centro para preservar os pés. Levantar exige consulta de
  interseção com a cápsula em pé na posição candidata, excluindo o próprio corpo e sensores.
- Offset de contato: 0,01 m; rampas até 45°; degraus até 0,3 m, largura mínima
  0,2 m. Autostep apenas em pé e no chão; sem subir corpos dinâmicos.
- Snap ao piso: 0,2 m, apenas no chão e sem pular. Sensores não bloqueiam movimento.
- Grupos: mundo = 1, jogador = 2. Queries do controlador filtram os mesmos grupos.
- Valores de velocidade, aceleração, atrito, gravidade e slide ficam em `MOVEMENT`.

## Estados e prioridades

| Estado    | Entrada                                                | Saída                                                         |
| --------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| Grounded  | Contato válido com piso                                | Pulo ou perda de contato                                      |
| Sprinting | No chão, Shift, intenção para frente e em pé           | Soltar Shift, parar de ir para frente, agachar, slide ou pulo |
| Crouched  | Ctrl, slide ou teto impedindo levantar                 | Soltar Ctrl e possuir espaço para levantar                    |
| Sliding   | Borda de C, chão, velocidade ≥ 6 m/s e cooldown zerado | 0,75 s, pulo ou perda do chão                                 |
| Airborne  | Pulo ou ausência de piso                               | Contato válido com o piso                                     |

Pulo tem prioridade sobre iniciar slide. Um slide usa a direção e velocidade
existentes, desacelera 6 m/s² e não adiciona impulso. Ao terminar, aplica cooldown
de 0,5 s. Air control é limitado e a velocidade aérea não passa de 8 m/s.
Não há tactical sprint, coyote time, jump buffer nem bunny hop automático nesta etapa.
No ar sem input conserva-se o momentum horizontal; no chão sem input aplica-se atrito.
Velocidade horizontal representa o momentum solicitado ao solver; colisões podem
reduzir o deslocamento efetivo, medido separadamente na apresentação.

## Limite de autoridade

Esta entrega serve ao treino local. A sala online continua estática até F03.
O controlador poderá ser usado no servidor; inputs recebidos precisarão passar
por validação, fila e orçamento de tempo. Nenhuma posição local será aceita como
estado oficial. Rapier entre ambientes ainda exige prediction/reconciliation.
