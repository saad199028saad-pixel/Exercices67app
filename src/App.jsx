import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/* ============ 1. DONNÉES (remplaçables) ============ */
const MODULE = { univ: 'Université Hassan II de Casablanca', fac: 'Faculté des Sciences Ben M’Sik (FSBM)', dep: 'Département Mathématiques et Informatique', fil: 'Licence d’Excellence', sem: 'S5', mod: 'Analyse de données', serie: 'Série n°1 – 2025/2026' };
const R = String.raw;
const EXERCISES = [
  { id: 'ex7', title: 'Exercice 7 : Arrivées de clients',
    intro: R`On observe 100 fois le nombre $X$ de clients arrivant à un guichet pendant 5 minutes. Relevé :

| $x_i$ | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| $n_i$ | 15 | 25 | 26 | 20 | 7 | 7 |`,
    qs: [
      R`Dresser le tableau statistique complet ($f_i$, $N_i$, $F_i$).`,
      R`Calculer la moyenne, le mode et les quartiles $Q_1$, $Q_2$, $Q_3$.`,
      R`Calculer la variance, l’écart-type et l’intervalle interquartile.`,
      R`Tracer le diagramme en bâtons et la boîte à moustaches (avec les barrières $Q_1 - 1{,}5\,IQR$ et $Q_3 + 1{,}5\,IQR$).`,
      R`Pour une loi de Poisson, $\mathrm{Var}(X) = E(X)$. Calculer l’indice de dispersion $I = \sigma^2/\bar{x}$ et conclure : sur- ou sous-dispersion ? Un modèle de Poisson est-il adapté ?`] },
  { id: 'ex8', title: 'Exercice 8 : Distribution des salaires',
    intro: R`Salaires horaires de 200 salariés (en Dhs) :

| Salaire horaire | [10 ; 16[ | [16 ; 20[ | [20 ; 30[ | [30 ; 40[ | [40 ; 80[ | [80 ; 150[ |
|---|---|---|---|---|---|---|
| Nombre de salariés | 20 | 60 | 80 | 20 | 10 | 10 |

*Table 5 : Distribution des salaires horaires.*`,
    qs: [
      R`Compléter le tableau statistique (centres, amplitudes, densités, $f_i$, $N_i$, $F_i$) et tracer l’histogramme.`,
      R`Calculer la classe modale, le mode, la médiane, les quartiles, la moyenne, la variance et l’écart-type.`,
      R`Calculer le coefficient de variation $CV = \sigma/\bar{x}$ et l’interpréter.`,
      R`Étudier la forme de la distribution : calculer le coefficient d’asymétrie de Pearson par deux formules, $AP_1 = \dfrac{\bar{x} - M_o}{\sigma}$ et $AP_2 = \dfrac{3(\bar{x} - M_e)}{\sigma}$, puis celui de Yule-Bowley. Interpréter et justifier le choix de l’indicateur de tendance centrale le plus représentatif.`,
      R`Construire la courbe de Lorenz (à partir des masses salariales approchées $n_i c_i$) et estimer l’indice de Gini. Quelle part de la masse salariale revient aux 10 % les mieux payés ?`,
      R`(Valeurs atypiques) Les 10 salariés de $[80 ; 150[$ sont-ils des valeurs atypiques ? Comment l’écart-type et la moyenne changeraient-ils sans eux ?`] },
  { id: 'syn', title: 'Exercice de synthèse : Temps de trajet des étudiants',
    intro: R`**Contexte.** Un service de la faculté étudie le temps de trajet quotidien entre le domicile et la faculté. On interroge $n = 21$ étudiants et on note $X$ le temps de trajet, en minutes (variable quantitative continue). Relevé brut, dans l’ordre de collecte :

**25 ; 40 ; 15 ; 30 ; 19 ; 35 ; 12 ; 28 ; 22 ; 18 ; 45 ; 25 ; 10 ; 30 ; 20 ; 50 ; 15 ; 25 ; 35 ; 90 ; 20**

*Conventions (identiques aux exercices 7 et 8) :* la variance se calcule en divisant par $n$ ; pour un quantile d’ordre $p$, on calcule $p \times n$, on l’arrondit au rang entier supérieur $k$ et on lit la $k$-ième valeur de la série ordonnée.

*Objectif :* réinvestir tous les outils de la Série n°1 (tendance centrale, position, dispersion, graphiques, valeurs atypiques) et surtout **interpréter** chaque résultat dans le contexte. Pour chaque question, vous disposez d’indices progressifs puis d’une correction détaillée.`,
    qs: [
      R`Ranger les 21 observations par ordre croissant, puis dresser le tableau statistique en classes de largeur 20 minutes ($[0 ; 20[$, …, $[80 ; 100[$) avec $n_i$, $f_i$, $N_i$, $F_i$.`,
      R`Tendance centrale : déterminer le mode, la moyenne $\bar{x}$ et la médiane $M_e$. Comparer ces trois valeurs et en déduire la forme de la distribution.`,
      R`Position : calculer les quartiles $Q_1$, $Q_2$, $Q_3$ puis le premier et le neuvième décile $D_1$, $D_9$. Interpréter chaque valeur dans le contexte.`,
      R`Dispersion (1) : calculer l’étendue $E = x_{\max} - x_{\min}$ et l’intervalle interquartile $IQR = Q_3 - Q_1$. Lequel des deux décrit le mieux la dispersion de la majorité des étudiants ? Pourquoi ?`,
      R`Dispersion (2) : calculer la variance $\sigma^2 = \dfrac{1}{n}\,\sum x_i^2 - \bar{x}^2$ et l’écart-type $\sigma$. Interpréter $\sigma$ dans l’unité de l’énoncé.`,
      R`Dispersion relative : calculer le coefficient de variation $CV = \sigma/\bar{x}$. La distance domicile-faculté des mêmes étudiants a pour moyenne $12$ km et pour écart-type $6$ km. Du temps de trajet ou de la distance, lequel est relativement le plus dispersé ? Pourquoi ne peut-on pas comparer directement les deux écarts-types ?`,
      R`Graphiques : tracer (ou décrire) l’histogramme du tableau de la question 1, puis la boîte à moustaches de la série (en y plaçant la moyenne). Que révèlent ces graphiques sur la forme de la distribution ?`,
      R`Valeurs atypiques : calculer les barrières $Q_1 - 1{,}5\,IQR$ et $Q_3 + 1{,}5\,IQR$. Existe-t-il des valeurs atypiques ? Recalculer la moyenne, la médiane, l’écart-type et l’étendue sans elles, puis comparer : quels indicateurs sont sensibles, lesquels sont robustes ?`,
      R`Synthèse : en 4 à 6 lignes, résumer la distribution du temps de trajet (valeur typique, dispersion, forme, valeurs atypiques) en choisissant et en justifiant les indicateurs les plus représentatifs.`] },
].map(e => ({ ...e, qs: e.qs.map((t, i) => ({ id: `${e.id}q${i + 1}`, n: i + 1, t })) }));
const ALLQ = EXERCISES.flatMap(e => e.qs.map(q => ({ ...q, ex: e.id })));

const VF = ['Vrai', 'Faux'];
const QUIZ = [
  { id: 'z1', topic: 'Moyenne d’une série discrète', q: 'Exercice 7 : la moyenne du nombre de clients vaut', o: ['2,5', '3', '3,5', '4'], ok: 1, why: 'x̄ = (1×15 + 2×25 + 3×26 + 4×20 + 5×7 + 6×7)/100 = 300/100 = 3.' },
  { id: 'z2', topic: 'Quartiles (série discrète)', q: 'Exercice 7 : le troisième quartile Q3 vaut', o: ['3', '4', '5', '6'], ok: 1, why: 'N = 100, Q3 correspond à la 75e observation. N(3) = 66 < 75 ≤ N(4) = 86, donc Q3 = 4.' },
  { id: 'z3', topic: 'Variance', q: 'Exercice 7 : la variance de X vaut', o: ['1,4', '1,96', '3', '10,96'], ok: 1, why: 'E(X²) = 1096/100 = 10,96 puis Var(X) = 10,96 − 3² = 1,96. La valeur 1,4 est l’écart-type.' },
  { id: 'z4', topic: 'Indice de dispersion', q: 'Exercice 7 : I = σ²/x̄ ≈ 0,65 < 1, la série est donc sous-dispersée par rapport à une loi de Poisson.', o: VF, ok: 0, why: 'Pour une loi de Poisson, I = 1. Ici 1,96/3 ≈ 0,65 < 1 : sous-dispersion, donc le modèle de Poisson n’est pas pleinement adapté.' },
  { id: 'z5', topic: 'Boîte à moustaches', q: 'Exercice 7 : la barrière supérieure Q3 + 1,5·IQR vaut', o: ['5', '6', '7', '8'], ok: 2, why: 'Q1 = 2 et Q3 = 4 donc IQR = 2. Barrière supérieure : 4 + 1,5×2 = 7.' },
  { id: 'z6', topic: 'Mode et densité', q: 'Pour des classes d’amplitudes inégales, la classe modale est celle de plus grande densité (nᵢ/aᵢ) et non de plus grand effectif.', o: VF, ok: 0, why: 'Exercice 8 : [20 ; 30[ a le plus grand effectif (80) mais [16 ; 20[ a la plus grande densité (15), c’est la classe modale.' },
  { id: 'z7', topic: 'Médiane (données groupées)', q: 'Exercice 8 : la médiane vaut', o: ['20', '22,5', '25', '28,95'], ok: 1, why: 'N/2 = 100 tombe dans [20 ; 30[ (effectif cumulé 80 avant). Me = 20 + 10×(100 − 80)/80 = 22,5.' },
  { id: 'z8', topic: 'Coefficient de variation', q: 'Exercice 8 : avec x̄ = 28,95 et σ ≈ 22,13, le coefficient de variation vaut', o: ['≈ 0,24', '≈ 0,76', '≈ 1,31', '≈ 22,13'], ok: 1, why: 'CV = σ/x̄ = 22,13/28,95 ≈ 0,76 (≈ 76 %), dispersion relative très forte.' },
  { id: 'z9', topic: 'Asymétrie', q: 'Un coefficient AP₂ = 3(x̄ − Me)/σ ≈ 0,87 > 0 indique', o: ['une distribution étalée à droite (asymétrie positive)', 'une distribution symétrique', 'une distribution étalée à gauche', 'une distribution uniforme'], ok: 0, why: 'x̄ > Me : la moyenne est tirée vers les grandes valeurs, la queue de distribution est à droite.' },
  { id: 'z10', topic: 'Choix de l’indicateur central', q: 'Pour une distribution asymétrique à droite avec valeurs extrêmes, l’indicateur de tendance centrale le plus représentatif est', o: ['la moyenne', 'la médiane', 'l’étendue', 'la variance'], ok: 1, why: 'La médiane est robuste aux valeurs extrêmes. L’étendue et la variance sont des indicateurs de dispersion.' },
  { id: 'z11', topic: 'Valeurs atypiques', q: 'Exercice 8 : retirer les 10 salariés de [80 ; 150[ diminue à la fois la moyenne et l’écart-type.', o: VF, ok: 0, why: 'Sans eux, 4640/190 ≈ 24,4 (contre 28,95) et σ ≈ 10,3 (contre ≈ 22,1).' },
  { id: 'z12', topic: 'Courbe de Lorenz et Gini', q: 'L’indice de Gini est compris entre 0 et 1 et vaut 0 en cas d’égalité parfaite.', o: VF, ok: 0, why: 'Gini = 0 : égalité parfaite (la courbe de Lorenz suit la diagonale). Il tend vers 1 quand la concentration est maximale.' },
];

/* ============ 1 bis. TABLEAUX STATISTIQUES INTERACTIFS ============
   Seules les données de l'énoncé sont préremplies (x_i, n_i, classes). Les cellules à compléter sont vides.
   Les colonnes de l'énoncé : Ex.7 Q1 -> f_i, N_i, F_i ; Ex.8 Q1 -> centres, amplitudes, densités, f_i, N_i, F_i.
   `exp` / `expT` ne servent QUE au contrôle de cohérence facultatif (jamais affichés). */
/* PURE:START */
const sum = a => a.reduce((s, x) => s + x, 0);
const cum = a => a.map((_, i) => sum(a.slice(0, i + 1)));
const N7 = [15, 25, 26, 20, 7, 7]; const T7 = sum(N7); const C7 = cum(N7);
const CL8 = [[10, 16], [16, 20], [20, 30], [30, 40], [40, 80], [80, 150]]; const N8 = [20, 60, 80, 20, 10, 10]; const T8 = sum(N8); const C8 = cum(N8);
/* Exercice de synthèse : 21 temps de trajet (min), relevé brut dans l'ordre de collecte, et classes de largeur 20 min. */
const RAW9 = [25, 40, 15, 30, 19, 35, 12, 28, 22, 18, 45, 25, 10, 30, 20, 50, 15, 25, 35, 90, 20];
const CL9 = [[0, 20], [20, 40], [40, 60], [60, 80], [80, 100]]; const N9 = CL9.map(([lo, hi]) => RAW9.filter(v => v >= lo && v < hi).length); const T9 = sum(N9); const C9 = cum(N9);
const TABLES = {
  ex7q1: {
    title: 'Tableau statistique de la série',
    caption: 'X : nombre de clients arrivant au guichet pendant 5 minutes (100 observations).',
    note: 'Complétez les colonnes f_i, N_i et F_i, ainsi que la ligne Total (n_i et f_i). Les fréquences se saisissent en décimal (0,15) ou en pourcentage (15 %).',
    cols: [
      { k: 'x', h: R`x_i`, name: 'modalité x_i', given: true },
      { k: 'n', h: R`n_i`, name: 'effectif n_i', given: true },
      { k: 'f', h: R`f_i`, name: 'fréquence f_i', pct: true },
      { k: 'N', h: R`N_i`, name: 'effectif cumulé N_i' },
      { k: 'F', h: R`F_i`, name: 'fréquence cumulée F_i', pct: true }],
    rows: N7.map((n, i) => ({ label: `x = ${i + 1}`, given: { x: String(i + 1), n: String(n) } })),
    total: { edit: ['n', 'f'] },
    exp: i => ({ f: N7[i] / T7, N: C7[i], F: C7[i] / T7 }),
    expT: { n: T7, f: 1 } },
  ex8q1: {
    title: 'Tableau statistique de la distribution des salaires horaires',
    caption: 'Table 5 : salaire horaire en Dhs, 200 salariés.',
    note: 'Complétez les centres, amplitudes, densités, f_i, N_i, F_i et la ligne Total (n_i et f_i). Les fréquences se saisissent en décimal ou en pourcentage. L’histogramme se décrit dans la zone de rédaction ci-dessous.',
    cols: [
      { k: 'cl', h: R`\text{Classe}`, unit: 'Dhs', name: 'classe', given: true },
      { k: 'n', h: R`n_i`, name: 'effectif n_i', given: true },
      { k: 'c', h: R`c_i`, unit: 'centre (Dhs)', name: 'centre c_i' },
      { k: 'a', h: R`a_i`, unit: 'amplitude (Dhs)', name: 'amplitude a_i' },
      { k: 'd', h: R`d_i`, unit: 'salariés par Dhs', name: 'densité d_i' },
      { k: 'f', h: R`f_i`, name: 'fréquence f_i', pct: true },
      { k: 'N', h: R`N_i`, name: 'effectif cumulé N_i' },
      { k: 'F', h: R`F_i`, name: 'fréquence cumulée F_i', pct: true }],
    rows: CL8.map(([lo, hi], i) => ({ label: `[${lo} ; ${hi}[`, given: { cl: `[${lo} ; ${hi}[`, n: String(N8[i]) } })),
    total: { edit: ['n', 'f'] },
    exp: i => { const [lo, hi] = CL8[i]; return { c: (lo + hi) / 2, a: hi - lo, d: N8[i] / (hi - lo), f: N8[i] / T8, N: C8[i], F: C8[i] / T8 }; },
    expT: { n: T8, f: 1 } },
  synq1: {
    title: 'Tableau statistique du temps de trajet',
    caption: 'X : temps de trajet domicile-faculté (minutes), 21 étudiants, classes de largeur 20 min.',
    note: 'Comptez les effectifs n_i de chaque classe (borne inférieure incluse, borne supérieure exclue), puis complétez f_i, N_i, F_i et la ligne Total (n_i et f_i). Les fréquences se saisissent en décimal ou en pourcentage.',
    cols: [
      { k: 'cl', h: R`\text{Classe}`, unit: 'min', name: 'classe', given: true },
      { k: 'n', h: R`n_i`, name: 'effectif n_i' },
      { k: 'f', h: R`f_i`, name: 'fréquence f_i', pct: true },
      { k: 'N', h: R`N_i`, name: 'effectif cumulé N_i' },
      { k: 'F', h: R`F_i`, name: 'fréquence cumulée F_i', pct: true }],
    rows: CL9.map(([lo, hi]) => ({ label: `[${lo} ; ${hi}[`, given: { cl: `[${lo} ; ${hi}[` } })),
    total: { edit: ['n', 'f'] },
    exp: i => ({ n: N9[i], f: N9[i] / T9, N: C9[i], F: C9[i] / T9 }),
    expT: { n: T9, f: 1 } },
};
const rowIdx = def => [...def.rows.keys()];
const isEditable = (def, c, r) => (r === 'T' ? def.total.edit.includes(c.k) : !c.given);
const editableKeys = def => def.cols.flatMap(c => [...rowIdx(def), ...(def.total ? ['T'] : [])].filter(r => isEditable(def, c, r)).map(r => `${r}:${c.k}`));
const cellTotal = def => editableKeys(def).length;
const parseNum = s => {
  const t = String(s ?? '').replace(/[\s  ]/g, '').replace(/[−–]/g, '-').replace(',', '.'); if (!t) return null;
  const m = /^([+-]?(?:\d+\.?\d*|\.\d+))(%?)$/.exec(t); if (!m) return null;
  const v = parseFloat(m[1]); return { v: m[2] ? v / 100 : v, pct: !!m[2] };
};
const sanitizeCell = v => v.replace(/[^\d.,%\-−+\s]/g, '').slice(0, 14);
const normCell = s => { const t = s.trim(); if (!t) return ''; if (!parseNum(t)) return t; const r = t.replace(/\s/g, '').replace(/−/g, '-').replace('.', ','); return r.endsWith('%') ? r.slice(0, -1) + ' %' : r; };
/** Renvoie l'ensemble des clés de cellules renseignées mais incohérentes avec les données de l'énoncé. */
const verifyTable = (def, vals) => {
  const bad = new Set(); let n = 0;
  editableKeys(def).forEach(k => {
    const v = String(vals[k] ?? '').trim(); if (!v) return; n++;
    const [r, ck] = k.split(':'); const col = def.cols.find(c => c.k === ck); const e = r === 'T' ? def.expT[ck] : def.exp(+r)[ck]; const p = parseNum(v);
    if (!p || e == null) { bad.add(k); return; }
    const near = (a, b) => Math.abs(a - b) <= (Number.isInteger(b) ? 1e-6 : Math.max(0.006, 0.015 * Math.abs(b)));
    if (!(near(p.v, e) || (col.pct && !p.pct && p.v > 1 && near(p.v / 100, e)))) bad.add(k);
  });
  return { bad, n };
};

