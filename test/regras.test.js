const test = require('node:test');
const assert = require('node:assert/strict');

// Funções de regra de negócio extraídas para validação didática

// 1. Função de Cálculo de Multa (Gabarito da Correção CORR-01)
function calcularMultaCorreta(diasAtraso, taxaFixa = 5.00, taxaDiaria = 2.00) {
  if (diasAtraso <= 0) return 0;
  // Operação puramente numérica
  return Number((taxaFixa + (diasAtraso * taxaDiaria)).toFixed(2));
}

// 2. Função com o Bug Proposital (CORR-01) para comparação
function calcularMultaComBug(diasAtraso) {
  if (diasAtraso <= 0) return 0;
  const taxaFixaProcessamento = "5.00"; // STRING!
  const taxaDiaria = 2.00;
  return taxaFixaProcessamento + (diasAtraso * taxaDiaria); // Concatena string
}

// 3. Função de Ajuste de Final de Semana (ADAP-01)
function ajustarParaDiaUtil(dataStr) {
  const d = new Date(dataStr + 'T00:00:00');
  const diaSemana = d.getDay(); // 0 = Domingo, 6 = Sábado
  if (diaSemana === 6) {
    d.setDate(d.getDate() + 2); // Pula para Segunda
  } else if (diaSemana === 0) {
    d.setDate(d.getDate() + 1); // Pula para Segunda
  }
  return d.toISOString().split('T')[0];
}

// 4. Validação de Renovação (EVOL-01)
function podeRenovar(renovacoesAtuais, isAtrasado) {
  if (isAtrasado) {
    return { permitido: false, motivo: 'Empréstimo em atraso não pode ser renovado.' };
  }
  if (renovacoesAtuais >= 2) {
    return { permitido: false, motivo: 'Limite máximo de 2 renovações atingido.' };
  }
  return { permitido: true, motivo: 'Renovação autorizada.' };
}

// ===================================================
// SUÍTE DE TESTES UNITÁRIOS (PERF-02)
// ===================================================

test('CORR-01: Demonstração da falha por concatenação de string', () => {
  const resultadoBug = calcularMultaComBug(3);
  // Esperado matematicamente seria 11.00 (5 + 3*2), mas com bug vira "5.006"
  assert.strictEqual(typeof resultadoBug, 'string');
  assert.strictEqual(resultadoBug, '5.006');
});

test('CORR-01: Cálculo correto da multa com valores numéricos', () => {
  // Sem atraso
  assert.strictEqual(calcularMultaCorreta(0), 0);
  // 1 dia de atraso: 5.00 + (1 * 2.00) = 7.00
  assert.strictEqual(calcularMultaCorreta(1), 7.00);
  // 6 dias de atraso: 5.00 + (6 * 2.00) = 17.00
  assert.strictEqual(calcularMultaCorreta(6), 17.00);
});

test('ADAP-01: Ajuste de devolução que cai no fim de semana', () => {
  // 2026-09-12 é um Sábado -> deve virar 2026-09-14 (Segunda)
  assert.strictEqual(ajustarParaDiaUtil('2026-09-12'), '2026-09-14');
  
  // 2026-09-13 é um Domingo -> deve virar 2026-09-14 (Segunda)
  assert.strictEqual(ajustarParaDiaUtil('2026-09-13'), '2026-09-14');

  // 2026-09-15 é uma Terça -> deve permanecer inalterado
  assert.strictEqual(ajustarParaDiaUtil('2026-09-15'), '2026-09-15');
});

test('EVOL-01: Regras de permissão de renovação de empréstimo', () => {
  // Caso 1: Empréstimo em dia com 0 renovações -> Permitido
  const caso1 = podeRenovar(0, false);
  assert.strictEqual(caso1.permitido, true);

  // Caso 2: Empréstimo em atraso -> Bloqueado
  const caso2 = podeRenovar(0, true);
  assert.strictEqual(caso2.permitido, false);

  // Caso 3: Já renovado 2 vezes -> Bloqueado
  const caso3 = podeRenovar(2, false);
  assert.strictEqual(caso3.permitido, false);
});
