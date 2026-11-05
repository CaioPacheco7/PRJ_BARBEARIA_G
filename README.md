# PRJ_BARBEARIA_G

Site da **Guina Alto Estilo**, barbearia em Licínio de Almeida (BA), desde 2010.
Versão de demonstração em HTML, CSS e JS puros, sem build e sem dependências.

## Rodar localmente

```bash
npx http-server . -p 5173 -c-1
```

Abra http://127.0.0.1:5173/ (ou dê dois cliques no `index.html`; as fontes do Google exigem internet).

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
