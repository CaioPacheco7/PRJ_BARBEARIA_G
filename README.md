# PRJ_BARBEARIA_G

Site da **Guina Alto Estilo**, barbearia em Licínio de Almeida (BA), desde 2010.
Versão de demonstração em HTML, CSS e JS puros, sem build e sem dependências.

## Rodar localmente

```bash
node scripts/dev-server.js
```

Abra http://127.0.0.1:5173/ (o painel e a API só funcionam por esse servidor; abrir o `index.html` direto
mostra o site com os valores de partida; as fontes do Google exigem internet).

## Painel de administração (preços e horários)

O Guina altera preços e horários em `/admin/` (cadeado discreto no rodapé do site). Ao salvar, o site público
já mostra os novos valores. O HTML guarda os valores de partida; o que o painel salva sobrescreve só o que mudou.

```
admin/            tela de login e painel (index.html, admin.css, admin.js)
api/config.js     GET público (o site lê) e PUT protegido (o painel salva)
api/login.js      entrar (trava o IP depois de 8 senhas erradas em 15 min)
api/session.js    o painel pergunta se já está logado
api/logout.js     sair
api/_lib/         código compartilhado (não vira endereço público)
scripts/dev-server.js   servidor local: site + API juntos
vercel.json       cabeçalhos de segurança do painel (noindex, CSP, sem iframe)
```

**Rodar localmente:** crie `.env.local` com `ADMIN_PASSWORD=sua-senha` (o arquivo não vai para o git) e rode
`node scripts/dev-server.js`. Abra http://127.0.0.1:5173/ e o painel em http://127.0.0.1:5173/admin/.
Em desenvolvimento os dados ficam em `.data/config.json`.

**Para funcionar na Vercel (uma vez só):**
1. Crie um banco **Upstash Redis** (Vercel → projeto → Storage → Marketplace) e conecte ao projeto. Isso cria
   `KV_REST_API_URL` e `KV_REST_API_TOKEN` (ou `UPSTASH_REDIS_REST_URL` e `..._TOKEN`), que o código já reconhece.
2. Em Settings → Environment Variables, crie `ADMIN_PASSWORD` com uma senha forte (Production e Preview).
3. Faça um novo deploy. Sem o passo 1 o painel abre mas avisa que não consegue salvar; sem o passo 2 o login fica desativado.

**Trocar a senha:** altere `ADMIN_PASSWORD` na Vercel e faça redeploy. Todas as sessões abertas caem.

**Adicionar um serviço novo** (hoje o painel edita os 16 existentes): incluir em `index.html` e em `api/_lib/defaults.js`
com o mesmo número. Depois rode `node scripts/check-defaults.js`: ele avisa se os dois lugares saírem de sincronia.

## Responsividade

Testado de 184 px (relógio) a 5120 px de largura, em pé e deitado: celulares Android e iPhone, dobráveis,
tablets, notebooks, monitores, TV/4K e quiosque. Pontos de quebra principais: 240, 320, 380, 560, 700, 900
(menu hambúrguer e botão fixo "Agendar") e 2400 px (a interface cresce junto com a tela). Entre 601 e 900 px em pé
(iPad) o hero e as seções usam duas colunas.

## Estrutura

```
index.html        página única (hero, a casa, tabela, cortes, agendamento, onde, rodapé)
css/style.css     estilos e responsividade
js/main.js        links do WhatsApp, animações ao rolar, menu mobile, chat de exemplo
assets/           logo (original e versões claras) e favicon
assets/fotos/     fotos do site (ver LEIA-ME.txt e CREDITOS.txt)
```

## O que ainda é provisório

- **Fotos:** todas já são reais (interior, fachada, praça, cadeira infantil e a galeria de cortes),
  exceto o fundo do topo (`hero.jpg`), que é uma imagem gerada por IA.
  Trocar salvando com o mesmo nome em `assets/fotos/` (lista em `assets/fotos/LEIA-ME.txt`).
- **Depoimentos:** a seção `#depoimentos` usa comentários reais do Instagram do Guina (capturas de tela).
  Confirmar com ele e com os autores que podem ser exibidos; para acrescentar, copiar um `<article>` em `index.html`.
- **Preços da tabela:** valores de exemplo. Editar em `index.html` (seção `#tabela`)
  e remover a nota "valores de exemplo".
- **Horários:** vêm do menu do bot (grade dos "demais dias" e grade das sextas), na seção `#tabela` (Serviços e valores), logo abaixo da lista de preços.
  Confirmar com o Guina quais dias da semana ele abre (hoje o site diz só "Demais dias").
- **WhatsApp e Instagram:** número e @ configurados em `js/main.js` e `index.html`.
