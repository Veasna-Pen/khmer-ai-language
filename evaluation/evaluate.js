#!/usr/bin/env node
// Scores translations against evaluation/benchmark.json: required terminology and pitfall avoidance.
// Outputs come from SIMULATED_RUNS below; no model is called.

const { loadBenchmark } = require('../tools/lib/dataset');

const SIMULATED_RUNS = [
  {
    name: 'Raw Baseline LLM (Without Reference)',
    outputs: {
      'bench-sw-001': 'ការផ្ទៀងផ្ទាត់ពីរជាន់ត្រូវបានទាមទារដើម្បីកំណត់ប៉ាសវើតឡើងវិញ។',
      'bench-sw-002': 'បរាជ័យក្នុងការភ្ជាប់ទៅកាន់ដេតាបាសសឺវើ។',
      'bench-ecom-001': 'សូមពិនិត្យមើលរទេះរុញរបស់អ្នក មុនពេលចាកចេញពីសណ្ឋាគារ។',
      'bench-fin-001': 'តុល្យភាពគណនីបច្ចុប្បន្ន និងប្រវត្តិប្រតិបត្តិការរបស់អ្នកមាននៅលើដាសបត។',
    },
  },
  {
    name: 'Reference-Grounded LLM (With Khmer AI Reference)',
    outputs: {
      'bench-sw-001': 'តម្រូវឱ្យមានការផ្ទៀងផ្ទាត់អត្តសញ្ញាណពីរជំហានដើម្បីកំណត់ពាក្យសម្ងាត់របស់អ្នកឡើងវិញ។',
      'bench-sw-002': 'បានបរាជ័យក្នុងការតភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេនៃមូលដ្ឋានទិន្នន័យ។',
      'bench-ecom-001': 'សូមពិនិត្យមើលកន្ត្រកទំនិញរបស់អ្នកមុនពេលបន្តទៅការទូទាត់ប្រាក់។',
      'bench-fin-001': 'សមតុល្យគណនីបច្ចុប្បន្ន និងប្រវត្តិប្រតិបត្តិការរបស់អ្នកមាននៅលើផ្ទាំងគ្រប់គ្រង។',
    },
  },
];

const hasTerm = (output, req) => (req.pattern ? new RegExp(req.pattern).test(output) : output.includes(req.khmer));
const rate = (passed, total) => `${total ? ((passed / total) * 100).toFixed(1) : '0.0'}% (${passed}/${total})`;

function evaluateRun(testCases, { name, outputs }) {
  const score = { termsPassed: 0, termsTotal: 0, pitfallsAvoided: 0, pitfallsTotal: 0 };

  console.log(`\n${'='.repeat(54)}\nEvaluating: ${name}\n${'='.repeat(54)}`);

  testCases.forEach((tc, idx) => {
    const output = outputs[tc.id] || '';
    console.log(`\nTest #${idx + 1} [${tc.id}] (${tc.domain}): "${tc.prompt}"`);
    console.log(`Model Output: "${output}"`);

    for (const req of tc.requiredTerminology) {
      score.termsTotal++;
      if (hasTerm(output, req)) {
        score.termsPassed++;
        console.log(`  ✔ Included required term: "${req.khmer}" (${req.term})`);
      } else {
        console.log(`  ✖ MISSING required term: "${req.khmer}" (${req.term})`);
      }
    }

    for (const pitfall of tc.pitfallsToAvoid) {
      score.pitfallsTotal++;
      if (output.includes(pitfall)) console.log(`  ⚠ FAILED: Output contained prohibited pitfall: "${pitfall}"`);
      else score.pitfallsAvoided++;
    }
  });

  console.log(`\n--- Summary for ${name} ---`);
  console.log(`Terminology Adherence Rate : ${rate(score.termsPassed, score.termsTotal)}`);
  console.log(`Pitfall Avoidance Rate      : ${rate(score.pitfallsAvoided, score.pitfallsTotal)}`);
  return score;
}

if (require.main === module) {
  const testCases = loadBenchmark();
  SIMULATED_RUNS.forEach((run) => evaluateRun(testCases, run));
}

module.exports = { evaluateRun };
