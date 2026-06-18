import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import https from 'https';

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

const FILES = {
  teams: {
    url: 'https://ndownloader.figshare.com/files/15073697',
    dest: path.join(DATA_DIR, 'teams.json'),
    type: 'json'
  },
  players: {
    url: 'https://ndownloader.figshare.com/files/15073721',
    dest: path.join(DATA_DIR, 'players.json'),
    type: 'json'
  },
  matches: {
    url: 'https://ndownloader.figshare.com/files/14464622',
    dest: path.join(DATA_DIR, 'matches.zip'),
    type: 'zip',
    keepFile: 'matches_World_Cup.json'
  },
  events: {
    url: 'https://ndownloader.figshare.com/files/14464685',
    dest: path.join(DATA_DIR, 'events.zip'),
    type: 'zip',
    keepFile: 'events_World_Cup.json'
  }
};

function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
          return;
        }
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      const file = fs.createWriteStream(destPath);
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          resolve();
        });
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('Starting dataset download pipeline...');
  
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`Created directory: ${DATA_DIR}`);
  }

  // 1. Download Teams JSON
  console.log('Downloading teams.json...');
  await downloadFile(FILES.teams.url, FILES.teams.dest);
  console.log('Teams download complete.');

  // 2. Download Players JSON
  console.log('Downloading players.json...');
  await downloadFile(FILES.players.url, FILES.players.dest);
  console.log('Players download complete.');

  // 3. Download Matches ZIP
  console.log('Downloading matches.zip (this may take a few seconds)...');
  await downloadFile(FILES.matches.url, FILES.matches.dest);
  console.log('Matches download complete. Waiting for file lock release...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('Extracting World Cup matches...');
  
  // Extract matches.zip using PowerShell
  const tempMatchesDir = path.join(DATA_DIR, 'temp_matches');
  if (fs.existsSync(tempMatchesDir)) {
    fs.rmSync(tempMatchesDir, { recursive: true });
  }
  fs.mkdirSync(tempMatchesDir);
  
  execSync(`powershell -Command "Expand-Archive -Path '${FILES.matches.dest}' -DestinationPath '${tempMatchesDir}' -Force"`);
  
  // Move matches_World_Cup.json and clean up
  const wcMatchesSrc = path.join(tempMatchesDir, FILES.matches.keepFile);
  const wcMatchesDest = path.join(DATA_DIR, FILES.matches.keepFile);
  if (fs.existsSync(wcMatchesSrc)) {
    fs.renameSync(wcMatchesSrc, wcMatchesDest);
    console.log(`Successfully extracted and saved: ${FILES.matches.keepFile}`);
  } else {
    throw new Error(`Could not find ${FILES.matches.keepFile} in extracted archive.`);
  }
  
  fs.rmSync(tempMatchesDir, { recursive: true });
  fs.unlinkSync(FILES.matches.dest);

  // 4. Download Events ZIP
  console.log('Downloading events.zip (this may take a moment, large file)...');
  await downloadFile(FILES.events.url, FILES.events.dest);
  console.log('Events download complete. Waiting for file lock release...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('Extracting World Cup events...');
  
  // Extract events.zip using PowerShell
  const tempEventsDir = path.join(DATA_DIR, 'temp_events');
  if (fs.existsSync(tempEventsDir)) {
    fs.rmSync(tempEventsDir, { recursive: true });
  }
  fs.mkdirSync(tempEventsDir);
  
  execSync(`powershell -Command "Expand-Archive -Path '${FILES.events.dest}' -DestinationPath '${tempEventsDir}' -Force"`);
  
  // Move events_World_Cup.json and clean up
  const wcEventsSrc = path.join(tempEventsDir, FILES.events.keepFile);
  const wcEventsDest = path.join(DATA_DIR, FILES.events.keepFile);
  if (fs.existsSync(wcEventsSrc)) {
    fs.renameSync(wcEventsSrc, wcEventsDest);
    console.log(`Successfully extracted and saved: ${FILES.events.keepFile}`);
  } else {
    throw new Error(`Could not find ${FILES.events.keepFile} in extracted archive.`);
  }
  
  fs.rmSync(tempEventsDir, { recursive: true });
  fs.unlinkSync(FILES.events.dest);

  console.log('Dataset downloading and extraction completed successfully!');
}

main().catch(err => {
  console.error('An error occurred during dataset download:', err);
  process.exit(1);
});
