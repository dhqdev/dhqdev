// Busca os dados do perfil via GitHub GraphQL e calcula as estatísticas.
// Usa GITHUB_TOKEN (o token automático da Action já basta para dados públicos).
// Com um PAT em PROFILE_TOKEN, entram também contribuições/linguagens privadas.

const API = 'https://api.github.com/graphql';
const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

async function gql(token, query, variables) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-arcade' },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && !json.errors) return json.data;
    const msg = json.errors ? JSON.stringify(json.errors) : `HTTP ${res.status}`;
    if (attempt === 3) throw new Error(`GraphQL falhou: ${msg}`);
    console.warn(`  ! tentativa ${attempt} falhou (${msg}), tentando de novo...`);
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
}

const CAL = `contributionCalendar{ totalContributions weeks{ contributionDays{ date contributionCount contributionLevel } } }`;
const TOTALS = `totalCommitContributions totalIssueContributions totalPullRequestContributions totalPullRequestReviewContributions totalRepositoryContributions restrictedContributionsCount`;

export async function fetchData(login, token) {
  if (!token) throw new Error('Defina GITHUB_TOKEN (ou PROFILE_TOKEN) para buscar os dados.');

  let base;
  try {
    base = await gql(token, `query($login:String!){
      user(login:$login){
        name login createdAt company location
        followers{totalCount} following{totalCount}
        publicRepos: repositories(ownerAffiliations:OWNER, privacy:PUBLIC){totalCount}
        contributionsCollection{ contributionYears ${TOTALS} ${CAL} }
      }
    }`, { login });
  } catch (e) {
    console.warn('  ! consulta completa falhou, usando a mínima:', e.message);
    base = await gql(token, `query($login:String!){
      user(login:$login){ name login createdAt company location contributionsCollection{ contributionYears ${TOTALS} ${CAL} } }
    }`, { login });
  }
  const u = base.user;
  if (!u) throw new Error(`Usuário ${login} não encontrado`);
  const lyCal = u.contributionsCollection.contributionCalendar;

  // calendário de todos os anos (para streak recorde e totais all-time)
  const years = [...u.contributionsCollection.contributionYears].sort();
  const allDays = new Map();
  let allTotal = 0, allCommits = 0;
  try {
    for (const y of years) {
      const d = await gql(token, `query($login:String!,$from:DateTime!,$to:DateTime!){
        user(login:$login){ contributionsCollection(from:$from,to:$to){ ${TOTALS} ${CAL} } }
      }`, { login, from: `${y}-01-01T00:00:00Z`, to: new Date(Math.min(Date.parse(`${y}-12-31T23:59:59Z`), Date.now())).toISOString() });
      const cc = d.user.contributionsCollection;
      allTotal += cc.contributionCalendar.totalContributions;
      allCommits += cc.totalCommitContributions + cc.restrictedContributionsCount;
      for (const w of cc.contributionCalendar.weeks) for (const day of w.contributionDays) allDays.set(day.date, day.contributionCount);
    }
  } catch (e) {
    console.warn('  ! histórico completo indisponível, usando só o último ano:', e.message);
    allDays.clear();
    allTotal = lyCal.totalContributions;
    allCommits = u.contributionsCollection.totalCommitContributions + u.contributionsCollection.restrictedContributionsCount;
  }
  // garante que o último ano esteja no mapa (e com os números mais recentes)
  for (const w of lyCal.weeks) for (const day of w.contributionDays) allDays.set(day.date, day.contributionCount);

  // repositórios (linguagens + estrelas)
  const langs = new Map();
  let stars = 0, cursor = null, repoCount = 0;
  try {
    do {
      const d = await gql(token, `query($login:String!,$cursor:String){
        user(login:$login){
          repositories(ownerAffiliations:OWNER, isFork:false, first:100, after:$cursor){
            pageInfo{hasNextPage endCursor}
            nodes{ stargazerCount languages(first:10, orderBy:{field:SIZE,direction:DESC}){ edges{ size node{ name color } } } }
          }
        }
      }`, { login, cursor });
      const r = d.user.repositories;
      for (const n of r.nodes) {
        repoCount++;
        stars += n.stargazerCount;
        for (const e of n.languages.edges) {
          const cur = langs.get(e.node.name) || { name: e.node.name, color: e.node.color || '#b967ff', size: 0 };
          cur.size += e.size;
          langs.set(e.node.name, cur);
        }
      }
      cursor = r.pageInfo.hasNextPage ? r.pageInfo.endCursor : null;
    } while (cursor);
  } catch (e) {
    console.warn('  ! não deu para ler as linguagens:', e.message);
  }

  const cc = u.contributionsCollection;
  return {
    login: u.login,
    name: u.name,
    createdAt: u.createdAt,
    company: u.company,
    location: u.location,
    followers: u.followers?.totalCount ?? 0,
    following: u.following?.totalCount ?? 0,
    publicRepos: u.publicRepos?.totalCount ?? repoCount,
    ownedRepos: repoCount,
    stars,
    lastYear: {
      total: cc.contributionCalendar.totalContributions,
      commits: cc.totalCommitContributions + cc.restrictedContributionsCount,
      prs: cc.totalPullRequestContributions,
      issues: cc.totalIssueContributions,
      reviews: cc.totalPullRequestReviewContributions,
      newRepos: cc.totalRepositoryContributions,
      weeks: cc.contributionCalendar.weeks.map((w) =>
        w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, level: LEVEL[d.contributionLevel] ?? 0 })),
      ),
    },
    allTime: { total: allTotal, commits: allCommits, days: Object.fromEntries([...allDays].sort()) },
    languages: [...langs.values()],
    generatedAt: new Date().toISOString(),
  };
}

