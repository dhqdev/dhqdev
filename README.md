<!-- 🕹️ Perfil arcade — os SVGs são gerados por scripts/generate.mjs (veja o final da página) -->
<div align="center">

<img src="./assets/banner.svg" width="100%" alt="David Fernandes — Desenvolvedor Full Stack"/>

<a href="https://planejai.tekvosoft.com"><img src="https://img.shields.io/badge/planejai.tekvosoft.com-0d0221?style=for-the-badge&logo=googlechrome&logoColor=ff2a6d" alt="Site"/></a>
<a href="https://github.com/dhqdev?tab=followers"><img src="https://img.shields.io/github/followers/dhqdev?style=for-the-badge&logo=github&logoColor=05d9e8&label=seguidores&labelColor=0d0221&color=150734" alt="Seguidores"/></a>
<img src="https://komarev.com/ghpvc/?username=dhqdev&label=visitas&color=ff2a6d&style=for-the-badge" alt="Visitas"/>

<br/><br/>

<img src="https://raw.githubusercontent.com/dhqdev/dhqdev/output/neofetch.svg" width="100%" alt="Terminal neofetch com informações do David"/>

<img src="https://raw.githubusercontent.com/dhqdev/dhqdev/output/stats.svg" width="100%" alt="Placar de commits: contribuições, commits e streaks"/>

<img src="https://raw.githubusercontent.com/dhqdev/dhqdev/output/lab.svg" width="100%" alt="Linguagens mais usadas e ritmo semanal de contribuições"/>

<img src="https://raw.githubusercontent.com/dhqdev/dhqdev/output/invaders.svg" width="100%" alt="Space Invaders destruindo o gráfico de contribuições"/>

<img src="./assets/stack.svg" width="100%" alt="Stack: HTML5, CSS3, JavaScript, TypeScript, Python, Angular, React, Node.js, Frappe, Docker, Git, GitHub, Notion, Trello"/>

<img src="./assets/footer.svg" width="100%" alt="Valeu pela visita!"/>

</div>

<details>
<summary>🕹️ <b>Como esse perfil funciona?</b></summary>
<br/>

Tudo aqui é SVG animado feito à mão, sem serviços externos: uma fonte pixel própria, sprites de Space Invaders e CSS/SMIL.

- `scripts/generate.mjs` busca seus dados na API GraphQL do GitHub e desenha os cards (terminal, placar, linguagens e o Space Invaders).
- A Action [`profile.yml`](.github/workflows/profile.yml) roda a cada 6 horas e publica os SVGs na branch `output`.
- Banner, stack e rodapé ficam em `assets/`. Para mudar textos, edite `scripts/profile.config.mjs` e rode `node scripts/generate.mjs --static`.
- Quer testar o visual sem token? `node scripts/generate.mjs --mock`.

</details>