/* --- LaTeX -> texte lisible pour le PDF (jsPDF ne sait pas composer du LaTeX) --- */
let UNI = false; // true si une police Unicode (DejaVu) est chargée dans le PDF
const GREEK = { sigma: 'σ', mu: 'μ', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', lambda: 'λ', theta: 'θ', pi: 'π', rho: 'ρ', chi: 'χ', tau: 'τ', phi: 'φ', omega: 'ω', epsilon: 'ε', varepsilon: 'ε', Sigma: 'Σ', Delta: 'Δ', Omega: 'Ω' };
const SYM = { sum: '∑', leq: '≤', le: '≤', geq: '≥', ge: '≥', cdot: '·', times: '×', approx: '≈', neq: '≠', ne: '≠', pm: '±', infty: '∞', to: '→', rightarrow: '→', Rightarrow: '⇒', in: '∈', ldots: '…', cdots: '…', int: '∫', div: '÷', mid: '|', sim: '~', quad: ' ', qquad: ' ' };
const SUPM = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '+': '⁺', '-': '⁻' };
const SUBM = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', '+': '₊', '-': '₋' };
const script = (b, map, mark) => (UNI && b && [...b].every(c => map[c]) ? [...b].map(c => map[c]).join('') : b.length > 1 ? `${mark}(${b})` : `${mark}${b}`);
const par = a => { const t = a.trim(); return /^[\w.̄\\]+$/.test(t) ? t : `(${t})`; };
const tex = s => {
  let t = s;
  for (let k = 0; k < 6; k++) {
    t = t.replace(/\\(?:bar|overline)\s*\{([^{}]*)\}/g, (_, a) => (UNI ? a + '̄' : a + '-barre'))
      .replace(/\\(?:mathrm|mathbf|mathit|text|textbf|operatorname|mathcal)\s*\{([^{}]*)\}/g, '$1')
      .replace(/\\hat\s*\{([^{}]*)\}/g, '$1^').replace(/\\sqrt\s*\{([^{}]*)\}/g, '√($1)')
      .replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (_, a, b) => `${par(a)}/${par(b)}`);
  }
  t = t.replace(/\{,\}/g, ',').replace(/\\(?:left|right)\s*/g, '').replace(/\\(?:,|;|:|!| )/g, ' ').replace(/\\%/g, '%')
    .replace(/\\([A-Za-z]+)/g, (_, n) => GREEK[n] ?? SYM[n] ?? n)
    .replace(/_\{([^{}]*)\}|_([A-Za-z0-9+-])/g, (_, a, b) => script(a ?? b, SUBM, '_'))
    .replace(/\^\{([^{}]*)\}|\^([A-Za-z0-9+-])/g, (_, a, b) => script(a ?? b, SUPM, '^'));
  return t.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
};
const ASCII = { 'σ': 'sigma', 'μ': 'mu', 'Σ': 'Somme', '∑': 'Somme', '≤': '<=', '≥': '>=', '−': '-', '–': '-', '—': '-', '→': '->', '⇒': '=>', '≈': '~', '≠': '!=', '’': "'", '‘': "'", '“': '"', '”': '"', '…': '...', 'œ': 'oe', 'Œ': 'OE', '√': 'racine', '•': '-', '∞': 'inf', '∈': 'dans', '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', 'ᵢ': 'i', '̄': '-barre', ' ': ' ', ' ': ' ', ' ': ' ' };
const UFIX = { 'ᵢ': '_i', 'ⱼ': '_j', 'ₙ': '_n', ' ': ' ', ' ': ' ', ' ': ' ' };
const charmap = s => (UNI ? [...s].map(c => UFIX[c] ?? c).join('') : [...s].map(c => ASCII[c] ?? (c.codePointAt(0) > 255 ? '?' : c)).join(''));
const inline = p => p.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/(^|[\s(])\*(\S(?:[^*]*?\S)?)\*(?=$|[\s).,;:!?])/g, '$1$2').replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
const rich = s => String(s ?? '').split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g).map((p, i) => (i % 2 ? charmap(tex(p.replace(/^\$\$?|\$\$?$/g, ''))) : charmap(inline(p)))).join('');
/* PURE:END */

/* ============ 1 quater. TABLEAUX DE CALCUL AUTOMATIQUES (moyenne, variance, écart-type) ============
   Moteur pur (sans React) : colonnes de base x_i et n_i + colonnes calculées par opérations entre colonnes
   (multiplication, addition, soustraction, carré). Chaque colonne calculée est décrite par une « spec »
   { id, op, a, b, k } : `a` et `b` sont des identifiants de colonnes, `k` une constante (à la place de `b`). */
/* CALC:START */
const r12 = v => (Number.isFinite(v) ? Number(v.toPrecision(12)) : v);
const fmtNum = (v, dec = 4) => {
  if (!Number.isFinite(v)) return '—';
  const r = Number(r12(v).toFixed(dec)); const [i, d] = Math.abs(r).toString().split('.');
  return (r < 0 ? '−' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0') + (d ? ',' + d : '');
};
const isExact = (v, dec = 4) => Number.isFinite(v) && Math.abs(Number(r12(v).toFixed(dec)) - r12(v)) < 1e-9;
const fmtTeX = s => s.replace('−', '-').replace(',', '{,}').replace(/\u00A0/g, '\\,');

const X9 = [...new Set(RAW9)].sort((a, b) => a - b); const NX9 = X9.map(v => RAW9.filter(u => u === v).length);
const SERIES = {
  s7: { label: 'Exercice 7 : série discrète', xh: 'x_i', x: N7.map((_, i) => i + 1), n: N7,
    info: 'Valeurs x_i (nombre de clients) et effectifs n_i de l’énoncé.' },
  s8: { label: 'Exercice 8 : données groupées', xh: 'c_i', x: CL8.map(([lo, hi]) => (lo + hi) / 2), n: N8,
    info: 'Données groupées en classes : chaque classe est représentée par son centre c_i = (borne inf. + borne sup.) / 2.' },
  s9: { label: 'Synthèse : temps de trajet', xh: 'x_i', x: X9, n: NX9,
    info: 'Valeurs distinctes de la série (en minutes) avec leur effectif : ce tableau est exactement équivalent aux 21 observations brutes.' },
};
/* Questions qui disposent de l'atelier de calcul : série + tableau proposé par défaut (mean | var). */
const CALC = { ex7q2: { s: 's7', preset: 'mean' }, ex7q3: { s: 's7', preset: 'var' }, ex7q5: { s: 's7', preset: 'var' },
  ex8q2: { s: 's8', preset: 'var' }, ex8q3: { s: 's8', preset: 'var' },
  synq2: { s: 's9', preset: 'mean' }, synq5: { s: 's9', preset: 'var' }, synq6: { s: 's9', preset: 'var' } };
const MAXCOLS = 12;
const OPS = { mul: { sym: '×', name: 'Multiplication', bin: true }, add: { sym: '+', name: 'Addition', bin: true },
  sub: { sym: '−', name: 'Soustraction', bin: true }, sq: { sym: '²', name: 'Élévation au carré', bin: false } };
const OPF = { mul: (p, q) => p * q, add: (p, q) => p + q, sub: (p, q) => p - q, sq: p => p * p };

/** Évalue les colonnes : renvoie [x, n, ...colonnes calculées] avec valeurs, en-tête LaTeX, total Σ et « monôme » n^a·x^b (ou null). */
const evalCols = (series, specs) => {
  const out = [
    { id: 'x', base: true, h: series.xh, vals: series.x, tot: sum(series.x), mono: { n: 0, x: 1 }, usesN: false },
    { id: 'n', base: true, h: 'n_i', vals: series.n, tot: sum(series.n), mono: { n: 1, x: 0 }, usesN: true }];
  const by = { x: out[0], n: out[1] };
  const wrap = c => (c.op === 'add' || c.op === 'sub' ? `\\left(${c.h}\\right)` : c.h);
  for (const s of specs) {
    const f = OPF[s.op]; const A = by[s.a]; if (!f || !A) continue;
    const bin = OPS[s.op].bin; const B = bin && s.b ? by[s.b] : null; if (bin && !B && s.k == null) continue;
    const kt = s.k == null ? '' : fmtTeX(fmtNum(s.k, 6));
    const vals = A.vals.map((p, i) => r12(f(p, bin ? (B ? B.vals[i] : s.k) : undefined)));
    let h, mono = null;
    if (s.op === 'sq') { h = A.base ? `${A.h}^2` : `\\left(${A.h}\\right)^2`; if (A.mono) mono = { n: 2 * A.mono.n, x: 2 * A.mono.x }; }
    else if (s.op === 'mul') { h = B ? `${wrap(A)}\\,${wrap(B)}` : `${wrap(A)}\\cdot ${kt}`; if (B && A.mono && B.mono) mono = { n: A.mono.n + B.mono.n, x: A.mono.x + B.mono.x }; }
    else if (s.op === 'add') h = `${A.h} + ${B ? B.h : kt}`;
    else h = `${A.h} - ${B ? wrap(B) : kt}`;
    const c = { id: s.id, base: false, op: s.op, h, vals, tot: r12(sum(vals)), mono, usesN: A.usesN || !!(B && B.usesN) };
    out.push(c); by[s.id] = c;
  }
  return out;
};
/** Supprime une colonne calculée et, en cascade, toutes celles qui en dépendent. */
const removeCol = (specs, id) => {
  const gone = new Set([id]); let changed = true;
  while (changed) { changed = false; specs.forEach(s => { if (!gone.has(s.id) && (gone.has(s.a) || (s.b && gone.has(s.b)))) { gone.add(s.id); changed = true; } }); }
  return specs.filter(s => !gone.has(s.id));
};
const nextId = specs => 'k' + (Math.max(0, ...specs.map(s => +s.id.slice(1) || 0)) + 1);
const hasMono = (series, specs, m) => evalCols(series, specs).find(c => c.mono && c.mono.n === m.n && c.mono.x === m.x);
/** Garantit qu'une colonne de monôme n^a·x^b existe (la crée par opérations entre colonnes sinon). */
const ensureMono = (series, specs, m) => {
  const hit = hasMono(series, specs, m); if (hit) return { specs, id: hit.id };
  if (m.n === 0 && m.x === 2) { const id = nextId(specs); return { specs: [...specs, { id, op: 'sq', a: 'x', b: null, k: null }], id }; }
  if (m.n === 1 && m.x >= 1) {
    const r = m.x === 1 ? { specs, id: 'x' } : ensureMono(series, specs, { n: 0, x: m.x });
    const id = nextId(r.specs); return { specs: [...r.specs, { id, op: 'mul', a: 'n', b: r.id, k: null }], id };
  }
  return { specs, id: null };
};
/* Tableaux types : moyenne -> n_i x_i ; variance / écart-type -> n_i x_i, x_i², n_i x_i² */
const PRESETS = { mean: [{ n: 1, x: 1 }], var: [{ n: 1, x: 1 }, { n: 0, x: 2 }, { n: 1, x: 2 }] };
const applyPreset = (series, specs, key) => PRESETS[key].reduce((sp, m) => ensureMono(series, sp, m).specs, specs);
/** Moyenne, variance (formule de König-Huygens, division par n) et écart-type déduits des totaux Σ. */
const calcResults = ev => {
  const n = ev[1].tot; const get = (a, b) => ev.find(c => c.mono && c.mono.n === a && c.mono.x === b); const c1 = get(1, 1), c2 = get(1, 2); const r = { n };
  if (c1 && n) { r.s1 = c1.tot; r.mean = c1.tot / n; }
  if (c2 && n) { r.s2 = c2.tot; if (r.mean != null) { r.var = Math.max(0, r12(c2.tot / n - r.mean * r.mean)); r.sd = Math.sqrt(r.var); } }
  return r;
};
/* CALC:END */

/* ============ 1 ter. AIDE PÉDAGOGIQUE : indices progressifs + corrections (exercice de synthèse) ============
   Indexée par identifiant de question. `hints` : indices affichés un par un ; `sol` / `after` : correction détaillée
   (formule, calcul, résultat, interprétation), `plot` : figure insérée entre `sol` et `after`. */
const S9 = [...RAW9].sort((a, b) => a - b);
const qtl9 = p => S9[Math.ceil(p * S9.length - 1e-9) - 1];
const STAT9 = (() => {
  const n = S9.length, m = sum(S9) / n, Q1 = qtl9(0.25), Me = qtl9(0.5), Q3 = qtl9(0.75), I = Q3 - Q1, lo = Q1 - 1.5 * I, hi = Q3 + 1.5 * I; const ok = S9.filter(v => v >= lo && v <= hi);
  return { n, m, Q1, Me, Q3, lo, hi, wl: Math.min(...ok), wu: Math.max(...ok), out: S9.filter(v => v < lo || v > hi) };
})();
const HELP = {
  synq1: {
    hints: [
      R`Rangez d’abord les 21 valeurs par ordre croissant : cette série ordonnée vous servira pour presque toutes les questions suivantes (médiane, quartiles, déciles, valeurs extrêmes).`,
      R`Pour chaque classe $[a ; b[$, comptez les valeurs qui vérifient $a \leq x < b$. Contrôle : la somme des $n_i$ doit valoir 21. Ensuite $f_i = n_i / 21$, $N_i$ est le cumul des $n_i$ et $F_i$ le cumul des $f_i$.`],
    sol: R`**Étape 1 – ordonner la série** (21 valeurs) :

10 ; 12 ; 15 ; 15 ; 18 ; 19 ; 20 ; 20 ; 22 ; 25 ; 25 ; 25 ; 28 ; 30 ; 30 ; 35 ; 35 ; 40 ; 45 ; 50 ; 90

**Formules.** $f_i = \dfrac{n_i}{n}$, $\quad N_i = n_1 + \dots + n_i$, $\quad F_i = \dfrac{N_i}{n}$, avec $n = 21$.

**Étape 2 – compter** les valeurs de chaque classe (borne inférieure incluse, borne supérieure exclue), puis calculer les colonnes :

| Classe | $n_i$ | $f_i$ | $N_i$ | $F_i$ |
|---|---|---|---|---|
| [0 ; 20[ | 6 | 0,286 | 6 | 0,286 |
| [20 ; 40[ | 11 | 0,524 | 17 | 0,810 |
| [40 ; 60[ | 3 | 0,143 | 20 | 0,952 |
| [60 ; 80[ | 0 | 0 | 20 | 0,952 |
| [80 ; 100[ | 1 | 0,048 | 21 | 1 |
| **Total** | **21** | **1** | | |

*Les fréquences sont arrondies au millième : leur somme affichée peut différer de 1 de quelques millièmes.*

> **Interprétation.** La classe $[20 ; 40[$ est la plus peuplée : 11 étudiants sur 21 (environ 52 %). Au total, 17 étudiants sur 21 (environ 81 %) ont un trajet de moins de 40 minutes. La classe vide $[60 ; 80[$ suivie d’un étudiant isolé dans $[80 ; 100[$ annonce déjà une valeur très éloignée du reste de la série.` },
  synq2: {
    hints: [
      R`Mode : valeur d’effectif maximal (repérez les valeurs qui se répètent dans la série). Moyenne : $\bar{x} = \dfrac{1}{n}\sum x_i$. Médiane : valeur du milieu de la série **ordonnée**.`,
      R`$n = 21$ est impair : la médiane est la valeur de rang $\dfrac{n+1}{2} = 11$. Comparez ensuite $\bar{x}$, $M_e$ et $M_o$ : si $\bar{x} > M_e$, la distribution est étalée vers la droite.`],
    sol: R`**Mode.** La valeur 25 apparaît 3 fois (15, 20, 30 et 35 apparaissent 2 fois, les autres valeurs 1 fois) : $M_o = 25$ min.

**Moyenne.**
- Formule : $\bar{x} = \dfrac{1}{n}\sum_{i=1}^{n} x_i$
- Calcul : $\sum x_i = 10 + 12 + 15 + 15 + 18 + 19 + 20 + 20 + 22 + 25 + 25 + 25 + 28 + 30 + 30 + 35 + 35 + 40 + 45 + 50 + 90 = 609$
- Résultat : $\bar{x} = \dfrac{609}{21} = 29$ min

**Médiane.**
- Formule : $n$ impair, donc $M_e = x_{(\frac{n+1}{2})}$
- Calcul : $\dfrac{21+1}{2} = 11$ ; la 11e valeur de la série ordonnée est 25
- Résultat : $M_e = 25$ min

> **Interprétation.** Le trajet le plus fréquent et le trajet « du milieu » valent tous deux 25 min : la moitié des étudiants mettent au plus 25 min. La moyenne (29 min) est supérieure à la médiane : quelques trajets longs, surtout celui de 90 min, la tirent vers le haut. Comme $M_o = M_e < \bar{x}$, la distribution est **étalée à droite** (asymétrie positive). Ici, la médiane décrit mieux le trajet « typique » que la moyenne.` },
  synq3: {
    hints: [
      R`Convention de l’énoncé : pour l’ordre $p$, calculez $p \times n$, arrondissez **au rang entier supérieur** $k$, puis lisez la $k$-ième valeur de la série ordonnée. Les quartiles correspondent à $p = 0{,}25$ ; $0{,}5$ ; $0{,}75$ et les déciles $D_1$, $D_9$ à $p = 0{,}1$ ; $0{,}9$.`,
      R`Rangs à calculer : $0{,}25 \times 21 = 5{,}25$ ; $0{,}5 \times 21 = 10{,}5$ ; $0{,}75 \times 21 = 15{,}75$ ; $0{,}1 \times 21 = 2{,}1$ ; $0{,}9 \times 21 = 18{,}9$. Arrondissez chacun au rang supérieur et lisez la série ordonnée de la question 1.`],
    sol: R`**Formule.** Le quantile d’ordre $p$ est $x_{(k)}$ avec $k = \lceil p \times n \rceil$ (arrondi au rang entier supérieur), où $n = 21$.

| Quantile | $p \times n$ | Rang $k$ | Valeur $x_{(k)}$ |
|---|---|---|---|
| $Q_1$ ($p = 0{,}25$) | 5,25 | 6 | **19** |
| $Q_2 = M_e$ ($p = 0{,}5$) | 10,5 | 11 | **25** |
| $Q_3$ ($p = 0{,}75$) | 15,75 | 16 | **35** |
| $D_1$ ($p = 0{,}1$) | 2,1 | 3 | **15** |
| $D_9$ ($p = 0{,}9$) | 18,9 | 19 | **45** |

> **Interprétation.**
> - $Q_1 = 19$ : au moins 25 % des étudiants (6 sur 21) mettent au plus 19 min.
> - $Q_2 = 25$ : la moitié des étudiants mettent au plus 25 min (c’est la médiane de la question 2).
> - $Q_3 = 35$ : au moins 75 % des étudiants (16 sur 21) mettent au plus 35 min.
> - $D_1 = 15$ : au moins 10 % des étudiants (3 sur 21) mettent au plus 15 min.
> - $D_9 = 45$ : au moins 90 % des étudiants (19 sur 21) mettent au plus 45 min ; seuls 2 étudiants (50 et 90 min) dépassent 45 min.` },
  synq4: {
    hints: [
      R`Étendue : $E = x_{\max} - x_{\min}$ (lisez les extrêmes dans la série ordonnée). Intervalle interquartile : $IQR = Q_3 - Q_1$ (utilisez les quartiles de la question 3).`,
      R`Demandez-vous laquelle de ces deux mesures dépend d’une seule observation extrême, et laquelle décrit uniquement la moitié centrale des étudiants.`],
    sol: R`**Formules.** $E = x_{\max} - x_{\min}$ et $IQR = Q_3 - Q_1$.

**Calculs.**
- $E = 90 - 10 = 80$ min
- $IQR = 35 - 19 = 16$ min

> **Interprétation.** L’étendue indique que le trajet le plus long dépasse de 80 min le plus court, mais elle ne dépend que de **deux observations** (10 et 90) : une seule valeur exceptionnelle la gonfle. L’IQR vaut 16 min : la moitié centrale des étudiants a un temps de trajet compris entre 19 et 35 min, soit dans un intervalle de seulement 16 min. L’étendue est 5 fois plus grande que l’IQR ($80 / 16 = 5$), ce qui montre l’influence de la valeur 90. Pour décrire la dispersion de la majorité des étudiants, l’**IQR est plus représentatif** : il ne dépend que du rang des observations, pas de la taille des valeurs extrêmes.` },
  synq5: {
    hints: [
      R`Formule de König-Huygens : $\sigma^2 = \dfrac{1}{n}\sum x_i^2 - \bar{x}^2$. Il faut donc la somme des **carrés** des 21 valeurs, puis $\bar{x}^2 = 29^2$.`,
      R`Carrés des valeurs : 100, 144, 225, 225, 324, 361, 400, 400, 484, 625, 625, 625, 784, 900, 900, 1225, 1225, 1600, 2025, 2500, 8100. Additionnez, divisez par 21, retranchez 841, puis prenez la racine carrée.`],
    sol: R`**Formules.** $\sigma^2 = \dfrac{1}{n}\sum x_i^2 - \bar{x}^2$ et $\sigma = \sqrt{\sigma^2}$.

**Calcul.**
- $\sum x_i^2 = 100 + 144 + 225 + 225 + 324 + 361 + 400 + 400 + 484 + 625 + 625 + 625 + 784 + 900 + 900 + 1225 + 1225 + 1600 + 2025 + 2500 + 8100 = 23\,797$
- $\dfrac{1}{n}\sum x_i^2 = \dfrac{23\,797}{21} \approx 1133{,}19$
- $\sigma^2 \approx 1133{,}19 - 29^2 = 1133{,}19 - 841 = 292{,}19$ min²
- $\sigma = \sqrt{292{,}19} \approx 17{,}09$ min

*Vérification par la définition :* $\sum (x_i - \bar{x})^2 = 6\,136$ et $\dfrac{6\,136}{21} \approx 292{,}19$.

> **Interprétation.** La variance s’exprime en min² : elle sert surtout d’étape intermédiaire. L’écart-type $\sigma \approx 17{,}1$ min signifie qu’en moyenne, les temps de trajet s’écartent d’environ 17 min de la moyenne (29 min) : la dispersion est importante. Elle est en grande partie due à la valeur 90 : son écart à la moyenne est $90 - 29 = 61$ min, soit $61^2 = 3\,721$ sur un total de 6 136 pour la somme des carrés des écarts (environ 61 %). Une seule observation sur 21 explique donc plus de la moitié de la variabilité.` },
  synq6: {
    hints: [
      R`$CV = \dfrac{\sigma}{\bar{x}}$ est un rapport **sans unité**, souvent exprimé en pourcentage. Calculez-le pour le temps de trajet (résultats de la question 5), puis pour la distance ($\bar{x} = 12$ km, $\sigma = 6$ km).`,
      R`Le temps est en minutes et la distance en kilomètres : comparer directement $17{,}09$ à $6$ n’a aucun sens. Comparez plutôt les deux coefficients de variation.`],
    sol: R`**Formule.** $CV = \dfrac{\sigma}{\bar{x}}$ (sans unité ; $\bar{x} \neq 0$).

**Calculs.**
- Temps de trajet : $CV_X = \dfrac{17{,}09}{29} \approx 0{,}589$, soit environ 59 %
- Distance : $CV_D = \dfrac{6}{12} = 0{,}50$, soit 50 %

> **Interprétation.** Pour le temps de trajet, l’écart-type représente environ 59 % de la moyenne : la dispersion relative est forte (série peu homogène ; repère indicatif, à confirmer avec votre cours : au-delà d’environ 30 %, on parle généralement de série hétérogène). Les écarts-types 17,09 min et 6 km ne sont **pas comparables** car ils n’ont pas la même unité. Le CV, lui, n’a pas d’unité : $0{,}59 > 0{,}50$, donc **le temps de trajet est relativement plus dispersé que la distance**.` },
  synq7: {
    plot: 'both',
    hints: [
      R`Histogramme : classes $[0 ; 20[$ … $[80 ; 100[$ en abscisse, effectifs $n_i$ en ordonnée (amplitudes égales : la hauteur est proportionnelle à $n_i$). Boîte à moustaches : une boîte de $Q_1$ à $Q_3$ avec un trait à la médiane.`,
      R`Les moustaches s’arrêtent aux valeurs extrêmes qui ne sont **pas** atypiques ; une valeur au-delà des barrières (question 8) se représente par un point isolé. Vous pouvez aussi marquer la moyenne.`],
    sol: R`**Construction.**
- *Histogramme* : barres de hauteurs 6, 11, 3, 0 et 1 sur les classes de largeur 20 min (tableau de la question 1).
- *Boîte à moustaches* : boîte de $Q_1 = 19$ à $Q_3 = 35$, trait à $M_e = 25$ ; moustache gauche jusqu’à 10 (minimum), moustache droite jusqu’à 50 (plus grande valeur non atypique) ; point isolé à 90 ; la moyenne $\bar{x} = 29$ est marquée par un losange.`,
    after: R`> **Interprétation.** L’histogramme est unimodal, concentré sur $[20 ; 40[$, avec une queue allongée vers la droite, une classe vide $[60 ; 80[$ puis une observation isolée. Dans la boîte, la médiane est plus proche de $Q_1$ que de $Q_3$ ($M_e - Q_1 = 6$ contre $Q_3 - M_e = 10$) et la moustache de droite est plus longue : la distribution est **asymétrique à droite**. Le coefficient de Yule-Bowley le confirme : $\dfrac{(Q_3 - M_e) - (M_e - Q_1)}{Q_3 - Q_1} = \dfrac{10 - 6}{16} = 0{,}25 > 0$. La moyenne (29), située à droite de la médiane (25), va dans le même sens.` },
  synq8: {
    hints: [
      R`Barrières de Tukey : $B_{inf} = Q_1 - 1{,}5\,IQR$ et $B_{sup} = Q_3 + 1{,}5\,IQR$. Toute valeur située hors de $[B_{inf} ; B_{sup}]$ est dite atypique.`,
      R`Une fois la valeur atypique identifiée, recalculez avec $n = 20$ valeurs : $\sum x_i = 609 - 90$ et $\sum x_i^2 = 23\,797 - 8\,100$. Pour la médiane, relisez la série ordonnée sans cette valeur.`],
    sol: R`**Formules (barrières de Tukey).** $B_{inf} = Q_1 - 1{,}5\,IQR$ et $B_{sup} = Q_3 + 1{,}5\,IQR$.

**Calcul.**
- $B_{inf} = 19 - 1{,}5 \times 16 = 19 - 24 = -5$
- $B_{sup} = 35 + 1{,}5 \times 16 = 35 + 24 = 59$

Aucune valeur n’est inférieure à $-5$ (un temps de trajet est de toute façon positif). Une seule valeur dépasse 59 : **90 min** est l’unique valeur atypique.

**Recalcul sans la valeur 90** ($n = 20$) :
- $\sum x_i = 609 - 90 = 519$, donc $\bar{x} = \dfrac{519}{20} = 25{,}95$ min
- $\sum x_i^2 = 23\,797 - 8\,100 = 15\,697$, donc $\sigma^2 = \dfrac{15\,697}{20} - 25{,}95^2 = 784{,}85 - 673{,}40 \approx 111{,}45$ et $\sigma \approx 10{,}56$ min
- médiane : les 10e et 11e valeurs valent toutes deux 25, donc $M_e = 25$ min
- étendue : $50 - 10 = 40$ min

| Indicateur | Avec 90 | Sans 90 | Variation |
|---|---|---|---|
| Moyenne | 29 | 25,95 | − 3,05 (environ − 10,5 %) |
| Médiane | 25 | 25 | 0 |
| Écart-type | 17,09 | 10,56 | − 6,53 (environ − 38 %) |
| Étendue | 80 | 40 | − 40 (− 50 %) |

> **Interprétation.** Retirer **une seule** observation sur 21 (environ 5 %) baisse la moyenne de plus de 3 min, réduit l’écart-type d’environ 38 % et divise l’étendue par 2, alors que la médiane ne bouge pas. La **moyenne, l’écart-type et l’étendue** sont donc **sensibles** aux valeurs atypiques ; la **médiane** est **robuste**. La médiane (comme les quartiles) ne dépend que du rang des observations : si 90 devenait 900, elle resterait égale à 25, alors que $\bar{x}$, $\sigma$ et $E$ exploseraient.
>
> Attention : « atypique » ne veut pas dire « erreur ». Il faut vérifier la donnée (erreur de saisie ? trajet réellement exceptionnel ?) avant de décider de l’écarter.` },
  synq9: {
    hints: [
      R`Structurez votre réponse : (1) la valeur typique, (2) la dispersion, (3) la forme de la distribution, (4) la valeur atypique et son effet sur le choix des indicateurs.`,
      R`Pour une distribution asymétrique avec une valeur atypique, privilégiez la médiane (position) et l’IQR (dispersion), et signalez que la moyenne et l’écart-type sont sensibles. Appuyez chaque affirmation sur un chiffre.`],
    sol: R`**Exemple de synthèse rédigée.**

> Le trajet typique est d’environ 25 min (médiane = mode) : la moitié centrale des étudiants met entre 19 et 35 min ($IQR = 16$ min). La distribution est unimodale et asymétrique à droite : la moyenne (29 min) dépasse la médiane. Un étudiant (90 min) est atypique, au-delà de la barrière de 59 min ; il gonfle la moyenne (29 contre 25,95 sans lui), l’écart-type (17,1 contre 10,6) et l’étendue (80 contre 40). Pour résumer la série, on retient donc la **médiane** et l’**IQR**, plus robustes, en vérifiant le trajet de 90 min avant de l’écarter. Le $CV \approx 59\,\%$ confirme une forte dispersion relative.

**Fiche récapitulative.**

| Indicateur | Formule | Résultat | À retenir |
|---|---|---|---|
| Mode | valeur la plus fréquente | 25 min | valeur la plus courante |
| Moyenne | $\bar{x} = \frac{1}{n}\sum x_i$ | 29 min | sensible aux valeurs atypiques |
| Médiane | valeur de rang $\frac{n+1}{2}$ | 25 min | robuste ; partage la série en deux moitiés |
| Quartiles | $x_{(k)}$, $k = \lceil p \times n \rceil$ | 19 ; 25 ; 35 | 25 %, 50 %, 75 % des valeurs en dessous |
| Déciles $D_1$ ; $D_9$ | idem | 15 ; 45 | 10 % et 90 % des valeurs en dessous |
| Étendue | $x_{\max} - x_{\min}$ | 80 min | très sensible aux extrêmes |
| IQR | $Q_3 - Q_1$ | 16 min | dispersion de la moitié centrale |
| Variance ; $\sigma$ | $\frac{1}{n}\sum x_i^2 - \bar{x}^2$ ; $\sqrt{\sigma^2}$ | 292,19 min² ; 17,09 min | écart typique à la moyenne |
| $CV$ | $\sigma / \bar{x}$ | 0,59 | dispersion relative, sans unité |
| Barrières | $Q_1 - 1{,}5\,IQR$ ; $Q_3 + 1{,}5\,IQR$ | −5 ; 59 | repérage des valeurs atypiques |` },
};

/* ============ 2. UTILITAIRES / STOCKAGE ============ */
const KEY = 'fsbm-s5-analyse-serie1-v1';
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
const fresh = () => ({ sid: uid(), student: null, answers: {}, tables: {}, hist: [], sec: 0, visited: {}, quiz: null, fin: null, theme: 'light' });
const load = () => { try { const s = localStorage.getItem(KEY); return s ? { ...fresh(), ...JSON.parse(s) } : fresh(); } catch { return fresh(); } };
const words = s => (s.trim() ? s.trim().split(/\s+/).length : 0);
const fmtT = s => `${Math.floor(s / 3600) ? Math.floor(s / 3600) + ' h ' : ''}${Math.floor((s % 3600) / 60)} min ${s % 60} s`;
const fmtD = iso => new Date(iso).toLocaleString('fr-FR');
const sha256 = async s => { try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); } catch { return null; } };
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const newQuiz = () => ({ order: shuffle(QUIZ.map(q => q.id)), perm: Object.fromEntries(QUIZ.map(q => [q.id, q.o === VF ? [0, 1] : shuffle(q.o.map((_, i) => i))])), ans: {}, done: false });
const grade = quiz => { const rows = (quiz?.order || []).map(id => { const q = QUIZ.find(x => x.id === id); const c = quiz.ans[id]; return { q, c, good: c === q.ok }; }); return { rows, score: rows.filter(r => r.good).length, total: rows.length, weak: [...new Set(rows.filter(r => !r.good).map(r => r.q.topic))] }; };
const download = (name, blob) => { const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 15000); };
const cellCount = (st, id) => Object.values(st.tables?.[id] || {}).filter(v => String(v).trim()).length;
const textWords = (st, id) => words(st.answers[id]?.t || '');
const answered = (st, id) => textWords(st, id) > 0 || cellCount(st, id) > 0 || (st.images?.[id]?.length || 0) > 0;
const status = (st, id) => (st.answers[id]?.done ? 'Terminée' : answered(st, id) ? 'En cours' : 'Non traitée');

