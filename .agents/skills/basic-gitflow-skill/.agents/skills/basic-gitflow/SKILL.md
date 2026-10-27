---
name: basic-gitflow
description: Use esta skill ao iniciar ou concluir uma tarefa de implementação que exija criar uma branch a partir da main, realizar commits organizados e abrir um Pull Request para a main.
---

# Basic Git Flow para Codex

## Objetivo
Trabalhar em branches de feature isoladas, com commits claros e Pull Requests direcionados à `main`. Este é um fluxo simplificado (GitHub Flow), não o Git Flow clássico com `develop` e branches de release.

## Convenções
- Branch principal: `main`.
- Nomes de branch: `feature/<descricao-curta>`, `fix/<descricao-curta>`, `chore/<descricao-curta>`.
- Usar letras minúsculas e hífens. Ex.: `feature/weapon-reload`.
- Commits preferencialmente em Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Cada Pull Request deve ter escopo pequeno e objetivo claro.

## Antes de começar
1. Inspecionar o repositório: `git status --short --branch`, `git branch -a` e `git remote -v`.
2. Se houver alterações locais não relacionadas, **não** descartá-las, resetá-las ou guardá-las em stash automaticamente. Perguntar como proceder se impedirem a troca de branch.
3. Confirmar que existe a branch `main` local ou `origin/main`. Se o repositório usar outro nome para a principal, confirmar antes de continuar.
4. Atualizar referências com `git fetch origin`, caso haja remoto e conectividade.
5. Criar a branch a partir de `origin/main` atualizado (ou `main` local se não houver remoto), sem sobrescrever trabalho existente:
   - `git switch -c feature/<descricao-curta> origin/main`
   - Alternativa sem remoto: `git switch main && git switch -c feature/<descricao-curta>`.
6. Se já estiver em uma branch de tarefa apropriada, reutilizá-la; nunca criar branches duplicadas sem necessidade.

## Durante a implementação
1. Implementar apenas o escopo pedido.
2. Não modificar arquivos não relacionados.
3. Executar testes, lint ou build disponíveis e relevantes.
4. Inspecionar o diff com `git diff` e `git status --short`.
5. Preparar somente os arquivos referentes à tarefa (`git add <caminhos>` em vez de `git add .` quando houver mudanças não relacionadas).
6. Criar commit com uma mensagem descritiva, por exemplo: `feat: add weapon reload animation`.
7. Nunca usar `git reset --hard`, `git clean -fd`, force push ou rebase destrutivo sem autorização explícita.

## Pull Request
1. Verificar se existe remoto configurado e autenticação disponível.
2. Quando o usuário tiver solicitado a entrega com PR e as ferramentas/credenciais permitirem, publicar a branch: `git push -u origin <nome-da-branch>`.
3. Abrir PR para `main`, por exemplo: `gh pr create --base main --head <nome-da-branch> --title "..." --body "..."`.
4. Incluir na descrição do PR:
   - **Resumo:** o que mudou;
   - **Validação:** testes executados e seus resultados;
   - **Observações:** limitações, riscos e próximos passos.
5. Não executar merge automaticamente. Não apagar a branch remotamente.
6. Se não houver `gh`, autorização, acesso ao GitHub ou remoto, informar o bloqueio e fornecer os comandos ou a URL para o usuário abrir o PR manualmente. Nunca afirmar que um PR foi criado sem confirmação.

## Checklist de conclusão
- [ ] Branch adequada criada a partir da principal correta.
- [ ] Implementação limitada ao escopo.
- [ ] Testes relevantes executados (ou impossibilidade documentada).
- [ ] Diff revisado; nenhuma alteração indevida adicionada ao commit.
- [ ] Commit com mensagem clara.
- [ ] PR direcionado à `main` quando solicitado e possível.
- [ ] Resumo final com branch, commit, testes e URL do PR (se criado).

## Regras prioritárias
- Não sobrescrever mudanças do usuário.
- Não commitar credenciais, arquivos `.env`, segredos ou artefatos desnecessários.
- Não fazer merge em `main` sem solicitação explícita.
- Se a tarefa pedir apenas análise ou explicação, não alterar o Git.
