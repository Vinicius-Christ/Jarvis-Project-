const fs = require('fs');

const paths = [
  'server.ts',
  'src/App.tsx',
  'src/components/JarvisAssistant.tsx',
  'src/components/DeviceConfig.tsx',
  'src/components/Installer.tsx'
];

paths.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/notebook Lenovo IdeaPad Gaming 3i/g, 'Desktop Ryzen 7 5700G');
    content = content.replace(/GTX 1650/g, 'RTX 4070 Ti');
    content = content.replace(/notebook Lenovo/g, 'Desktop Ryzen 7');
    content = content.replace(/4GB VRAM/g, '12GB VRAM');
    content = content.replace(/llama3\.2:(3B|8B)/g, 'llama3.1:8b');
    content = content.replace(/llama3\.2/g, 'llama3.1');
    content = content.replace(/modelo de conversação de 3B parâmetros ideal para a VRAM de 4GB/g, 'modelo de conversação de 8B parâmetros suportado com folga pela VRAM de 12GB');
    content = content.replace(/3B parâmetros/g, '8B parâmetros');
    content = content.replace(/\(3B\)/g, '(8B)');
    content = content.replace(/ notebook /g, ' desktop ');
    content = content.replace(/ do notebook /g, ' do seu PC ');
    content = content.replace(/3B com tempo de resposta/g, '8B com tempo de resposta');
    content = content.replace(/Lenovo IdeaPad/g, 'Desktop Ryzen 7');
    fs.writeFileSync(file, content);
  }
});
console.log('Update Complete');