/* ============ 3. COMPOSANTS UI ============ */
const MD = ({ children }) => (<div className="md"><ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{children || ''}</ReactMarkdown></div>);
const TeX = ({ children }) => (<span className="tex"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{ p: ({ children: c }) => <>{c}</> }}>{'$' + children + '$'}</ReactMarkdown></span>);
const Badge = ({ s }) => <span className={'badge b-' + s.replace(/\s|é/g, '')}>{s}</span>;
const Bar = ({ v, label }) => (<div className="bar" role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label}><i style={{ width: v + '%' }} /></div>);
const Modal = ({ title, children, ok, okLabel = 'Confirmer', onOk, onCancel, danger }) => (
  <div className="overlay" role="dialog" aria-modal="true" aria-label={title}><div className="modal"><h3>{title}</h3><div>{children}</div>
    <div className="row end"><button className="btn" onClick={onCancel}>Annuler</button><button className={'btn ' + (danger ? 'danger' : 'primary')} onClick={onOk}>{okLabel}</button></div></div></div>);

const TOOLS = [
  ['G', '**', '**', 'texte', 'Gras'], ['I', '*', '*', 'texte', 'Italique'], ['H', '\n## ', '', 'Titre', 'Titre'],
  ['•', '\n- ', '', 'élément', 'Liste à puces'], ['1.', '\n1. ', '', 'élément', 'Liste numérotée'],
  ['▦', '\n| Colonne 1 | Colonne 2 |\n|---|---|\n| a | b |\n', '', '', 'Tableau'],
  ['$x$', '$', '$', 'x', 'Formule en ligne'], ['$$', '\n$$\n', '\n$$\n', R`\sum_{i=1}^{n} x_i`, 'Formule en bloc'],
  ['a/b', R`$\frac{`, R`}{b}$`, 'a', 'Fraction'], ['x̄', R`$\bar{x}$`, '', '', 'Moyenne x barre'], ['σ', R`$\sigma$`, '', '', 'Écart-type'],
  ['x²', '$x^{', '}$', '2', 'Exposant'], ['xᵢ', '$x_{', '}$', 'i', 'Indice'], ['≤', R`$\leq$`, '', '', 'Inférieur ou égal'], ['√', R`$\sqrt{`, '}$', 'x', 'Racine'],
];
const HEIGHTS = [300, 480, 680];
function Editor({ value, onChange, disabled }) {
  const [mode, setMode] = useState('edit'); const [full, setFull] = useState(false); const [hi, setHi] = useState(0); const ta = useRef(null);
  const ins = (b, a, ph) => {
    const e = ta.current; if (!e || disabled) return; const s = e.selectionStart, t = e.selectionEnd; const sel = value.slice(s, t) || ph;
    onChange(value.slice(0, s) + b + sel + a + value.slice(t)); if (mode === 'preview') setMode('edit');
    requestAnimationFrame(() => { e.focus(); e.setSelectionRange(s + b.length, s + b.length + sel.length); });
  };
  useEffect(() => { if (!full) return; const k = e => e.key === 'Escape' && setFull(false); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [full]);
  const sty = full ? undefined : { minHeight: HEIGHTS[hi] };
  const area = <textarea ref={ta} className="ta" style={sty} value={value} disabled={disabled} onChange={e => onChange(e.target.value)} aria-label="Zone de réponse" spellCheck="false"
    placeholder={'Rédigez votre réponse en Markdown. Formules : $\\bar{x} = \\frac{1}{n}\\sum n_i x_i$'} />;
  const prev = <div className="preview" style={sty}>{value.trim() ? <MD>{value}</MD> : <p className="muted">Rien à afficher pour l’instant.</p>}</div>;
  return (
    <div className={'editor' + (full ? ' full' : '')}>
      <div className="toolbar" role="toolbar" aria-label="Outils de mise en forme">
        {TOOLS.map(([l, b, a, ph, h]) => <button key={h} className="tool" title={h} aria-label={h} disabled={disabled || mode === 'preview'} onClick={() => ins(b, a, ph)}>{l}</button>)}
        <span className="grow" />
        <button className={'tool wide' + (mode === 'edit' ? ' on' : '')} onClick={() => setMode('edit')}>Édition</button>
        <button className={'tool wide' + (mode === 'split' ? ' on' : '')} onClick={() => setMode('split')}>Côte à côte</button>
        <button className={'tool wide' + (mode === 'preview' ? ' on' : '')} onClick={() => setMode('preview')}>Aperçu</button>
        {!full && <button className="tool wide" title="Changer la hauteur de la zone" onClick={() => setHi((hi + 1) % HEIGHTS.length)}>Hauteur ↕</button>}
        <button className="tool wide" onClick={() => setFull(!full)}>{full ? 'Quitter le plein écran' : 'Plein écran'}</button>
      </div>
      {mode === 'split' ? <div className="split">{area}{prev}</div> : mode === 'edit' ? area : prev}
      <div className="row between small muted"><span>{words(value)} mot(s) · {value.length} caractère(s)</span><span>{mode === 'preview' ? 'Aperçu en direct' : 'Zone redimensionnable (coin inférieur droit)'}</span></div>
    </div>);
}

function StatTable({ def, vals, onCell, onClear, locked }) {
  const [chk, setChk] = useState(null); const box = useRef(null);
  const order = useMemo(() => editableKeys(def), [def]);
  const filled = order.filter(k => String(vals[k] ?? '').trim()).length;
  const focusKey = k => { const el = box.current?.querySelector(`input[data-k="${k}"]`); if (el) el.focus(); };
  const onKey = (e, k) => {
    const i = order.indexOf(k); let t = null;
    if (e.key === 'Enter' || e.key === 'ArrowDown') t = e.shiftKey && e.key === 'Enter' ? order[i - 1] : order[i + 1]; else if (e.key === 'ArrowUp') t = order[i - 1]; else return;
    e.preventDefault(); if (t) focusKey(t);
  };
  const cell = (c, r) => {
    const k = `${r}:${c.k}`;
    if (r !== 'T' && c.given) return <td key={c.k} className="given">{def.rows[r].given[c.k]}</td>;
    if (!isEditable(def, c, r)) return <td key={c.k} className={r === 'T' && c.k === def.cols[0].k ? 'given' : 'blocked'}>{r === 'T' && c.k === def.cols[0].k ? 'Total' : '—'}</td>;
    const v = String(vals[k] ?? ''); const bad = chk?.bad.has(k); const inv = v.trim() && !parseNum(v);
    const cls = (v.trim() ? 'filled' : 'empty') + (inv ? ' invalid' : '') + (chk && v.trim() && !inv ? (bad ? ' bad' : ' okc') : '');
    return (<td key={c.k}><input data-k={k} className={cls} value={v} disabled={locked} inputMode="decimal" enterKeyHint="next" autoComplete="off" spellCheck="false"
      aria-label={`${r === 'T' ? 'Total' : def.rows[r].label}, ${c.name}`} aria-invalid={inv || bad || undefined}
      onFocus={e => e.target.select()} onKeyDown={e => onKey(e, k)}
      onChange={e => { onCell(k, sanitizeCell(e.target.value)); setChk(null); }}
      onBlur={e => { const n = normCell(e.target.value); if (n !== e.target.value) onCell(k, n); }} /></td>);
  };
  const body = [...rowIdx(def), ...(def.total ? ['T'] : [])];
  return (<div className="stat-wrap">
    <div className="stat-head"><h3>{def.title}</h3><span className={'badge ' + (filled === order.length ? 'b-Terminee' : filled ? 'b-Encours' : '')}>{filled} / {order.length} cellules complétées</span></div>
    <Bar v={order.length ? 100 * filled / order.length : 0} label="Cellules complétées" />
    <p className="small muted">{def.note}</p>
    <div className="tscroll"><table className="stat" ref={box}><caption>{def.caption}</caption>
      <thead><tr>{def.cols.map(c => <th key={c.k} scope="col"><TeX>{c.h}</TeX>{c.unit && <small>{c.unit}</small>}</th>)}</tr></thead>
      <tbody>{body.map(r => <tr key={r} className={r === 'T' ? 'total' : ''}>{def.cols.map(c => cell(c, r))}</tr>)}</tbody></table></div>
    <div className="row wrap"><button className="btn" onClick={() => setChk(verifyTable(def, vals))} disabled={!filled}>Vérifier la cohérence</button>
      <button className="btn" disabled={locked || !filled} onClick={onClear}>Vider le tableau</button>
      <span className="small muted">Entrée / ↓ : cellule suivante · ↑ : précédente · virgule ou point acceptés</span></div>
    {chk && <div className={'note ' + (chk.bad.size ? 'warn' : '')} role="status">{chk.bad.size
      ? `${chk.bad.size} cellule(s) à revoir parmi les ${chk.n} renseignée(s) (en rouge). Reprenez vos calculs à partir de l’énoncé.`
      : `Aucune incohérence détectée parmi les ${chk.n} cellule(s) renseignée(s). Les cellules vides ne sont pas contrôlées.`}</div>}
  </div>);
}

/* --- Figures de la correction (SVG calculé à partir des données de l'exercice de synthèse) --- */
function Plot({ kind = 'both' }) {
  const s = STAT9, X0 = 40, X1 = 500, sx = v => X0 + (v / 100) * (X1 - X0), tk = [0, 20, 40, 60, 80, 100];
  const t = { fontSize: 11, fill: 'var(--mut)', fontFamily: 'inherit' }; const ln = { stroke: 'var(--mut)', strokeWidth: 1 };
  const base = 140, mx = Math.max(...N9), sy = v => (v / mx) * 110;
  const hist = (<svg viewBox="0 0 520 182" role="img" aria-label={`Histogramme du temps de trajet : effectifs ${N9.join(', ')} pour les classes de 20 minutes de 0 à 100`}>
    <line x1={X0} x2={X1} y1={base} y2={base} style={ln} />
    {CL9.map(([lo, hi], i) => <g key={lo}>
      {N9[i] > 0 && <rect x={sx(lo) + 1} y={base - sy(N9[i])} width={sx(hi) - sx(lo) - 2} height={sy(N9[i])} style={{ fill: 'var(--acc)', opacity: 0.85 }} />}
      <text x={(sx(lo) + sx(hi)) / 2} y={base - sy(N9[i]) - 6} textAnchor="middle" style={{ ...t, fill: 'var(--ink)', fontWeight: 600 }}>{N9[i]}</text></g>)}
    {tk.map(v => <g key={v}><line x1={sx(v)} x2={sx(v)} y1={base} y2={base + 4} style={ln} /><text x={sx(v)} y={base + 17} textAnchor="middle" style={t}>{v}</text></g>)}
    <text x={(X0 + X1) / 2} y={176} textAnchor="middle" style={t}>Temps de trajet (min) – effectif n_i au-dessus de chaque barre</text></svg>);
  const ay = 90, cy = 50;
  const box = (<svg viewBox="0 0 520 125" role="img" aria-label={`Boîte à moustaches : Q1 = ${s.Q1}, médiane = ${s.Me}, Q3 = ${s.Q3}, moustaches de ${s.wl} à ${s.wu}, valeur atypique ${s.out.join(', ')}, moyenne ${s.m}`}>
    <line x1={X0} x2={X1} y1={ay} y2={ay} style={ln} />
    {tk.map(v => <g key={v}><line x1={sx(v)} x2={sx(v)} y1={ay} y2={ay + 4} style={ln} /><text x={sx(v)} y={ay + 17} textAnchor="middle" style={t}>{v}</text></g>)}
    <line x1={sx(s.wl)} x2={sx(s.wu)} y1={cy} y2={cy} style={{ stroke: 'var(--ink)', strokeWidth: 1.5 }} />
    {[s.wl, s.wu].map(v => <line key={v} x1={sx(v)} x2={sx(v)} y1={cy - 8} y2={cy + 8} style={{ stroke: 'var(--ink)', strokeWidth: 1.5 }} />)}
    <rect x={sx(s.Q1)} y={cy - 16} width={sx(s.Q3) - sx(s.Q1)} height={32} style={{ fill: 'var(--accs)', stroke: 'var(--acc)', strokeWidth: 2 }} />
    <line x1={sx(s.Me)} x2={sx(s.Me)} y1={cy - 16} y2={cy + 16} style={{ stroke: 'var(--ink)', strokeWidth: 3 }} />
    <polygon points={`${sx(s.m)},${cy - 6} ${sx(s.m) + 6},${cy} ${sx(s.m)},${cy + 6} ${sx(s.m) - 6},${cy}`} style={{ fill: 'var(--gold)', stroke: 'var(--ink)', strokeWidth: 0.8 }} />
    <line x1={sx(s.hi)} x2={sx(s.hi)} y1={cy - 26} y2={cy + 26} style={{ ...ln, strokeDasharray: '4 3' }} /><text x={sx(s.hi)} y={cy - 31} textAnchor="middle" style={t}>barrière {s.hi}</text>
    {s.out.map(v => <g key={v}><circle cx={sx(v)} cy={cy} r={4.5} style={{ fill: 'none', stroke: 'var(--bad)', strokeWidth: 2 }} /><text x={sx(v)} y={cy - 12} textAnchor="middle" style={{ ...t, fill: 'var(--bad)', fontWeight: 600 }}>{v}</text></g>)}
    {[['Q1', s.Q1], ['Me', s.Me], ['Q3', s.Q3]].map(([l, v]) => <text key={l} x={sx(v)} y={cy - 22} textAnchor="middle" style={{ ...t, fill: 'var(--ink)', fontWeight: 600 }}>{l}</text>)}
    <text x={X0 + (X1 - X0) / 2} y={122} textAnchor="middle" style={t}>Temps de trajet (min)</text></svg>);
  return (<div className="plots">
    {kind !== 'box' && <figure>{hist}<figcaption>Histogramme (classes de largeur 20 min, hauteur proportionnelle à n_i).</figcaption></figure>}
    {kind !== 'hist' && <figure>{box}<figcaption>Boîte à moustaches : Q1 = {s.Q1}, Me = {s.Me}, Q3 = {s.Q3} ; moustaches de {s.wl} à {s.wu} ; barrière supérieure {s.hi} ; valeur atypique : {s.out.join(', ')} ; moyenne (losange) = {s.m}.</figcaption></figure>}
  </div>);
}

/* --- Aide pédagogique : indices un par un, puis correction détaillée (état conservé dans st.help) --- */
function Help({ id, st, upd, ready }) {
  const H = HELP[id]; if (!H) return null;
  const cur = st.help?.[id] || {}; const nh = Math.min(cur.h || 0, H.hints.length);
  const set = patch => upd(s => ({ ...s, help: { ...(s.help || {}), [id]: { ...(s.help?.[id] || {}), ...patch } } }));
  return (<div className="help">
    <p className="small muted">Essayez d’abord seul(e), puis utilisez les indices un par un. La correction détaillée (formule, calcul, résultat, interprétation) se débloque dès que vous avez commencé à répondre.</p>
    {H.hints.slice(0, nh).map((t, i) => <div className="hint" key={i}><b>Indice {i + 1} / {H.hints.length}</b><MD>{t}</MD></div>)}
    <div className="row wrap">
      <button className="btn" disabled={nh >= H.hints.length} onClick={() => set({ h: nh + 1 })}>{nh >= H.hints.length ? 'Tous les indices sont affichés' : nh ? 'Indice suivant' : 'Voir un indice'}</button>
      <button className={'btn' + (cur.s ? '' : ' primary')} disabled={!cur.s && !ready} onClick={() => set({ s: !cur.s })}>{cur.s ? 'Masquer la correction' : 'Afficher la correction détaillée'}</button>
      {!cur.s && !ready && <span className="small muted">Commencez à répondre (texte ou tableau) pour débloquer la correction.</span>}</div>
    {cur.s && <div className="sol" role="region" aria-label="Correction détaillée"><p className="eyebrow">Correction détaillée</p><MD>{H.sol}</MD>{H.plot && <Plot kind={H.plot} />}{H.after && <MD>{H.after}</MD>}</div>}
  </div>);
}

/* --- Atelier de calcul : tableau détaillé + opérations entre colonnes (moyenne, variance, écart-type) ---
   L'état (colonnes calculées) est conservé dans st.calc[id] ; sans état, le tableau type de la question est proposé.
   Cet outil est une aide au calcul : il ne modifie ni les tableaux à compléter, ni les réponses, ni la progression. */
const plain = h => tex(h);
const calcMd = (series, res) => {
  const X = series.xh; const f = v => fmtTeX(fmtNum(v)); const eq = v => (isExact(v) ? '=' : '\\approx'); let md = '';
  if (res.mean != null) md += R`$$
\bar{x} = \dfrac{\sum n_i ${X}}{\sum n_i} = \dfrac{${f(res.s1)}}{${f(res.n)}} ${eq(res.mean)} ${f(res.mean)}
$$

`;
  if (res.var != null) md += R`$$
\sigma^2 = \dfrac{\sum n_i ${X}^2}{\sum n_i} - \bar{x}^2 = \dfrac{${f(res.s2)}}{${f(res.n)}} - \left(${f(res.mean)}\right)^2 ${eq(res.var)} ${f(res.var)}
$$

$$
\sigma = \sqrt{\sigma^2} ${eq(res.sd)} ${f(res.sd)}
$$
`;
  return md;
};
function CalcLab({ id, st, upd, locked }) {
  const cfg = CALC[id]; const series = SERIES[cfg.s]; const stored = st.calc?.[id]?.cols;
  const specs = useMemo(() => stored ?? applyPreset(series, [], cfg.preset), [stored, series, cfg.preset]);
  const ev = useMemo(() => evalCols(series, specs), [series, specs]);
  const res = useMemo(() => calcResults(ev), [ev]);
  const [op, setOp] = useState('mul'); const [a, setA] = useState('n'); const [b, setB] = useState('x'); const [ks, setKs] = useState('');
  const ids = ev.map(c => c.id); const A = ids.includes(a) ? a : ids[0]; const B = b === '#k' || ids.includes(b) ? b : ids[0];
  const bin = OPS[op].bin; const kp = bin && B === '#k' ? parseNum(ks) : null; const ready = !bin || B !== '#k' || !!kp; const full = specs.length >= MAXCOLS;
  const draft = { id: nextId(specs), op, a: A, b: bin && B !== '#k' ? B : null, k: kp ? kp.v : null };
  const pe = ready ? evalCols(series, [...specs, draft]) : ev; const ph = ready && pe.length > ev.length ? pe[pe.length - 1].h : null;
  const setSpecs = next => upd(s => ({ ...s, calc: { ...(s.calc || {}), [id]: { cols: next } } }));
  const reset = () => upd(s => { const c = { ...(s.calc || {}) }; delete c[id]; return { ...s, calc: c }; });
  const md = calcMd(series, res); const missing = [res.mean == null && 'la moyenne', res.var == null && 'la variance et l’écart-type'].filter(Boolean);
  return (<div className="stat-wrap calc-wrap">
    <div className="stat-head"><h3>Tableau de calcul : {series.label}</h3><span className="badge">{specs.length} colonne(s) calculée(s)</span></div>
    <p className="small muted">{series.info} Les colonnes calculées et la ligne Σ se mettent à jour automatiquement. Cet outil est une aide : il ne remplit pas vos tableaux et n’affecte pas votre progression.</p>
    <div className="row wrap calc-presets">
      <button className="btn" disabled={locked || full} onClick={() => setSpecs(applyPreset(series, specs, 'mean'))}>Colonnes pour la moyenne</button>
      <button className="btn" disabled={locked || full} onClick={() => setSpecs(applyPreset(series, specs, 'var'))}>Colonnes pour la variance et l’écart-type</button>
      <button className="btn" disabled={locked || !stored} onClick={reset}>Réinitialiser</button></div>
    <div className="tscroll"><table className="stat calc"><caption>{series.label} : valeurs, effectifs et colonnes calculées (Σ = total de la colonne).</caption>
      <thead><tr>{ev.map(c => <th key={c.id} scope="col"><TeX>{c.h}</TeX>{!c.base && !locked && <button className="colx" title="Supprimer cette colonne (et celles qui en dépendent)" aria-label={`Supprimer la colonne ${plain(c.h)}`} onClick={() => setSpecs(removeCol(specs, c.id))}>×</button>}</th>)}</tr></thead>
      <tbody>{series.x.map((_, i) => <tr key={i}>{ev.map(c => <td key={c.id} className={c.base ? 'given' : ''}>{fmtNum(c.vals[i])}</td>)}</tr>)}
        <tr className="total">{ev.map((c, j) => <td key={c.id} className={!j ? '' : c.usesN ? '' : 'nosum'} title={!j || c.usesN ? undefined : 'Cette colonne ne tient pas compte des effectifs : sa somme est donnée à titre indicatif.'}>{!j ? 'Σ' : fmtNum(c.tot)}</td>)}</tr></tbody></table></div>
    <div className="calc-op" role="group" aria-label="Opération entre colonnes">
      <b className="calc-ttl">Nouvelle colonne</b>
      <label><span>Opération</span><select value={op} disabled={locked || full} onChange={e => setOp(e.target.value)}>{Object.entries(OPS).map(([k, o]) => <option key={k} value={k}>{o.name} ({o.sym})</option>)}</select></label>
      <label><span>{bin ? 'Colonne A' : 'Colonne'}</span><select value={A} disabled={locked || full} onChange={e => setA(e.target.value)}>{ev.map(c => <option key={c.id} value={c.id}>{plain(c.h)}</option>)}</select></label>
      {bin && <><span className="opsym" aria-hidden="true">{OPS[op].sym}</span>
        <label><span>Colonne B ou constante</span><select value={B} disabled={locked || full} onChange={e => setB(e.target.value)}>{ev.map(c => <option key={c.id} value={c.id}>{plain(c.h)}</option>)}<option value="#k">Constante (nombre)…</option></select></label>
        {B === '#k' && <label><span>Valeur</span><input value={ks} disabled={locked || full} inputMode="decimal" autoComplete="off" spellCheck="false" aria-invalid={!!ks.trim() && !kp} placeholder="ex. 2,5" onChange={e => setKs(sanitizeCell(e.target.value))} /></label>}</>}
      <div className="calc-prev small">{ph ? <>Résultat : <TeX>{ph}</TeX></> : <span className="muted">{ready ? '' : 'Saisissez une constante valide.'}</span>}</div>
      <button className="btn primary" disabled={locked || full || !ready} onClick={() => setSpecs([...specs, draft])}>Créer la colonne</button></div>
    {full && <p className="small muted">Nombre maximal de colonnes calculées atteint ({MAXCOLS}) : supprimez-en une pour continuer.</p>}
    {(md || missing.length > 0) && <div className="calc-res" role="status" aria-live="polite"><p className="eyebrow">Résultats déduits des totaux Σ</p>
      {md && <MD>{md}</MD>}
      {missing.length > 0 && <p className="small muted">Pour obtenir {missing.join(' et ')}, utilisez les boutons ci-dessus ou créez vous-même les colonnes nécessaires avec les opérations entre colonnes.</p>}
      <div className="small muted calc-note">Variance : formule de König-Huygens avec division par <TeX>n</TeX>, comme dans l’énoncé.</div></div>}
  </div>);
}

/* --- Espace de visualisation : import d'images (diagrammes réalisés ailleurs) depuis l'ordinateur --- */
const IMG_MAX = 3; const IMG_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp']; const IMG_BUDGET = 3200000;
const loadImage = file => new Promise((ok, ko) => { const u = URL.createObjectURL(file); const im = new Image();
  im.onload = () => { URL.revokeObjectURL(u); ok(im); }; im.onerror = () => { URL.revokeObjectURL(u); ko(new Error('Image illisible ou corrompue.')); }; im.src = u; });
/** Réduit l'image (côté max 1400 px) et la convertit en JPEG pour rester sous le quota du stockage local du navigateur. */
async function compressImage(file) {
  const im = await loadImage(file); const w0 = im.naturalWidth, h0 = im.naturalHeight; if (!w0 || !h0) throw new Error('Dimensions d’image invalides.');
  let best = null;
  for (const side of [1400, 1200, 1000, 800, 640]) for (const q of [0.85, 0.72, 0.58]) {
    const k = Math.min(1, side / Math.max(w0, h0)); const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(w0 * k)); cv.height = Math.max(1, Math.round(h0 * k));
    const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(im, 0, 0, cv.width, cv.height);
    best = { data: cv.toDataURL('image/jpeg', q), w: cv.width, h: cv.height }; if (best.data.length <= 220000) return best;
  }
  return best;
}
function VizSpace({ id, imgs, total, locked, onAdd, onDel, onCap, notify }) {
  const inp = useRef(null); const [over, setOver] = useState(false); const [busy, setBusy] = useState(false); const [zoom, setZoom] = useState(null);
  useEffect(() => { if (!zoom) return; const k = e => e.key === 'Escape' && setZoom(null); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [zoom]);
  const take = async files => {
    const list = [...files]; if (!list.length || locked) return; setBusy(true); let room = IMG_MAX - imgs.length, used = total, added = 0;
    for (const f of list) {
      if (room <= 0) { notify(`Maximum ${IMG_MAX} images par question : supprimez-en une pour en ajouter.`, true); break; }
      if (!IMG_TYPES.includes(f.type)) { notify(`« ${f.name} » : format non pris en charge (PNG, JPEG, WebP, GIF ou BMP).`, true); continue; }
      if (f.size > 15 * 1024 * 1024) { notify(`« ${f.name} » dépasse 15 Mo.`, true); continue; }
      try {
        const c = await compressImage(f);
        if (used + c.data.length > IMG_BUDGET) { notify('Espace de stockage local insuffisant pour cette image : supprimez une image existante ou utilisez une image plus légère.', true); break; }
        onAdd({ id: uid(), name: f.name.slice(0, 80), data: c.data, w: c.w, h: c.h, cap: '', at: new Date().toISOString() }); room--; used += c.data.length; added++;
      } catch (e) { notify(`« ${f.name} » : ${e.message || 'import impossible.'}`, true); }
    }
    setBusy(false); if (added) notify(`${added} image${added > 1 ? 's' : ''} importée${added > 1 ? 's' : ''}.`);
  };
  return (<div className="viz">
    <p className="small muted">Réalisez votre diagramme (sur papier, avec un tableur ou un logiciel de dessin) puis importez-le ici : {IMG_MAX} images au plus par question, formats PNG, JPEG, WebP, GIF ou BMP. Les images sont réduites (1 400 px maximum), conservées uniquement dans votre navigateur et ajoutées au rapport PDF.</p>
    <div className={'viz-drop' + (over ? ' over' : '')} onDragOver={e => { if (!locked) { e.preventDefault(); setOver(true); } }} onDragLeave={() => setOver(false)} onDrop={e => { e.preventDefault(); setOver(false); take(e.dataTransfer.files); }}>
      <input ref={inp} type="file" accept={IMG_TYPES.join(',')} multiple hidden aria-label="Choisir des images à importer" onChange={e => { take(e.target.files); e.target.value = ''; }} />
      <button className="btn primary" disabled={locked || busy || imgs.length >= IMG_MAX} onClick={() => inp.current?.click()}>{busy ? 'Import en cours…' : 'Importer une image…'}</button>
      <p className="small muted">ou glissez-déposez vos images ici · {imgs.length} / {IMG_MAX}</p></div>
    {imgs.length > 0 && <div className="viz-grid">{imgs.map(m => <figure className="viz-item" key={m.id}>
      <img src={m.data} alt={m.cap || m.name} onClick={() => setZoom(m)} />
      <figcaption><input className="viz-cap" value={m.cap || ''} maxLength={140} disabled={locked} placeholder="Légende (facultatif)" aria-label={`Légende de l’image ${m.name}`} onChange={e => onCap(m.id, e.target.value)} />
        <span className="row between small"><span className="muted viz-name" title={m.name}>{m.name}</span><span><button className="link" onClick={() => setZoom(m)}>Agrandir</button>{!locked && <> · <button className="link" onClick={() => onDel(m.id)}>Supprimer</button></>}</span></span></figcaption></figure>)}</div>}
    {zoom && <div className="overlay" role="dialog" aria-modal="true" aria-label="Image agrandie" onClick={() => setZoom(null)}><div className="lightbox" onClick={e => e.stopPropagation()}>
      <img src={zoom.data} alt={zoom.cap || zoom.name} />{zoom.cap && <p className="small">{zoom.cap}</p>}<div className="row end"><button className="btn" onClick={() => setZoom(null)}>Fermer</button></div></div></div>}
  </div>);
}
const VIZ_Q = new Set(['ex7q4', 'ex8q1', 'ex8q5', 'synq7']);

/* ============ 4. PDF ============ */
const NAVY = [16, 32, 64];
const fontUrl = f => new URL('fonts/' + f, document.baseURI).href;
async function fetchFont(f) {
  const r = await fetch(fontUrl(f)); if (!r.ok) throw new Error(`HTTP ${r.status} pour fonts/${f}`);
  const b = new Uint8Array(await r.arrayBuffer()); const sig = [...b.slice(0, 4)].map(x => x.toString(16).padStart(2, '0')).join('');
  if (!['00010000', '74727565', '4f54544f'].includes(sig)) throw new Error(`fonts/${f} n’est pas une police TTF valide (fichier absent de public/fonts ?)`);
  let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s);
}
const hasWork = (d, id) => !!(d.answers[id]?.t || '').trim() || Object.values(d.tables?.[id] || {}).some(v => String(v).trim()) || (d.images?.[id]?.length || 0) > 0;
async function makePdf(d) {
  let stage = 'initialisation'; const S = s => { stage = s; }; const warn = [];
  try {
    S('chargement de jsPDF');
    const mj = await import('jspdf'); const jsPDF = mj.jsPDF || mj.default?.jsPDF || mj.default;
    if (typeof jsPDF !== 'function') throw new Error('jsPDF introuvable (exports : ' + Object.keys(mj).join(', ') + ')');
    S('chargement de jspdf-autotable'); const am = await import('jspdf-autotable');
    S('création du document'); const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    // Résolution tolérante : selon la version et l'interop CJS/ESM, autoTable peut être am.default, am.default.default, am.autoTable…
    let autoTable = [am.default, am.default?.default, am.autoTable, am.default?.autoTable].find(f => typeof f === 'function');
    if (!autoTable) {
      const ap = [am.applyPlugin, am.default?.applyPlugin].find(f => typeof f === 'function');
      if (ap) { ap(jsPDF); if (typeof doc.autoTable === 'function') autoTable = (dc, o) => dc.autoTable(o); }
    }
    if (typeof autoTable !== 'function') throw new Error('jspdf-autotable : autoTable introuvable (exports : ' + Object.keys(am).join(', ') + ' ; default : ' + typeof am.default + (am.default && typeof am.default === 'object' ? ' {' + Object.keys(am.default).join(', ') + '}' : '') + ')');
    S('chargement de la police Unicode'); let FN = 'helvetica'; UNI = false;
    try {
      const reg = await fetchFont('DejaVuSans.ttf'); let bold = reg; try { bold = await fetchFont('DejaVuSans-Bold.ttf'); } catch (e) { console.warn('[PDF] gras absent, police normale utilisée', e); }
      doc.addFileToVFS('DejaVuSans.ttf', reg); doc.addFont('DejaVuSans.ttf', 'DejaVu', 'normal'); doc.addFileToVFS('DejaVuSans-Bold.ttf', bold); doc.addFont('DejaVuSans-Bold.ttf', 'DejaVu', 'bold'); FN = 'DejaVu'; UNI = true;
    } catch (e) { console.warn('[PDF] police Unicode indisponible : formules en texte simplifié', e); warn.push('police Unicode absente (formules simplifiées)'); }
    const clean = rich; const W = 210, M = 15, CW = W - 2 * M; let y = M;
    const ens = h => { if (y + h > 278) { doc.addPage(); y = M; } };
    const txt = (s, o = {}) => {
      const { size = 10, bold = false, color = [30, 30, 30], gap = 1.5, x = M, w = CW, align = 'left', raw = false, bullet = null } = o;
      doc.setFont(FN, bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
      const lh = size * 0.47; const bx = bullet ? 5 : 0; const lines = doc.splitTextToSize(raw ? charmap(String(s)) : clean(s), w - bx);
      lines.forEach((l, k) => { ens(lh); if (k === 0 && bullet) doc.text(bullet, x, y + lh * 0.8); if (align === 'center') doc.text(l, x + bx + (w - bx) / 2, y + lh * 0.8, { align: 'center' }); else doc.text(l, x + bx, y + lh * 0.8); y += lh; });
      y += gap;
    };
    const tbl = (head, body, opt = {}) => {
      ens(18); let fy = null; const n = Math.max(head?.length || 0, ...body.map(r => r.length));
      const pad = r => Array.from({ length: n }, (_, i) => clean(r[i] ?? ''));
      autoTable(doc, { startY: y, head: head ? [pad(head)] : undefined, body: body.map(pad), margin: { left: M, right: M, top: M, bottom: 20 }, showHead: 'everyPage', rowPageBreak: 'avoid',
        styles: { font: FN, fontSize: 9, cellPadding: 1.6, overflow: 'linebreak', textColor: [30, 30, 30] }, headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold' }, didDrawPage: dd => { fy = dd.cursor?.y ?? fy; }, ...opt });
      y = (doc.lastAutoTable?.finalY ?? fy ?? y) + 4;
    };
    const h2 = s => { ens(16); y += 3; txt(s, { size: 13, bold: true, color: NAVY, gap: 1 }); doc.setDrawColor(...NAVY); doc.line(M, y, W - M, y); y += 3; };
    const md = (s, ind = 0) => {
      const L = String(s || '').replace(/\r/g, '').split('\n'); let i = 0; const x0 = M + ind, w0 = CW - ind;
      const brk = l => /^\s*(\||#{1,6}\s|[-*+]\s|\d+[.)]\s|>|```|\$\$|(-{3,}|\*{3,})\s*$)/.test(l);
      while (i < L.length) {
        const l = L[i]; const t = l.trim();
        if (!t) { y += 1.5; i++; continue; }
        if (t.startsWith('```')) { i++; const code = []; while (i < L.length && !L[i].trim().startsWith('```')) code.push(L[i++]); i++; code.forEach(c => txt(c || ' ', { size: 8.5, gap: 0, x: x0 + 2, w: w0 - 4, color: [60, 60, 60], raw: true })); y += 1.5; continue; }
        if (t.startsWith('$$')) { let b = t.slice(2); i++; if (b.includes('$$')) b = b.slice(0, b.indexOf('$$')); else while (i < L.length) { const u = L[i++]; if (u.includes('$$')) { b += ' ' + u.slice(0, u.indexOf('$$')); break; } b += ' ' + u; } txt('$' + b.trim() + '$', { align: 'center', x: x0, w: w0, gap: 1.5 }); continue; }
        if (t.startsWith('|')) {
          const B = []; while (i < L.length && L[i].trim().startsWith('|')) B.push(L[i++].trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()));
          const sep = r => r.every(c => /^:?-{2,}:?$/.test(c)); const head = B.length > 1 && sep(B[1]); const rows = B.filter(r => !sep(r));
          if (rows.length) tbl(head ? rows[0] : null, head ? rows.slice(1) : rows, { margin: { left: x0, right: M, top: M, bottom: 20 }, theme: 'grid', styles: { font: FN, fontSize: 9, cellPadding: 1.6, halign: 'center', overflow: 'linebreak' } }); continue;
        }
        let m;
        if ((m = /^(#{1,6})\s+(.*)$/.exec(t))) { ens(10); y += 1; txt(m[2], { bold: true, size: m[1].length <= 2 ? 11.5 : 10.5, gap: 0.8, x: x0, w: w0, color: NAVY }); i++; continue; }
        if (/^(-{3,}|\*{3,})\s*$/.test(t)) { doc.setDrawColor(180); doc.line(x0, y + 1, W - M, y + 1); y += 3; i++; continue; }
        if ((m = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(l))) { const lv = Math.min(3, Math.floor(m[1].length / 2)); txt(m[3], { bullet: /\d/.test(m[2]) ? m[2] : '•', x: x0 + 4 * lv, w: w0 - 4 * lv, gap: 0.6 }); i++; continue; }
        if (t.startsWith('>')) { txt(t.replace(/^>+\s?/, ''), { x: x0 + 4, w: w0 - 4, color: [90, 90, 90], gap: 0.8 }); i++; continue; }
        const para = [t]; i++; while (i < L.length && L[i].trim() && !brk(L[i])) para.push(L[i++].trim()); txt(para.join(' '), { x: x0, w: w0, gap: 1.2 });
      }
    };
    const statPdf = (def, vals) => {
      const ed = editableKeys(def); const f = ed.filter(k => String(vals[k] ?? '').trim()).length;
      txt(`Tableau à compléter : ${def.title} — ${f} / ${ed.length} cellule(s) renseignée(s)`, { size: 9.5, bold: true, color: NAVY, gap: 0.6 }); txt(def.caption, { size: 8.5, color: [90, 90, 90], gap: 1.2 });
      const body = [...rowIdx(def), ...(def.total ? ['T'] : [])].map(r => def.cols.map(c => (r !== 'T' && c.given) ? def.rows[r].given[c.k] : isEditable(def, c, r) ? String(vals[`${r}:${c.k}`] ?? '') : (r === 'T' && c.k === def.cols[0].k ? 'Total' : '—')));
      const gi = new Set(def.cols.map((c, i) => c.given ? i : -1).filter(i => i >= 0));
      tbl(def.cols.map(c => '$' + c.h + '$' + (c.unit ? '\n(' + c.unit + ')' : '')), body, { theme: 'grid', styles: { font: FN, fontSize: 9, cellPadding: 1.8, halign: 'center', valign: 'middle', overflow: 'linebreak', minCellHeight: 7 },
        didParseCell: h => { if (h.section === 'body') { const isT = h.row.index === def.rows.length; if (isT) h.cell.styles.fontStyle = 'bold'; if (gi.has(h.column.index) && !isT) h.cell.styles.fillColor = [235, 239, 246]; if (String(h.cell.raw) === '—') h.cell.styles.fillColor = [245, 245, 245]; } } });
    };

    /* ---- Page de garde ---- */
    S('page de garde');
    doc.setFillColor(...NAVY); doc.rect(0, 0, W, 62, 'F'); doc.setTextColor(255, 255, 255); doc.setFont(FN, 'bold'); doc.setFontSize(16); doc.text(clean(MODULE.univ), M, 22);
    doc.setFont(FN, 'normal'); doc.setFontSize(11); doc.text(clean(MODULE.fac), M, 31); doc.text(clean(MODULE.dep), M, 38); doc.text(clean(`${MODULE.fil} - ${MODULE.sem}`), M, 45);
    y = 84; txt('Rapport final de travail personnel', { size: 24, bold: true, color: NAVY, align: 'center', gap: 2 });
    txt(`${MODULE.mod} - ${MODULE.sem} - ${MODULE.fil}`, { size: 12, align: 'center', gap: 1 }); txt(MODULE.serie, { size: 11, align: 'center', color: [90, 90, 90], gap: 14 });
    tbl(null, [['Étudiant', `${d.student.prenom} ${d.student.nom}`], ['Numéro étudiant', d.student.num || 'non renseigné'], ['Module', `${MODULE.mod} (${MODULE.sem})`], ['Filière', MODULE.fil], ['Établissement', `${MODULE.fac} - ${MODULE.dep}`], ['Université', MODULE.univ], ['Date de génération', fmtD(d.at)], ['Identifiant du rapport', d.rid], ['Code de vérification', d.code], ['Identifiant de session', d.sid]],
      { theme: 'grid', margin: { left: M + 10, right: M + 38, top: M, bottom: 20 }, columnStyles: { 0: { fontStyle: 'bold', cellWidth: 42, fillColor: [235, 239, 246] } }, styles: { font: FN, fontSize: 10, cellPadding: 2.2, overflow: 'linebreak' } });
    try { const QR = (await import('qrcode')).default; const url = await QR.toDataURL(`FSBM-S5-ANALYSE|${d.rid}|${d.code}`, { margin: 1, width: 200 }); doc.addImage(url, 'PNG', W - M - 30, y - 6 - 3 * 12, 28, 28); } catch (e) { console.warn('[PDF] QR code ignoré (facultatif)', e); }
    doc.addPage(); y = M;

    S('résumé');
    const nA = ALLQ.filter(q => hasWork(d, q.id)).length; const tb = d.tables || {};
    const cellsDone = Object.keys(TABLES).reduce((s, id) => s + Object.values(tb[id] || {}).filter(v => String(v).trim()).length, 0); const cellsAll = Object.values(TABLES).reduce((s, t) => s + cellTotal(t), 0);
    h2('1. Résumé de progression et traçabilité');
    tbl(null, [['Questions traitées', `${nA} / ${ALLQ.length}`], ['Questions marquées terminées', `${ALLQ.filter(q => d.answers[q.id]?.done).length} / ${ALLQ.length}`], ['Cellules de tableaux renseignées', `${cellsDone} / ${cellsAll}`], ['Durée active estimée', fmtT(d.sec)], ['Nombre de sauvegardes horodatées', String(d.hist.length)], ['Dernière modification', d.hist.length ? fmtD(d.hist[d.hist.length - 1].t) : '-'], ['Empreinte SHA-256 du contenu', d.hash || 'indisponible dans ce navigateur']], { columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }, theme: 'grid', styles: { font: FN, fontSize: 8.5, cellPadding: 1.6, overflow: 'linebreak' } });
    txt('Limites : identifiant, horodatage, durée et empreinte sont calculés dans le navigateur de l’étudiant. Ils documentent le travail mais ne prouvent ni l’identité de l’auteur ni l’absence de copier-coller ou d’aide extérieure. Aucune vérification centralisée n’est effectuée.', { size: 8.5, color: [90, 90, 90] });

    h2('2. Exercices et réponses de l’étudiant');
    for (const e of EXERCISES) {
      S('exercice ' + e.id); ens(40); y += 2; txt(e.title, { size: 13, bold: true, color: NAVY, gap: 1.5 }); txt('Énoncé', { size: 9, bold: true, color: [90, 90, 90], gap: 0.8 }); md(e.intro); y += 2;
      for (const q of e.qs) {
        S(`question ${e.id}/${q.n}`); ens(34); txt(`Question ${q.n}`, { size: 11, bold: true, color: NAVY, gap: 0.5 }); md(q.t); y += 0.5;
        if (TABLES[q.id]) { S(`tableau ${q.id}`); statPdf(TABLES[q.id], tb[q.id] || {}); }
        const a = (d.answers[q.id]?.t || '').trim(); S(`réponse ${q.id}`);
        txt(a ? 'Réponse rédigée de l’étudiant :' : 'Réponse rédigée de l’étudiant : (aucune réponse rédigée)', { size: 9, bold: true, gap: 0.8 }); if (a) md(a, 3);
        const ims = d.images?.[q.id] || [];
        if (ims.length) {
          S(`images ${q.id}`); txt(`Image(s) importée(s) par l’étudiant : ${ims.length}`, { size: 9, bold: true, gap: 0.8 });
          for (const m of ims) {
            try {
              const pr = doc.getImageProperties(m.data); let w = Math.min(CW - 6, 120), h = w * pr.height / pr.width; if (h > 85) { h = 85; w = h * pr.width / pr.height; }
              ens(h + 10); doc.addImage(m.data, 'JPEG', M + 3, y, w, h); y += h + 2;
              if (m.cap) txt(m.cap, { size: 8.5, color: [90, 90, 90], x: M + 3, w: CW - 6, gap: 2 }); else y += 2;
            } catch (e) { console.warn('[PDF] image ignorée', e); warn.push('une image n’a pas pu être insérée'); }
          }
        }
        y += 4;
      }
    }

    S('test final'); h2('3. Test final de connaissances');
    const g = d.grade; txt(`Score : ${g.score} / ${g.total} (${g.total ? Math.round(100 * g.score / g.total) : 0} %)`, { bold: true, size: 11 });
    if (!g.total) txt('Test non effectué.'); else {
      tbl(['#', 'Question', 'Réponse donnée', 'Bonne réponse', 'Résultat'], g.rows.map((r, i) => [i + 1, r.q.q, r.c == null ? '(sans réponse)' : r.q.o[r.c], r.q.o[r.q.ok], r.good ? 'Correct' : 'Incorrect']), { columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 70 }, 4: { cellWidth: 20 } }, styles: { font: FN, fontSize: 8, cellPadding: 1.4, overflow: 'linebreak' } });
      txt('Explications du corrigé', { bold: true, gap: 1 }); g.rows.forEach((r, i) => txt(`${i + 1}. ${r.why || r.q.why}`, { size: 8.5, gap: 1 }));
      txt(g.weak.length ? 'Notions à réviser : ' + g.weak.join(' ; ') : 'Aucune notion à réviser.', { bold: true, gap: 2 });
    }
    S('bilan'); h2('4. Bilan final');
    txt(`Progression : ${nA} question(s) traitée(s) sur ${ALLQ.length}${nA < ALLQ.length ? ' (travail incomplet)' : ''}. Test : ${g.total ? g.score + '/' + g.total : 'non effectué'}. Durée active estimée : ${fmtT(d.sec)}.`);
    ens(50); txt('Observations de l’enseignant', { bold: true, gap: 2 }); doc.setDrawColor(150); for (let k = 0; k < 6; k++) doc.line(M, y + 6 * k + 5, W - M, y + 6 * k + 5); y += 38;
    txt('Note : les formules LaTeX sont converties en texte linéaire dans ce PDF ; la saisie originale (avec rendu mathématique) reste dans l’application.', { size: 8, color: [110, 110, 110] });

    S('pied de page'); const n = doc.getNumberOfPages();
    for (let p = 1; p <= n; p++) { doc.setPage(p); doc.setFontSize(8); doc.setTextColor(110); doc.setFont(FN, 'normal'); doc.setDrawColor(200); doc.line(M, 285, W - M, 285); doc.text(clean(`Rapport ${d.rid} - généré le ${fmtD(d.at)}`), M, 290); doc.text(`Page ${p} / ${n}`, W - M, 290, { align: 'right' }); }
    S('création du fichier (Blob)'); const blob = doc.output('blob'); if (!blob || !blob.size) throw new Error('Le PDF généré est vide');
    S('téléchargement'); download(`Rapport_${charmap(d.student.nom + '_' + d.student.prenom).replace(/[^A-Za-z0-9]+/g, '_')}_${d.rid}.pdf`, blob);
    return { pages: n, size: blob.size, warn };
  } catch (e) { const err = e instanceof Error ? e : new Error(String(e)); err.stage = stage; throw err; }
}

/* ============ 5. APPLICATION ============ */
export default function App() {
  const [st, setSt] = useState(load); const [view, setView] = useState('dash'); const [qi, setQi] = useState(0);
  const [save, setSave] = useState({ s: 'saved', t: null }); const [sec, setSec] = useState(st.sec || 0);
  const [modal, setModal] = useState(null); const [toast, setToast] = useState(null); const [busy, setBusy] = useState(false); const [form, setForm] = useState({ nom: '', prenom: '', num: '' }); const [errs, setErrs] = useState({});
  const stRef = useRef(st); const secRef = useRef(sec); const last = useRef(Date.now());
  stRef.current = st; secRef.current = sec;
  const upd = f => setSt(s => f(s));
  const persist = () => { try { const s = JSON.stringify({ ...stRef.current, sec: secRef.current }); localStorage.setItem(KEY, s); setSave({ s: localStorage.getItem(KEY) === s ? 'saved' : 'error', t: new Date() }); } catch { setSave({ s: 'error', t: null }); } };
  useEffect(() => { setSave(p => ({ ...p, s: p.s === 'error' ? 'error' : 'pending' })); const t = setTimeout(persist, 400); return () => clearTimeout(t); }, [st]);
  useEffect(() => { const a = () => { last.current = Date.now(); }; ['keydown', 'pointerdown', 'scroll'].forEach(e => window.addEventListener(e, a, { passive: true }));
    const i = setInterval(() => { if (!document.hidden && Date.now() - last.current < 60000 && !stRef.current.fin) setSec(s => s + 1); }, 1000); const j = setInterval(persist, 10000);
    return () => { ['keydown', 'pointerdown', 'scroll'].forEach(e => window.removeEventListener(e, a)); clearInterval(i); clearInterval(j); }; }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), toast.err ? 14000 : 4000); return () => clearTimeout(t); }, [toast]);
  const notify = (m, err) => setToast({ m, err });
  const locked = !!st.fin; const ex = EXERCISES.find(e => e.id === view); const q = ex?.qs[qi];
  const nTreated = ALLQ.filter(x => answered(st, x.id)).length; const g = useMemo(() => grade(st.quiz), [st.quiz]);
  const global = ((nTreated + (st.quiz?.done ? 1 : 0)) / (ALLQ.length + 1)) * 100;
  const quizUnlocked = ['ex7', 'ex8'].every(id => st.visited[id]);
  const go = (v, i = 0) => { setView(v); setQi(i); if (EXERCISES.some(e => e.id === v)) upd(s => ({ ...s, visited: { ...s.visited, [v]: true } })); window.scrollTo?.(0, 0); };
  const stamp = (s, id, len, now) => { const h = s.hist; const l = [...h].reverse().find(x => x.q === id); const keep = l && Date.now() - new Date(l.t) < 30000; return [...(keep ? h.filter(x => x !== l) : h), { t: now, q: id, len }].slice(-300); };
  const setAns = (id, t) => upd(s => { const now = new Date().toISOString(); return { ...s, answers: { ...s.answers, [id]: { ...s.answers[id], t, u: now } }, hist: stamp(s, id, words(t), now) }; });
  const setCell = (id, key, v) => upd(s => { const now = new Date().toISOString(); const nt = { ...(s.tables?.[id] || {}) }; if (v === '') delete nt[key]; else nt[key] = v;
    return { ...s, tables: { ...s.tables, [id]: nt }, answers: { ...s.answers, [id]: { ...s.answers[id], t: s.answers[id]?.t || '', u: now } }, hist: stamp(s, id, Object.keys(nt).length, now) }; });
  const touch = (s, id, now) => ({ ...s.answers, [id]: { ...s.answers[id], t: s.answers[id]?.t || '', u: now } });
  const addImg = (id, img) => upd(s => { const now = new Date().toISOString(); const list = [...(s.images?.[id] || []), img]; return { ...s, images: { ...(s.images || {}), [id]: list }, answers: touch(s, id, now), hist: stamp(s, id, list.length, now) }; });
  const delImg = (id, iid) => upd(s => { const now = new Date().toISOString(); return { ...s, images: { ...(s.images || {}), [id]: (s.images?.[id] || []).filter(m => m.id !== iid) }, answers: touch(s, id, now) }; });
  const capImg = (id, iid, cap) => upd(s => ({ ...s, images: { ...(s.images || {}), [id]: (s.images?.[id] || []).map(m => (m.id === iid ? { ...m, cap } : m)) } }));
  const markDone = (id, v) => upd(s => ({ ...s, answers: { ...s.answers, [id]: { ...s.answers[id], t: s.answers[id]?.t || '', done: v, u: new Date().toISOString() } } }));
  const exI = EXERCISES.findIndex(e => e.id === view);
  const next = () => { if (qi < ex.qs.length - 1) setQi(qi + 1); else go(EXERCISES[exI + 1]?.id || 'quiz'); };

  const register = e => { e.preventDefault(); const er = {}; const nm = /^[\p{L}][\p{L}\s'’-]{1,}$/u;
    if (!nm.test(form.nom.trim())) er.nom = 'Saisissez votre nom (2 lettres minimum, sans chiffres).'; if (!nm.test(form.prenom.trim())) er.prenom = 'Saisissez votre prénom (2 lettres minimum, sans chiffres).';
    if (form.num.trim() && !/^[A-Za-z0-9-]{4,20}$/.test(form.num.trim())) er.num = 'Numéro invalide (4 à 20 caractères : lettres, chiffres, tiret).'; setErrs(er);
    if (!Object.keys(er).length) upd(s => ({ ...s, student: { nom: form.nom.trim().toUpperCase(), prenom: form.prenom.trim(), num: form.num.trim() }, hist: [...s.hist, { t: new Date().toISOString(), e: 'début' }] })); };

  const finalize = async () => { setModal(null); setBusy(true);
    const s = stRef.current; const norm = JSON.stringify({ sid: s.sid, st: s.student, a: ALLQ.map(x => [x.id, (s.answers[x.id]?.t || '').trim()]), tb: s.tables || {}, z: s.quiz ? [s.quiz.order, s.quiz.ans] : null });
    const hash = await sha256(norm); const rid = 'RPT-' + uid().replace(/-/g, '').slice(0, 12).toUpperCase(); const code = (hash ? hash.slice(0, 10) : uid().replace(/-/g, '').slice(0, 10)).toUpperCase();
    upd(x => ({ ...x, fin: { at: new Date().toISOString(), rid, code, hash, sec: secRef.current }, hist: [...x.hist, { t: new Date().toISOString(), e: 'finalisation' }] })); setBusy(false); notify('Travail finalisé. Vous pouvez télécharger le rapport PDF.'); };
  const snapshot = () => ({ student: st.student, sid: st.sid, rid: st.fin.rid, code: st.fin.code, hash: st.fin.hash, at: st.fin.at, sec: st.fin.sec, answers: st.answers, tables: st.tables || {}, images: st.images || {}, hist: st.hist.filter(h => h.q), grade: { ...g, rows: g.rows.map(r => ({ ...r, why: r.q.why })) } });
  const pdf = async () => { setBusy(true);
    try { const r = await makePdf(snapshot()); notify(`Rapport PDF généré (${r.pages} pages, ${Math.max(1, Math.round(r.size / 1024))} Ko).${r.warn.length ? ' Attention : ' + r.warn.join(', ') + '.' : ''}`, r.warn.length > 0); }
    catch (e) { console.error(`[PDF] échec à l’étape « ${e.stage || 'inconnue'} »`, e); notify(`Échec de la génération du PDF à l’étape « ${e.stage || 'inconnue'} » : ${String(e.message || e).slice(0, 180)}. Ouvrez la console (F12) pour le détail ; la sauvegarde .json reste disponible.`, true); }
    setBusy(false); };
  const backup = () => download(`sauvegarde_${st.sid}.json`, new Blob([JSON.stringify({ ...st, sec }, null, 2)], { type: 'application/json' }));

  const css = <style>{CSS}</style>;
  const shell = c => <div className="app" data-theme={st.theme}>{css}{c}</div>;
  if (!st.student) return shell(
    <main className="center"><form className="card welcome" onSubmit={register} noValidate>
      <p className="eyebrow">{MODULE.fac} · {MODULE.dep}</p><h1>{MODULE.mod} · {MODULE.sem}</h1><p className="muted">{MODULE.fil} · {MODULE.serie} · Exercices 7 et 8 et exercice de synthèse</p>
      {[['nom', 'Nom', 'family-name'], ['prenom', 'Prénom', 'given-name'], ['num', 'Numéro étudiant (facultatif)', 'off']].map(([k, l, ac]) => (
        <label key={k}><span>{l}</span><input value={form[k]} autoComplete={ac} aria-invalid={!!errs[k]} aria-describedby={errs[k] ? 'e-' + k : undefined} onChange={e => setForm({ ...form, [k]: e.target.value })} />{errs[k] && <em id={'e-' + k} role="alert" className="err">{errs[k]}</em>}</label>))}
      <p className="small muted">Ces informations et vos réponses sont conservées uniquement dans votre navigateur et apparaissent dans le rapport PDF que vous remettrez. Rien n’est envoyé à un serveur.</p>
      <button className="btn primary" type="submit">Commencer</button></form></main>);

  const items = [['dash', 'Tableau de bord', '▣'], ['ex7', 'Exercice 7', '7'], ['ex8', 'Exercice 8', '8'], ['syn', 'Synthèse', 'Σ'], ['quiz', 'Test final', '✓'], ['review', 'Rapport', '⇩']];
  const lockMsg = locked && <div className="note" role="status">Travail finalisé : les modifications sont verrouillées. <button className="link" onClick={() => go('review')}>Reprendre le travail</button></div>;
  const def = q ? TABLES[q.id] : null;
  const calc = q && CALC[q.id] ? CALC[q.id] : null; const viz = q ? VIZ_Q.has(q.id) : false;
  let sn = 0; const nDef = def ? ++sn : 0; const nCalc = calc ? ++sn : 0; const nRed = ++sn; const nHelp = q && HELP[q.id] ? ++sn : 0; const nViz = viz ? ++sn : 0;
  const imgTotal = Object.values(st.images || {}).flat().reduce((n, m) => n + (m?.data?.length || 0), 0);
  const cnt = ex ? ex.qs.reduce((a, x) => { const s = status(st, x.id); a[s] = (a[s] || 0) + 1; return a; }, {}) : {};
  return shell(<>
    <aside className="side"><div className="brand"><b>FSBM</b><span>{MODULE.mod} · {MODULE.sem}</span></div>
      <nav aria-label="Navigation principale">{items.map(([k, l, ic]) => <button key={k} className={'nav' + (view === k ? ' on' : '')} aria-current={view === k ? 'page' : undefined} disabled={k === 'quiz' && !quizUnlocked} title={k === 'quiz' && !quizUnlocked ? 'Consultez d’abord les deux exercices' : ''} onClick={() => go(k)}><i>{ic}</i><span>{l}</span></button>)}</nav>
      <div className="side-foot small"><div>{st.student.prenom} {st.student.nom}</div><button className="link" onClick={() => upd(s => ({ ...s, theme: s.theme === 'light' ? 'dark' : 'light' }))}>Mode {st.theme === 'light' ? 'sombre' : 'clair'}</button></div></aside>
    <main className="main">
      <header className="top"><div><h1>{view === 'dash' ? 'Tableau de bord' : view === 'quiz' ? 'Test final de connaissances' : view === 'review' ? 'Revue et rapport' : ex.title}</h1><p className="muted small">{MODULE.serie}</p></div>
        <div className={'save s-' + save.s} role="status" aria-live="polite">{save.s === 'saved' ? `Enregistré localement${save.t ? ' à ' + save.t.toLocaleTimeString('fr-FR') : ''}` : save.s === 'pending' ? 'Enregistrement…' : 'Échec de l’enregistrement : téléchargez la sauvegarde .json'}</div></header>
      {lockMsg}

      {view === 'dash' && <section className="grid">
        <div className="card span2"><h2>Progression globale</h2><Bar v={global} label="Progression globale" /><p className="muted small">{Math.round(global)} % · {nTreated} / {ALLQ.length} questions traitées, test {st.quiz?.done ? 'terminé' : 'non terminé'}</p></div>
        <div className="card"><h2>Temps actif estimé</h2><p className="big">{fmtT(sec)}</p><p className="muted small">Hors inactivité (plus de 60 s sans interaction).</p></div>
        {EXERCISES.map(e => { const n = e.qs.filter(x => st.answers[x.id]?.done).length; return <div className="card" key={e.id}><h2>{e.title.split(' : ')[0]}</h2><p>{e.title.split(' : ')[1]}</p><Bar v={100 * n / e.qs.length} label={e.title} /><p className="muted small">{n} / {e.qs.length} terminées</p><button className="btn" onClick={() => go(e.id)}>Ouvrir</button></div>; })}
        <div className="card"><h2>Test final</h2><p><Badge s={st.quiz?.done ? 'Terminée' : quizUnlocked ? 'En cours' : 'Non traitée'} /></p><p className="muted small">{quizUnlocked ? `${QUIZ.length} questions` : 'Disponible après consultation des deux exercices.'}</p><button className="btn" disabled={!quizUnlocked} onClick={() => go('quiz')}>Accéder</button></div>
        <div className="card span2"><h2>Espace personnel</h2><p><b>{st.student.prenom} {st.student.nom}</b>{st.student.num && ` · N° ${st.student.num}`}</p><p className="muted small">{MODULE.fil} · {MODULE.mod} · {MODULE.sem}</p><p className="small">Identifiant de session : <code>{st.sid}</code></p></div>
      </section>}

      {ex && <section className="work">
        <details className="card enonce" open={qi === 0}><summary>Énoncé complet de l’exercice</summary><MD>{ex.intro}</MD></details>
        <div className="tabs" role="tablist" aria-label="Questions de l’exercice">{ex.qs.map((x, i) => <button key={x.id} role="tab" aria-selected={i === qi} className={'tab' + (i === qi ? ' on' : '')} onClick={() => setQi(i)}>Q{x.n} <Badge s={status(st, x.id)} /></button>)}</div>
        <p className="small muted tabsum">{cnt['Terminée'] || 0} terminée(s) · {cnt['En cours'] || 0} en cours · {cnt['Non traitée'] || 0} non commencée(s)</p>
        <article className="card qcard">
          <div className="qhead"><span className="qnum" aria-hidden="true">{q.n}</span><div className="grow"><p className="eyebrow">{ex.title.split(' : ')[0]} · Question {q.n} sur {ex.qs.length}</p></div><Badge s={status(st, q.id)} /></div>
          <div className="qtext"><MD>{q.t}</MD></div>
          {def && <><h3 className="sec"><span>{nDef}</span> Tableau à compléter</h3>
            <StatTable key={q.id} def={def} vals={st.tables?.[q.id] || {}} locked={locked} onCell={(k, v) => setCell(q.id, k, v)} onClear={() => setModal('cleartbl')} /></>}
          {calc && <><h3 className="sec"><span>{nCalc}</span> Tableau de calcul automatique</h3>
            <CalcLab key={q.id} id={q.id} st={st} upd={upd} locked={locked} /></>}
          <h3 className="sec">{(def || calc) && <span>{nRed}</span>} Rédaction de la réponse</h3>
          <Editor key={q.id} value={st.answers[q.id]?.t || ''} onChange={t => setAns(q.id, t)} disabled={locked} />
          {HELP[q.id] && <><h3 className="sec"><span>{nHelp}</span> Indices et correction détaillée</h3><Help key={q.id} id={q.id} st={st} upd={upd} ready={answered(st, q.id)} /></>}
          {viz && <><h3 className="sec"><span>{nViz}</span> Espace de visualisation : importer un diagramme</h3>
            <VizSpace key={q.id} id={q.id} imgs={st.images?.[q.id] || []} total={imgTotal} locked={locked} onAdd={m => addImg(q.id, m)} onDel={i => delImg(q.id, i)} onCap={(i, c) => capImg(q.id, i, c)} notify={notify} /></>}
          <div className="row wrap actions"><button className="btn" onClick={() => qi ? setQi(qi - 1) : exI > 0 ? go(EXERCISES[exI - 1].id, EXERCISES[exI - 1].qs.length - 1) : go('dash')}>← Retour</button>
            <button className="btn" disabled={locked} onClick={() => { persist(); notify(save.s === 'error' ? 'L’enregistrement a échoué.' : 'Réponse enregistrée localement.', save.s === 'error'); }}>Enregistrer</button>
            <button className="btn" disabled={locked || !textWords(st, q.id)} onClick={() => setModal('clear')}>Effacer le texte</button><span className="grow" />
            <label className="small"><input type="checkbox" disabled={locked} checked={!!st.answers[q.id]?.done} onChange={e => markDone(q.id, e.target.checked)} /> Marquer comme terminée</label>
            <button className="btn primary" onClick={() => { if (!locked) markDone(q.id, answered(st, q.id)); persist(); next(); }}>{qi < ex.qs.length - 1 ? 'Enregistrer et continuer →' : exI === 0 ? 'Terminer et passer à l’exercice 8 →' : exI < EXERCISES.length - 1 ? 'Terminer et passer à l’exercice de synthèse →' : 'Terminer et passer au test →'}</button></div>
          {!answered(st, q.id) && <p className="small muted">Cette question n’est pas encore traitée.</p>}</article></section>}

      {view === 'quiz' && <Quiz st={st} g={g} locked={locked} upd={upd} go={go} setModal={setModal} />}

      {view === 'review' && <section className="work">
        <div className="card"><h2>Revue du travail</h2><div className="tscroll"><table><thead><tr><th>Question</th><th>Statut</th><th>Mots</th><th>Tableau</th><th>Dernière modification</th><th /></tr></thead><tbody>{ALLQ.map(x => <tr key={x.id}><td>{x.ex === 'ex7' ? 'Ex. 7' : x.ex === 'ex8' ? 'Ex. 8' : 'Synthèse'} · Q{x.n}</td><td><Badge s={status(st, x.id)} /></td><td>{textWords(st, x.id)}</td><td>{TABLES[x.id] ? `${cellCount(st, x.id)} / ${cellTotal(TABLES[x.id])}` : '-'}</td><td>{st.answers[x.id]?.u ? fmtD(st.answers[x.id].u) : '-'}</td><td><button className="link" onClick={() => go(x.ex, x.n - 1)}>Voir</button></td></tr>)}</tbody></table></div>
          <p className="small">Test final : {st.quiz?.done ? `${g.score} / ${g.total}` : 'non terminé'} · Durée active : {fmtT(sec)} · {st.hist.filter(h => h.q).length} sauvegarde(s) horodatée(s)</p>
          {nTreated < ALLQ.length && <div className="note warn" role="alert">{ALLQ.length - nTreated} question(s) sans réponse. Vous pouvez finaliser, mais le rapport l’indiquera.</div>}</div>
        <div className="card"><h2>À propos de la vérification</h2><p className="small">L’identifiant de session, les horodatages, la durée active et l’empreinte SHA-256 sont calculés dans votre navigateur. Ils documentent votre travail mais <b>ne prouvent pas</b> que vous en êtes l’auteur, et ne détectent pas le copier-coller. Aucune activité n’est surveillée à votre insu et aucune donnée n’est envoyée. Une vérification fiable nécessiterait un serveur et une authentification des étudiants.</p></div>
        {!locked ? <div className="card"><h2>Finalisation</h2><p className="small">Après finalisation, les réponses sont verrouillées et le rapport peut être téléchargé.</p><div className="row wrap"><button className="btn" onClick={backup}>Sauvegarde .json</button><button className="btn primary" disabled={busy} onClick={() => setModal('final')}>Finaliser mon travail</button></div></div>
          : <div className="card"><h2>Rapport prêt</h2><p className="small">ID : <code>{st.fin.rid}</code> · Code de vérification : <code>{st.fin.code}</code><br />Généré le {fmtD(st.fin.at)}<br />SHA-256 : <code className="brk">{st.fin.hash || 'indisponible'}</code></p>
            <div className="row wrap"><button className="btn primary big-btn" disabled={busy} onClick={pdf}>{busy ? 'Génération…' : 'Télécharger le rapport final PDF'}</button><button className="btn" onClick={backup}>Sauvegarde .json (secours)</button><button className="btn danger" onClick={() => setModal('resume')}>Reprendre le travail</button></div></div>}
      </section>}
    </main>
    <nav className="bottom" aria-label="Navigation mobile">{items.map(([k, l, ic]) => <button key={k} className={'nav' + (view === k ? ' on' : '')} disabled={k === 'quiz' && !quizUnlocked} onClick={() => go(k)}><i>{ic}</i><span>{l.replace('Tableau de bord', 'Accueil')}</span></button>)}</nav>
    {modal === 'clear' && <Modal title="Effacer le texte de cette réponse ?" danger okLabel="Effacer" onCancel={() => setModal(null)} onOk={() => { setAns(q.id, ''); markDone(q.id, false); setModal(null); }}>Le texte rédigé sera supprimé définitivement (le tableau n’est pas concerné).</Modal>}
    {modal === 'cleartbl' && <Modal title="Vider le tableau ?" danger okLabel="Vider" onCancel={() => setModal(null)} onOk={() => { upd(s => ({ ...s, tables: { ...s.tables, [q.id]: {} } })); setModal(null); }}>Toutes les valeurs saisies dans ce tableau seront supprimées. Les données de l’énoncé restent affichées.</Modal>}
    {modal === 'final' && <Modal title="Finaliser le travail ?" okLabel="Finaliser" onCancel={() => setModal(null)} onOk={finalize}>{nTreated < ALLQ.length && <p className="err">Attention : {ALLQ.length - nTreated} question(s) sans réponse. </p>}{!st.quiz?.done && <p className="err">Le test final n’est pas terminé. </p>}<p>Les réponses seront verrouillées. Vous pourrez reprendre le travail via une procédure explicite.</p></Modal>}
    {modal === 'resume' && <Modal title="Reprendre le travail ?" danger okLabel="Déverrouiller" onCancel={() => setModal(null)} onOk={() => { upd(s => ({ ...s, fin: null, hist: [...s.hist, { t: new Date().toISOString(), e: 'reprise' }] })); setModal(null); notify('Travail déverrouillé. Le rapport devra être régénéré après une nouvelle finalisation.'); }}>Le rapport actuel sera invalidé : il faudra finaliser à nouveau.</Modal>}
    {modal === 'retry' && <Modal title="Recommencer le test ?" danger okLabel="Recommencer" onCancel={() => setModal(null)} onOk={() => { upd(s => ({ ...s, quiz: newQuiz() })); setModal(null); }}>Vos réponses au test seront effacées et l’ordre des questions sera mélangé de nouveau.</Modal>}
    {toast && <div className={'toast' + (toast.err ? ' bad' : '')} role={toast.err ? 'alert' : 'status'}>{toast.m}</div>}
  </>);
}

function Quiz({ st, g, locked, upd, go, setModal }) {
  useEffect(() => { if (!st.quiz) upd(s => ({ ...s, quiz: newQuiz() })); }, [st.quiz]);
  if (!st.quiz) return null; const qz = st.quiz; const left = qz.order.filter(id => qz.ans[id] == null).length; const ro = qz.done || locked;
  const pick = (id, o) => upd(s => ({ ...s, quiz: { ...s.quiz, ans: { ...s.quiz.ans, [id]: o } } }));
  return (<section className="work">
    {qz.done && <div className="card"><h2>Résultat</h2><p className="big">{g.score} / {g.total} · {Math.round(100 * g.score / g.total)} %</p><Bar v={100 * g.score / g.total} label="Score" />
      <p className="small">{g.weak.length ? <><b>Notions à réviser :</b> {g.weak.join(' ; ')}.</> : 'Aucune notion à réviser : bravo.'}</p></div>}
    {qz.order.map((id, n) => { const q = QUIZ.find(x => x.id === id); const c = qz.ans[id]; return (
      <fieldset className="card quiz" key={id} disabled={ro}><legend>Question {n + 1} / {QUIZ.length} · {q.o === VF ? 'Vrai / Faux' : 'QCM'}</legend><p>{q.q}</p>
        {qz.perm[id].map(oi => { const mine = c === oi; const cls = qz.done ? (oi === q.ok ? ' good' : mine ? ' bad' : '') : ''; return <label key={oi} className={'opt' + cls}><input type="radio" name={id} checked={mine} onChange={() => pick(id, oi)} /> {q.o[oi]}</label>; })}
        {qz.done && <p className={'small ' + (c === q.ok ? 'okx' : 'err')}><b>{c == null ? 'Sans réponse.' : c === q.ok ? 'Correct.' : 'Incorrect.'}</b> {q.why}</p>}</fieldset>); })}
    <div className="row wrap">{!qz.done ? <><span className="muted small">{left ? `${left} question(s) sans réponse` : 'Toutes les questions ont une réponse'}</span><span className="grow" /><button className="btn primary" disabled={locked} onClick={() => upd(s => ({ ...s, quiz: { ...s.quiz, done: true } }))}>Valider le test</button></>
      : <><button className="btn" disabled={locked} onClick={() => setModal('retry')}>Recommencer</button><span className="grow" /><button className="btn primary" onClick={() => go('review')}>Continuer vers le rapport →</button></>}</div></section>);
}

/* ============ 6. STYLES ============ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

/* ====== Design tokens ====== */
.app{--bg:#f4f6fb;--panel:#ffffff;--panel2:#f8fafd;--ink:#0f172a;--ink2:#334155;--mut:#64748b;--line:#e2e8f0;--line2:#cbd5e1;--acc:#0e7490;--acc2:#6366f1;--acc3:#0891b2;--navy:#0b1535;--navy2:#13265a;--accs:#e8f5f8;--bad:#dc2626;--good:#16a34a;--warn:#fff7e0;--given:#eef2fb;--gold:#c9a227;--onacc:#fff;
  --r-sm:9px;--r-md:12px;--r-lg:18px;--sh-1:0 1px 2px rgba(15,23,42,.05);--sh-2:0 1px 2px rgba(15,23,42,.04),0 8px 24px -12px rgba(15,23,42,.14);--sh-3:0 2px 4px rgba(15,23,42,.05),0 18px 40px -16px rgba(15,23,42,.24);--ring:0 0 0 4px color-mix(in srgb,var(--acc) 16%,transparent);
  --ease:cubic-bezier(.22,1,.36,1);
  --sans:Inter,"Segoe UI Variable Text","Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;--serif:var(--sans);--mono:"JetBrains Mono","Cascadia Code",ui-monospace,Consolas,monospace;
  font-family:var(--sans);font-size:16px;color:var(--ink);background:radial-gradient(1100px 560px at 88% -12%,rgba(99,102,241,.09),transparent 60%),radial-gradient(900px 500px at -10% 30%,rgba(14,116,144,.07),transparent 55%),var(--bg);
  min-height:100vh;line-height:1.65;display:flex;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-feature-settings:"cv11","ss01"}
.app[data-theme=dark]{--bg:#070b17;--panel:#0f1830;--panel2:#0c1428;--ink:#e8edf7;--ink2:#c3cde0;--mut:#8d9bb8;--line:#1f2d4c;--line2:#2c3d63;--acc:#22d3ee;--acc2:#818cf8;--acc3:#67e8f9;--navy:#050a18;--navy2:#0a1431;--accs:#0c2d38;--bad:#f87171;--good:#4ade80;--warn:#33290f;--given:#15213d;--gold:#e8c767;--onacc:#03242e;
  --sh-1:0 1px 2px rgba(0,0,0,.3);--sh-2:0 1px 2px rgba(0,0,0,.3),0 10px 28px -14px rgba(0,0,0,.6);--sh-3:0 2px 4px rgba(0,0,0,.35),0 20px 44px -16px rgba(0,0,0,.7);
  background:radial-gradient(1100px 560px at 88% -12%,rgba(129,140,248,.11),transparent 60%),radial-gradient(900px 500px at -10% 30%,rgba(34,211,238,.06),transparent 55%),var(--bg)}
.app[data-theme=dark] :is(.b-Terminee,.b-Termine,.btn.danger,.save.s-error,.toast.bad){color:#0b1020}
.app ::-webkit-scrollbar{width:10px;height:10px}.app ::-webkit-scrollbar-track{background:transparent}.app ::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--mut) 35%,transparent);border-radius:99px;border:2px solid var(--bg)}.app ::-webkit-scrollbar-thumb:hover{background:color-mix(in srgb,var(--mut) 55%,transparent)}
.app ::selection{background:color-mix(in srgb,var(--acc) 28%,transparent)}
.app *{box-sizing:border-box}
.app h1,.app h2,.app h3{font-family:var(--sans);letter-spacing:-.022em;color:var(--ink);font-weight:700}
.app h1{font-size:1.6rem;line-height:1.2;margin:.1rem 0 .25rem;font-weight:800;letter-spacing:-.03em}
.app h2{font-size:1.08rem;margin:0 0 .75rem;line-height:1.3}.app h3{margin-top:0;font-size:1rem}
.app p{margin:.5rem 0}

