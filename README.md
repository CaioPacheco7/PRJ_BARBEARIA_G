# PRJ_BARBEARIA_G

Site da **Guina Alto Estilo**, barbearia em Licínio de Almeida (BA), desde 2010.
Versão de demonstração em HTML, CSS e JS puros, sem build e sem dependências.

## Rodar localmente

```bash
npx http-server . -p 5173 -c-1
```

Abra http://127.0.0.1:5173/ (ou dê dois cliques no `index.html`; as fontes do Google exigem internet).

## Estrutura

```
index.html        página única (hero, a casa, tabela, cortes, agendamento, onde, rodapé)
css/style.css     estilos e responsividade
js/main.js        links do WhatsApp, animações ao rolar, menu mobile, chat de exemplo
assets/           logo (original e versões claras) e favicon
assets/fotos/     fotos do site (ver LEIA-ME.txt e CREDITOS.txt)
```

## O que ainda é provisório

- **Fotos:** vêm de banco de imagens gratuito (Pexels). Trocar pelas fotos reais do Guina,
  salvando com o mesmo nome em `assets/fotos/` (lista em `assets/fotos/LEIA-ME.txt`).
- **Preços da tabela:** valores de exemplo. Editar em `index.html` (seção `#tabela`)
  e remover a nota "valores de exemplo".
- **Horário de funcionamento:** ainda não incluído.
- **WhatsApp e Instagram:** número e @ configurados em `js/main.js` e `index.html`.
