import fs from 'fs';

const paths = [
  'server.ts',
  'src/App.tsx',
  'src/components/JarvisAssistant.tsx',
  'src/components/DeviceConfig.tsx',
  'src/components/Installer.tsx',
  'src/components/LogsDocker.tsx',
  'AutoInstaller.ps1',
  'README.md'
];

paths.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/Llama 3\.2.?\(?8B\)?/g, 'Llama 3.1 (8B)');
    content = content.replace(/Llama 3\.2.?\(?3B\)?/g, 'Llama 3.1 (8B)');
    content = content.replace(/Llama 3\.2 3B/g, 'Llama 3.1 8B');
    content = content.replace(/Llama 3\.2/g, 'Llama 3.1');
    content = content.replace(/llama3\.1:3b/g, 'llama3.1:8b');
    
    // Also "2.2GB" to "4.7GB" everywhere
    content = content.replace(/2\.2GB/g, '4.7GB');
    
    fs.writeFileSync(file, content);
  }
});
console.log('Update Complete');
