#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get words from command line arguments or stdin
const words = process.argv.slice(2);

if (words.length === 0) {
    console.error('Usage: node update-words.js word1 word2 word3 ...');
    console.error('Or: echo "word1\nword2\nword3" | node update-words.js');
    process.exit(1);
}

// Path to words.txt file
const wordsFilePath = path.join(__dirname, '..', 'public', 'words.txt');

try {
    // Write words to file
    const wordsContent = words.join('\n') + '\n';
    fs.writeFileSync(wordsFilePath, wordsContent, 'utf8');
    
    console.log(`Successfully updated words.txt with ${words.length} words:`);
    words.forEach((word, index) => {
        console.log(`${index + 1}. ${word}`);
    });
    
} catch (error) {
    console.error('Error updating words.txt:', error.message);
    process.exit(1);
}
