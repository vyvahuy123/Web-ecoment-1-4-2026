const fs = require('fs');
// Tìm UserConfiguration nếu có
const files = [
  'E:/CleanArchitecture/src/Infrastructure/Persistence/Configurations/UserConfiguration.cs'
];
files.forEach(f => {
  try {
    let code = fs.readFileSync(f, 'utf8');
    console.log('Found:', f);
    console.log(code.slice(0, 300));
  } catch { console.log('Not found:', f); }
});