/* ====== Sidebar ====== */
.side{width:256px;background:linear-gradient(178deg,var(--navy) 0%,var(--navy2) 80%,color-mix(in srgb,var(--navy2) 75%,#000) 100%);color:#eaf0fb;padding:22px 14px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;flex-shrink:0;box-shadow:8px 0 30px -14px rgba(6,12,34,.6);z-index:30}
.side::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,var(--gold),transparent 70%)}
.side::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(260px 200px at 0% 0%,rgba(99,102,241,.22),transparent 70%)}
.side>*{position:relative;z-index:1}
.brand{display:flex;flex-direction:column;padding:6px 12px 22px}
.brand b{font-family:var(--sans);font-size:1.4rem;font-weight:800;letter-spacing:.2em}
.brand b::after{content:"";display:block;width:34px;height:3px;background:linear-gradient(90deg,var(--gold),transparent);margin-top:10px;border-radius:3px}
.brand span{font-size:.78rem;opacity:.7;margin-top:8px;line-height:1.4}
.side nav{display:flex;flex-direction:column;gap:3px}
.nav{position:relative;display:flex;align-items:center;gap:12px;background:none;border:0;color:inherit;padding:10px 12px;border-radius:var(--r-md);cursor:pointer;font:inherit;font-size:.93rem;font-weight:500;width:100%;text-align:left;transition:background .2s var(--ease),transform .2s var(--ease),box-shadow .2s var(--ease),color .2s}
.nav i{font-style:normal;width:26px;height:26px;border-radius:8px;background:rgba(255,255,255,.1);display:grid;place-items:center;font-size:.8rem;font-weight:600;flex-shrink:0;transition:background .2s,transform .2s var(--ease)}
.nav:hover:not(:disabled){background:rgba(255,255,255,.08);transform:translateX(3px)}
.nav:hover:not(:disabled) i{background:rgba(255,255,255,.18)}
.nav.on{background:linear-gradient(90deg,var(--acc),color-mix(in srgb,var(--acc2) 55%,var(--acc)));color:var(--onacc);font-weight:600;box-shadow:0 8px 20px -8px color-mix(in srgb,var(--acc) 70%,transparent)}
.app[data-theme=light] .nav.on{color:#fff}
.nav.on i{background:rgba(255,255,255,.24);transform:scale(1.05)}.nav:disabled{opacity:.36;cursor:not-allowed}
.side-foot{margin-top:auto;padding:14px 12px 4px;border-top:1px solid rgba(255,255,255,.1);font-size:.85rem}
.side-foot>div{font-weight:600;margin-bottom:4px}
.side-foot .link{color:#9fe3f2;font-size:.82rem;text-decoration-color:rgba(159,227,242,.4);transition:color .15s}.side-foot .link:hover{color:#fff}

/* ====== Contenu principal ====== */
.main{flex:1;min-width:0;padding:28px 40px 64px;max-width:1180px;margin:0 auto;animation:pagein .35s var(--ease)}
@keyframes pagein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.main,.card,.hint,.toast,.modal,.overlay{animation:none!important}.app *{transition:none!important}.bar i::after{animation:none!important}}
.top{display:flex;justify-content:space-between;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:24px;padding:14px 20px;border:1px solid var(--line);border-radius:var(--r-lg);background:color-mix(in srgb,var(--panel) 80%,transparent);backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4);box-shadow:var(--sh-2);position:sticky;top:12px;z-index:20}
.top h1{margin:0}.top p{margin:2px 0 0}
.save{font-size:.78rem;padding:6px 14px 6px 28px;border-radius:999px;background:var(--accs);color:var(--ink2);font-weight:600;white-space:nowrap;position:relative}
.save::before{content:"";position:absolute;left:12px;top:50%;width:8px;height:8px;margin-top:-4px;border-radius:50%;background:var(--good);box-shadow:0 0 0 3px color-mix(in srgb,var(--good) 25%,transparent)}
.save.s-pending::before{background:#e8a33d;box-shadow:0 0 0 3px rgba(232,163,61,.28)}
.save.s-error{background:var(--bad);color:#fff}.save.s-error::before{background:#fff;box-shadow:none}
.card{background:var(--panel);border:1px solid var(--line);border-radius:var(--r-lg);padding:22px 26px;margin-bottom:18px;box-shadow:var(--sh-2);animation:in .35s var(--ease);transition:transform .25s var(--ease),box-shadow .25s var(--ease),border-color .25s}
@keyframes in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.grid .card{margin:0;display:flex;flex-direction:column;align-items:flex-start}
.grid .card .bar{width:100%}.grid .card .btn{margin-top:auto}
.grid .card:hover{transform:translateY(-3px);box-shadow:var(--sh-3);border-color:color-mix(in srgb,var(--acc) 40%,var(--line))}
.span2{grid-column:span 2}
.big{font-size:1.9rem;font-weight:800;letter-spacing:-.03em;margin:.2rem 0;background:linear-gradient(90deg,var(--acc),var(--acc2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.muted{color:var(--mut)}.small{font-size:.86rem}.err{color:var(--bad);font-style:normal;font-size:.85rem;font-weight:600}.okx{color:var(--good)}

/* ====== Barre de progression ====== */
.bar{position:relative;height:9px;background:color-mix(in srgb,var(--line) 85%,transparent);border-radius:99px;overflow:hidden;margin:8px 0}
.bar::after{content:"";position:absolute;inset:0;border-radius:99px;box-shadow:inset 0 1px 2px rgba(15,23,42,.1)}
.bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--acc),var(--acc3) 60%,var(--acc2));position:relative;transition:width .6s var(--ease)}
.bar i::after{content:"";position:absolute;top:0;bottom:0;right:0;width:26px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.5));border-radius:99px;animation:sheen 2.6s ease-in-out infinite}
@keyframes sheen{0%,100%{opacity:.2}50%{opacity:.9}}

