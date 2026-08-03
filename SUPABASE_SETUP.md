# Configuracao Supabase multiempresa para o NPS

## Projeto atual

- Nome: Gestao 360
- Ref: `fqdndfizwxlscrgiwvjc`
- URL: `https://fqdndfizwxlscrgiwvjc.supabase.co`
- Regiao: South America (Sao Paulo)

## Modelo multiempresa

- `organizations`: empresas/tenants.
- `organization_members`: usuarios do Supabase Auth vinculados a cada empresa.
- `nps_surveys`: pesquisas/formularios NPS de uma empresa.
- `nps_survey_branches`: filiais/unidades vinculadas a uma pesquisa.
- `nps_responses`: respostas NPS vinculadas a organizacao, pesquisa e filial.

A resposta publica nao escreve diretamente nas tabelas. A API server-side chama a RPC `submit_nps_response`, que resolve organizacao/pesquisa/filial no banco, define `submitted_at` no servidor e usa `submission_id` para impedir duplicidade.

## Variaveis de ambiente

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_PUBLISHABLE_KEY=sua-chave-publishable-ou-anon-legacy
SUPABASE_SECRET_KEY=sua-chave-secret-ou-service-role-apenas-no-servidor
APP_ORIGIN=https://www.maissaudelab.com.br
NEXT_PUBLIC_TURNSTILE_SITE_KEY=sua-chave-publica-turnstile
TURNSTILE_SECRET_KEY=sua-chave-secreta-turnstile
NPS_DEFAULT_ORGANIZATION_SLUG=mais-saude
NPS_DEFAULT_SURVEY_SLUG=atendimento
```

`SUPABASE_SECRET_KEY` nunca deve ir para o navegador. Na Netlify, deixe essa variavel apenas no contexto Production e marcada como segredo. As variaveis `NPS_*`, `APP_ORIGIN`, `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` nao sao segredos, mas devem continuar no ambiente correto.

## Publicacao Netlify

- Build command: `npm run build`
- Publish directory: `.next`
- Dominio final: `https://www.maissaudelab.com.br`
- NPS: `/nps` e `/nps/[filial]`
- Login: `/login`
- Dashboard: `/dashboard`

Antes de apontar o dominio oficial, configure Turnstile na Cloudflare e cadastre `www.maissaudelab.com.br` como hostname permitido. Enquanto estiver testando na URL temporaria, adicione tambem o hostname Netlify no Turnstile ou use `APP_ORIGIN` com a URL temporaria.

## RLS e MFA

As policies usam membership por organizacao e exigem sessao `aal2` com token recente. Na pratica, o usuario precisa entrar com senha e concluir TOTP em `/login/mfa` antes de acessar `/dashboard`.

No Supabase Auth, desative cadastro publico e cadastre usuarios administrativamente. A senha temporaria do Renan deve ser rotacionada antes de liberar ao cliente.

## Criar nova organizacao futuramente

1. Inserir uma linha em `organizations` com `slug`, `name` e `status='active'`.
2. Criar uma ou mais linhas em `nps_surveys` para essa organizacao.
3. Criar as filiais em `nps_survey_branches` apontando para a pesquisa.
4. Criar ou convidar usuarios no Supabase Auth.
5. Vincular os usuarios em `organization_members` com `role` `owner`, `admin` ou `viewer`.
6. Criar uma rota/configuracao que resolva `organization_slug` e `survey_slug` para o novo cliente.

## Backup

O Supabase Free nao inclui backup automatico. Use o workflow `.github/workflows/supabase-backup.yml` com estes secrets no GitHub:

- `SUPABASE_DB_URL`: Session Pooler/Postgres URL com senha percent-encoded.
- `AGE_RECIPIENT`: chave publica age para criptografar artefatos.

A chave privada age deve ficar fora do GitHub, em gerenciador de senhas e copia offline.

## Checklist antes de producao

- Aplicar `supabase/migrations/002_harden_nps_security.sql`.
- Rodar Supabase Advisors.
- Configurar Turnstile e variaveis Netlify Production.
- Rotacionar senha temporaria do Renan e concluir MFA.
- Testar envio NPS real e verificar no Supabase.
- Testar que usuario sem membership ou sem AAL2 nao acessa dashboard.
- Fazer restore inicial do backup criptografado.
