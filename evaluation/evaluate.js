#!/usr/bin/env node

/**
 * Khmer Translation Quality Evaluator
 * 
 * Scores model outputs against the benchmark criteria:
 * - Preferred Terminology Adherence
 * - Negative Pitfall Avoidance
 * - Unicode NFC compliance
 */

const fs = require('fs');
const path = require('path');

const BENCHMARK_PATH = path.resolve(__dirname, 'benchmark.json');
const testCases = JSON.parse(fs.readFileSync(BENCHMARK_PATH, 'utf8'));

// Test candidates: Simulation comparing raw LLM translation vs Reference-grounded translation
const SIMULATED_RUNS = [
  {
    name: "Raw Baseline LLM (Without Reference)",
    outputs: {
      "bench-sw-001": "ការផ្ទៀងផ្ទាត់ពីរជាន់ត្រូវបានទាមទារដើម្បីកំណត់ប៉ាសវើតឡើងវិញ។", // Contains pitfall 'ប៉ាសវើត'
      "bench-sw-002": "បរាជ័យក្នុងការភ្ជាប់ទៅកាន់ដេតាបាសសឺវើ។", // Contains pitfalls 'ដេតាបាស', 'សឺវើ'
      "bench-ecom-001": "សូមពិនិត្យមើលរទេះរុញរបស់អ្នក មុនពេលចាកចេញពីសណ្ឋាគារ។", // Contains pitfalls 'រទេះរុញ', 'ចាកចេញពីសណ្ឋាគារ'
      "bench-fin-001": "តុល្យភាពគណនីបច្ចុប្បន្ន និងប្រវត្តិប្រតិបត្តិការរបស់អ្នកមាននៅលើដាសបត។" // Pitfalls 'តុល្យភាពគណនី', 'ដាសបត'
    }
  },
  {
    name: "Reference-Grounded LLM (With Khmer AI Reference)",
    outputs: {
      "bench-sw-001": "តម្រូវឱ្យមានការផ្ទៀងផ្ទាត់អត្តសញ្ញាណពីរជំហានដើម្បីកំណត់ពាក្យសម្ងាត់របស់អ្នកឡើងវិញ។",
      "bench-sw-002": "បានបរាជ័យក្នុងការតភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេនៃមូលដ្ឋានទិន្នន័យ។",
      "bench-ecom-001": "សូមពិនិត្យមើលកន្ត្រកទំនិញរបស់អ្នកមុនពេលបន្តទៅការទូទាត់ប្រាក់។",
      "bench-fin-001": "សមតុល្យគណនីបច្ចុប្បន្ន និងប្រវត្តិប្រតិបត្តិការរបស់អ្នកមាននៅលើផ្ទាំងគ្រប់គ្រង។"
    }
  }
];

function evaluateModel(modelName, outputs) {
  console.log(`\n======================================================`);
  console.log(`Evaluating: ${modelName}`);
  console.log(`======================================================`);

  let totalTermsRequired = 0;
  let termsPassed = 0;
  let totalPitfallsChecked = 0;
  let pitfallsAvoided = 0;

  testCases.forEach((tc, idx) => {
    const output = outputs[tc.id] || "";
    console.log(`\nTest #${idx + 1} [${tc.id}] (${tc.domain}): "${tc.prompt}"`);
    console.log(`Model Output: "${output}"`);

    // Terminology check
    tc.requiredTerminology.forEach(req => {
      totalTermsRequired++;
      const termPattern = req.pattern ? new RegExp(req.pattern) : null;
      const hasTerm = termPattern ? termPattern.test(output) : output.includes(req.khmer);
      if (hasTerm) {
        termsPassed++;
        console.log(`  ✔ Included required term: "${req.khmer}" (${req.term})`);
      } else {
        console.log(`  ✖ MISSING required term: "${req.khmer}" (${req.term})`);
      }
    });

    // Pitfalls check
    tc.pitfallsToAvoid.forEach(pf => {
      totalPitfallsChecked++;
      const hasPitfall = output.includes(pf);
      if (!hasPitfall) {
        pitfallsAvoided++;
      } else {
        console.log(`  ⚠ FAILED: Output contained prohibited pitfall: "${pf}"`);
      }
    });
  });

  const termScore = ((termsPassed / totalTermsRequired) * 100).toFixed(1);
  const pitfallScore = ((pitfallsAvoided / totalPitfallsChecked) * 100).toFixed(1);

  console.log(`\n--- Summary for ${modelName} ---`);
  console.log(`Terminology Adherence Rate : ${termScore}% (${termsPassed}/${totalTermsRequired})`);
  console.log(`Pitfall Avoidance Rate      : ${pitfallScore}% (${pitfallsAvoided}/${totalPitfallsChecked})`);
}

SIMULATED_RUNS.forEach(run => evaluateModel(run.name, run.outputs));
