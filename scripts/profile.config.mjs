// ✏️  Edite aqui os textos do perfil. Depois rode `node scripts/generate.mjs --static`
// para regerar os SVGs estáticos (banner, stack, rodapé) — os dinâmicos a Action gera sozinha.

export default {
  login: 'dhqdev',
  title: 'DAVID FERNANDES',
  fullName: 'David Queiroz Viotti Fernandes',
  role: 'Full Stack Developer',
  location: 'Campinas-SP, Brasil',
  company: 'GRV Software',
  focus: 'web full stack & data science',

  // Frases que são "digitadas" no banner
  phrases: [
    'DESENVOLVEDOR FULL STACK',
    'PYTHON • JAVASCRIPT • TYPESCRIPT',
    'ANGULAR • REACT • NODE • FRAPPE',
    'IOT • ERP • IA • AUTOMAÇÃO',
    'CAMPINAS-SP • BRASIL',
  ],

  // Tela "SELECT YOUR STACK"
  stack: [
    { name: 'HTML5', tag: 'HT', color: '#E34F26', cls: 'FRONT-END', quote: 'O ESQUELETO DE TUDO' },
    { name: 'CSS3', tag: 'CS', color: '#2D8CF0', cls: 'FRONT-END', quote: 'PIXEL PERFECT... QUASE' },
    { name: 'JAVASCRIPT', tag: 'JS', color: '#F7DF1E', cls: 'FULL STACK', quote: 'RODA EM TODO LUGAR' },
    { name: 'TYPESCRIPT', tag: 'TS', color: '#3B8EEA', cls: 'FULL STACK', quote: 'JS COM ARMADURA' },
    { name: 'PYTHON', tag: 'PY', color: '#FFD43B', cls: 'BACK-END • DADOS', quote: 'CAFÉ ENTRA, SCRIPT SAI' },
    { name: 'ANGULAR', tag: 'NG', color: '#FF3B5C', cls: 'FRONT-END', quote: 'EXÉRCITO DE COMPONENTES' },
    { name: 'REACT', tag: 'RE', color: '#61DAFB', cls: 'FRONT-END', quote: 'ESTADO SOB CONTROLE' },
    { name: 'NODE.JS', tag: 'ND', color: '#6CC24A', cls: 'BACK-END', quote: 'BACK-END EM TEMPO REAL' },
    { name: 'FRAPPE', tag: 'FR', color: '#2E9BFF', cls: 'ERP • BACK-END', quote: 'ERP NO MODO HARD' },
    { name: 'DOCKER', tag: 'DK', color: '#2496ED', cls: 'DEVOPS', quote: 'SUA MÁQUINA = MINHA' },
    { name: 'GIT', tag: 'GT', color: '#F05032', cls: 'VERSIONAMENTO', quote: 'COMMIT, PUSH, REPETE' },
    { name: 'GITHUB', tag: 'GH', color: '#F8F7FF', cls: 'COLABORAÇÃO', quote: 'BASE DE OPERAÇÕES' },
    { name: 'NOTION', tag: 'NO', color: '#D9D9D9', cls: 'ORGANIZAÇÃO', quote: 'SEGUNDO CÉREBRO' },
    { name: 'TRELLO', tag: 'TR', color: '#1E8BFF', cls: 'ORGANIZAÇÃO', quote: 'TO DO → DOING → DONE' },
    { name: '???', tag: '??', color: '#b967ff', cls: 'DESBLOQUEANDO', quote: 'PRÓXIMA FASE...' },
  ],
};
