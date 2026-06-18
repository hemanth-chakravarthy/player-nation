import DatasetService from './services/dataset.service.ts';
import EventProcessorService from './services/event-processor.service.ts';

async function verifyPipeline() {
  console.log('--- Verifying Data Processing Pipeline ---');
  
  const datasetService = DatasetService.getInstance();
  const eventProcessor = new EventProcessorService();

  console.log('Initializing dataset service...');
  await datasetService.initialize();

  const matches = datasetService.getMatches();
  console.log(`Total parsed matches: ${matches.length}`);

  if (matches.length === 0) {
    console.error('ERROR: No matches found in the dataset.');
    return;
  }

  // Look for a notable match, like France vs Croatia (usually ID 2058017) or any match
  const sampleMatch = matches.find(m => m.homeTeam === 'France' && m.awayTeam === 'Croatia') || matches[0];
  console.log(`\nSelected Match for Verification: ${sampleMatch.homeTeam} vs ${sampleMatch.awayTeam} (ID: ${sampleMatch.matchId})`);
  console.log(`Official score: ${sampleMatch.homeScore}-${sampleMatch.awayScore}`);

  console.log('\nRunning Event Processor...');
  const processedData = eventProcessor.processMatch(sampleMatch.matchId);

  console.log('\nProcessed Team Statistics:');
  console.log(`- ${processedData.homeTeam.teamName}:`);
  console.log(`  * Goals: ${processedData.homeTeam.goals}`);
  console.log(`  * Possession: ${processedData.homeTeam.possession}%`);
  console.log(`  * Shots (On Target): ${processedData.homeTeam.shots} (${processedData.homeTeam.shotsOnTarget})`);
  console.log(`  * Passes: ${processedData.homeTeam.passesCompleted}/${processedData.homeTeam.passesAttempted} (${processedData.homeTeam.passAccuracy}%)`);
  console.log(`  * Fouls: ${processedData.homeTeam.fouls}, Yellows: ${processedData.homeTeam.yellowCards}, Reds: ${processedData.homeTeam.redCards}`);

  console.log(`- ${processedData.awayTeam.teamName}:`);
  console.log(`  * Goals: ${processedData.awayTeam.goals}`);
  console.log(`  * Possession: ${processedData.awayTeam.possession}%`);
  console.log(`  * Shots (On Target): ${processedData.awayTeam.shots} (${processedData.awayTeam.shotsOnTarget})`);
  console.log(`  * Passes: ${processedData.awayTeam.passesCompleted}/${processedData.awayTeam.passesAttempted} (${processedData.awayTeam.passAccuracy}%)`);
  console.log(`  * Fouls: ${processedData.awayTeam.fouls}, Yellows: ${processedData.awayTeam.yellowCards}, Reds: ${processedData.awayTeam.redCards}`);

  console.log('\nTop Performers:');
  processedData.topPlayers.forEach((p, idx) => {
    console.log(`${idx + 1}. ${p.playerName} (${p.teamName}) - Rating: ${p.rating} (Goals: ${p.goals}, Assists: ${p.assists}, Key Passes: ${p.keyPasses}, Duels Won: ${p.duelsWon}, Interceptions: ${p.interceptions})`);
  });

  console.log('\nKey Moments Timeline:');
  processedData.keyMoments.forEach(m => {
    console.log(`- [${m.type.toUpperCase()}] ${m.description}`);
  });

  console.log('\n--- Verification Finished Successfully ---');
}

verifyPipeline().catch(err => {
  console.error('Verification failed:', err);
});