/* ====== Boutons ====== */
.btn{font:inherit;font-size:.92rem;padding:9px 18px;border-radius:var(--r-md);border:1px solid var(--line2);background:var(--panel);color:var(--ink);cursor:pointer;font-weight:600;min-height:42px;box-shadow:var(--sh-1);transition:transform .18s var(--ease),box-shadow .18s var(--ease),border-color .18s,background .18s,color .18s}
.btn:hover:not(:disabled){border-color:var(--acc);color:var(--acc);transform:translateY(-1px);box-shadow:0 8px 18px -8px color-mix(in srgb,var(--acc) 50%,transparent);background:color-mix(in srgb,var(--acc) 4%,var(--panel))}
.btn:active:not(:disabled){transform:translateY(0) scale(.98);box-shadow:var(--sh-1)}
.btn:disabled{opacity:.45;cursor:not-allowed;box-shadow:none}
.btn.primary{background:linear-gradient(135deg,var(--acc),color-mix(in srgb,var(--acc2) 48%,var(--acc)));border-color:transparent;color:var(--onacc);box-shadow:0 10px 22px -10px color-mix(in srgb,var(--acc) 75%,transparent)}
.btn.primary:hover:not(:disabled){color:var(--onacc);background:linear-gradient(135deg,var(--acc),color-mix(in srgb,var(--acc2) 62%,var(--acc)));box-shadow:0 14px 26px -10px color-mix(in srgb,var(--acc) 80%,transparent);filter:brightness(1.05)}
.app[data-theme=light] .btn.primary,.app[data-theme=light] .btn.primary:hover:not(:disabled){color:#fff}
.btn.danger{background:var(--bad);border-color:transparent;color:#fff}
.btn.danger:hover:not(:disabled){color:#fff;background:var(--bad);filter:brightness(1.08);box-shadow:0 10px 20px -8px color-mix(in srgb,var(--bad) 60%,transparent)}
.btn.big-btn{padding:14px 26px;font-size:1.02rem;border-radius:14px;min-height:50px}
.app :focus-visible{outline:3px solid color-mix(in srgb,var(--acc) 60%,transparent);outline-offset:2px;border-radius:6px}
.link{background:none;border:0;color:var(--acc);cursor:pointer;font:inherit;font-weight:600;text-decoration:underline;text-decoration-color:color-mix(in srgb,var(--acc) 35%,transparent);text-underline-offset:3px;padding:0;transition:text-decoration-color .15s,color .15s}
.link:hover{text-decoration-color:currentColor}
.row{display:flex;gap:12px;align-items:center;margin-top:14px}.row.wrap{flex-wrap:wrap}.row.end{justify-content:flex-end}.row.between{justify-content:space-between}.grow{flex:1}
.badge{display:inline-flex;align-items:center;font-size:.7rem;padding:3px 10px;border-radius:99px;font-weight:700;background:color-mix(in srgb,var(--line) 90%,transparent);color:var(--mut);letter-spacing:.03em;white-space:nowrap}
.b-Terminee,.b-Termine{background:linear-gradient(135deg,var(--good),color-mix(in srgb,var(--good) 75%,#065f46));color:#fff}
.b-Encours{background:#f2b04a;color:#221503}

/* ====== Onglets de questions ====== */
.tabs{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 12px;margin:16px 0 4px;scrollbar-width:thin}
.tab{font:inherit;font-size:.9rem;font-weight:500;display:flex;gap:8px;align-items:center;white-space:nowrap;padding:9px 15px;border-radius:999px;border:1px solid var(--line2);background:var(--panel);color:var(--ink2);cursor:pointer;box-shadow:var(--sh-1);transition:all .2s var(--ease)}
.tab:hover{border-color:var(--acc);color:var(--acc);transform:translateY(-1px)}
.tab.on{border-color:transparent;background:linear-gradient(135deg,var(--acc),color-mix(in srgb,var(--acc2) 48%,var(--acc)));color:var(--onacc);font-weight:700;box-shadow:0 8px 18px -8px color-mix(in srgb,var(--acc) 65%,transparent)}
.app[data-theme=light] .tab.on{color:#fff}
.app[data-theme=light] .tab.on .badge{background:rgba(255,255,255,.26);color:#fff}
.tabsum{margin:0 0 16px}
details summary{cursor:pointer;font-weight:600;list-style:none}details summary::-webkit-details-marker{display:none}
details.enonce{padding:18px 24px}
details.enonce summary{font-size:1.02rem;font-weight:700;letter-spacing:-.01em;display:flex;align-items:center;gap:10px;transition:color .15s}
details.enonce summary:hover{color:var(--acc)}
details.enonce summary::before{content:"▸";display:inline-grid;place-items:center;width:24px;height:24px;border-radius:8px;background:var(--accs);color:var(--acc);font-size:.8rem;transition:transform .25s var(--ease)}
details.enonce[open] summary::before{transform:rotate(90deg)}
details.enonce[open] summary{margin-bottom:10px;padding-bottom:12px;border-bottom:1px solid var(--line)}
.note{background:var(--accs);border-radius:var(--r-md);padding:12px 18px;margin:14px 0;border:1px solid color-mix(in srgb,var(--acc) 22%,transparent);font-size:.93rem}
.note.warn{background:var(--warn);border-color:color-mix(in srgb,var(--gold) 40%,transparent)}

/* ====== Carte question ====== */
.qcard{padding:30px 36px 28px;position:relative;overflow:hidden}
.qcard::before{content:"";position:absolute;left:0;right:0;top:0;height:4px;background:linear-gradient(90deg,var(--acc),var(--acc2),var(--gold))}
.qhead{display:flex;align-items:center;gap:14px;padding-bottom:16px;margin-bottom:18px;border-bottom:1px solid var(--line)}.qhead .eyebrow{margin:0}
.qnum{font-size:1.05rem;width:40px;height:40px;border-radius:13px;background:linear-gradient(135deg,var(--navy),var(--navy2));color:#fff;display:grid;place-items:center;font-weight:800;flex-shrink:0;box-shadow:0 8px 16px -8px rgba(6,12,28,.6)}
.qtext{font-size:1.1rem;line-height:1.8;color:var(--ink);max-width:80ch}.qtext .md>p{margin:.35rem 0}
.sec{display:flex;align-items:center;gap:10px;font-size:.98rem;font-weight:700;margin:32px 0 12px;padding-top:22px;border-top:1px dashed var(--line2);color:var(--ink);letter-spacing:-.01em}
.sec span{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,var(--acc),var(--acc2));color:#fff;display:grid;place-items:center;font-size:.8rem;font-weight:700;flex-shrink:0;box-shadow:0 4px 10px -4px color-mix(in srgb,var(--acc) 65%,transparent)}
.actions{margin-top:26px;padding-top:20px;border-top:1px solid var(--line)}
.actions label{display:inline-flex;align-items:center;gap:8px;cursor:pointer;color:var(--ink2);font-weight:500}
.actions input[type=checkbox],.opt input{accent-color:var(--acc);width:17px;height:17px;cursor:pointer}

/* ====== Tableau statistique ====== */
.stat-wrap{border:1px solid var(--line);border-radius:var(--r-lg);padding:20px 22px;background:var(--panel2);box-shadow:inset 0 1px 3px rgba(15,23,42,.04)}
.stat-head{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap}.stat-head h3{margin:0;font-size:1rem}
.app table.stat{width:100%;border-collapse:separate;border-spacing:0;margin:12px 0;font-variant-numeric:tabular-nums;background:var(--panel);border-radius:var(--r-md);overflow:hidden;box-shadow:var(--sh-2);border:1px solid var(--line)}
.app table.stat caption{caption-side:top;text-align:left;font-size:.85rem;color:var(--mut);padding:2px 0 8px}
.app table.stat th,.app table.stat td{text-align:center;border:0;border-bottom:1px solid var(--line);border-right:1px solid var(--line);padding:6px 7px}
.app table.stat tr>*:last-child{border-right:0}.app table.stat tbody tr:last-child>*{border-bottom:0}
.app table.stat tbody tr{transition:background .15s}
.app table.stat tbody tr:not(.total):hover{background:color-mix(in srgb,var(--acc) 5%,transparent)}
.app table.stat th{background:linear-gradient(180deg,var(--navy),var(--navy2));color:#fff;font-weight:600;padding:11px 7px;white-space:normal;font-size:.88rem;border-right-color:rgba(255,255,255,.1);border-bottom:0}
.app table.stat th small{display:block;font-weight:400;opacity:.78;font-size:.68rem;margin-top:2px}
.app table.stat td.given{background:var(--given);font-weight:600;white-space:nowrap;color:var(--ink)}.app table.stat td.blocked{background:var(--given);color:var(--mut)}
.app table.stat tr.total td{border-top:2px solid var(--navy);background:color-mix(in srgb,var(--navy) 5%,var(--panel));font-weight:700}
.app[data-theme=dark] table.stat tr.total td{border-top-color:var(--line2)}
.app table.stat input{width:100%;min-width:76px;height:40px;text-align:center;font:inherit;font-size:.95rem;font-variant-numeric:tabular-nums;color:var(--ink);background:var(--panel);border:1.5px solid var(--line);border-radius:var(--r-sm);padding:0 8px;transition:border-color .18s,box-shadow .18s,background .18s}
.app table.stat input:hover:not(:disabled){border-color:color-mix(in srgb,var(--acc) 55%,var(--line))}
.app table.stat input:focus{border-color:var(--acc);box-shadow:var(--ring);outline:none;background:var(--panel)}
.app table.stat input.filled{background:var(--accs);border-color:color-mix(in srgb,var(--acc) 55%,var(--line))}
.app table.stat input.okc{border-color:var(--good);background:color-mix(in srgb,var(--good) 9%,var(--panel))}
.app table.stat input.bad,.app table.stat input.invalid{border-color:var(--bad);background:color-mix(in srgb,var(--bad) 9%,var(--panel))}
.app table.stat input:disabled{opacity:.7}
.tex .katex{font-size:1.05em}

/* ====== Éditeur de rédaction ====== */
.editor{margin-top:14px;border:1px solid var(--line2);border-radius:var(--r-lg);padding:0;background:var(--panel);box-shadow:var(--sh-2);overflow:hidden;transition:border-color .2s,box-shadow .2s}
.editor:focus-within{border-color:var(--acc);box-shadow:var(--ring),var(--sh-2)}
.editor.full{position:fixed;inset:0;z-index:50;border-radius:0;display:flex;flex-direction:column;background:var(--bg);border:0}
.toolbar{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:12px 14px;background:var(--panel2);border-bottom:1px solid var(--line);align-items:center}
.tool{font:inherit;min-width:36px;height:36px;border:1px solid var(--line);background:var(--panel);color:var(--ink2);border-radius:var(--r-sm);cursor:pointer;padding:0 10px;transition:all .18s var(--ease);font-size:.86rem;font-weight:500;box-shadow:var(--sh-1)}
.tool.wide{font-size:.8rem;font-weight:600}
.tool:hover:not(:disabled){border-color:var(--acc);color:var(--acc);transform:translateY(-1px);background:color-mix(in srgb,var(--acc) 5%,var(--panel))}
.tool.on{background:linear-gradient(135deg,var(--acc),color-mix(in srgb,var(--acc2) 48%,var(--acc)));color:var(--onacc);border-color:transparent;box-shadow:0 6px 14px -6px color-mix(in srgb,var(--acc) 65%,transparent)}
.app[data-theme=light] .tool.on{color:#fff}
.tool:disabled{opacity:.4;cursor:not-allowed;box-shadow:none}
.editor>.split,.editor>.ta,.editor>.preview{margin:0}
.ta,.preview{width:100%;min-height:300px;border:0;border-radius:0;padding:24px 28px;background:var(--panel);color:var(--ink);font:400 .95rem/1.85 var(--mono);letter-spacing:0;resize:vertical;display:block;tab-size:2}
.ta::placeholder{color:color-mix(in srgb,var(--mut) 80%,transparent)}
.ta:focus{outline:none;box-shadow:none}
.preview{overflow:auto;font-family:var(--sans);font-size:1rem;line-height:1.8;background:var(--panel)}
.full .ta,.full .preview{flex:1;resize:none}
.split{display:grid;grid-template-columns:1fr 1fr;gap:0}.split>.preview{background:var(--panel2);border-left:1px solid var(--line)}.full .split{flex:1;min-height:0}
.editor>.row{margin:0;padding:10px 18px;background:var(--panel2);border-top:1px solid var(--line);font-size:.8rem}
.md{line-height:1.8}
.md table,.app table{border-collapse:collapse;max-width:100%}
.md table{margin:.9rem 0;font-variant-numeric:tabular-nums;border-radius:var(--r-md);overflow:hidden;box-shadow:var(--sh-2);border:1px solid var(--line)}
.md th{background:var(--given);font-weight:600}
.md blockquote{margin:.9rem 0;padding:.55rem 1.1rem;border-left:4px solid var(--gold);background:linear-gradient(90deg,color-mix(in srgb,var(--gold) 11%,transparent),transparent);border-radius:0 var(--r-md) var(--r-md) 0}
.md blockquote>p{margin:.4rem 0}.md blockquote ul{margin:.3rem 0;padding-left:1.2rem}
.md ul,.md ol{padding-left:1.3rem}.md li{margin:.15rem 0}
.md th,.md td,th,td{border:1px solid var(--line);padding:7px 12px;text-align:center}
table th,table td{text-align:left}.md{overflow-x:auto}.tscroll{overflow-x:auto;padding-bottom:4px}

/* ====== Revue (tableau général) ====== */
.card>.tscroll>table{width:100%;border-collapse:separate;border-spacing:0;border:1px solid var(--line);border-radius:var(--r-md);overflow:hidden;font-size:.9rem}
.card>.tscroll>table th{background:var(--panel2);color:var(--mut);font-size:.74rem;text-transform:uppercase;letter-spacing:.06em;font-weight:700;text-align:left;padding:11px 14px}
.card>.tscroll>table td{text-align:left;padding:11px 14px}
.card>.tscroll>table tbody tr{transition:background .15s}.card>.tscroll>table tbody tr:hover{background:color-mix(in srgb,var(--acc) 5%,transparent)}
.card>.tscroll>table tr>*{border-width:0 0 1px 0}.card>.tscroll>table tbody tr:last-child>*{border-bottom:0}

/* ====== Formulaires & accueil ====== */
label{display:block}.welcome label{margin:16px 0}.welcome label span{display:block;font-weight:600;font-size:.9rem;color:var(--ink2);margin-bottom:6px}
.welcome input{width:100%;padding:13px 16px;border-radius:var(--r-md);border:1.5px solid var(--line2);background:var(--panel);color:var(--ink);font:inherit;box-shadow:var(--sh-1);transition:border-color .18s,box-shadow .18s}
.welcome input:hover{border-color:color-mix(in srgb,var(--acc) 50%,var(--line2))}
.welcome input:focus{border-color:var(--acc);box-shadow:var(--ring);outline:none}
.welcome input[aria-invalid=true]{border-color:var(--bad)}
.welcome .btn.primary{width:100%;margin-top:6px;min-height:48px;font-size:1rem}
.center{margin:auto;padding:28px;width:100%;display:grid;place-items:center}
.welcome{max-width:500px;width:100%;position:relative;overflow:hidden;padding:36px 38px 32px;box-shadow:var(--sh-3)}
.welcome h1{font-size:1.75rem;margin:.4rem 0 .5rem}
.welcome::before{content:"";position:absolute;left:0;right:0;top:0;height:4px;background:linear-gradient(90deg,var(--acc),var(--acc2),var(--gold))}
.eyebrow{font-size:.74rem;text-transform:uppercase;letter-spacing:.09em;color:var(--acc);font-weight:700;line-height:1.5}

/* ====== Quiz ====== */
.opt{display:flex;align-items:center;gap:12px;padding:13px 16px;border:1.5px solid var(--line);border-radius:var(--r-md);margin:8px 0;cursor:pointer;background:var(--panel);transition:all .18s var(--ease)}
.opt:hover{border-color:var(--acc);background:color-mix(in srgb,var(--acc) 5%,var(--panel));transform:translateX(3px)}
.opt:has(input:checked){border-color:var(--acc);background:var(--accs)}
.opt.good{border-color:var(--good);background:color-mix(in srgb,var(--good) 11%,var(--panel))}
.opt.bad{border-color:var(--bad);background:color-mix(in srgb,var(--bad) 9%,var(--panel))}
fieldset.quiz{border:1px solid var(--line);padding:22px 26px}fieldset.quiz>p{font-size:1.05rem;line-height:1.7;margin:.4rem 0 .8rem;font-weight:500}
legend{font-weight:700;padding:0 10px;color:var(--acc);font-size:.8rem;text-transform:uppercase;letter-spacing:.07em}
code{font-family:var(--mono);background:var(--accs);padding:2px 8px;border-radius:7px;font-size:.8rem;color:var(--acc)}.brk{word-break:break-all}

/* ====== Modales & toasts ====== */
.overlay{position:fixed;inset:0;background:rgba(5,10,25,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:grid;place-items:center;z-index:100;padding:16px;animation:fadein .2s ease}
@keyframes fadein{from{opacity:0}to{opacity:1}}
.modal{background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:28px;max-width:480px;width:100%;box-shadow:0 30px 70px -20px rgba(0,0,0,.5);animation:pop .3s cubic-bezier(.22,1.3,.36,1)}
.modal h3{font-size:1.15rem;margin-bottom:10px}.modal .row{margin-top:22px}
@keyframes pop{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:none}}
.toast{position:fixed;right:20px;bottom:20px;background:linear-gradient(135deg,var(--navy),var(--navy2));color:#fff;padding:14px 20px;border-radius:14px;z-index:120;max-width:440px;font-size:.92rem;box-shadow:0 18px 40px -14px rgba(0,0,0,.55);animation:toastin .35s cubic-bezier(.22,1.3,.36,1);border-left:4px solid var(--acc)}
.toast.bad{border-left-color:var(--bad)}
@keyframes toastin{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}

/* ====== Aide pédagogique ====== */
.help{margin-top:6px}
.hint{background:var(--warn);border-left:4px solid var(--gold);border-radius:0 var(--r-md) var(--r-md) 0;padding:11px 18px;margin:12px 0;animation:in .3s var(--ease)}
.hint b{font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:color-mix(in srgb,var(--gold) 70%,var(--ink))}.hint .md>p{margin:.3rem 0}
.sol{border:1px solid var(--line);border-left:4px solid var(--acc);border-radius:var(--r-lg);background:var(--panel);padding:20px 28px 14px;margin-top:16px;box-shadow:var(--sh-2)}
.sol .eyebrow{margin:0 0 8px}.sol .md{line-height:1.8}
.plots{display:grid;gap:16px;margin:14px 0}.plots figure{margin:0;padding:14px 16px;border:1px solid var(--line);border-radius:var(--r-md);background:var(--panel2)}
.plots svg{width:100%;height:auto;display:block;max-width:560px;margin:0 auto}.plots figcaption{font-size:.85rem;color:var(--mut);margin-top:8px}
.bottom{display:none}

/* ====== Responsive ====== */
@media(max-width:1100px){.main{padding:24px 28px 56px}}
@media(max-width:1000px){.split{grid-template-columns:1fr}.split>.preview{border-left:0;border-top:1px solid var(--line)}}
@media(max-width:860px){.app{display:block}.side{display:none}.main{padding:14px 14px 100px}.top{top:0;border-radius:0;margin:-14px -14px 18px;padding:12px 14px}
.grid{grid-template-columns:1fr}.span2{grid-column:auto}.qcard{padding:22px 16px}.card{padding:18px 16px}.welcome{padding:26px 20px}
.ta,.preview{padding:16px 16px}.toolbar{padding:10px}
.app table.stat input{min-width:68px;height:44px;font-size:1rem}
.bottom{display:flex;position:fixed;left:0;right:0;bottom:0;background:linear-gradient(180deg,var(--navy2),var(--navy));color:#fff;z-index:40;padding:6px 6px calc(6px + env(safe-area-inset-bottom,0px));box-shadow:0 -8px 24px -10px rgba(0,0,0,.55)}
.bottom .nav{flex-direction:column;gap:3px;padding:6px 2px;font-size:.68rem;text-align:center;align-items:center}
.bottom .nav:hover:not(:disabled){transform:none}
.bottom .nav.on{transform:none}}

/* ====== Atelier de calcul (colonnes calculées, ligne Σ) ====== */
.app table.stat.calc td{padding:9px 10px;font-weight:500}
.app table.stat.calc td.given{font-weight:600}
.app table.stat.calc tr.total td:first-child{font-weight:800;font-size:1.05rem;color:var(--acc)}
.app table.stat.calc td.nosum{color:var(--mut);font-weight:500}
.app table.stat.calc th{position:relative;white-space:nowrap}
.colx{margin-left:8px;border:0;background:rgba(255,255,255,.2);color:#fff;border-radius:6px;width:20px;height:20px;line-height:1;font-size:.95rem;cursor:pointer;vertical-align:middle;transition:background .15s}
.colx:hover{background:var(--bad)}
.calc-presets{margin:10px 0 4px}
.calc-op{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;margin-top:14px;padding:14px 16px;border:1px dashed var(--line2);border-radius:var(--r-md);background:var(--panel)}
.calc-op .calc-ttl{width:100%;font-size:.9rem;color:var(--ink)}
.calc-op label{display:flex;flex-direction:column;gap:4px;margin:0}
.calc-op label>span{font-size:.76rem;font-weight:600;color:var(--ink2)}
.calc-op select,.calc-op input{font:inherit;font-size:.9rem;height:42px;border:1.5px solid var(--line);border-radius:var(--r-sm);background:var(--panel);color:var(--ink);padding:0 10px;max-width:100%;transition:border-color .18s,box-shadow .18s}
.calc-op input{width:110px;text-align:center}
.calc-op select:focus,.calc-op input:focus{border-color:var(--acc);box-shadow:var(--ring);outline:none}
.calc-op input[aria-invalid=true]{border-color:var(--bad)}
.calc-op select:disabled,.calc-op input:disabled{opacity:.6}
.calc-op .opsym{font-size:1.3rem;font-weight:700;color:var(--acc);padding-bottom:7px}
.calc-prev{min-height:42px;display:flex;align-items:center;flex:1;min-width:170px}
.calc-res{margin-top:14px;padding:14px 20px 6px;border:1px solid var(--line);border-left:4px solid var(--acc);border-radius:var(--r-md);background:var(--panel)}
.calc-res .eyebrow{margin:0 0 4px}
.calc-res .md .katex-display{margin:.7em 0}
.calc-note{margin:.5rem 0 .6rem}

/* ====== Espace de visualisation (import d'images) ====== */
.viz-drop{border:2px dashed var(--line2);border-radius:var(--r-lg);padding:22px;text-align:center;background:var(--panel2);transition:border-color .2s,background .2s}
.viz-drop.over{border-color:var(--acc);background:var(--accs)}
.viz-drop p{margin:8px 0 0}
.viz-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;margin-top:16px}
.viz-item{margin:0;border:1px solid var(--line);border-radius:var(--r-md);background:var(--panel);padding:10px;box-shadow:var(--sh-1)}
.viz-item img{width:100%;height:auto;max-height:260px;object-fit:contain;display:block;border-radius:8px;background:#fff;cursor:zoom-in}
.viz-item figcaption{margin-top:8px}
.viz-cap{width:100%;font:inherit;font-size:.88rem;height:38px;border:1.5px solid var(--line);border-radius:var(--r-sm);background:var(--panel);color:var(--ink);padding:0 10px}
.viz-cap:focus{border-color:var(--acc);box-shadow:var(--ring);outline:none}
.viz-item .row{margin-top:8px;gap:8px}
.viz-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:48%}
.lightbox{background:var(--panel);border-radius:var(--r-lg);padding:16px;max-width:min(96vw,1240px);max-height:94vh;overflow:auto;box-shadow:var(--sh-3)}
.lightbox img{display:block;max-width:100%;max-height:78vh;margin:0 auto;background:#fff;border-radius:10px}
@media(max-width:860px){.calc-op input,.calc-op select{height:44px}.viz-grid{grid-template-columns:1fr}.lightbox{padding:10px}}`;
