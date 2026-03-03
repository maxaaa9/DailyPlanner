/**
 * Runs after `expo prebuild` to restore settings that prebuild overwrites.
 */
const fs = require('fs');

const buildGradlePath = 'android/app/build.gradle';
let content = fs.readFileSync(buildGradlePath, 'utf8');

if (!content.includes('abiFilters')) {
    content = content.replace(
        'versionCode 1\n        versionName "1.0.0"',
        'versionCode 1\n        versionName "1.0.0"\n\n        ndk {\n            abiFilters "arm64-v8a", "armeabi-v7a"\n        }'
    );
    fs.writeFileSync(buildGradlePath, content);
    console.log('✓ abiFilters patched into build.gradle');
}