/** Estatísticas derivadas (streaks, dia da semana, melhor dia...) */
export function enrich(data, { excludeLanguages = [] } = {}) {
  const days = Object.entries(data.allTime.days)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  const lastDate = data.lastYear.weeks.flat().map((d) => d.date).sort().pop();
  const upto = days.filter((d) => d.date <= lastDate);

  // streak recorde
  let longest = 0, run = 0, runStart = null, lStart = null, lEnd = null;
  for (const d of upto) {
    if (d.count > 0) {
      if (run === 0) runStart = d.date;
      run++;
      if (run > longest) { longest = run; lStart = runStart; lEnd = d.date; }
    } else run = 0;
  }
  // streak atual (hoje sem contribuição ainda não quebra a sequência)
  let current = 0;
  let i = upto.length - 1;
  if (i >= 0 && upto[i].count === 0) i--;
  while (i >= 0 && upto[i].count > 0) { current++; i--; }

  const ly = data.lastYear.weeks.flat();
  const weekday = [0, 0, 0, 0, 0, 0, 0];
  let best = { date: null, count: 0 }, active = 0;
  for (const d of ly) {
    const wd = new Date(d.date + 'T12:00:00Z').getUTCDay();
    weekday[wd] += d.count;
    if (d.count > best.count) best = d;
    if (d.count > 0) active++;
  }

  const langs = data.languages.filter((l) => !excludeLanguages.includes(l.name)).sort((a, b) => b.size - a.size);
  const totalSize = langs.reduce((s, l) => s + l.size, 0) || 1;
  const languages = langs.map((l) => ({ ...l, pct: (l.size / totalSize) * 100 }));

  return {
    ...data,
    languages,
    streak: { current, longest, longestStart: lStart, longestEnd: lEnd },
    weekday,
    bestDay: best,
    activeDays: active,
    lastDate,
  };
}

/** Dados fictícios para testar o visual localmente (node scripts/generate.mjs --mock) */
export function mockData(login = 'dhqdev') {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const end = new Date(Date.UTC(2026, 10, 26));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 364 - end.getUTCDay());
  const weeks = [];
  const days = {};
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const wd = d.getUTCDay();
    if (wd === 0 || !weeks.length) weeks.push([]);
    const weekend = wd === 0 || wd === 6;
    const busy = rnd() < (weekend ? 0.35 : 0.85);
    const count = busy ? Math.floor(rnd() * rnd() * 28) + 1 : 0;
    const date = d.toISOString().slice(0, 10);
    weeks[weeks.length - 1].push({ date, count, level: count === 0 ? 0 : count < 4 ? 1 : count < 9 ? 2 : count < 16 ? 3 : 4 });
    days[date] = count;
  }
  const total = weeks.flat().reduce((s, d) => s + d.count, 0);
  return {
    login, name: 'David Fernandes', createdAt: '2023-04-03T13:48:27Z', company: 'GRV Software', location: 'Campinas',
    followers: 45, following: 67, publicRepos: 64, ownedRepos: 80, stars: 23,
    lastYear: { total, commits: Math.round(total * 0.86), prs: 41, issues: 9, reviews: 17, newRepos: 22, weeks },
    allTime: { total: total * 2 + 311, commits: Math.round(total * 1.7), days },
    languages: [
      { name: 'Python', color: '#3572A5', size: 4200000 }, { name: 'JavaScript', color: '#f1e05a', size: 3100000 },
      { name: 'TypeScript', color: '#3178c6', size: 2100000 }, { name: 'HTML', color: '#e34c26', size: 1300000 },
      { name: 'CSS', color: '#563d7c', size: 700000 }, { name: 'Shell', color: '#89e051', size: 120000 },
      { name: 'Dockerfile', color: '#384d54', size: 20000 },
    ],
    generatedAt: new Date().toISOString(),
  };
}
