function calculateComplexity(structure, techStack) {
  let score = 0;
  const { totalFiles, totalLines, languageStats } = structure;

  // File count (0–30)
  if      (totalFiles < 10)   score += 5;
  else if (totalFiles < 50)   score += 10;
  else if (totalFiles < 150)  score += 18;
  else if (totalFiles < 500)  score += 24;
  else                        score += 30;

  // LOC (0–25)
  if      (totalLines < 500)   score += 5;
  else if (totalLines < 2000)  score += 10;
  else if (totalLines < 10000) score += 16;
  else if (totalLines < 50000) score += 21;
  else                         score += 25;

  // Tech diversity (0–25)
  score += Math.min((techStack?.length || 0) * 2, 25);

  // Language diversity (0–20)
  score += Math.min((languageStats?.length || 0) * 4, 20);

  return Math.min(Math.round(score), 100);
}

function calculateTechnicalDebt(structure) {
  let debt = 0;
  const large    = (structure.largestFiles || []).filter((f) => f.lines > 300).length;
  const veryLarge= (structure.largestFiles || []).filter((f) => f.lines > 1000).length;
  debt += large * 5 + veryLarge * 10;
  return Math.min(debt, 100);
}

module.exports = { calculateComplexity, calculateTechnicalDebt };
